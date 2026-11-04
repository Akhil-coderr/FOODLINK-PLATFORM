const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const NGOProfile = require('../models/NGOProfile');
const VolunteerProfile = require('../models/VolunteerProfile');
const Donation = require('../models/Donation');
const PickupRequest = require('../models/PickupRequest');
const Assignment = require('../models/Assignment');
const ContactMessage = require('../models/ContactMessage');
const ImpactRecord = require('../models/ImpactRecord');
const AuditLog = require('../models/AuditLog');
const Broadcast = require('../models/Broadcast');
const Notification = require('../models/Notification');
const { recordAudit } = require('../services/auditService');
const { notifyUser, getIO } = require('../sockets/socketHandler');
const { normalizeToKg } = require('../utils/distance');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalNGOs,
      verifiedNGOs,
      totalVolunteers,
      totalDonations,
      availableDonations,
      completedDonations,
      pendingRequests,
      expiredDonations,
      flaggedDonations,
      impactRecords,
      recentDonations,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      NGOProfile.countDocuments({ verificationStatus: 'approved' }),
      User.countDocuments({ role: 'volunteer' }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'AVAILABLE', expiryTime: { $gt: new Date() } }),
      Donation.countDocuments({ status: 'COMPLETED' }),
      PickupRequest.countDocuments({ status: 'PENDING' }),
      Donation.countDocuments({ status: 'EXPIRED' }),
      Donation.countDocuments({ status: 'FLAGGED' }),
      ImpactRecord.find(),
      Donation.find().sort({ createdAt: -1 }).limit(5).populate('donorId', 'name city'),
      User.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash'),
    ]);

    let totalKg = 0;
    let totalMeals = 0;
    impactRecords.forEach((rec) => {
      totalKg += rec.foodQuantityKg || 0;
      totalMeals += rec.estimatedMealsSaved || 0;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDonors,
        totalNGOs,
        verifiedNGOs,
        totalVolunteers,
        totalDonations,
        availableDonations,
        completedDonations,
        pendingRequests,
        expiredDonations,
        flaggedDonations,
        totalFoodRescuedKg: Number(totalKg.toFixed(2)),
        estimatedMealsSaved: totalMeals,
        recentDonations,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.accountStatus = status;
    if (search) {
      const sanitized = search.trim();
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
        { city: { $regex: sanitized, $options: 'i' } },
        { phone: { $regex: sanitized, $options: 'i' } },
        { role: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.accountStatus = status;
    await user.save();

    await recordAudit({
      actorId: req.user._id,
      action: `USER_STATUS_${status.toUpperCase()}`,
      entityType: 'User',
      entityId: user._id,
      metadata: { newStatus: status, userEmail: user.email },
    });

    res.json({ success: true, message: `User status changed to ${status}`, data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Administrator accounts cannot be removed from user management.',
      });
    }

    await recordAudit({
      actorId: req.user._id,
      action: 'USER_REMOVED_BY_ADMIN',
      entityType: 'User',
      entityId: user._id,
      metadata: { role: user.role, userEmail: user.email, userName: user.name },
    });

    if (user.role === 'donor') {
      await DonorProfile.deleteOne({ userId: user._id });
    } else if (user.role === 'ngo') {
      await NGOProfile.deleteOne({ userId: user._id });
    } else if (user.role === 'volunteer') {
      await VolunteerProfile.deleteOne({ userId: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: `${user.role} account removed successfully` });
  } catch (error) {
    next(error);
  }
};

exports.getNGOs = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [ngos, total] = await Promise.all([
      NGOProfile.find(query)
        .populate('userId', 'name email phone address city accountStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      NGOProfile.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { ngos, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

exports.approveNGO = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const ngo = await NGOProfile.findById(req.params.id).populate('userId');
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found' });
    }

    ngo.verificationStatus = 'approved';
    ngo.verifiedAt = new Date();
    ngo.adminVerificationNotes = notes || 'Verified by system administrator.';
    await ngo.save();

    await recordAudit({
      actorId: req.user._id,
      action: 'NGO_APPROVED',
      entityType: 'NGOProfile',
      entityId: ngo._id,
      metadata: { organizationName: ngo.organizationName, regNumber: ngo.registrationNumber },
    });

    await notifyUser({
      recipientId: ngo.userId._id,
      title: 'Congratulations! NGO Account Approved',
      message: 'Your organization has been officially verified by FoodLink. You can now browse and claim surplus food.',
      type: 'success',
      relatedEntityId: ngo._id,
      entityType: 'NGOProfile',
    });

    res.json({ success: true, message: 'NGO verified and approved successfully', data: ngo });
  } catch (error) {
    next(error);
  }
};

exports.rejectNGO = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const ngo = await NGOProfile.findById(req.params.id).populate('userId');
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found' });
    }

    ngo.verificationStatus = 'rejected';
    ngo.adminVerificationNotes = notes || 'Application rejected during review.';
    await ngo.save();

    await recordAudit({
      actorId: req.user._id,
      action: 'NGO_REJECTED',
      entityType: 'NGOProfile',
      entityId: ngo._id,
      metadata: { organizationName: ngo.organizationName, notes },
    });

    await notifyUser({
      recipientId: ngo.userId._id,
      title: 'NGO Verification Notice',
      message: `Your verification request was rejected: ${ngo.adminVerificationNotes}`,
      type: 'warning',
      relatedEntityId: ngo._id,
      entityType: 'NGOProfile',
    });

    res.json({ success: true, message: 'NGO application rejected', data: ngo });
  } catch (error) {
    next(error);
  }
};

