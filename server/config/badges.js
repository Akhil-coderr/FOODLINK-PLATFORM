/**
 * Karma Badge Tiers.
 *
 * A volunteer permanently unlocks a badge when their LIFETIME earned Karma
 * reaches each threshold. Badges are derived from lifetime points, so spending
 * points on rewards never removes a badge that was already earned.
 *
 * Progressive Milestone Ladder: 100 Bronze, 200 Silver, 300 Gold, 400 Platinum, 500 Diamond.
 */
const KARMA_BADGE_TIERS = [
  {
    id: 'bronze_badge',
    name: 'Bronze Badge',
    threshold: 100,
    icon: '🥉',
    accent: 'amber',
    level: 'bronze',
    description: '100 Karma earned. First milestone unlocked in your food rescue journey.',
  },
  {
    id: 'silver_badge',
    name: 'Silver Badge',
    threshold: 200,
    icon: '🥈',
    accent: 'slate',
    level: 'silver',
    description: '200 Karma earned. Consistent commitment to hunger relief and food diversion.',
  },
  {
    id: 'gold_badge',
    name: 'Gold Badge',
    threshold: 300,
    icon: '🥇',
    accent: 'yellow',
    level: 'gold',
    description: '300 Karma earned. Master volunteer with verified hygiene and prompt deliveries.',
  },
  {
    id: 'platinum_badge',
    name: 'Platinum Badge',
    threshold: 400,
    icon: '💠',
    accent: 'purple',
    level: 'platinum',
    description: '400 Karma earned. Veteran food rescue ambassador championing community kitchens.',
  },
  {
    id: 'diamond_badge',
    name: 'Diamond Badge',
    threshold: 500,
    icon: '💎',
    accent: 'cyan',
    level: 'diamond',
    description: '500 Karma earned. Premier achievement level honoring exceptional community impact.',
  },
];

/** Badges earned at or below the given lifetime points, highest last. */
const getEarnedBadges = (points = 0) =>
  KARMA_BADGE_TIERS.filter((tier) => points >= tier.threshold);

/** Highest badge earned, or null when the first threshold is not reached. */
const getCurrentBadge = (points = 0) => {
  const earned = getEarnedBadges(points);
  return earned.length > 0 ? earned[earned.length - 1] : null;
};

/** Next badge to unlock, or null when the ladder is complete. */
const getNextBadge = (points = 0) =>
  KARMA_BADGE_TIERS.find((tier) => points < tier.threshold) || null;

/**
 * Full progress summary for a lifetime points value.
 */
const getBadgeProgress = (points = 0, dynamicBadges = null) => {
  const safePoints = Math.max(0, Number(points) || 0);
  const tiers = Array.isArray(dynamicBadges) && dynamicBadges.length > 0
    ? dynamicBadges.map((b) => ({
        id: b.slug || b._id,
        name: b.name || b.badgeName,
        threshold: b.milestonePoints || b.pointsCost || 100,
        icon: b.icon || '🏅',
        accent: b.accent || 'emerald',
        level: b.badgeLevel || 'bronze',
        description: b.description || b.shortDescription || '',
      })).sort((a, b) => a.threshold - b.threshold)
    : KARMA_BADGE_TIERS;

  const earned = tiers.filter((t) => safePoints >= t.threshold);
  const current = earned.length > 0 ? earned[earned.length - 1] : null;
  const next = tiers.find((t) => safePoints < t.threshold) || null;

  let progressPercent = 100;
  let pointsToNext = 0;

  if (next) {
    const base = current ? current.threshold : 0;
    const span = next.threshold - base;
    progressPercent = span > 0 ? Math.min(100, Math.round(((safePoints - base) / span) * 100)) : 0;
    pointsToNext = next.threshold - safePoints;
  }

  return {
    lifetimePoints: safePoints,
    currentBadge: current,
    nextBadge: next,
    pointsToNext,
    progressPercent,
    earnedBadges: earned,
    allBadges: tiers.map((tier) => ({
      ...tier,
      earned: safePoints >= tier.threshold,
    })),
  };
};

module.exports = {
  KARMA_BADGE_TIERS,
  getEarnedBadges,
  getCurrentBadge,
  getNextBadge,
  getBadgeProgress,
};
