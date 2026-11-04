import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Award,
  CheckCircle2,
  Clock,
  Gift,
  History,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Ticket,
  X,
  Copy,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Utensils,
  Star,
  Check,
  Building2,
  Calendar,
  Lock,
} from 'lucide-react';
import { rewardService } from '../../services/rewardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

export default function VolunteerRewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [restaurantPartners, setRestaurantPartners] = useState([]);
  const [canonicalBadges, setCanonicalBadges] = useState([]);
  const [activeBadges, setActiveBadges] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [points, setPoints] = useState(0);
  const [badgeProgress, setBadgeProgress] = useState(null);
  const [overview, setOverview] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active filter tab for redeemed rewards (Hotel Coupons & Badges only)
  const [redeemedTab, setRedeemedTab] = useState('ALL'); // ALL, coupon, badge

  // Redemption dialog states
  const [selectedCouponToRedeem, setSelectedCouponToRedeem] = useState(null);
  const [redeemSuccessData, setRedeemSuccessData] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  // Copy code feedback state
  const [copiedCode, setCopiedCode] = useState(null);

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);

    try {
      const [catalogRes, redemptionsRes, overviewRes] = await Promise.allSettled([
        rewardService.getCatalog(),
        rewardService.getMyRedemptions(),
        rewardService.getKarmaOverview(),
      ]);

      if (catalogRes.status === 'fulfilled' && catalogRes.value?.data) {
        const catData = catalogRes.value.data;
        setRewards(catData.rewards || []);
        setRestaurantPartners(catData.restaurantPartners || []);
        setCanonicalBadges(catData.canonicalBadges || []);
        setActiveBadges(catData.activeBadges || []);
        setUnlockedBadges(catData.unlockedBadges || []);
        setPoints(catData.points || 0);
        if (catData.badgeProgress) setBadgeProgress(catData.badgeProgress);
      }

      if (redemptionsRes.status === 'fulfilled' && redemptionsRes.value?.data) {
        setRedemptions(redemptionsRes.value.data.redemptions || []);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setOverview(overviewRes.value.data);
        if (overviewRes.value.data.badgeProgress) {
          setBadgeProgress(overviewRes.value.data.badgeProgress);
        }
      }
    } catch (err) {
      toast.error('Failed to load rewards data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Only Hotel Coupons and Badges redemptions
  const validRedemptions = useMemo(() => {
    return redemptions.filter((r) => r.rewardCategory === 'coupon' || r.rewardCategory === 'badge');
  }, [redemptions]);

  // Filtered redeemed rewards
  const filteredRedemptions = useMemo(() => {
    if (redeemedTab === 'ALL') return validRedemptions;
    return validRedemptions.filter((r) => r.rewardCategory === redeemedTab);
  }, [validRedemptions, redeemedTab]);

  // Hotel Coupons List from persistent DB
  const hotelCoupons = useMemo(() => {
    return rewards.filter((r) => r.category === 'coupon' && r.active);
  }, [rewards]);

  // Badges List from persistent DB
  const milestoneBadges = useMemo(() => {
    const list = rewards.filter((r) => r.category === 'badge' && r.active);
    if (list.length > 0) return list;
    return activeBadges.length > 0 ? activeBadges : canonicalBadges;
  }, [rewards, activeBadges, canonicalBadges]);

  // Execute Coupon Redemption
  const handleExecuteCouponRedeem = async () => {
    if (!selectedCouponToRedeem) return;
    setRedeeming(true);

    try {
      const payload = {
        rewardId: selectedCouponToRedeem.slug || selectedCouponToRedeem._id,
      };

      const res = await rewardService.redeem(payload);

      if (res.success) {
        toast.success(res.message || 'Hotel coupon redeemed successfully!');
        setRedeemSuccessData(res.data);
        setSelectedCouponToRedeem(null);
        await loadData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Could not complete coupon redemption.');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Karma Rewards & Points Overview..." size="lg" />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Volunteer Rewards Program
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2 mt-0.5">
            <Gift className="w-8 h-8 text-emerald-600" />
            Karma Points & Reward Redemption
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
            Redeem your earned Karma Points for sponsor-funded hotel coupons and earn exclusive badges.
          </p>
        </div>
        <button
          onClick={() => loadData(false)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-950 font-bold text-xs hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Store</span>
        </button>
      </div>

      {/* A. KARMA POINTS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Points */}
        <div className="bg-gradient-to-br from-emerald-800 to-forest-900 text-white rounded-3xl p-6 shadow-lg border border-emerald-700 relative overflow-hidden card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Available Points
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="text-4xl font-black tracking-tight mt-3 text-white">
            {points}
          </div>
          <p className="text-xs text-emerald-200 font-semibold mt-1">
            Ready to spend on hotel coupons
          </p>
        </div>

        {/* Total Points Earned */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-300 card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Lifetime Earned
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 mt-3">
            {overview?.totalPointsEarned || badgeProgress?.lifetimePoints || points}
          </div>
          <p className="text-xs font-semibold text-forest-900 mt-1">
            Determines your milestone badges
          </p>
        </div>

        {/* Total Points Redeemed */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-300 card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Points Redeemed
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 mt-3">
            {overview?.totalPointsRedeemed || 0}
          </div>
          <p className="text-xs font-semibold text-forest-900 mt-1">
            Spent on hotel discount coupons
          </p>
        </div>

        {/* Unlocked Badges */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-300 card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Unlocked Badges
            </span>
            <div className="w-9 h-9 rounded-xl bg-forest-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-forest-900" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 mt-3">
            {unlockedBadges.length} / {milestoneBadges.length || 5}
          </div>
          <p className="text-xs font-semibold text-forest-900 mt-1">
            Milestones earned permanently
          </p>
        </div>
      </div>

      {/* A2. KARMA BADGE LADDER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-700" /> Progressive Milestone Ladder
            </h2>
            <p className="text-xs font-semibold text-slate-900 mt-0.5">
              Badges unlock automatically when your lifetime Karma Points reach each unique threshold. Badges are never lost when points are redeemed.
            </p>
          </div>
          {badgeProgress?.currentBadge && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-3.5 py-2">
              <span className="text-2xl">{badgeProgress.currentBadge.icon}</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Current Badge Tier</p>
                <p className="text-sm font-black text-emerald-950">{badgeProgress.currentBadge.name}</p>
              </div>
            </div>
          )}
        </div>

        {badgeProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>{badgeProgress.lifetimePoints} Lifetime Karma Points</span>
              <span>
                {badgeProgress.nextBadge
                  ? `${badgeProgress.pointsToNext} more pts to unlock ${badgeProgress.nextBadge.name}`
                  : 'Highest milestone tier achieved 🎉'}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
                style={{ width: `${badgeProgress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(badgeProgress?.allBadges || []).map((tier) => (
            <div
              key={tier.id}
              title={tier.description}
              className={`rounded-2xl border-2 p-3.5 flex flex-col justify-between transition ${
                tier.earned
                  ? 'border-emerald-400 bg-emerald-50/80 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-2xl ${tier.earned ? '' : 'grayscale'}`}>{tier.icon}</span>
                {tier.earned ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 border border-emerald-400">
                    Earned
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">
                    {tier.threshold} pts
                  </span>
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-black text-slate-950 truncate">{tier.name}</p>
                <p className="text-[10px] font-semibold text-slate-700 line-clamp-1">{tier.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: HOTEL DISCOUNT COUPONS */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-600" />
              Available Hotel Coupons ({hotelCoupons.length})
            </h2>
            <p className="text-xs font-semibold text-slate-900 mt-0.5">
              Redeem Karma Points for verified stay and dining discounts funded by hospitality sponsors.
            </p>
          </div>
        </div>

        {hotelCoupons.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-300">
            <Gift className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-950">No Hotel Coupons currently in stock.</p>
            <p className="text-xs text-slate-600">New sponsor-funded hotel coupons are added by administrators periodically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelCoupons.map((coupon) => {
              const isOutOfStock = (coupon.availableCount ?? coupon.remainingCoupons ?? 1) <= 0;
              const hasInsufficientPoints = points < coupon.pointsCost;
              const isExpired = coupon.isExpired;
              const isLimitReached = coupon.limitReached;

              return (
                <div
                  key={coupon._id || coupon.slug}
                  className="bg-white rounded-3xl border-2 border-amber-300 shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between card-interactive"
                >
                  <div>
                    {/* Card Image Banner */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={
                          coupon.imageUrl ||
                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop'
                        }
                        alt={coupon.name}
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-amber-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          <span>Hotel Coupon</span>
                        </span>
                        {coupon.discountValue && (
                          <span className="bg-emerald-600 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-md">
                            {coupon.discountValue}
                          </span>
                        )}
                      </div>

                      {/* Hotel Name Overlay */}
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                          {coupon.hotelName || 'Partner Hotel Establishment'}
                        </span>
                        <h3 className="text-base font-black text-white leading-tight line-clamp-1">
                          {coupon.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Cost:</span>
                        <span className="inline-flex items-center gap-1 text-sm font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> {coupon.pointsCost} Karma Points
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                        {coupon.shortDescription || coupon.description || 'Exclusive stay and dining discount coupon for verified volunteers.'}
                      </p>

                      {/* Details Box */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5 font-semibold text-slate-900">
                        {coupon.minBookingAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Min. Booking:</span>
                            <span className="font-bold text-slate-950">₹{coupon.minBookingAmount}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Validity:</span>
                          <span className="font-bold text-slate-950">
                            {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString('en-IN') : '90 Days'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Available:</span>
                          <span
                            className={`font-black px-2 py-0.5 rounded-md text-[10px] ${
                              isOutOfStock ? 'bg-rose-100 text-rose-950' : 'bg-emerald-100 text-emerald-950'
                            }`}
                          >
                            {isOutOfStock ? 'Sold Out' : `${coupon.availableCount ?? coupon.remainingCoupons ?? 50} Available`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-5 pt-0">
                    {isExpired ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 font-bold text-xs cursor-not-allowed"
                      >
                        Offer Expired
                      </button>
                    ) : isLimitReached ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 font-bold text-xs cursor-not-allowed"
                      >
                        Redemption Limit Reached
                      </button>
                    ) : isOutOfStock ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 font-bold text-xs cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    ) : hasInsufficientPoints ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Need {coupon.pointsCost - points} more Karma Points</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedCouponToRedeem(coupon)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Redeem Hotel Coupon ({coupon.pointsCost} pts)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2: EXCLUSIVE MILESTONE BADGES */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            Milestone Achievement Badges ({milestoneBadges.length})
          </h2>
          <p className="text-xs font-semibold text-slate-900 mt-0.5">
            Progressive badges unlock automatically from your lifetime Karma Points and remain permanently active on your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {milestoneBadges.map((badge) => {
            const threshold = badge.milestonePoints || badge.pointsCost || 100;
            const isUnlocked = badge.isUnlocked || unlockedBadges.includes(badge.name);
            const lifetimePoints = overview?.totalPointsEarned || badgeProgress?.lifetimePoints || points;
            const pointsNeeded = Math.max(0, threshold - lifetimePoints);

            return (
              <div
                key={badge._id || badge.slug}
                className={`bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 card-interactive ${
                  isUnlocked
                    ? 'border-emerald-400 shadow-md bg-gradient-to-br from-white to-emerald-50/40'
                    : 'border-slate-300 shadow-xs opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{badge.icon || '🏅'}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {badge.badgeLevel ? `${badge.badgeLevel} Tier` : 'Milestone'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-950 mt-3">
                    {badge.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                    {badge.description || badge.shortDescription || `Unlocks automatically upon reaching ${threshold} Karma Points.`}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Milestone Threshold:</span>
                    <span className="text-slate-950 font-black">{threshold} Lifetime Points</span>
                  </div>

                  {isUnlocked ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-xs text-center flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Unlocked & Active on Profile</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-full py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Need {pointsNeeded} more points</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((lifetimePoints / threshold) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3: MY REDEEMED REWARDS WITH TABS/FILTERS */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-forest-900" /> My Redeemed Rewards ({validRedemptions.length})
            </h2>
            <p className="text-xs font-semibold text-slate-900 mt-0.5">
              Access your assigned hotel coupon codes and unlocked profile badges.
            </p>
          </div>

          {/* Filter Tabs: Hotel Coupons and Badges */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-300">
            {[
              { id: 'ALL', label: `All (${validRedemptions.length})` },
              { id: 'coupon', label: 'Hotel Coupons' },
              { id: 'badge', label: 'Badges' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRedeemedTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  redeemedTab === tab.id
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'text-slate-900 hover:text-forest-900 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRedemptions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 space-y-2">
            <Gift className="w-10 h-10 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-950">No redeemed rewards found in this category.</p>
            <p className="text-xs text-slate-700">
              Redeem your available Karma Points from the store above to get hotel coupons, or earn deliveries to unlock badges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRedemptions.map((item) => (
              <div
                key={item._id}
                className="bg-white p-5 rounded-2xl border border-slate-300 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          item.rewardCategory === 'coupon'
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                        }`}
                      >
                        {item.rewardCategory === 'coupon' ? 'Hotel Coupon' : 'Badge'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-950 mt-1">
                      {item.rewardName}
                    </h3>
                  </div>

                  <span className="text-xs font-black text-forest-950 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg">
                    {item.pointsCost > 0 ? `-${item.pointsCost} PTS` : 'Milestone'}
                  </span>
                </div>

                {/* Specific Category Data Display */}
                {item.rewardCategory === 'coupon' && item.couponCode && (
                  <div className="bg-amber-50/90 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-950 tracking-wider">
                        Assigned Coupon Code:
                      </div>
                      <div className="text-base font-black font-mono text-amber-950 tracking-wider">
                        {item.couponCode}
                      </div>
                      {item.expiryDate && (
                        <div className="text-[10px] font-semibold text-amber-900 mt-0.5">
                          Expires: {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopyCode(item.couponCode)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      {copiedCode === item.couponCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-900 font-semibold">Status:</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: POINTS TRANSACTION HISTORY */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-4">
        <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-forest-900" /> Karma Points Transaction History
        </h2>
        <p className="text-xs font-semibold text-slate-900">
          Permanent ledger of points earned from verified deliveries and deducted for hotel coupon redemptions.
        </p>

        {overview?.recentTransactions?.length === 0 ? (
          <p className="text-xs text-slate-700 italic">No Karma transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Points</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(overview?.recentTransactions || []).map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-950 font-bold whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tx.type === 'EARN'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : 'bg-amber-100 text-amber-950 border border-amber-300'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-950 font-semibold">{tx.description}</td>
                    <td className="py-3 px-4 text-right font-black whitespace-nowrap">
                      <span className={tx.type === 'EARN' ? 'text-emerald-700' : 'text-rose-700'}>
                        {tx.type === 'EARN' ? `+${tx.amount}` : `-${tx.amount}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-950 whitespace-nowrap">
                      {tx.balanceAfter} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL: REDEEM HOTEL COUPON */}
      {selectedCouponToRedeem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-300 shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-950 font-black text-lg">
                <Utensils className="w-5 h-5 text-amber-600" />
                <span>Confirm Hotel Coupon Redemption</span>
              </div>
              <button
                onClick={() => setSelectedCouponToRedeem(null)}
                className="p-1 text-slate-500 hover:text-slate-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                  {selectedCouponToRedeem.hotelName || 'Partner Hotel'}
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-0.5">
                  {selectedCouponToRedeem.name}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {selectedCouponToRedeem.detailedDescription || selectedCouponToRedeem.description}
                </p>
                {selectedCouponToRedeem.discountValue && (
                  <div className="mt-2 inline-block bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs">
                    {selectedCouponToRedeem.discountValue}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5 font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Points to be Deducted:</span>
                  <span className="text-base font-black text-amber-950">
                    {selectedCouponToRedeem.pointsCost} Karma Points
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Remaining Balance After:</span>
                  <span className="font-bold text-slate-950">
                    {points - selectedCouponToRedeem.pointsCost} Points
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Coupon Validity:</span>
                  <span className="font-bold text-slate-950">
                    {selectedCouponToRedeem.validUntil
                      ? new Date(selectedCouponToRedeem.validUntil).toLocaleDateString('en-IN')
                      : '90 Days from issuance'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] font-semibold text-slate-600">
                • A unique sponsor-funded coupon code will be assigned immediately.
                <br />• Your coupon code will be saved in your "My Redeemed Rewards" section.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCouponToRedeem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-950 font-bold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={redeeming}
                onClick={handleExecuteCouponRedeem}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {redeeming ? 'Redeeming Coupon...' : `Confirm & Redeem (${selectedCouponToRedeem.pointsCost} pts)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL: REDEEMED COUPON CODE */}
      {redeemSuccessData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-300 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-950">Coupon Successfully Assigned!</h3>
            <p className="text-xs font-semibold text-slate-700">
              Your sponsor-funded discount coupon for <strong>{redeemSuccessData.hotelName || 'our partner hotel'}</strong> is ready to use.
            </p>

            <div className="bg-amber-50 p-4 rounded-2xl border-2 border-dashed border-amber-300 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                Your Exclusive Coupon Code
              </span>
              <div className="text-xl font-black font-mono tracking-widest text-amber-950">
                {redeemSuccessData.couponCode}
              </div>
              <button
                onClick={() => handleCopyCode(redeemSuccessData.couponCode)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                {copiedCode === redeemSuccessData.couponCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Coupon Code</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] font-semibold text-slate-600">
              Show this code during check-in or booking to receive your sponsor-funded discount.
            </p>

            <button
              onClick={() => setRedeemSuccessData(null)}
              className="w-full py-2.5 bg-forest-900 hover:bg-forest-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Done & View My Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
