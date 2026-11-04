const PickupRequest = require('../models/PickupRequest');
const Donation = require('../models/Donation');
const Assignment = require('../models/Assignment');
const NGOProfile = require('../models/NGOProfile');
const { notifyUser, notifyRole } = require('../sockets/socketHandler');
const { generateRandomSecret, hashToken } = require('../utils/token');

exports.createRequest = async (req, res, next) => {
  try {
    const { donationId, requestedQuantity, message } = req.body;
    const ngoId = req.user._id;

    // 1. Check NGO Verification
    const ngoProfile = await NGOProfile.findOne({ userId: ngoId });
    if (!ngoProfile || ngoProfile.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your NGO account is pending administrative verification. You cannot request food yet.',
      });
    }

    // 2. Atomic check and reservation on Donation
    // Find donation that is AVAILABLE and not expired
    const donation = await Donation.findOne({
      _id: donationId,
      status: 'AVAILABLE',
      expiryTime: { $gt: new Date() },
    });

    if (!donation) {
      return res.status(400).json({
        success: false,
        message: 'This food donation is no longer available or has already been requested/expired.',
      });
    }

    // 3. Create Pickup Request
    const request = await PickupRequest.create({
      donationId: donation._id,
      ngoId,
      donorId: donation.donorId,
      requestedQuantity: requestedQuantity || donation.quantity,
      message: message || '',
      status: 'PENDING',
    });

    // 4. Update donation status to REQUESTED
    donation.status = 'REQUESTED';
    await donation.save();

    // 5. Notify Donor
    await notifyUser({
      recipientId: donation.donorId,
      title: 'New NGO Food Request!',
      message: `${ngoProfile.organizationName} has requested your donation "${donation.foodName}".`,
      type: 'info',
      relatedEntityId: request._id,
      entityType: 'PickupRequest',
    });

    res.status(201).json({
      success: true,
      message: 'Pickup request submitted successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'ngo') {
      query.ngoId = req.user._id;
    } else if (req.user.role === 'donor') {
      query.donorId = req.user._id;
    }

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      PickupRequest.find(query)
        .populate('donationId')
        .populate('ngoId', 'name phone email city')
        .populate('donorId', 'name phone email city address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PickupRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const request = await PickupRequest.findById(req.params.id)
      .populate('donationId')
      .populate('ngoId', 'name phone email city')
      .populate('donorId', 'name phone email city address');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await PickupRequest.findById(req.params.id).populate('donationId');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Ownership check: Only the donor of this donation or admin can accept
    if (request.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Atomic conditional check on Donation
    const donation = await Donation.findOneAndUpdate(
      { _id: request.donationId._id, status: { $in: ['AVAILABLE', 'REQUESTED'] } },
      { status: 'ACCEPTED', acceptedRequestId: request._id },
      { new: true }
    );

    if (!donation) {
      return res.status(400).json({
        success: false,
        message: 'Donation has already been accepted or is no longer available.',
      });
    }

    request.status = 'ACCEPTED';
    request.acceptedAt = new Date();
    await request.save();

    // Reject any other pending requests on this donation to prevent double assignment
    await PickupRequest.updateMany(
      { donationId: donation._id, _id: { $ne: request._id }, status: 'PENDING' },
      { status: 'REJECTED', rejectedAt: new Date(), rejectionReason: 'Another NGO request was accepted' }
    );

    // Generate single-use random verification tokens for pickup and delivery
    const pickupSecretPlain = generateRandomSecret('PK');
    const deliverySecretPlain = generateRandomSecret('DL');

    const pickupTokenHash = hashToken(pickupSecretPlain);
    const deliveryTokenHash = hashToken(deliverySecretPlain);

    // Create Assignment record
    const assignment = await Assignment.create({
      pickupRequestId: request._id,
      donationId: donation._id,
      ngoId: request.ngoId,
      donorId: request.donorId,
      status: 'UNASSIGNED',
      pickupVerificationTokenHash: pickupTokenHash,
      pickupVerificationSecretPlain: pickupSecretPlain,
      deliveryVerificationTokenHash: deliveryTokenHash,
      deliveryVerificationSecretPlain: deliverySecretPlain,
    });

    // Notify NGO
    await notifyUser({
      recipientId: request.ngoId,
      title: 'Food Request Accepted!',
      message: `Your request for "${donation.foodName}" was accepted by the donor. Volunteer dispatch initiated.`,
      type: 'success',
      relatedEntityId: assignment._id,
      entityType: 'Assignment',
    });

    // Notify Admin to dispatch volunteer
    notifyRole('admin', 'assignment:created', {
      assignmentId: assignment._id,
      donationName: donation.foodName,
    });

    res.json({
      success: true,
      message: 'Request accepted and assignment created',
      data: { request, assignment },
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    request.status = 'REJECTED';
    request.rejectedAt = new Date();
    request.rejectionReason = reason || 'Declined by donor';
    await request.save();

    // Check if any other pending requests exist for this donation
    const otherPending = await PickupRequest.findOne({
      donationId: request.donationId,
      status: 'PENDING',
    });

    if (!otherPending) {
      await Donation.findByIdAndUpdate(request.donationId, { status: 'AVAILABLE' });
    }

    await notifyUser({
      recipientId: request.ngoId,
      title: 'Food Request Declined',
      message: `Your request was declined: ${request.rejectionReason}`,
      type: 'warning',
      relatedEntityId: request._id,
      entityType: 'PickupRequest',
    });

    res.json({ success: true, message: 'Request rejected', data: request });
  } catch (error) {
    next(error);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.ngoId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    request.status = 'CANCELLED';
    await request.save();

    const otherPending = await PickupRequest.findOne({
      donationId: request.donationId,
      status: 'PENDING',
    });

    if (!otherPending) {
      await Donation.findByIdAndUpdate(request.donationId, { status: 'AVAILABLE' });
    }

    res.json({ success: true, message: 'Request cancelled', data: request });
  } catch (error) {
    next(error);
  }
};
