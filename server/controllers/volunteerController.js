const VolunteerProfile = require('../models/VolunteerProfile');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { getBadgeProgress } = require('../config/badges');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }
    res.json({ success: true, data: { ...req.user.toObject(), volunteerProfile: profile } });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { transportType, maximumCapacityKg, serviceRadiusKm, availability } = req.body;
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    if (transportType) profile.transportType = transportType;
    if (maximumCapacityKg) profile.maximumCapacityKg = Number(maximumCapacityKg);
    if (serviceRadiusKm) profile.serviceRadiusKm = Number(serviceRadiusKm);
    if (availability !== undefined) profile.availability = availability;

    await profile.save();

    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableTasks = async (req, res, next) => {
  try {
    // Unassigned or assigned to current volunteer
    const tasks = await Assignment.find({
      status: { $in: ['UNASSIGNED', 'ASSIGNED'] },
      $or: [{ volunteerId: null }, { volunteerId: req.user._id }],
    })
      .populate('donationId')
      .populate('donorId', 'name phone address city location')
      .populate('ngoId', 'name phone address city location')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.getMyAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ volunteerId: req.user._id })
      .populate('donationId')
      .populate('donorId', 'name phone address city location')
      .populate('ngoId', 'name phone address city location')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const volunteerId = req.user._id;
    const profile = await VolunteerProfile.findOne({ userId: volunteerId });

    const [activeAssignments, completedTasks] = await Promise.all([
      Assignment.countDocuments({
        volunteerId,
        status: { $in: ['ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP'] },
      }),
      Assignment.countDocuments({
        volunteerId,
        status: { $in: ['DELIVERED', 'COMPLETED'] },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalPoints: profile?.totalPoints || 0,
        completedTasks: completedTasks || profile?.completedTasks || 0,
        activeAssignments,
        totalDistanceKm: profile?.totalDistanceKm || 0,
        achievements: profile?.achievements || ['First Steps'],
        transportType: profile?.transportType || 'bike',
        availability: profile?.availability !== undefined ? profile?.availability : true,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const topVolunteers = await VolunteerProfile.find()
      .populate('userId', 'name city profileImage')
      .sort({ totalPoints: -1 })
      .limit(10);

    const leaderboard = topVolunteers.map((v, index) => ({
      rank: index + 1,
      name: v.userId?.name || 'Volunteer Hero',
      city: v.userId?.city || 'Coimbatore',
      totalPoints: v.totalPoints || 0,
      completedTasks: v.completedTasks || 0,
      achievementsCount: v.achievements?.length || 0,
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
};

exports.getAchievements = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });

    const lifetimePoints = profile?.lifetimePoints ?? profile?.totalPoints ?? 0;

    const allBadges = [
      { id: 'first_step', name: 'First Steps', desc: 'Registered as a FoodLink Volunteer Hero', earned: true },
      { id: 'first_pickup', name: 'First Rescue', desc: 'Completed 1 successful food delivery', earned: (profile?.completedTasks || 0) >= 1 },
      { id: 'food_hero', name: 'Food Hero', desc: 'Rescued 5+ meals from wastage', earned: (profile?.completedTasks || 0) >= 5 },
      { id: 'ten_deliveries', name: 'Community Pillar', desc: 'Completed 10 verified deliveries', earned: (profile?.completedTasks || 0) >= 10 },
      { id: 'century_saver', name: 'Century Champion', desc: 'Over 100 lifetime karma points accumulated', earned: lifetimePoints >= 100 },
    ];

    res.json({
      success: true,
      data: {
        points: profile?.totalPoints || 0,
        lifetimePoints,
        badgeProgress: getBadgeProgress(lifetimePoints),
        badges: allBadges,
      },
    });
  } catch (error) {
    next(error);
  }
};
