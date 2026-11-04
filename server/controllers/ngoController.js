const NGOProfile = require('../models/NGOProfile');
const User = require('../models/User');
const Donation = require('../models/Donation');
const PickupRequest = require('../models/PickupRequest');
const { recommendNGOsForDonation } = require('../services/matchingService');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await NGOProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found' });
    }
    res.json({ success: true, data: { ...req.user.toObject(), ngoProfile: profile } });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { acceptedFoodCategories, receivingCapacityKg, operatingHours, description } = req.body;

    const profile = await NGOProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'NGO Profile not found' });
    }

    if (acceptedFoodCategories) profile.acceptedFoodCategories = acceptedFoodCategories;
    if (receivingCapacityKg) profile.receivingCapacityKg = Number(receivingCapacityKg);
    if (operatingHours) profile.operatingHours = operatingHours;
    if (description !== undefined) profile.description = description;

    await profile.save();

    res.json({ success: true, message: 'NGO Profile updated', data: profile });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { status = 'approved', page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;

    const profiles = await NGOProfile.find(query)
      .populate('userId', 'name phone address city location accountStatus')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const recommendations = await recommendNGOsForDonation(donationId);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const ngoId = req.user._id;

    const [profile, totalReqs, pendingReqs, acceptedReqs, availableDonations] = await Promise.all([
      NGOProfile.findOne({ userId: ngoId }),
      PickupRequest.countDocuments({ ngoId }),
      PickupRequest.countDocuments({ ngoId, status: 'PENDING' }),
      PickupRequest.countDocuments({ ngoId, status: 'ACCEPTED' }),
      Donation.countDocuments({ status: 'AVAILABLE', expiryTime: { $gt: new Date() } }),
    ]);

    res.json({
      success: true,
      data: {
        verificationStatus: profile?.verificationStatus || 'pending',
        availableNearbyDonations: availableDonations,
        totalRequests: totalReqs,
        pendingRequests: pendingReqs,
        acceptedRequests: acceptedReqs,
        totalFoodReceivedKg: profile?.totalFoodReceivedKg || 0,
        totalMealsDistributed: profile?.totalMealsDistributed || Math.round((profile?.totalFoodReceivedKg || 0) * 2.2),
        receivingCapacityKg: profile?.receivingCapacityKg || 100,
        currentReservedCapacityKg: profile?.currentReservedCapacityKg || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