exports.getDonations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('donorId', 'name email phone city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Donation.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { donations, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

exports.flagDonation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.status = 'FLAGGED';
    donation.flagReason = reason || 'Flagged for quality or safety compliance review';
    await donation.save();

    await recordAudit({
      actorId: req.user._id,
      action: 'DONATION_FLAGGED',
      entityType: 'Donation',
      entityId: donation._id,
      metadata: { reason: donation.flagReason },
    });

    await notifyUser({
      recipientId: donation.donorId,
      title: 'Donation Flagged for Safety Review',
      message: `Your donation "${donation.foodName}" was flagged: ${donation.flagReason}`,
      type: 'warning',
      relatedEntityId: donation._id,
      entityType: 'Donation',
    });

    res.json({ success: true, message: 'Donation flagged successfully', data: donation });
  } catch (error) {
    next(error);
  }
};

exports.deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    await recordAudit({
      actorId: req.user._id,
      action: 'DONATION_REMOVED_BY_ADMIN',
      entityType: 'Donation',
      entityId: donation._id,
      metadata: { foodName: donation.foodName },
    });

    await donation.deleteOne();

    res.json({ success: true, message: 'Donation removed by administrator' });
  } catch (error) {
    next(error);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      PickupRequest.find(query)
        .populate('donationId')
        .populate('ngoId', 'name phone city')
        .populate('donorId', 'name phone city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PickupRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { requests, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssignments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .populate('donationId')
        .populate('ngoId', 'name phone city')
        .populate('donorId', 'name phone city address')
        .populate('volunteerId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Assignment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { assignments, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

exports.getVolunteers = async (req, res, next) => {
  try {
    const volunteers = await VolunteerProfile.find()
      .populate('userId', 'name email phone city accountStatus')
      .sort({ totalPoints: -1 });

    res.json({ success: true, data: volunteers });
  } catch (error) {
    next(error);
  }
};

exports.deleteVolunteer = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const user = profile.userId ? await User.findById(profile.userId) : null;
    if (user && user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Administrator accounts cannot be removed from volunteer management.',
      });
    }

    await recordAudit({
      actorId: req.user._id,
      action: 'VOLUNTEER_REMOVED_BY_ADMIN',
      entityType: 'VolunteerProfile',
      entityId: profile._id,
      metadata: {
        userId: user?._id,
        userEmail: user?.email,
        userName: user?.name,
      },
    });

    await VolunteerProfile.deleteOne({ _id: profile._id });
    if (user) {
      await User.deleteOne({ _id: user._id });
    }

    res.json({ success: true, message: 'Volunteer removed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const messages = await ContactMessage.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

exports.updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, message: 'Message status updated', data: message });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// Generates downloadable CSV report
exports.getReports = async (req, res, next) => {
  try {
    const { type = 'donations' } = req.query;

    if (type === 'donations') {
      const donations = await Donation.find().populate('donorId', 'name city');
      let csv = 'ID,Food Name,Category,Quantity,Unit,City,Status,Created At,Expiry Time\n';
      donations.forEach((d) => {
        csv += `"${d._id}","${d.foodName.replace(/"/g, '""')}","${d.foodCategory}","${d.quantity}","${d.unit}","${d.city}","${d.status}","${d.createdAt.toISOString()}","${d.expiryTime.toISOString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="foodlink_donations_report.csv"');
      return res.send(csv);
    }

    if (type === 'impact') {
      const records = await ImpactRecord.find()
        .populate('donationId', 'foodName')
        .populate('donorId', 'name')
        .populate('ngoId', 'name');

      let csv = 'Impact ID,Donation,Donor,NGO,Quantity (kg),Estimated Meals,CO2e Avoided (kg),Completed At\n';
      records.forEach((r) => {
        csv += `"${r._id}","${r.donationId?.foodName || ''}","${r.donorId?.name || ''}","${r.ngoId?.name || ''}","${r.foodQuantityKg}","${r.estimatedMealsSaved}","${r.estimatedCarbonImpactKg}","${r.completedAt.toISOString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="foodlink_impact_report.csv"');
      return res.send(csv);
    }

    res.status(400).json({ success: false, message: 'Invalid report type specified' });
  } catch (error) {
    next(error);
  }
};

exports.getDonors = async (req, res, next) => {
  try {
    const { organizationType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (organizationType) query.organizationType = organizationType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donors, total] = await Promise.all([
      DonorProfile.find(query)
        .populate('userId', 'name email phone address city accountStatus createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DonorProfile.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { donors, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

exports.getNGOById = async (req, res, next) => {
  try {
    const ngo = await NGOProfile.findById(req.params.id).populate(
      'userId',
      'name email phone address city state postalCode accountStatus createdAt'
    );
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found' });
    }
    res.json({ success: true, data: ngo });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const categoryStats = await Donation.aggregate([
      { $group: { _id: '$foodCategory', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
    ]);

    const monthlyStats = await Donation.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalDonations: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const userRoleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        categoryStats,
        monthlyStats,
        userRoleBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.sendBroadcast = async (req, res, next) => {
  try {
    const { title, message, targetRole = 'all', priority = 'info' } = req.body;

    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required for platform broadcasts',
      });
    }

    const validRoles = ['all', 'donor', 'ngo', 'volunteer'];
    const selectedRole = validRoles.includes(targetRole) ? targetRole : 'all';

    const validPriorities = ['info', 'success', 'warning', 'urgent'];
    const selectedPriority = validPriorities.includes(priority) ? priority : 'info';

    // Find all target active users
    const query = { accountStatus: 'active' };
    if (selectedRole !== 'all') {
      query.role = selectedRole;
    }

    const recipients = await User.find(query).select('_id name email role').lean();

    // Persist broadcast event
    const broadcast = await Broadcast.create({
      title: title.trim(),
      message: message.trim(),
      targetRole: selectedRole,
      priority: selectedPriority,
      sentBy: req.user._id,
      recipientCount: recipients.length,
    });

    // Bulk-create individual Notification inbox documents
    if (recipients.length > 0) {
      const notificationDocs = recipients.map((user) => ({
        recipientId: user._id,
        title: title.trim(),
        message: message.trim(),
        type: selectedPriority,
        relatedEntityId: broadcast._id,
        entityType: 'broadcast',
        isRead: false,
      }));

      await Notification.insertMany(notificationDocs);
    }

    // Real-time delivery via Socket.IO
    const io = getIO();
    if (io) {
      const socketPayload = {
        _id: broadcast._id,
        title: broadcast.title,
        message: broadcast.message,
        type: selectedPriority,
        priority: selectedPriority,
        targetRole: selectedRole,
        entityType: 'broadcast',
        createdAt: broadcast.createdAt,
      };

      if (selectedRole === 'all') {
        io.emit('notification:new', socketPayload);
        io.emit('broadcast:notification', socketPayload);
      } else {
        io.to(`role:${selectedRole}`).emit('notification:new', socketPayload);
        io.to(`role:${selectedRole}`).emit('broadcast:notification', socketPayload);
      }
    }

    // Security audit trail
    await recordAudit({
      userId: req.user._id,
      action: 'BROADCAST_SENT',
      entityType: 'Broadcast',
      entityId: broadcast._id,
      details: {
        title: broadcast.title,
        targetRole: selectedRole,
        priority: selectedPriority,
        recipientCount: recipients.length,
      },
      req,
    });

    res.status(201).json({
      success: true,
      message: `Broadcast successfully dispatched to ${recipients.length} ${selectedRole === 'all' ? 'active users' : selectedRole + 's'}`,
      data: {
        broadcast,
        recipientCount: recipients.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await Broadcast.find()
      .populate('sentBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: broadcasts.length,
      data: { broadcasts },
    });
  } catch (error) {
    next(error);
  }
};
