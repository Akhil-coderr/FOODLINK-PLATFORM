const Assignment = require('../models/Assignment');
const Donation = require('../models/Donation');
const VolunteerProfile = require('../models/VolunteerProfile');
const NGOProfile = require('../models/NGOProfile');
const ImpactRecord = require('../models/ImpactRecord');
const KarmaTransaction = require('../models/KarmaTransaction');
const { getCurrentBadge } = require('../config/badges');
const { notifyUser, notifyRole } = require('../sockets/socketHandler');
const { hashToken } = require('../utils/token');
const {
  normalizeToKg,
  calculateMealsSaved,
  calculateCarbonOffsetKg,
  calculateDistanceKm,
} = require('../utils/distance');

exports.getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'volunteer') {
      query.volunteerId = req.user._id;
    } else if (req.user.role === 'donor') {
      query.donorId = req.user._id;
    } else if (req.user.role === 'ngo') {
      query.ngoId = req.user._id;
    }

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .populate('donationId')
        .populate('donorId', 'name phone address city location')
        .populate('ngoId', 'name phone address city location')
        .populate('volunteerId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Assignment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        assignments,
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

exports.getById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('donationId')
      .populate('donorId', 'name phone address city location')
      .populate('ngoId', 'name phone address city location')
      .populate('volunteerId', 'name phone');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.assignVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('donationId');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const assignedId = volunteerId || req.user._id;
    assignment.volunteerId = assignedId;
    assignment.status = 'ASSIGNED';
    await assignment.save();

    await Donation.findByIdAndUpdate(assignment.donationId._id, { status: 'VOLUNTEER_ASSIGNED' });

    // Notify assigned volunteer
    await notifyUser({
      recipientId: assignedId,
      title: 'New Food Pickup Assigned!',
      message: `You have been assigned to pick up food from ${assignment.donationId.foodName}.`,
      type: 'assignment',
      relatedEntityId: assignment._id,
      entityType: 'Assignment',
    });

    res.json({ success: true, message: 'Volunteer assigned successfully', data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.startPickup = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role === 'volunteer' && assignment.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Assignment belongs to another volunteer' });
    }

    assignment.status = 'PICKUP_IN_PROGRESS';
    await assignment.save();

    await Donation.findByIdAndUpdate(assignment.donationId, { status: 'PICKUP_IN_PROGRESS' });

    // Notify donor
    await notifyUser({
      recipientId: assignment.donorId,
      title: 'Volunteer On The Way!',
      message: 'Volunteer has started the journey to your kitchen for food collection.',
      type: 'info',
      relatedEntityId: assignment._id,
      entityType: 'Assignment',
    });

    res.json({ success: true, message: 'Pickup marked in progress', data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.completePickup = async (req, res, next) => {
  try {
    const { code } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('donationId');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role === 'volunteer' && assignment.volunteerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Assignment belongs to another volunteer' });
    }

    // Verify Secret Token
    if (code) {
      const inputHash = hashToken(code.trim().toUpperCase());
      if (inputHash !== assignment.pickupVerificationTokenHash && code.trim().toUpperCase() !== assignment.pickupVerificationSecretPlain) {
        return res.status(400).json({ success: false, message: 'Invalid pickup verification QR / Code' });
      }
    }

    assignment.pickupVerified = true;
    assignment.pickupTime = new Date();
    assignment.status = 'PICKED_UP';
    await assignment.save();

    await Donation.findByIdAndUpdate(assignment.donationId._id, { status: 'PICKED_UP' });

    // Notify NGO that food is in transit
    await notifyUser({
      recipientId: assignment.ngoId,
      title: 'Food Collected from Donor Kitchen',
      message: `Food collection verified for "${assignment.donationId.foodName}". Volunteer is en route to your shelter.`,
      type: 'info',
      relatedEntityId: assignment._id,
      entityType: 'Assignment',
    });

    res.json({ success: true, message: 'Pickup verified and marked collected', data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.completeDelivery = async (req, res, next) => {
  try {
    const { code } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('donationId');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.status === 'COMPLETED' || assignment.status === 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Assignment is already completed' });
    }

    // Verify delivery secret
    if (code) {
      const inputHash = hashToken(code.trim().toUpperCase());
      if (inputHash !== assignment.deliveryVerificationTokenHash && code.trim().toUpperCase() !== assignment.deliveryVerificationSecretPlain) {
        return res.status(400).json({ success: false, message: 'Invalid delivery verification QR / Code' });
      }
    }

    const now = new Date();
    assignment.deliveryVerified = true;
    assignment.deliveryTime = now;
    assignment.completedAt = now;
    assignment.status = 'COMPLETED';
    await assignment.save();

    // Mark donation COMPLETED
    const donation = assignment.donationId;
    await Donation.findByIdAndUpdate(donation._id, { status: 'COMPLETED' });

    // Calculate metrics
    const foodKg = normalizeToKg(donation.quantity, donation.unit);
    const mealsSaved = calculateMealsSaved(foodKg);
    const carbonImpactKg = calculateCarbonOffsetKg(foodKg);

    // Create single Impact Record (atomic & deduplicated)
    const existingImpact = await ImpactRecord.findOne({ assignmentId: assignment._id });
    if (!existingImpact) {
      await ImpactRecord.create({
        donationId: donation._id,
        donorId: assignment.donorId,
        ngoId: assignment.ngoId,
        assignmentId: assignment._id,
        foodQuantityKg: foodKg,
        estimatedMealsSaved: mealsSaved,
        estimatedCarbonImpactKg: carbonImpactKg,
        completedAt: now,
      });
    }

    // Update NGO total received food stats
    await NGOProfile.findOneAndUpdate(
      { userId: assignment.ngoId },
      {
        $inc: {
          totalFoodReceivedKg: foodKg,
          totalMealsDistributed: mealsSaved,
        },
      }
    );

    // Award volunteer 20 reward points (once per completed assignment)
    if (assignment.volunteerId && !assignment.pointsAwarded) {
      assignment.pointsAwarded = true;
      await assignment.save();

      const volProfile = await VolunteerProfile.findOne({ userId: assignment.volunteerId });
      if (volProfile) {
        const previousLifetime = Math.max(
          volProfile.lifetimePoints || 0,
          volProfile.totalPoints || 0
        );

        const previousBadge = getCurrentBadge(previousLifetime);

        volProfile.lifetimePoints = previousLifetime + 20;
        volProfile.totalPoints = (volProfile.totalPoints || 0) + 20;
        volProfile.completedTasks = (volProfile.completedTasks || 0) + 1;

        // Check for badge unlock
        if (volProfile.completedTasks >= 1 && !volProfile.achievements.includes('First Rescue')) {
          volProfile.achievements.push('First Rescue');
        }
        if (volProfile.completedTasks >= 5 && !volProfile.achievements.includes('Food Hero')) {
          volProfile.achievements.push('Food Hero');
        }
        if (volProfile.completedTasks >= 10 && !volProfile.achievements.includes('Community Pillar')) {
          volProfile.achievements.push('Community Pillar');
        }

        await volProfile.save();

        // Record Karma Points transaction
        try {
          await KarmaTransaction.create({
            userId: assignment.volunteerId,
            type: 'EARN',
            amount: 20,
            balanceAfter: volProfile.totalPoints,
            description: `Completed verified delivery for "${donation.foodName}"`,
            relatedDeliveryId: assignment._id,
          });
        } catch (txErr) {
          console.error('Error logging Karma transaction:', txErr.message);
        }

        await notifyUser({
          recipientId: assignment.volunteerId,
          title: '+20 Volunteer Karma Points Earned!',
          message: `Great job delivering ${donation.foodName}! 20 points have been added to your profile.`,
          type: 'success',
          relatedEntityId: assignment._id,
          entityType: 'Assignment',
        });

        // Celebrate a newly unlocked Karma badge tier
        const earnedBadge = getCurrentBadge(volProfile.lifetimePoints);
        if (earnedBadge && earnedBadge.id !== previousBadge?.id) {
          await notifyUser({
            recipientId: assignment.volunteerId,
            title: `${earnedBadge.icon} New Badge Unlocked: ${earnedBadge.name}`,
            message: `You reached ${earnedBadge.threshold} lifetime Karma Points and earned the ${earnedBadge.name} badge. It now appears in your site banner.`,
            type: 'success',
            relatedEntityId: assignment._id,
            entityType: 'Assignment',
          });
        }
      }
    }

    // Notify Donor
    await notifyUser({
      recipientId: assignment.donorId,
      title: 'Donation Successfully Delivered & Distributed!',
      message: `Your donation "${donation.foodName}" (${foodKg} kg) has been safely delivered to the shelter. Thank you for rescuing food!`,
      type: 'success',
      relatedEntityId: assignment._id,
      entityType: 'Assignment',
    });

    res.json({
      success: true,
      message: 'Delivery verified and assignment successfully completed!',
      data: { assignment, foodKg, mealsSaved, carbonImpactKg },
    });
  } catch (error) {
    next(error);
  }
};
