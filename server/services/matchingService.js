const NGOProfile = require('../models/NGOProfile');
const User = require('../models/User');
const Donation = require('../models/Donation');
const { calculateDistanceKm, normalizeToKg } = require('../utils/distance');

/**
 * Smart NGO Recommendation Engine
 * Formula:
 * Score = 35% Location + 30% Category + 20% Capacity + 15% Time Window
 */
const recommendNGOsForDonation = async (donationId, maxResults = 10) => {
  const donation = await Donation.findById(donationId).populate('donorId', 'name location city');
  if (!donation) {
    throw new Error('Donation not found');
  }

  const donCoords = donation.location?.coordinates; // [lng, lat]
  const donLat = donCoords ? donCoords[1] : 11.0168;
  const donLng = donCoords ? donCoords[0] : 76.9558;
  const donationKg = normalizeToKg(donation.quantity, donation.unit);

  // Find all approved and active NGOs
  const activeUsers = await User.find({
    role: 'ngo',
    accountStatus: 'active',
  }).select('_id name phone address city location');

  const userIds = activeUsers.map((u) => u._id);

  const ngoProfiles = await NGOProfile.find({
    userId: { $in: userIds },
    verificationStatus: 'approved',
  });

  const recommendations = [];

  for (const profile of ngoProfiles) {
    const user = activeUsers.find((u) => u._id.toString() === profile.userId.toString());
    if (!user) continue;

    const ngoCoords = user.location?.coordinates;
    const ngoLat = ngoCoords ? ngoCoords[1] : 11.0045;
    const ngoLng = ngoCoords ? ngoCoords[0] : 76.9616;

    // 1. Distance Calculation (35% weight)
    const distanceKm = calculateDistanceKm(donLat, donLng, ngoLat, ngoLng);
    // Scaled: 0km = 100%, 30km = 0%
    const locationScore = Math.max(0, 100 - (distanceKm / 30) * 100);

    // 2. Category Compatibility (30% weight)
    let categoryScore = 0;
    const acceptsCategory = profile.acceptedFoodCategories.some(
      (c) => c.toLowerCase() === donation.foodCategory.toLowerCase()
    );
    if (acceptsCategory) {
      categoryScore = 100;
    } else if (profile.acceptedFoodCategories.length === 0) {
      categoryScore = 50; // accepts all if unspecified
    } else {
      categoryScore = 20; // partial
    }

    // 3. Capacity Compatibility (20% weight)
    const remainingCapacity = Math.max(0, profile.receivingCapacityKg - (profile.currentReservedCapacityKg || 0));
    let capacityScore = 0;
    if (remainingCapacity >= donationKg) {
      capacityScore = 100;
    } else if (remainingCapacity > 0) {
      capacityScore = (remainingCapacity / donationKg) * 80;
    } else {
      capacityScore = 10;
    }

    // 4. Time Window / Operating Hours Compatibility (15% weight)
    let timeScore = 85; // default reasonable operating compatibility
    const now = new Date();
    const expiryDiffHours = (new Date(donation.expiryTime) - now) / (1000 * 60 * 60);
    if (expiryDiffHours < 2) {
      timeScore = 50; // tight timeline
    } else if (expiryDiffHours >= 4) {
      timeScore = 100;
    }

    // Weighted Total Score
    const matchScore = Math.round(
      0.35 * locationScore + 0.30 * categoryScore + 0.20 * capacityScore + 0.15 * timeScore
    );

    // Build transparent reason
    const reasons = [];
    if (distanceKm <= 5) reasons.push(`Close proximity (${distanceKm} km away)`);
    else reasons.push(`${distanceKm} km away`);

    if (acceptsCategory) reasons.push(`Explicitly accepts ${donation.foodCategory}`);
    if (remainingCapacity >= donationKg) reasons.push(`Sufficient receiving capacity (${remainingCapacity} kg remaining)`);

    recommendations.push({
      ngoId: user._id,
      ngoProfileId: profile._id,
      organizationName: profile.organizationName || user.name,
      contactPerson: user.name,
      phone: user.phone,
      city: user.city,
      distanceKm,
      locationScore: Math.round(locationScore),
      categoryScore: Math.round(categoryScore),
      capacityScore: Math.round(capacityScore),
      matchScore,
      remainingCapacityKg: remainingCapacity,
      recommendationReason: reasons.join(' • '),
    });
  }

  // Sort descending by highest match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return recommendations.slice(0, maxResults);
};

module.exports = { recommendNGOsForDonation };
