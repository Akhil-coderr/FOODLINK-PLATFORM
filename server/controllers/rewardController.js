const crypto = require('crypto');
const mongoose = require('mongoose');
const Redemption = require('../models/Redemption');
const Reward = require('../models/Reward');
const VolunteerProfile = require('../models/VolunteerProfile');
const User = require('../models/User');
const RestaurantPartner = require('../models/RestaurantPartner');
const Certificate = require('../models/Certificate');
const KarmaTransaction = require('../models/KarmaTransaction');
const { getFileUrl } = require('../middleware/upload');
const { notifyUser, notifyRole } = require('../sockets/socketHandler');
const { recordAudit } = require('../services/auditService');
const { DEFAULT_REWARDS } = require('../config/rewards');
const { getBadgeProgress } = require('../config/badges');

const CATEGORIES = ['coupon', 'badge', 'certificate', 'experience'];
const ACCENTS = ['forest', 'amber', 'purple', 'blue', 'rose', 'slate'];

const CANONICAL_BADGES = [
  {
    id: 'food_hero',
    name: 'Food Hero',
    icon: '🦸‍♂️',
    description: 'Awarded for extraordinary dedication to community food rescue and rapid delivery dispatch.',
    pointsCost: 150,
  },
  {
    id: 'green_champion',
    name: 'Green Champion',
    icon: '🌱',
    description: 'Recognizing vital contributions to reducing food waste and lowering greenhouse emissions.',
    pointsCost: 150,
  },
  {
    id: 'community_star',
    name: 'Community Star',
    icon: '⭐',
    description: 'Recognizing selfless service to local shelters, community kitchens, and people in need.',
    pointsCost: 150,
  },
  {
    id: 'food_rescue_champion',
    name: 'Food Rescue Champion',
    icon: '🏆',
    description: 'Awarded to master food rescue volunteers who maintain zero missed pickups and perfect hygiene.',
    pointsCost: 150,
  },
  {
    id: 'helping_hands',
    name: 'Helping Hands',
    icon: '🤝',
    description: 'Recognizing reliable, ready-to-help volunteers bridging hunger gaps in emergency situations.',
    pointsCost: 150,
  },
];

// Helper to ensure canonical default rewards and restaurant partners exist
const ensureDefaultRewardsAndPartners = async () => {
  try {
    // Remove any legacy non-coupon/non-badge reward categories
    await Reward.deleteMany({
      $or: [
        { category: { $nin: ['coupon', 'badge'] } },
        { slug: { $in: ['coupon_100', 'digital_achievement_certificate', 'kct_visit'] } },
      ],
    });

    // Remove legacy non-hotel/non-badge redemption records
    await Redemption.deleteMany({
      $or: [
        { rewardCategory: { $nin: ['coupon', 'badge'] } },
        { rewardName: { $regex: /KCT Visit|Amazon|Flipkart|Coffee/i } },
      ],
    });

    // Upsert the authorized default rewards (Hotel Coupons & Progressive Badges)
    for (const def of DEFAULT_REWARDS) {
      if (def.slug === 'hotel_discount_coupon') {
        await Reward.deleteMany({ slug: 'restaurant_discount_coupon' });
      }
      await Reward.findOneAndUpdate(
        { slug: def.slug },
        { $set: def },
        { upsert: true, new: true }
      );
    }

    // NOTE: We deliberately DO NOT delete admin-created rewards here so custom rewards persist permanently.

    const partnerCount = await RestaurantPartner.countDocuments();
    if (partnerCount === 0) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);

      await RestaurantPartner.create([
        {
          name: 'Annapoorna Gowrishankar',
          logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop',
          cuisine: 'South Indian & Vegetarian Delicacies',
          city: 'Coimbatore',
          address: '75 East Arokiasamy Rd, R.S. Puram, Coimbatore',
          discountType: 'percentage',
          discountValue: '20% OFF',
          minPurchase: 250,
          terms: 'Valid on all dine-in and takeaway orders. Cannot be combined with other promotional coupons.',
          expiryDate: futureDate,
          sponsorFunded: true,
          sponsorName: 'Annapoorna Hospitality Group',
          active: true,
          coupons: [
            { code: 'AGS-400-K92X' },
            { code: 'AGS-400-M17P' },
            { code: 'AGS-400-B83Q' },
            { code: 'AGS-400-V55N' },
            { code: 'AGS-400-T62Z' },
          ],
        },
        {
          name: 'Green Leaf Bistro',
          logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
          cuisine: 'Organic & Farm-Fresh Continental',
          city: 'Coimbatore',
          address: '14 Race Course Rd, Coimbatore',
          discountType: 'percentage',
          discountValue: '15% OFF',
          minPurchase: 200,
          terms: 'Valid on entire food menu. One coupon per table or billing.',
          expiryDate: futureDate,
          sponsorFunded: true,
          sponsorName: 'EcoLiving Sponsor Network',
          active: true,
          coupons: [
            { code: 'GLB-400-P11A' },
            { code: 'GLB-400-Q22B' },
            { code: 'GLB-400-R33C' },
            { code: 'GLB-400-Y88W' },
          ],
        },
        {
          name: 'Spice & Grain Kitchen',
          logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop',
          cuisine: 'North Indian & Tandoor Specialties',
          city: 'Coimbatore',
          address: '42 Cross Cut Rd, Gandhipuram, Coimbatore',
          discountType: 'fixed',
          discountValue: '₹100 FLAT OFF',
          minPurchase: 350,
          terms: 'Valid on minimum bill of ₹350. Valid for 90 days from issuance.',
          expiryDate: futureDate,
          sponsorFunded: true,
          sponsorName: 'Spice & Grain Community Fund',
          active: true,
          coupons: [
            { code: 'SGK-400-S44D' },
            { code: 'SGK-400-T55E' },
            { code: 'SGK-400-U66F' },
            { code: 'SGK-400-Z99K' },
          ],
        },
      ]);
    }

    // Ensure at least one hotel partner so hotel discount coupons are available.
    const hotelCount = await RestaurantPartner.countDocuments({ partnerType: 'hotel' });
    if (hotelCount === 0) {
      const hotelExpiry = new Date();
      hotelExpiry.setDate(hotelExpiry.getDate() + 120);

      await RestaurantPartner.create({
        name: 'The Residency Grand',
        partnerType: 'hotel',
        logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop',
        cuisine: 'Hotel Stay & Buffet Dining',
        city: 'Coimbatore',
        address: 'Avinashi Rd, Peelamedu, Coimbatore',
        discountType: 'percentage',
        discountValue: '25% OFF',
        minPurchase: 1500,
        terms: 'Valid on room bookings and buffet dining. Subject to availability. One coupon per booking.',
        expiryDate: hotelExpiry,
        sponsorFunded: true,
        sponsorName: 'Residency Hospitality Group',
        active: true,
        coupons: [
          { code: 'TRG-500-H10A' },
          { code: 'TRG-500-H20B' },
          { code: 'TRG-500-H30C' },
          { code: 'TRG-500-H40D' },
          { code: 'TRG-500-H50E' },
        ],
      });
    }
  } catch (err) {
    console.error('Error ensuring default rewards/partners:', err.message);
  }
};

