const Assignment = require('../models/Assignment');
const Donation = require('../models/Donation');
const { hashToken } = require('../utils/token');
const assignmentController = require('./assignmentController');

exports.generateQRPayload = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId).populate('donationId');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const userId = req.user._id.toString();
    const isDonor = assignment.donorId.toString() === userId;
    const isNGO = assignment.ngoId.toString() === userId;
    const isVolunteer = assignment.volunteerId && assignment.volunteerId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isNGO && !isVolunteer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view QR tokens for this assignment' });
    }

    // Return the appropriate token depending on stage and entity
    res.json({
      success: true,
      data: {
        assignmentId: assignment._id,
        foodName: assignment.donationId?.foodName,
        status: assignment.status,
        // Donor displays pickup QR for volunteer
        pickupToken: isDonor || isAdmin ? assignment.pickupVerificationSecretPlain : undefined,
        pickupVerified: assignment.pickupVerified,
        // NGO displays delivery QR for volunteer
        deliveryToken: isNGO || isAdmin ? assignment.deliveryVerificationSecretPlain : undefined,
        deliveryVerified: assignment.deliveryVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPickup = async (req, res, next) => {
  try {
    const { assignmentId, code } = req.body;
    req.params.id = assignmentId;
    req.body.code = code;
    return assignmentController.completePickup(req, res, next);
  } catch (error) {
    next(error);
  }
};

exports.verifyDelivery = async (req, res, next) => {
  try {
    const { assignmentId, code } = req.body;
    req.params.id = assignmentId;
    req.body.code = code;
    return assignmentController.completeDelivery(req, res, next);
  } catch (error) {
    next(error);
  }
};
