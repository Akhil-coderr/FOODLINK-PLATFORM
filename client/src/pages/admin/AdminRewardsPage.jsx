import React, { useEffect, useMemo, useState } from 'react';
import {
  Gift,
  Ticket,
  Award,
  FileText,
  Utensils,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Trash2,
  Pencil,
  Copy,
  Download,
  Users,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import CertificateModal from '../../components/volunteer/CertificateModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminRewardsPage() {
  const [activeTab, setActiveTab] = useState('restaurants'); // 'categories', 'restaurants', 'badges', 'redemptions'
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Data states
  const [rewards, setRewards] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, coupons: 0 });
  const [restaurantPartners, setRestaurantPartners] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletePartnerTarget, setDeletePartnerTarget] = useState(null);
  const [deletePartnerLoading, setDeletePartnerLoading] = useState(false);
  const [rejectRedemption, setRejectRedemption] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [redemptionStatusFilter, setRedemptionStatusFilter] = useState('ALL');
  const [redemptionCategoryFilter, setRedemptionCategoryFilter] = useState('ALL');

  // Restaurant Partner Modal State
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    partnerType: 'restaurant',
    cuisine: 'Multi-Cuisine',
    city: 'Coimbatore',
    discountValue: '20% OFF',
    minPurchase: 250,
    terms: 'Valid on all dine-in and takeaways.',
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    sponsorFunded: true,
    sponsorName: 'Hospitality Partner Sponsor',
    newCouponCodes: '',
  });

  // Certificate Viewer Modal State
  const [inspectCertificate, setInspectCertificate] = useState(null);

  // Edit Reward Modal
  const [editingReward, setEditingReward] = useState(null);
  const [editRewardPoints, setEditRewardPoints] = useState(500);
  const [editRewardDesc, setEditRewardDesc] = useState('');

  // Add Reward Modal state
  const initialRewardForm = {
    name: '',
    category: 'coupon',
    shortDescription: '',
    detailedDescription: '',
    description: '',
    pointsCost: 500,
    // Hotel coupon specific
    hotelName: '',
    couponCode: '',
    discountType: 'percentage',
    discountValue: '25% OFF',
    minBookingAmount: 1500,
    validUntil: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    totalAvailable: 50,
    redemptionLimitPerUser: 1,
    imageUrl: '',
    // Badge specific
    badgeName: '',
    badgeType: 'Milestone Achievement',
    badgeLevel: 'bronze',
    milestonePoints: 100,
    icon: '🏅',
    active: true,
  };

  const [addRewardOpen, setAddRewardOpen] = useState(false);
  const [addRewardLoading, setAddRewardLoading] = useState(false);
  const [rewardForm, setRewardForm] = useState(initialRewardForm);

  // Redeem For Volunteer Modal
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [redeemForm, setRedeemForm] = useState({
    userId: '',
    rewardId: '',
    badgeName: '',
    restaurantPartnerId: '',
    adminNote: '',
  });

  const loadAllAdminData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);

    try {
      const [rewardsRes, partnersRes, badgesRes, certsRes, redemptionsRes] = await Promise.allSettled([
        adminService.getRewards(),
        adminService.getRestaurants(),
        adminService.getBadges(),
        adminService.getCertificates(),
        adminService.getRedemptions(),
      ]);

      if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.data) {
        setRewards(rewardsRes.value.data.rewards || []);
        setStats(rewardsRes.value.data.stats || { total: 0, active: 0, coupons: 0 });
      }

      if (partnersRes.status === 'fulfilled' && partnersRes.value?.data) {
        setRestaurantPartners(partnersRes.value.data.partners || []);
      }

      if (badgesRes.status === 'fulfilled' && badgesRes.value?.data) {
        setBadges(badgesRes.value.data.badges || []);
      }

      if (certsRes.status === 'fulfilled' && certsRes.value?.data) {
        setCertificates(certsRes.value.data.certificates || []);
      }

      if (redemptionsRes.status === 'fulfilled' && redemptionsRes.value?.data) {
        setRedemptions(redemptionsRes.value.data.redemptions || []);
      }
    } catch (err) {
      showMessage('error', 'Failed to load reward administration data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Update Reward Config
  const handleSaveRewardConfig = async (e) => {
    e.preventDefault();
    if (!editingReward) return;

    try {
      await adminService.updateReward(editingReward._id, {
        pointsCost: Number(editRewardPoints),
        description: editRewardDesc,
      });
      showMessage('success', `Updated points configuration for "${editingReward.name}"!`);
      setEditingReward(null);
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Error updating reward configuration.');
    }
  };

  // Create a brand-new reward
  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!rewardForm.name.trim()) {
      showMessage('error', 'Reward name is required.');
      return;
    }
    setAddRewardLoading(true);
    try {
      const payload = {
        ...rewardForm,
        name: rewardForm.name.trim(),
        pointsCost: Number(rewardForm.category === 'coupon' ? rewardForm.pointsCost : rewardForm.milestonePoints),
        milestonePoints: Number(rewardForm.milestonePoints || 100),
        minBookingAmount: Number(rewardForm.minBookingAmount || 0),
        totalAvailable: Number(rewardForm.totalAvailable || 50),
        redemptionLimitPerUser: Number(rewardForm.redemptionLimitPerUser || 1),
      };

      await adminService.createReward(payload);
      showMessage(
        'success',
        `${rewardForm.category === 'coupon' ? 'Hotel Coupon' : 'Badge'} "${rewardForm.name.trim()}" added to the catalog.`
      );
      setAddRewardOpen(false);
      setRewardForm(initialRewardForm);
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Failed to create reward.');
    } finally {
      setAddRewardLoading(false);
    }
  };

  // Admin-assisted redemption on behalf of a volunteer
  const openRedeemModal = async () => {
    setRedeemOpen(true);
    if (volunteers.length > 0) return;
    setVolunteersLoading(true);
    try {
      const res = await adminService.getVolunteers();
      const list = res?.data?.volunteers || res?.data || [];
      setVolunteers(Array.isArray(list) ? list : []);
    } catch (err) {
      showMessage('error', err.message || 'Failed to load volunteers.');
    } finally {
      setVolunteersLoading(false);
    }
  };

  const selectedRedeemReward = rewards.find(
    (reward) => (reward.slug || reward._id) === redeemForm.rewardId
  );
  const selectedVolunteer = volunteers.find(
    (profile) => profile.userId?._id === redeemForm.userId
  );

  const handleRedeemForVolunteer = async (e) => {
    e.preventDefault();
    if (!redeemForm.userId) {
      showMessage('error', 'Please select a volunteer.');
      return;
    }
    if (!selectedRedeemReward) {
      showMessage('error', 'Please select a reward to redeem.');
      return;
    }
    if (selectedRedeemReward.category === 'badge' && !redeemForm.badgeName) {
      showMessage('error', 'Please choose a badge to unlock.');
      return;
    }

    setRedeemLoading(true);
    try {
      const payload = {
        userId: redeemForm.userId,
        rewardId: selectedRedeemReward.slug || selectedRedeemReward._id,
        adminNote: redeemForm.adminNote.trim(),
      };
      if (selectedRedeemReward.category === 'coupon' && redeemForm.restaurantPartnerId) {
        payload.restaurantPartnerId = redeemForm.restaurantPartnerId;
      }
      if (selectedRedeemReward.category === 'badge') {
        payload.badgeName = redeemForm.badgeName;
      }

      const res = await adminService.redeemForUser(payload);
      showMessage('success', res.message || 'Reward redeemed for volunteer.');
      setRedeemOpen(false);
      setRedeemForm({
        userId: '',
        rewardId: '',
        badgeName: '',
        restaurantPartnerId: '',
        adminNote: '',
      });
      window.dispatchEvent(new Event('karma:updated'));
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Failed to redeem reward for volunteer.');
    } finally {
      setRedeemLoading(false);
    }
  };

  // Toggle Reward Active State
  const handleToggleRewardActive = async (reward) => {
    try {
      await adminService.updateReward(reward._id, { active: !reward.active });
      showMessage('success', `Reward "${reward.name}" is now ${!reward.active ? 'Active' : 'Inactive'}.`);
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Error toggling reward status.');
    }
  };

  // Delete Reward
  const handleDeleteReward = async (reward) => {
    if (!window.confirm(`Are you sure you want to delete "${reward.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteReward(reward._id);
      showMessage('success', `Reward "${reward.name}" removed from the catalog.`);
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Error deleting reward.');
    }
  };

  // Restaurant Partner Save
  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    if (!partnerForm.name || !partnerForm.discountValue) {
      showMessage('error', 'Restaurant name and discount value are required.');
      return;
    }

    const rawCodes = partnerForm.newCouponCodes
      .split('\n')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    try {
      if (editingPartner) {
        await adminService.updateRestaurant(editingPartner._id, {
          ...partnerForm,
          newCouponCodes: rawCodes,
        });
        showMessage('success', `Restaurant partner "${partnerForm.name}" updated!`);
      } else {
        await adminService.createRestaurant({
          ...partnerForm,
          couponCodes: rawCodes,
        });
        showMessage('success', `Added "${partnerForm.name}" with ${rawCodes.length} coupon codes!`);
      }

      setPartnerModalOpen(false);
      setEditingPartner(null);
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Failed to save restaurant partner.');
    }
  };

  const handleDeletePartner = (partner) => {
    setDeletePartnerTarget(partner);
  };

  const confirmDeletePartner = async () => {
    if (!deletePartnerTarget) return;
    setDeletePartnerLoading(true);
    try {
      await adminService.deleteRestaurant(deletePartnerTarget._id);
      showMessage('success', 'Restaurant partner removed.');
      setDeletePartnerTarget(null);
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Error deleting partner.');
    } finally {
      setDeletePartnerLoading(false);
    }
  };

  // Redemption Status Handling (Approve / Reject with point refund)
  const handleUpdateRedemptionStatus = async (redemption, status) => {
    if (status === 'REJECTED') {
      setRejectRedemption(redemption);
      setRejectReason('');
      return;
    }

    try {
      await adminService.updateRedemptionStatus(redemption._id, { status, adminNote: '' });
      showMessage('success', `Redemption marked as ${status}.`);
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Error updating status.');
    }
  };

  const submitRejectRedemption = async () => {
    if (!rejectRedemption) return;
    const adminNote = rejectReason.trim();
    setRejectLoading(true);
    try {
      await adminService.updateRedemptionStatus(rejectRedemption._id, { status: 'REJECTED', adminNote });
      showMessage('success', `Redemption marked as REJECTED.`);
      setRejectRedemption(null);
      setRejectReason('');
      await loadAllAdminData(false);
    } catch (err) {
      showMessage('error', err.message || 'Error updating status.');
    } finally {
      setRejectLoading(false);
    }
  };

  // Filtered Redemptions for Audit Tab
  const filteredRedemptions = useMemo(() => {
    let list = redemptions;
    if (redemptionStatusFilter !== 'ALL') {
      list = list.filter((r) => r.status === redemptionStatusFilter);
    }
    if (redemptionCategoryFilter !== 'ALL') {
      list = list.filter((r) => r.rewardCategory === redemptionCategoryFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.userId?.name?.toLowerCase().includes(q) ||
          r.userId?.email?.toLowerCase().includes(q) ||
          r.rewardName?.toLowerCase().includes(q) ||
          r.couponCode?.toLowerCase().includes(q) ||
          r.certificateId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [redemptions, redemptionStatusFilter, redemptionCategoryFilter, search]);

  if (loading) {
    return <LoadingSpinner text="Loading Reward & Redemption Control Center..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {message.text && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}
      {/* Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Gift className="w-8 h-8 text-emerald-400" />
            Reward & Redemption Management
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Configure Karma points rewards, restaurant partners, coupon inventory, achievement badges, and verifiable certificates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openRedeemModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-md cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Redeem for Volunteer</span>
          </button>
          <button
            onClick={() => setAddRewardOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 border border-slate-300 rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reward</span>
          </button>
          <button
            onClick={() => loadAllAdminData(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh All Data</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 flex flex-wrap gap-2">
        {[
          { id: 'categories', label: 'Reward Categories (2 Options)', icon: Gift },
          { id: 'restaurants', label: `Hotels, Restaurants & Coupons (${restaurantPartners.length})`, icon: Utensils },
          { id: 'badges', label: `Profile Badges (${badges.length || 5})`, icon: Award },
          { id: 'redemptions', label: `Redemption Requests & Audit (${redemptions.length})`, icon: Ticket },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/* TAB 1: REWARD CATEGORIES CONFIGURATION */}
      {/* ================================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 text-xs font-semibold text-slate-300">
            <strong className="text-emerald-400 font-bold">Authorized Rules:</strong> Hotel Discount Coupons (500 pts) and Exclusive Profile Badges (150 pts). Volunteers also automatically unlock Karma badges at 100, 500, 1000, then every 1000 up to 10000 lifetime points.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward._id || reward.slug}
                className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{reward.icon || '🎁'}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          reward.category === 'coupon'
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                        }`}
                      >
                        {reward.category === 'coupon' ? 'Hotel Coupon' : `${reward.badgeLevel || 'Badge'}`}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          reward.active
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : 'bg-rose-100 text-rose-950 border border-rose-300'
                        }`}
                      >
                        {reward.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-950 mt-3">{reward.name}</h3>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-xs font-black text-forest-950 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {reward.pointsCost} Karma Points
                    </span>
                    {reward.category === 'coupon' && reward.discountValue && (
                      <span className="text-xs font-black text-amber-950 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        {reward.discountValue}
                      </span>
                    )}
                    {reward.category === 'coupon' && reward.hotelName && (
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                        {reward.hotelName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-900 mt-3 leading-relaxed">
                    {reward.shortDescription || reward.description}
                  </p>

                  {reward.category === 'coupon' && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-800 mt-3 space-y-1">
                      <div className="flex justify-between">
                        <span>Stock Remaining:</span>
                        <span className="font-bold text-slate-950">{reward.remainingCoupons ?? reward.totalAvailable ?? 50} Coupons</span>
                      </div>
                      {reward.validUntil && (
                        <div className="flex justify-between">
                          <span>Expiry:</span>
                          <span className="font-bold text-slate-950">{new Date(reward.validUntil).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingReward(reward);
                      setEditRewardPoints(reward.pointsCost);
                      setEditRewardDesc(reward.description || '');
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleRewardActive(reward)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition ${
                      reward.active
                        ? 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {reward.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                    title="Delete Reward"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 2: RESTAURANT PARTNERS & COUPON INVENTORY */}
      {/* ================================================================== */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <div>
              <h3 className="font-extrabold text-base text-white">Partner Restaurants, Hotels & Sponsor Coupons</h3>
              <p className="text-xs text-slate-400">
                Manage partner restaurants and hotels, sponsor-funded discount values, and unique coupon codes inventory.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPartner(null);
                setPartnerForm({
                  name: '',
                  partnerType: 'restaurant',
                  cuisine: 'South Indian & Multi-Cuisine',
                  city: 'Coimbatore',
                  discountValue: '20% OFF',
                  minPurchase: 250,
                  terms: 'Valid on dine-in and takeaways.',
                  expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
                  sponsorFunded: true,
                  sponsorName: 'Community Restaurant Sponsor',
                  newCouponCodes: '',
                });
                setPartnerModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Restaurant / Hotel Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantPartners.map((partner) => {
              const remaining = (partner.coupons || []).filter((c) => !c.isAssigned).length;
              const total = (partner.coupons || []).length;

              return (
                <div
                  key={partner._id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-lg text-slate-950">{partner.name}</h4>
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full mt-1">
                          {partner.partnerType === 'hotel' ? 'Hotel' : 'Restaurant'}
                        </span>
                        <span className="block text-xs font-bold text-forest-900 mt-1">{partner.city} • {partner.cuisine}</span>
                      </div>
                      <span className="text-sm font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl">
                        {partner.discountValue}
                      </span>
                    </div>

                    <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-950 font-bold">
                        <span>Coupon Inventory:</span>
                        <span className="font-mono text-emerald-950 font-black">
                          {remaining} / {total} Unassigned
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-semibold">
                        <span>Expires:</span>
                        <span>{new Date(partner.expiryDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-semibold">
                        <span>Sponsor:</span>
                        <span className="truncate max-w-[150px]">{partner.sponsorName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setEditingPartner(partner);
                        setPartnerForm({
                          name: partner.name,
                          partnerType: partner.partnerType || 'restaurant',
                          cuisine: partner.cuisine || '',
                          city: partner.city || '',
                          discountValue: partner.discountValue,
                          minPurchase: partner.minPurchase || 0,
                          terms: partner.terms || '',
                          expiryDate: new Date(partner.expiryDate).toISOString().split('T')[0],
                          sponsorFunded: partner.sponsorFunded !== false,
                          sponsorName: partner.sponsorName || '',
                          newCouponCodes: '',
                        });
                        setPartnerModalOpen(true);
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit & Add Codes</span>
                    </button>
                    <button
                      onClick={() => handleDeletePartner(partner)}
                      className="p-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 3: EXCLUSIVE BADGES MANAGEMENT */}
      {/* ================================================================== */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h3 className="font-extrabold text-base text-white">FoodLink Exclusive Recognition Badges (150 pts each)</h3>
            <p className="text-xs text-slate-400">
              Review badge unlocked statistics and see which volunteers have permanently unlocked each badge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{badge.icon}</span>
                    <span className="text-xs font-black text-forest-950 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      150 PTS
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-950 mt-3">{badge.name}</h4>
                  <p className="text-xs font-semibold text-slate-900 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-950 mb-1">
                    <span>Unlocked by:</span>
                    <strong className="text-forest-950 font-black">{badge.unlockedCount || 0} Volunteers</strong>
                  </div>
                  {badge.unlockedBy && badge.unlockedBy.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto pt-1 border-t border-slate-200">
                      {badge.unlockedBy.map((vol) => (
                        <div key={vol._id} className="text-[11px] text-forest-900 font-semibold truncate">
                          • {vol.name} ({vol.email})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-600 font-medium">None unlocked yet</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 4: CERTIFICATES MANAGEMENT */}
      {/* ================================================================== */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h3 className="font-extrabold text-base text-white">Issued Digital Achievement Certificates</h3>
            <p className="text-xs text-slate-400">
              Inspect verified achievement certificates issued to volunteers with authentic delivery counts.
            </p>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-300 text-center text-slate-900 font-bold text-xs">
              No digital certificates have been redeemed yet.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-300 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 font-black uppercase">
                    <tr>
                      <th className="py-3 px-4">Certificate ID</th>
                      <th className="py-3 px-4">Volunteer Recipient</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Deliveries</th>
                      <th className="py-3 px-4">Meals Rescued</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {certificates.map((cert) => (
                      <tr key={cert._id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-black text-blue-950">{cert.certificateId}</td>
                        <td className="py-3.5 px-4">
                          <strong className="block text-slate-950">{cert.recipientName}</strong>
                          <span className="text-[11px] text-forest-900 font-bold">{cert.userId?.email}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {new Date(cert.issueDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-950">{cert.completedDeliveries || 0}</td>
                        <td className="py-3.5 px-4 font-black text-forest-950">{cert.estimatedMealsSaved || 0}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setInspectCertificate(cert)}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect & PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 5: REDEMPTION REQUESTS & AUDIT */}
      {/* ================================================================== */}
      {activeTab === 'redemptions' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <h3 className="font-extrabold text-base text-white">Redemption Audit & Approval Queue</h3>
              <p className="text-xs text-slate-400">
                Filter and inspect all volunteer redemption operations with full points safety audit.
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={redemptionCategoryFilter}
                onChange={(e) => setRedemptionCategoryFilter(e.target.value)}
                className="admin-select-input px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-950 font-bold"
              >
                <option value="ALL">All Categories</option>
                <option value="coupon">Hotel Coupons</option>
                <option value="badge">Badges</option>
              </select>

              <select
                value={redemptionStatusFilter}
                onChange={(e) => setRedemptionStatusFilter(e.target.value)}
                className="admin-select-input px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-950 font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {filteredRedemptions.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-300 text-center text-slate-900 font-bold text-xs">
              No redemption records matching filters.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-300 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 font-black uppercase">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Volunteer</th>
                      <th className="py-3 px-4">Reward Item</th>
                      <th className="py-3 px-4">Code / ID</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRedemptions.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="block text-slate-950 font-extrabold">{r.userId?.name || 'Volunteer'}</strong>
                          <span className="text-[11px] text-forest-900 font-bold block">{r.userId?.email}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-950">{r.rewardName}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-950">
                          {r.couponCode || r.certificateId || r.badgeName || '—'}
                        </td>
                        <td className="py-3 px-4 font-black text-rose-700 whitespace-nowrap">
                          -{r.pointsCost} PTS
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {r.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateRedemptionStatus(r, 'FULFILLED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {r.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateRedemptionStatus(r, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-[11px] font-bold"
                              title="Reject and safely refund Karma Points"
                            >
                              Reject & Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESTAURANT PARTNER MODAL */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-slate-950">
                {editingPartner ? 'Edit Restaurant / Hotel Partner' : 'Add New Restaurant / Hotel Partner'}
              </h3>
              <button onClick={() => setPartnerModalOpen(false)} className="text-slate-500 hover:text-slate-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurant} className="space-y-3 text-xs font-bold text-slate-950">
              <div>
                <label className="block mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="e.g. Annapoorna Gowrishankar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Partner Type *</label>
                  <select
                    value={partnerForm.partnerType}
                    onChange={(e) => setPartnerForm({ ...partnerForm, partnerType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Cuisine / Category</label>
                  <input
                    type="text"
                    value={partnerForm.cuisine}
                    onChange={(e) => setPartnerForm({ ...partnerForm, cuisine: e.target.value })}
                    placeholder="e.g. Multi-Cuisine"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Discount Value *</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.discountValue}
                    onChange={(e) => setPartnerForm({ ...partnerForm, discountValue: e.target.value })}
                    placeholder="e.g. 20% OFF or ₹150 OFF"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1">Min Purchase (₹)</label>
                  <input
                    type="number"
                    value={partnerForm.minPurchase}
                    onChange={(e) => setPartnerForm({ ...partnerForm, minPurchase: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">City</label>
                  <input
                    type="text"
                    value={partnerForm.city}
                    onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1">Coupon Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={partnerForm.expiryDate}
                    onChange={(e) => setPartnerForm({ ...partnerForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Sponsor / Funding Partner Name</label>
                <input
                  type="text"
                  value={partnerForm.sponsorName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, sponsorName: e.target.value })}
                  placeholder="e.g. CSR Sponsor Network"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Add Unique Coupon Codes to Inventory (1 per line)</label>
                <textarea
                  rows={4}
                  value={partnerForm.newCouponCodes}
                  onChange={(e) => setPartnerForm({ ...partnerForm, newCouponCodes: e.target.value })}
                  placeholder="AGS-400-K92X&#10;AGS-400-M17P&#10;AGS-400-B83Q"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  Save Partner & Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REWARD MODAL */}
      {editingReward && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-300 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-950">
              Configure "{editingReward.name}"
            </h3>
            <form onSubmit={handleSaveRewardConfig} className="space-y-3 text-xs font-bold text-slate-950">
              <div>
                <label className="block mb-1">Karma Points Cost</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editRewardPoints}
                  onChange={(e) => setEditRewardPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editRewardDesc}
                  onChange={(e) => setEditRewardDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-900 text-white rounded-xl font-black"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD REWARD MODAL */}
      {addRewardOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-slate-300 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-950">
                  {rewardForm.category === 'coupon' ? 'Add New Hotel Coupon' : 'Add New Milestone Badge'}
                </h3>
                <p className="text-[11px] font-semibold text-slate-700">
                  {rewardForm.category === 'coupon'
                    ? 'Configure a sponsor-funded hotel discount coupon with custom terms and inventory.'
                    : 'Configure a progressive achievement milestone badge for lifetime Karma points.'}
                </p>
              </div>
              <button
                onClick={() => setAddRewardOpen(false)}
                className="text-slate-500 hover:text-slate-950 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Toggle Buttons */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setRewardForm({ ...rewardForm, category: 'coupon', pointsCost: 500 })}
                className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  rewardForm.category === 'coupon'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Hotel Coupon</span>
              </button>
              <button
                type="button"
                onClick={() => setRewardForm({ ...rewardForm, category: 'badge', pointsCost: 100, milestonePoints: 100 })}
                className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  rewardForm.category === 'badge'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Achievement Badge</span>
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3.5 text-xs font-bold text-slate-950 max-h-[70vh] overflow-y-auto pr-1">
              {/* ---------------- A. HOTEL COUPON FIELDS ---------------- */}
              {rewardForm.category === 'coupon' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-950">Reward Name *</label>
                      <input
                        type="text"
                        required
                        value={rewardForm.name}
                        onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                        placeholder="e.g. The Residency Grand - 25% Stay & Dine"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Hotel Name *</label>
                      <input
                        type="text"
                        required
                        value={rewardForm.hotelName}
                        onChange={(e) => setRewardForm({ ...rewardForm, hotelName: e.target.value })}
                        placeholder="e.g. The Residency Grand"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-950">Required Karma Points *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={rewardForm.pointsCost}
                        onChange={(e) => setRewardForm({ ...rewardForm, pointsCost: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Discount Type</label>
                      <select
                        value={rewardForm.discountType}
                        onChange={(e) => setRewardForm({ ...rewardForm, discountType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                        <option value="special_offer">Special Offer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Discount Value *</label>
                      <input
                        type="text"
                        required
                        value={rewardForm.discountValue}
                        onChange={(e) => setRewardForm({ ...rewardForm, discountValue: e.target.value })}
                        placeholder="e.g. 25% OFF or ₹500 OFF"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-950">Coupon Code (optional)</label>
                      <input
                        type="text"
                        value={rewardForm.couponCode}
                        onChange={(e) => setRewardForm({ ...rewardForm, couponCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. GRAND25"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Min. Booking Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={rewardForm.minBookingAmount}
                        onChange={(e) => setRewardForm({ ...rewardForm, minBookingAmount: e.target.value })}
                        placeholder="1500"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Validity / Expiry Date</label>
                      <input
                        type="date"
                        value={rewardForm.validUntil}
                        onChange={(e) => setRewardForm({ ...rewardForm, validUntil: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-950">Total Available Coupons *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={rewardForm.totalAvailable}
                        onChange={(e) => setRewardForm({ ...rewardForm, totalAvailable: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Redemption Limit Per User</label>
                      <input
                        type="number"
                        min="1"
                        value={rewardForm.redemptionLimitPerUser}
                        onChange={(e) => setRewardForm({ ...rewardForm, redemptionLimitPerUser: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-950">Reward Image URL (optional)</label>
                    <input
                      type="url"
                      value={rewardForm.imageUrl}
                      onChange={(e) => setRewardForm({ ...rewardForm, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-950">Short Description</label>
                    <input
                      type="text"
                      value={rewardForm.shortDescription}
                      onChange={(e) => setRewardForm({ ...rewardForm, shortDescription: e.target.value })}
                      placeholder="One-line summary for the reward card"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-950">Detailed Description & Terms</label>
                    <textarea
                      rows={2}
                      value={rewardForm.detailedDescription}
                      onChange={(e) => setRewardForm({ ...rewardForm, detailedDescription: e.target.value })}
                      placeholder="Eligibility, dining hours, room booking conditions, blackout dates..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                    />
                  </div>
                </>
              )}

              {/* ---------------- B. BADGE FIELDS ---------------- */}
              {rewardForm.category === 'badge' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-950">Badge Name *</label>
                      <input
                        type="text"
                        required
                        value={rewardForm.name}
                        onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                        placeholder="e.g. Master Food Hero"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Badge Level *</label>
                      <select
                        value={rewardForm.badgeLevel}
                        onChange={(e) => setRewardForm({ ...rewardForm, badgeLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      >
                        <option value="bronze">Bronze Level</option>
                        <option value="silver">Silver Level</option>
                        <option value="gold">Gold Level</option>
                        <option value="platinum">Platinum Level</option>
                        <option value="diamond">Diamond Level</option>
                        <option value="other">Special Recognition</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-950">Milestone Points Threshold *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={rewardForm.milestonePoints}
                        onChange={(e) => setRewardForm({ ...rewardForm, milestonePoints: e.target.value, pointsCost: e.target.value })}
                        placeholder="100, 200, 300, 400, 500"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Badge Type</label>
                      <input
                        type="text"
                        value={rewardForm.badgeType}
                        onChange={(e) => setRewardForm({ ...rewardForm, badgeType: e.target.value })}
                        placeholder="Milestone Achievement"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-950">Badge Icon (emoji) *</label>
                      <input
                        type="text"
                        required
                        value={rewardForm.icon}
                        onChange={(e) => setRewardForm({ ...rewardForm, icon: e.target.value })}
                        placeholder="🥉, 🥈, 🥇, 💠, 💎"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-950">Badge Image URL (optional)</label>
                    <input
                      type="url"
                      value={rewardForm.imageUrl}
                      onChange={(e) => setRewardForm({ ...rewardForm, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-950">Badge Description</label>
                    <input
                      type="text"
                      value={rewardForm.shortDescription}
                      onChange={(e) => setRewardForm({ ...rewardForm, shortDescription: e.target.value })}
                      placeholder="e.g. Awarded automatically upon reaching 100 lifetime Karma Points."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-950">Detailed Badge Information</label>
                    <textarea
                      rows={2}
                      value={rewardForm.detailedDescription}
                      onChange={(e) => setRewardForm({ ...rewardForm, detailedDescription: e.target.value })}
                      placeholder="Explains what this achievement signifies and where it is showcased."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold"
                    />
                  </div>
                </>
              )}

              <label className="flex items-center gap-2 font-bold pt-1">
                <input
                  type="checkbox"
                  checked={rewardForm.active}
                  onChange={(e) => setRewardForm({ ...rewardForm, active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-950">Activate this reward immediately for volunteers</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAddRewardOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-950 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addRewardLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-60 transition"
                >
                  {addRewardLoading ? 'Saving Reward...' : 'Save & Publish Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REDEEM FOR VOLUNTEER MODAL */}
      {redeemOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-950">Redeem Reward for Volunteer</h3>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  Spend a volunteer's Karma points on their behalf. They are notified instantly.
                </p>
              </div>
              <button
                onClick={() => setRedeemOpen(false)}
                className="text-slate-500 hover:text-slate-950"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRedeemForVolunteer} className="space-y-3 text-xs font-bold text-slate-950">
              <div>
                <label className="block mb-1">Volunteer *</label>
                <select
                  required
                  value={redeemForm.userId}
                  onChange={(e) => setRedeemForm({ ...redeemForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  disabled={volunteersLoading}
                >
                  <option value="">
                    {volunteersLoading ? 'Loading volunteers...' : 'Select a volunteer'}
                  </option>
                  {volunteers.map((profile) => (
                    <option key={profile._id} value={profile.userId?._id}>
                      {profile.userId?.name || 'Volunteer'} — {profile.totalPoints || 0} pts
                    </option>
                  ))}
                </select>
                {selectedVolunteer && (
                  <p className="mt-1 text-[11px] font-semibold text-forest-900">
                    Available balance: {selectedVolunteer.totalPoints || 0} Karma Points
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1">Reward *</label>
                <select
                  required
                  value={redeemForm.rewardId}
                  onChange={(e) =>
                    setRedeemForm({
                      ...redeemForm,
                      rewardId: e.target.value,
                      badgeName: '',
                      restaurantPartnerId: '',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">Select a reward</option>
                  {rewards
                    .filter((reward) => reward.active)
                    .map((reward) => (
                      <option key={reward._id || reward.slug} value={reward.slug || reward._id}>
                        {reward.name} — {reward.pointsCost} pts
                      </option>
                    ))}
                </select>
              </div>

              {selectedRedeemReward?.category === 'coupon' && (
                <div>
                  <label className="block mb-1">Partner Restaurant / Hotel (optional)</label>
                  <select
                    value={redeemForm.restaurantPartnerId}
                    onChange={(e) =>
                      setRedeemForm({ ...redeemForm, restaurantPartnerId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="">Auto-assign next available coupon</option>
                    {restaurantPartners.map((partner) => {
                      const remaining = (partner.coupons || []).filter((c) => !c.isAssigned).length;
                      return (
                        <option key={partner._id} value={partner._id} disabled={remaining === 0}>
                          {partner.name} ({partner.partnerType === 'hotel' ? 'Hotel' : 'Restaurant'}) —{' '}
                          {partner.discountValue} • {remaining} left
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {selectedRedeemReward?.category === 'badge' && (
                <div>
                  <label className="block mb-1">Badge to Unlock *</label>
                  <select
                    required
                    value={redeemForm.badgeName}
                    onChange={(e) => setRedeemForm({ ...redeemForm, badgeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="">Choose a badge</option>
                    {badges.map((badge) => (
                      <option key={badge.id || badge.name} value={badge.name}>
                        {badge.icon} {badge.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-1">Admin Note</label>
                <textarea
                  rows={2}
                  value={redeemForm.adminNote}
                  onChange={(e) => setRedeemForm({ ...redeemForm, adminNote: e.target.value })}
                  placeholder="Optional note stored with this redemption"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {selectedRedeemReward && selectedVolunteer && (
                <div
                  className={`text-[11px] font-bold rounded-xl p-2.5 border ${
                    (selectedVolunteer.totalPoints || 0) >= selectedRedeemReward.pointsCost
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  {(selectedVolunteer.totalPoints || 0) >= selectedRedeemReward.pointsCost
                    ? `Balance after redemption: ${(selectedVolunteer.totalPoints || 0) - selectedRedeemReward.pointsCost} Karma Points`
                    : `Insufficient balance — ${selectedRedeemReward.pointsCost - (selectedVolunteer.totalPoints || 0)} more points required.`}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRedeemOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    redeemLoading ||
                    !selectedRedeemReward ||
                    !selectedVolunteer ||
                    (selectedVolunteer.totalPoints || 0) < selectedRedeemReward.pointsCost
                  }
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeemLoading ? 'Redeeming...' : 'Redeem Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE INSPECT MODAL */}
      <CertificateModal
        certificate={inspectCertificate}
        isOpen={Boolean(inspectCertificate)}
        onClose={() => setInspectCertificate(null)}
      />

      <ConfirmationModal
        isOpen={!!deletePartnerTarget}
        title="Remove restaurant partner"
        message={deletePartnerTarget ? `Are you sure you want to remove "${deletePartnerTarget.name}"?` : ''}
        confirmText="Remove"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeletePartner}
        onClose={() => setDeletePartnerTarget(null)}
        isLoading={deletePartnerLoading}
      />

      {rejectRedemption && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brandText-primary">Reject redemption</h3>
              <button onClick={() => setRejectRedemption(null)} className="text-brandText-muted hover:text-brandText-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-brandText-muted mb-3">
              Please specify rejection reason for "{rejectRedemption.rewardName}". The volunteer's {rejectRedemption.pointsCost} Karma Points will be safely refunded:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              rows={4}
              placeholder="Enter reason..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setRejectRedemption(null)}
                className="px-4 py-2 text-sm font-medium text-brandText-primary bg-slate-100 hover:bg-slate-200 rounded-lg"
                disabled={rejectLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitRejectRedemption}
                disabled={rejectLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                {rejectLoading ? 'Rejecting...' : 'Reject & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