const notifyAdmins = async (payload) => {
  try {
    const admins = await User.find({ role: 'admin', accountStatus: 'active' }).select('_id');
    await Promise.all(admins.map((admin) => notifyUser({ ...payload, recipientId: admin._id })));
    notifyRole('admin', 'reward:redemption', payload);
  } catch (err) {
    console.error('Failed to notify admins about redemption:', err.message);
  }
};

const refundPoints = async (redemption, reason = '') => {
  if (redemption.pointsRefunded) return false;

  const claimed = await Redemption.findOneAndUpdate(
    { _id: redemption._id, pointsRefunded: false },
    { $set: { pointsRefunded: true, status: 'REJECTED', adminNote: reason } },
    { new: true }
  );

  if (!claimed) return false;

  const updatedProfile = await VolunteerProfile.findOneAndUpdate(
    { userId: redemption.userId },
    { $inc: { totalPoints: redemption.pointsCost } },
    { new: true }
  );

  // If badge was unlocked, remove it
  if (redemption.rewardCategory === 'badge' && redemption.badgeName) {
    await VolunteerProfile.findOneAndUpdate(
      { userId: redemption.userId },
      { $pull: { achievements: redemption.badgeName } }
    );
  }

  // If a restaurant coupon was assigned, release it back to inventory
  if (redemption.couponCode) {
    await RestaurantPartner.findOneAndUpdate(
      { 'coupons.code': redemption.couponCode },
      {
        $set: {
          'coupons.$.isAssigned': false,
          'coupons.$.assignedTo': null,
          'coupons.$.assignedAt': null,
          'coupons.$.redemptionId': null,
        },
      }
    );
  }

  // Record refund KarmaTransaction
  try {
    await KarmaTransaction.create({
      userId: redemption.userId,
      type: 'REFUND',
      amount: redemption.pointsCost,
      balanceAfter: updatedProfile ? updatedProfile.totalPoints : 0,
      description: `Refunded points for rejected redemption: ${redemption.rewardName} (${reason || 'Admin action'})`,
      relatedRedemptionId: redemption._id,
    });
  } catch (txErr) {
    console.error('Failed to record refund transaction:', txErr.message);
  }

  redemption.pointsRefunded = true;
  return true;
};

// ============================================================================
// VOLUNTEER CONTROLLER ENDPOINTS
// ============================================================================

/**
 * GET /api/rewards/catalog
 * Returns the two authorized reward categories (Hotel Coupons & Badges) and volunteer's current points
 */
exports.getCatalog = async (req, res, next) => {
  try {
    await ensureDefaultRewardsAndPartners();

    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    const accumulatedPoints = Math.max(profile?.lifetimePoints || 0, profile?.totalPoints || 0);

    // 1. Fetch all active badges from MongoDB
    const activeBadges = await Reward.find({
      category: 'badge',
      active: true,
    }).sort({ pointsCost: 1, milestonePoints: 1, order: 1 }).lean();

    // 2. Progressive Milestone Synchronization:
    // Unlock any badge whose threshold is reached and guarantee no duplicate badge records
    let achievementsChanged = false;
    const currentAchievements = new Set(profile?.achievements || []);

    for (const badge of activeBadges) {
      const threshold = badge.milestonePoints || badge.pointsCost || 100;
      if (accumulatedPoints >= threshold) {
        if (!currentAchievements.has(badge.name)) {
          currentAchievements.add(badge.name);
          achievementsChanged = true;

          // Record non-purchased milestone in Redemption history if not already recorded
          const existingRedemption = await Redemption.findOne({
            userId: req.user._id,
            rewardCategory: 'badge',
            badgeName: badge.name,
          });

          if (!existingRedemption) {
            await Redemption.create({
              userId: req.user._id,
              rewardId: badge.slug || badge._id.toString(),
              rewardName: `Milestone: ${badge.name}`,
              rewardCategory: 'badge',
              badgeName: badge.name,
              pointsCost: 0,
              status: 'FULFILLED',
              processedAt: new Date(),
              metadata: {
                milestonePoints: threshold,
                badgeLevel: badge.badgeLevel || 'bronze',
              },
            });
          }
        }
      }
    }

    if (achievementsChanged && profile) {
      profile.achievements = Array.from(currentAchievements);
      await profile.save();
    }

    // 3. Fetch all active rewards (Coupons & Badges), partners, and user's redemptions
    const [rewards, partners, userRedemptions] = await Promise.all([
      Reward.find({ active: true, category: { $in: ['coupon', 'badge'] } })
        .sort({ category: 1, order: 1, pointsCost: 1 })
        .lean(),
      RestaurantPartner.find({ active: true }).lean(),
      Redemption.find({ userId: req.user._id }).lean(),
    ]);

    const userRedemptionCounts = {};
    userRedemptions.forEach((r) => {
      if (r.rewardId) {
        userRedemptionCounts[r.rewardId] = (userRedemptionCounts[r.rewardId] || 0) + 1;
      }
    });

    const now = new Date();

    const partnersWithStock = partners.map((p) => {
      const remaining = (p.coupons || []).filter((c) => !c.isAssigned).length;
      return {
        _id: p._id,
        name: p.name,
        partnerType: p.partnerType || 'hotel',
        logoUrl: p.logoUrl,
        cuisine: p.cuisine,
        city: p.city,
        address: p.address,
        discountType: p.discountType,
        discountValue: p.discountValue,
        minPurchase: p.minPurchase,
        terms: p.terms,
        expiryDate: p.expiryDate,
        sponsorFunded: p.sponsorFunded,
        sponsorName: p.sponsorName,
        remainingCoupons: remaining,
        totalCoupons: (p.coupons || []).length,
      };
    });

    const enrichedRewards = rewards.map((r) => {
      const isExpired = r.validUntil ? new Date(r.validUntil) < now : false;
      const userRedeemedCount = userRedemptionCounts[r.slug] || userRedemptionCounts[r._id?.toString()] || 0;
      const limitReached = userRedeemedCount >= (r.redemptionLimitPerUser || 1);
      const isUnlocked = r.category === 'badge'
        ? currentAchievements.has(r.name) || accumulatedPoints >= (r.milestonePoints || r.pointsCost)
        : false;
      const pointsNeeded = r.category === 'badge'
        ? Math.max(0, (r.milestonePoints || r.pointsCost) - accumulatedPoints)
        : Math.max(0, r.pointsCost - (profile?.totalPoints || 0));

      const availableCount = r.category === 'coupon'
        ? (r.remainingCoupons !== undefined ? r.remainingCoupons : 50)
        : 999;

      return {
        ...r,
        id: r.slug || r._id.toString(),
        availableCount,
        isExpired,
        userRedeemedCount,
        limitReached,
        isUnlocked,
        pointsNeeded,
        canRedeem: r.category === 'coupon'
          ? (profile?.totalPoints || 0) >= r.pointsCost && !isExpired && availableCount > 0 && !limitReached
          : isUnlocked,
      };
    });

    const badgeProgress = getBadgeProgress(accumulatedPoints, activeBadges);

    res.json({
      success: true,
      data: {
        rewards: enrichedRewards,
        restaurantPartners: partnersWithStock,
        canonicalBadges: activeBadges.map((b) => ({
          id: b.slug,
          name: b.name,
          icon: b.icon || '🏅',
          description: b.description || b.shortDescription || '',
          pointsCost: b.pointsCost || b.milestonePoints || 100,
          badgeLevel: b.badgeLevel || 'bronze',
        })),
        activeBadges,
        points: profile?.totalPoints || 0,
        lifetimePoints: accumulatedPoints,
        badgeProgress,
        unlockedBadges: Array.from(currentAchievements),
        completedTasks: profile?.completedTasks || 0,
        canRedeem: Boolean(profile),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/karma/overview
 * Returns Karma Points overview: available balance, total earned, total redeemed, recent transactions
 */
exports.getKarmaOverview = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    const currentPoints = profile?.totalPoints || 0;

    const [earnAgg, redeemAgg, recentTransactions, redemptionsCount] = await Promise.all([
      KarmaTransaction.aggregate([
        { $match: { userId: req.user._id, type: 'EARN' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      KarmaTransaction.aggregate([
        { $match: { userId: req.user._id, type: 'REDEEM' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      KarmaTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(15).lean(),
      Redemption.countDocuments({ userId: req.user._id }),
    ]);

    const totalEarnedCalculated = (earnAgg[0]?.total || 0) + (currentPoints > 0 && earnAgg.length === 0 ? currentPoints : 0);
    const totalRedeemedCalculated = redeemAgg[0]?.total || 0;
    const lifetimePoints = Math.max(
      profile?.lifetimePoints || 0,
      currentPoints,
      totalEarnedCalculated
    );

    res.json({
      success: true,
      data: {
        currentPoints,
        lifetimePoints,
        badgeProgress: getBadgeProgress(lifetimePoints),
        totalPointsEarned: Math.max(totalEarnedCalculated, currentPoints + totalRedeemedCalculated),
        totalPointsRedeemed: totalRedeemedCalculated,
        completedTasks: profile?.completedTasks || 0,
        unlockedBadges: profile?.achievements || [],
        totalRedemptionsCount: redemptionsCount,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/karma/badge
 * Lightweight badge summary used by the site header/banner.
 * Safe for every authenticated role: non-volunteers simply receive 0 points.
 */
exports.getKarmaBadge = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ userId: req.user._id }).select(
      'totalPoints lifetimePoints'
    );

    const lifetimePoints = Math.max(profile?.lifetimePoints || 0, profile?.totalPoints || 0);

    res.json({
      success: true,
      data: {
        points: profile?.totalPoints || 0,
        ...getBadgeProgress(lifetimePoints),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/redemptions
 * Returns all past redemptions for the authenticated volunteer
 */
exports.getMyRedemptions = async (req, res, next) => {
  try {
    const [redemptions, profile] = await Promise.all([
      Redemption.find({ userId: req.user._id, rewardCategory: { $in: ['coupon', 'badge'] } }).sort({ createdAt: -1 }).lean(),
      VolunteerProfile.findOne({ userId: req.user._id }),
    ]);

    res.json({
      success: true,
      data: {
        redemptions,
        points: profile?.totalPoints || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/certificates
 * Returns all generated achievement certificates for the authenticated volunteer
 */
exports.getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id }).sort({ issueDate: -1 }).lean();
    res.json({
      success: true,
      data: { certificates },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/certificates/:certificateId
 * Public/Volunteer endpoint to inspect and verify an achievement certificate
 */
exports.getCertificateById = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({
      $or: [{ certificateId: certificateId.toUpperCase() }, ...(mongoose.isValidObjectId(certificateId) ? [{ _id: certificateId }] : [])],
    }).populate('userId', 'name email city');

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({
      success: true,
      data: { certificate: cert },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rewards/redeem
 * Main atomic redemption handler for ONLY the three authorized categories:
 * - Restaurant Coupons (400 Karma Points)
 * - Exclusive Profile Badges (150 Karma Points)
 * - Digital Achievement Certificates (100 Karma Points)
 */
exports.redeemReward = async (req, res, next) => {
  try {
    const { rewardId, variant, badgeName, restaurantPartnerId, contactPhone, note } = req.body || {};

    if (!rewardId) {
      return res.status(400).json({ success: false, message: 'Please select a reward category to redeem.' });
    }

    // Look up the reward in DB (strictly coupon or badge)
    let reward = await Reward.findOne({
      $or: [
        { slug: String(rewardId) },
        { category: String(rewardId) },
        ...(rewardId === 'restaurant_discount_coupon' || rewardId === 'hotel_discount_coupon'
          ? [{ slug: 'hotel_discount_coupon' }, { slug: 'restaurant_discount_coupon' }]
          : []),
      ],
      active: true,
      category: { $in: ['coupon', 'badge'] },
    });
    if (!reward && mongoose.isValidObjectId(rewardId)) {
      reward = await Reward.findOne({ _id: rewardId, active: true, category: { $in: ['coupon', 'badge'] } });
    }

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found. Only Hotel Coupons and Badges are available for redemption.',
      });
    }

    // Volunteer Profile verification
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found. Reward redemptions are available exclusively to verified volunteers.',
      });
    }

    // Strict Karma Points validation
    const currentPoints = profile.totalPoints || 0;
    if (currentPoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Karma Points. You have ${currentPoints} points, but need ${reward.pointsCost} points (${reward.pointsCost - currentPoints} more required).`,
      });
    }

    // ========================================================================
    // REWARD CATEGORY 1: HOTEL DISCOUNT COUPONS
    // ========================================================================
    if (reward.category === 'coupon') {
      // 1. Check Expiry
      if (reward.validUntil && new Date(reward.validUntil) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'This hotel coupon has expired and can no longer be redeemed.',
        });
      }

      // 2. Check Availability / Inventory
      if (reward.remainingCoupons !== undefined && reward.remainingCoupons <= 0) {
        return res.status(400).json({
          success: false,
          message: 'All coupons for this hotel offer have been redeemed (out of stock).',
        });
      }

      // 3. Check User Redemption Limit
      const userRedeemedCount = await Redemption.countDocuments({
        userId: req.user._id,
        $or: [{ rewardId: reward.slug }, { rewardId: reward._id.toString() }],
        status: { $in: ['FULFILLED', 'APPROVED', 'PENDING'] },
      });

      const maxLimit = reward.redemptionLimitPerUser || 1;
      if (userRedeemedCount >= maxLimit) {
        return res.status(400).json({
          success: false,
          message: `You have reached the maximum redemption limit (${maxLimit}) for this hotel coupon.`,
        });
      }

      // 4. Partner lookup (optional fallback if linked)
      let partner = null;
      let couponItem = null;
      if (restaurantPartnerId && mongoose.isValidObjectId(restaurantPartnerId)) {
        partner = await RestaurantPartner.findOne({ _id: restaurantPartnerId, active: true });
        if (partner) {
          couponItem = (partner.coupons || []).find((c) => !c.isAssigned);
        }
      }

      // 5. Atomic point deduction
      const updatedProfile = await VolunteerProfile.findOneAndUpdate(
        { userId: req.user._id, totalPoints: { $gte: reward.pointsCost } },
        { $inc: { totalPoints: -reward.pointsCost } },
        { new: true }
      );

      if (!updatedProfile) {
        return res.status(400).json({ success: false, message: 'Insufficient Karma Points.' });
      }

      // 6. Generate unique coupon code
      let assignedCode = couponItem?.code;
      if (!assignedCode) {
        const prefix = (reward.couponCode || reward.hotelName || 'HOTEL').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'HTL';
        const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
        assignedCode = `${prefix}-${rand}`;
      }

      // 7. Decrement reward inventory
      if (reward.remainingCoupons > 0) {
        reward.remainingCoupons -= 1;
        await reward.save();
      }

      if (partner && couponItem) {
        couponItem.isAssigned = true;
        couponItem.assignedTo = req.user._id;
        couponItem.assignedAt = new Date();
      }

      const hotelDisplayName = reward.hotelName || partner?.name || reward.name || 'Partner Hotel';
      const discountDisplay = reward.discountValue || partner?.discountValue || 'Discount Offer';

      // 8. Create persistent Redemption record
      let redemption;
      try {
        redemption = await Redemption.create({
          userId: req.user._id,
          rewardId: reward.slug || reward._id.toString(),
          rewardName: `${hotelDisplayName} - ${discountDisplay}`,
          rewardCategory: 'coupon',
          pointsCost: reward.pointsCost,
          couponCode: assignedCode,
          restaurantName: hotelDisplayName,
          expiryDate: reward.validUntil || partner?.expiryDate || new Date(Date.now() + 90 * 86400000),
          status: 'FULFILLED',
          contactPhone: String(contactPhone || req.user.phone || '').trim(),
          note: String(note || '').trim().slice(0, 500),
          processedAt: new Date(),
          metadata: {
            rewardId: reward._id,
            hotelName: hotelDisplayName,
            discountType: reward.discountType || partner?.discountType || 'percentage',
            discountValue: discountDisplay,
            minBookingAmount: reward.minBookingAmount || partner?.minPurchase || 0,
            shortDescription: reward.shortDescription || reward.description,
          },
        });

        if (partner && couponItem) {
          couponItem.redemptionId = redemption._id;
          await partner.save();
        }

        // Record Karma Transaction
        await KarmaTransaction.create({
          userId: req.user._id,
          type: 'REDEEM',
          amount: reward.pointsCost,
          balanceAfter: updatedProfile.totalPoints,
          description: `Redeemed ${discountDisplay} for ${hotelDisplayName}`,
          relatedRedemptionId: redemption._id,
        });
      } catch (err) {
        // Rollback point deduction if creation fails
        await VolunteerProfile.findOneAndUpdate(
          { userId: req.user._id },
          { $inc: { totalPoints: reward.pointsCost } }
        );
        throw err;
      }

      // Send single in-app and socket notification
      await notifyUser({
        recipientId: req.user._id,
        title: 'Hotel Coupon Redeemed!',
        message: `Your ${discountDisplay} at ${hotelDisplayName} is ready! Coupon Code: ${assignedCode}`,
        type: 'success',
        relatedEntityId: redemption._id,
        entityType: 'Redemption',
      });

      await recordAudit({
        actorId: req.user._id,
        action: 'REWARD_REDEEMED_COUPON',
        entityType: 'Redemption',
        entityId: redemption._id,
        metadata: {
          hotel: hotelDisplayName,
          couponCode: assignedCode,
          pointsCost: reward.pointsCost,
        },
      });

      return res.status(201).json({
        success: true,
        message: `Successfully redeemed coupon for ${hotelDisplayName}! Code: ${assignedCode}`,
        data: {
          redemption,
          couponCode: assignedCode,
          hotelName: hotelDisplayName,
          discountValue: discountDisplay,
          expiryDate: redemption.expiryDate,
          remainingPoints: updatedProfile.totalPoints,
        },
      });
    }

    // ========================================================================
    // REWARD CATEGORY 2: PROGRESSIVE MILESTONE BADGES (Earned by Lifetime Karma)
    // ========================================================================
    if (reward.category === 'badge') {
      const accumulatedPoints = Math.max(profile.lifetimePoints || 0, profile.totalPoints || 0);
      const threshold = reward.milestonePoints || reward.pointsCost || 100;

      if (accumulatedPoints < threshold) {
        return res.status(400).json({
          success: false,
          message: `Milestone locked: You need ${threshold} lifetime Karma Points to unlock the ${reward.name} (currently ${accumulatedPoints} pts).`,
        });
      }

      if (Array.isArray(profile.achievements) && profile.achievements.includes(reward.name)) {
        return res.status(400).json({
          success: false,
          message: `You have already unlocked the "${reward.name}" badge. Milestone badges are awarded once permanently.`,
        });
      }

      // Add badge to achievements without deducting spendable points
      const updatedProfile = await VolunteerProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $addToSet: { achievements: reward.name } },
        { new: true }
      );

      // Create persistent milestone Redemption record
      const redemption = await Redemption.create({
        userId: req.user._id,
        rewardId: reward.slug || reward._id.toString(),
        rewardName: `Milestone Badge: ${reward.name}`,
        rewardCategory: 'badge',
        badgeName: reward.name,
        pointsCost: 0,
        status: 'FULFILLED',
        processedAt: new Date(),
        metadata: {
          badgeName: reward.name,
          milestonePoints: threshold,
          badgeLevel: reward.badgeLevel || 'bronze',
        },
      });

      // Send single in-app and socket notification
      await notifyUser({
        recipientId: req.user._id,
        title: 'Milestone Badge Unlocked!',
        message: `Congratulations! The "${reward.name}" has been permanently added to your volunteer profile.`,
        type: 'success',
        relatedEntityId: redemption._id,
        entityType: 'Redemption',
      });

      await recordAudit({
        actorId: req.user._id,
        action: 'REWARD_REDEEMED_BADGE',
        entityType: 'Redemption',
        entityId: redemption._id,
        metadata: {
          badgeName: reward.name,
          milestonePoints: threshold,
        },
      });

      return res.status(201).json({
        success: true,
        message: `Congratulations! You unlocked the "${reward.name}" badge!`,
        data: {
          redemption,
          badgeName: reward.name,
          achievements: updatedProfile.achievements,
          remainingPoints: updatedProfile.totalPoints,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unsupported reward category. Only Hotel Coupons and Badges are available.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/rewards/redemptions/:id/cancel
 * Allows cancelling a pending request and refunding points
 */
exports.cancelMyRedemption = async (req, res, next) => {
  try {
    const redemption = await Redemption.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'PENDING',
    });

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption not found or cannot be cancelled.',
      });
    }

    const refunded = await refundPoints(redemption, 'Cancelled by volunteer');
    const profile = await VolunteerProfile.findOne({ userId: req.user._id });

    res.json({
      success: true,
      message: refunded ? 'Redemption cancelled and points refunded.' : 'Redemption cancelled.',
      data: { redemption, remainingPoints: profile?.totalPoints || 0 },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// ADMIN CONTROLLER ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/rewards
 * Lists the rewards catalog for management
 */
exports.adminListRewards = async (req, res, next) => {
  try {
    await ensureDefaultRewardsAndPartners();

    const [rewards, totalRedemptions, activeCouponsCount] = await Promise.all([
      Reward.find().sort({ order: 1, pointsCost: 1 }).lean(),
      Redemption.countDocuments(),
      RestaurantPartner.aggregate([
        { $unwind: '$coupons' },
        { $match: { 'coupons.isAssigned': false } },
        { $count: 'remaining' },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        rewards,
        stats: {
          total: rewards.length,
          active: rewards.filter((r) => r.active).length,
          coupons: activeCouponsCount[0]?.remaining || 0,
          totalRedemptions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/rewards
 */
exports.adminCreateReward = async (req, res, next) => {
  try {
    const {
      name,
      category = 'coupon',
      pointsCost,
      shortDescription,
      detailedDescription,
      description,
      // Hotel Coupon fields
      hotelName,
      couponCode,
      discountType,
      discountValue,
      minBookingAmount,
      validUntil,
      totalAvailable,
      redemptionLimitPerUser,
      // Badge fields
      badgeName,
      badgeType,
      badgeLevel,
      milestonePoints,
      // Visuals & controls
      icon,
      accent,
      imageUrl,
      active = true,
      order = 0,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Reward name is required.' });
    }

    if (!['coupon', 'badge'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Only Hotel Coupons and Badges can be created.' });
    }

    const safePoints = Math.max(0, Math.round(Number(pointsCost ?? milestonePoints ?? 0)));
    const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40) || 'reward';
    const uniqueSlug = `${baseSlug}_${Date.now().toString(36)}`;

    const rewardData = {
      slug: uniqueSlug,
      name: name.trim(),
      category,
      pointsCost: safePoints,
      shortDescription: (shortDescription || description || '').trim(),
      detailedDescription: (detailedDescription || description || '').trim(),
      description: (description || shortDescription || detailedDescription || '').trim(),
      icon: (icon || (category === 'coupon' ? '🏨' : '🏅')).trim(),
      accent: accent || (category === 'coupon' ? 'amber' : 'forest'),
      imageUrl: (imageUrl || '').trim(),
      active: Boolean(active),
      order: Number(order) || 0,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    };

    if (category === 'coupon') {
      rewardData.hotelName = (hotelName || name).trim();
      rewardData.couponCode = (couponCode || '').trim().toUpperCase();
      rewardData.discountType = ['percentage', 'fixed', 'special_offer'].includes(discountType) ? discountType : 'percentage';
      rewardData.discountValue = (discountValue || 'Special Discount').trim();
      rewardData.minBookingAmount = Number(minBookingAmount) || 0;
      rewardData.validUntil = validUntil ? new Date(validUntil) : new Date(Date.now() + 90 * 86400000);
      const total = Math.max(1, Number(totalAvailable) || 100);
      rewardData.totalAvailable = total;
      rewardData.remainingCoupons = total;
      rewardData.redemptionLimitPerUser = Math.max(1, Number(redemptionLimitPerUser) || 1);
    } else if (category === 'badge') {
      rewardData.badgeName = (badgeName || name).trim();
      rewardData.badgeType = (badgeType || 'milestone').trim();
      rewardData.badgeLevel = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'other'].includes(badgeLevel) ? badgeLevel : 'bronze';
      rewardData.milestonePoints = safePoints || 100;
      rewardData.pointsCost = safePoints || 100;
    }

    const reward = await Reward.create(rewardData);

    await recordAudit({
      actorId: req.user?._id,
      action: 'REWARD_CREATED',
      entityType: 'Reward',
      entityId: reward._id,
      metadata: { name: reward.name, category: reward.category, pointsCost: reward.pointsCost },
    });

    res.status(201).json({
      success: true,
      message: `${category === 'coupon' ? 'Hotel Coupon' : 'Badge'} "${reward.name}" created successfully.`,
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/rewards/:id
 */
exports.adminUpdateReward = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found.' });
    }

    const allowed = [
      'name', 'description', 'shortDescription', 'detailedDescription', 'pointsCost',
      'category', 'icon', 'accent', 'imageUrl', 'active', 'order',
      'hotelName', 'couponCode', 'discountType', 'discountValue', 'minBookingAmount',
      'validUntil', 'totalAvailable', 'remainingCoupons', 'redemptionLimitPerUser',
      'badgeName', 'badgeType', 'badgeLevel', 'milestonePoints',
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (['pointsCost', 'minBookingAmount', 'totalAvailable', 'remainingCoupons', 'redemptionLimitPerUser', 'milestonePoints', 'order'].includes(key)) {
          reward[key] = Math.max(0, Number(req.body[key]));
        } else if (key === 'validUntil') {
          reward[key] = req.body[key] ? new Date(req.body[key]) : null;
        } else if (key === 'active') {
          reward[key] = Boolean(req.body[key]);
        } else {
          reward[key] = req.body[key];
        }
      }
    }

    reward.updatedBy = req.user?._id || null;
    await reward.save();

    res.json({ success: true, message: 'Reward updated successfully.', data: reward });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/rewards/:id
 */
exports.adminDeleteReward = async (req, res, next) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found.' });
    res.json({ success: true, message: 'Reward removed.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/rewards/upload-image
 */
exports.adminUploadRewardImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const url = getFileUrl(req, req.file.filename);
  res.json({ success: true, data: { url } });
};

/**
 * GET /api/admin/redemptions
 * Lists all redemptions with category/status filters & search
 */
exports.adminListRedemptions = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'ALL') query.status = status;
    if (category && category !== 'ALL') query.rewardCategory = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let redemptions = await Redemption.find(query)
      .populate('userId', 'name email phone role city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (search) {
      const term = search.toLowerCase();
      redemptions = redemptions.filter(
        (r) =>
          r.userId?.name?.toLowerCase().includes(term) ||
          r.userId?.email?.toLowerCase().includes(term) ||
          r.rewardName?.toLowerCase().includes(term) ||
          r.couponCode?.toLowerCase().includes(term) ||
          r.certificateId?.toLowerCase().includes(term)
      );
    }

    const [total, pendingCount, fulfilledCount, rejectedCount] = await Promise.all([
      Redemption.countDocuments(query),
      Redemption.countDocuments({ status: 'PENDING' }),
      Redemption.countDocuments({ status: 'FULFILLED' }),
      Redemption.countDocuments({ status: 'REJECTED' }),
    ]);

    res.json({
      success: true,
      data: {
        redemptions,
        total,
        stats: {
          pending: pendingCount,
          fulfilled: fulfilledCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/redemptions/:id/status
 */
exports.adminUpdateRedemptionStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const redemption = await Redemption.findById(req.params.id);

    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Redemption not found.' });
    }

    if (status === 'REJECTED') {
      await refundPoints(redemption, adminNote);
      await notifyUser({
        recipientId: redemption.userId,
        title: 'Redemption Request Rejected & Refunded',
        message: `Your redemption request for "${redemption.rewardName}" was rejected (${adminNote || 'No reason provided'}). ${redemption.pointsCost} Karma Points have been refunded.`,
        type: 'warning',
        relatedEntityId: redemption._id,
        entityType: 'Redemption',
      });
    } else {
      redemption.status = status;
      if (adminNote) redemption.adminNote = adminNote;
      redemption.processedBy = req.user._id;
      redemption.processedAt = new Date();
      await redemption.save();

      await notifyUser({
        recipientId: redemption.userId,
        title: `Redemption Status: ${status}`,
        message: `Your redemption for "${redemption.rewardName}" has been marked as ${status}.`,
        type: 'info',
        relatedEntityId: redemption._id,
        entityType: 'Redemption',
      });
    }

    res.json({ success: true, message: `Redemption marked as ${status}.`, data: redemption });
  } catch (error) {
    next(error);
  }
};

/**
 * RESTAURANT PARTNER ADMIN APIS
 */
exports.adminListRestaurants = async (req, res, next) => {
  try {
    await ensureDefaultRewardsAndPartners();
    const partners = await RestaurantPartner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { partners } });
  } catch (error) {
    next(error);
  }
};

exports.adminCreateRestaurant = async (req, res, next) => {
  try {
    const { name, partnerType, cuisine, city, address, discountType, discountValue, minPurchase, terms, expiryDate, sponsorFunded, sponsorName, couponCodes = [] } = req.body;

    if (!name || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Name, discountValue, and expiryDate are required.' });
    }

    const coupons = couponCodes
      .filter(Boolean)
      .map((code) => ({ code: String(code).trim().toUpperCase(), isAssigned: false }));

    const partner = await RestaurantPartner.create({
      name,
      partnerType: partnerType === 'hotel' ? 'hotel' : 'restaurant',
      cuisine: cuisine || 'Multi-Cuisine',
      city: city || 'Coimbatore',
      address: address || '',
      discountType: discountType || 'percentage',
      discountValue,
      minPurchase: Number(minPurchase) || 0,
      terms: terms || 'Valid on dine-in and takeaways.',
      expiryDate: new Date(expiryDate),
      sponsorFunded: sponsorFunded !== false,
      sponsorName: sponsorName || 'Partner Sponsor',
      coupons,
    });

    res.status(201).json({ success: true, message: 'Restaurant partner and inventory added.', data: partner });
  } catch (error) {
    next(error);
  }
};

exports.adminUpdateRestaurant = async (req, res, next) => {
  try {
    const partner = await RestaurantPartner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Restaurant partner not found.' });

    const fields = ['name', 'partnerType', 'cuisine', 'city', 'address', 'discountType', 'discountValue', 'minPurchase', 'terms', 'expiryDate', 'sponsorFunded', 'sponsorName', 'active'];
    for (const f of fields) {
      if (req.body[f] !== undefined) partner[f] = req.body[f];
    }

    // Add new coupon codes if provided
    if (Array.isArray(req.body.newCouponCodes) && req.body.newCouponCodes.length > 0) {
      for (const code of req.body.newCouponCodes) {
        const clean = String(code).trim().toUpperCase();
        if (clean && !partner.coupons.some((c) => c.code === clean)) {
          partner.coupons.push({ code: clean, isAssigned: false });
        }
      }
    }

    await partner.save();
    res.json({ success: true, message: 'Restaurant partner updated.', data: partner });
  } catch (error) {
    next(error);
  }
};

exports.adminDeleteRestaurant = async (req, res, next) => {
  try {
    const partner = await RestaurantPartner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Restaurant partner not found.' });
    res.json({ success: true, message: 'Restaurant partner removed.' });
  } catch (error) {
    next(error);
  }
};

/**
 * BADGE ADMIN APIS
 */
exports.adminListBadges = async (req, res, next) => {
  try {
    const [dbBadges, volunteers] = await Promise.all([
      Reward.find({ category: 'badge' }).sort({ pointsCost: 1, milestonePoints: 1, order: 1 }).lean(),
      VolunteerProfile.find().select('userId achievements').populate('userId', 'name email'),
    ]);

    const badgeStats = dbBadges.map((b) => {
      const badgeIdentifier = b.name;
      const unlockedUsers = volunteers.filter(
        (v) => v.achievements && (v.achievements.includes(badgeIdentifier) || v.achievements.includes(b.slug))
      );
      return {
        _id: b._id,
        id: b.slug,
        slug: b.slug,
        name: b.name,
        badgeLevel: b.badgeLevel || 'bronze',
        badgeType: b.badgeType || 'milestone',
        icon: b.icon || '🏅',
        description: b.description || b.shortDescription || '',
        detailedDescription: b.detailedDescription || '',
        pointsCost: b.milestonePoints || b.pointsCost || 100,
        milestonePoints: b.milestonePoints || b.pointsCost || 100,
        active: b.active,
        unlockedCount: unlockedUsers.length,
        unlockedBy: unlockedUsers.map((u) => ({
          _id: u.userId?._id,
          name: u.userId?.name || 'Volunteer',
          email: u.userId?.email,
        })),
      };
    });

    res.json({ success: true, data: { badges: badgeStats } });
  } catch (error) {
    next(error);
  }
};

/**
 * CERTIFICATE ADMIN APIS
 */
exports.adminListCertificates = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      const term = search.trim();
      query.$or = [
        { recipientName: { $regex: term, $options: 'i' } },
        { certificateId: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [certificates, total] = await Promise.all([
      Certificate.find(query).populate('userId', 'name email city').sort({ issueDate: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Certificate.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { certificates, total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/redemptions/manual
 * Admin-initiated redemption performed on behalf of a volunteer.
 * Supports coupon and badge rewards; the volunteer is notified and audited.
 */
exports.adminRedeemForUser = async (req, res, next) => {
  try {
    const { userId, rewardId, badgeName, restaurantPartnerId, adminNote } = req.body || {};

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Please select a valid volunteer.' });
    }
    if (!rewardId) {
      return res.status(400).json({ success: false, message: 'Please select a reward to redeem.' });
    }

    const [user, profile] = await Promise.all([
      User.findById(userId).select('name email role phone'),
      VolunteerProfile.findOne({ userId }),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Volunteer account not found.' });
    }
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'That account has no volunteer profile, so Karma points cannot be redeemed.',
      });
    }

    let reward = await Reward.findOne({ slug: String(rewardId), active: true });
    if (!reward && mongoose.isValidObjectId(rewardId)) {
      reward = await Reward.findOne({ _id: rewardId, active: true });
    }
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found or inactive.' });
    }

    const currentPoints = profile.totalPoints || 0;
    if (currentPoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: `${user.name} has ${currentPoints} Karma Points, but "${reward.name}" costs ${reward.pointsCost} (${reward.pointsCost - currentPoints} more required).`,
      });
    }

    let redemption = null;
    let remainingPoints = currentPoints;

    if (reward.category === 'coupon') {
      let partner = null;
      if (restaurantPartnerId && mongoose.isValidObjectId(restaurantPartnerId)) {
        partner = await RestaurantPartner.findOne({ _id: restaurantPartnerId, active: true });
      }
      if (!partner) {
        partner = await RestaurantPartner.findOne({ active: true, 'coupons.isAssigned': false });
      }
      if (!partner) {
        return res.status(400).json({
          success: false,
          message: 'No partner restaurant or hotel coupons are currently in stock.',
        });
      }

      const couponItem = partner.coupons.find((c) => !c.isAssigned);
      if (!couponItem) {
        return res.status(400).json({
          success: false,
          message: `All coupons for ${partner.name} have been redeemed. Choose another partner.`,
        });
      }

      const updatedProfile = await VolunteerProfile.findOneAndUpdate(
        { userId, totalPoints: { $gte: reward.pointsCost } },
        { $inc: { totalPoints: -reward.pointsCost } },
        { new: true }
      );
      if (!updatedProfile) {
        return res.status(400).json({ success: false, message: 'Insufficient Karma Points.' });
      }
      remainingPoints = updatedProfile.totalPoints;

      try {
        redemption = await Redemption.create({
          userId,
          rewardId: reward.slug,
          rewardName: `${partner.name} - ${partner.discountValue}`,
          rewardCategory: 'coupon',
          pointsCost: reward.pointsCost,
          couponCode: couponItem.code,
          restaurantName: partner.name,
          expiryDate: partner.expiryDate,
          status: 'FULFILLED',
          adminNote: String(adminNote || '').trim().slice(0, 500),
          processedBy: req.user._id,
          processedAt: new Date(),
          metadata: {
            restaurantPartnerId: partner._id,
            partnerType: partner.partnerType || 'restaurant',
            discountValue: partner.discountValue,
            terms: partner.terms,
            minPurchase: partner.minPurchase,
            issuedByAdmin: true,
          },
        });

        couponItem.isAssigned = true;
        couponItem.assignedTo = userId;
        couponItem.assignedAt = new Date();
        couponItem.redemptionId = redemption._id;
        await partner.save();

        await KarmaTransaction.create({
          userId,
          type: 'REDEEM',
          amount: reward.pointsCost,
          balanceAfter: updatedProfile.totalPoints,
          description: `Admin redeemed ${partner.discountValue} coupon for ${partner.name}`,
          relatedRedemptionId: redemption._id,
        });
      } catch (err) {
        await VolunteerProfile.findOneAndUpdate({ userId }, { $inc: { totalPoints: reward.pointsCost } });
        throw err;
      }

      await notifyUser({
        recipientId: userId,
        title: 'Reward Redeemed For You',
        message: `An administrator redeemed a ${partner.discountValue} coupon at ${partner.name}. Code: ${couponItem.code}`,
        type: 'success',
        relatedEntityId: redemption._id,
        entityType: 'Redemption',
      });
    } else if (reward.category === 'badge') {
      const selectedBadge = String(badgeName || '').trim();
      const validNames = CANONICAL_BADGES.map((b) => b.name);

      if (!selectedBadge || !validNames.includes(selectedBadge)) {
        return res.status(400).json({
          success: false,
          message: `Choose a valid badge: ${validNames.join(', ')}.`,
        });
      }
      if (Array.isArray(profile.achievements) && profile.achievements.includes(selectedBadge)) {
        return res.status(400).json({
          success: false,
          message: `${user.name} already owns the "${selectedBadge}" badge.`,
        });
      }

      const updatedProfile = await VolunteerProfile.findOneAndUpdate(
        { userId, totalPoints: { $gte: reward.pointsCost } },
        { $inc: { totalPoints: -reward.pointsCost }, $addToSet: { achievements: selectedBadge } },
        { new: true }
      );
      if (!updatedProfile) {
        return res.status(400).json({ success: false, message: 'Insufficient Karma Points.' });
      }
      remainingPoints = updatedProfile.totalPoints;

      try {
        redemption = await Redemption.create({
          userId,
          rewardId: reward.slug,
          rewardName: `Exclusive Badge: ${selectedBadge}`,
          rewardCategory: 'badge',
          badgeName: selectedBadge,
          pointsCost: reward.pointsCost,
          status: 'FULFILLED',
          adminNote: String(adminNote || '').trim().slice(0, 500),
          processedBy: req.user._id,
          processedAt: new Date(),
          metadata: { badgeName: selectedBadge, issuedByAdmin: true },
        });

        await KarmaTransaction.create({
          userId,
          type: 'REDEEM',
          amount: reward.pointsCost,
          balanceAfter: updatedProfile.totalPoints,
          description: `Admin unlocked Exclusive Profile Badge: ${selectedBadge}`,
          relatedRedemptionId: redemption._id,
        });
      } catch (err) {
        await VolunteerProfile.findOneAndUpdate(
          { userId },
          { $inc: { totalPoints: reward.pointsCost }, $pull: { achievements: selectedBadge } }
        );
        throw err;
      }

      await notifyUser({
        recipientId: userId,
        title: 'Badge Unlocked For You',
        message: `An administrator unlocked the "${selectedBadge}" badge on your profile.`,
        type: 'success',
        relatedEntityId: redemption._id,
        entityType: 'Redemption',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Admin-assisted redemption supports coupon and badge rewards only.',
      });
    }

    await recordAudit({
      actorId: req.user._id,
      action: 'ADMIN_MANUAL_REDEMPTION',
      entityType: 'Redemption',
      entityId: redemption._id,
      metadata: {
        targetUserId: userId,
        reward: reward.name,
        pointsCost: reward.pointsCost,
      },
    });

    res.status(201).json({
      success: true,
      message: `Redeemed "${reward.name}" for ${user.name}.`,
      data: { redemption, remainingPoints },
    });
  } catch (error) {
    next(error);
  }
};
