import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { volunteerService } from '../../services/volunteerService';
import { assignmentService } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  Award,
  CheckCircle2,
  Compass,
  QrCode,
  Package,
  Bike,
  ArrowRight,
  TrendingUp,
  Gift,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { SkeletonMetric, SkeletonCard } from '../../components/common/Skeleton';

export default function VolunteerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, assignRes] = await Promise.allSettled([
          volunteerService.getDashboardStats(),
          volunteerService.getMyAssignments(),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }

        if (assignRes.status === 'fulfilled' && assignRes.value?.data) {
          setActiveTasks(assignRes.value.data.filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED'));
        }
      } catch (err) {
        console.error('Error fetching volunteer dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-28 rounded-3xl bg-slate-100 skeleton-shimmer"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-interactive transition">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Volunteer Logistics Hero
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brandText-primary tracking-tight mt-0.5">
            Welcome, {user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-brandText-muted mt-1">
            Pick up surplus food from generous donors, deliver to community shelters, and earn karma points.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/volunteer/scan"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition btn-press"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Scan QR Code
          </Link>
          <Link
            to="/volunteer/tasks"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-sm border border-amber-200 transition btn-press"
          >
            <Package className="w-4 h-4 mr-1.5 text-amber-700" />
            Available Pickups
          </Link>
          <Link
            to="/volunteer/rewards"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition btn-press"
          >
            <Gift className="w-4 h-4 mr-1.5" />
            Redeem Points
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Karma Points"
          value={<AnimatedCounter value={stats?.totalPoints || 0} />}
          subtext="20 pts earned per dropoff"
          icon={Award}
          color="amber"
          className="card-interactive"
        />
        <StatCard
          title="Active Deliveries"
          value={<AnimatedCounter value={stats?.activeAssignments || 0} />}
          subtext="In transit or scheduled"
          icon={Truck}
          color="blue"
          className="card-interactive"
        />
        <StatCard
          title="Completed Tasks"
          value={<AnimatedCounter value={stats?.completedTasks || 0} />}
          subtext="Verified shelter drops"
          icon={CheckCircle2}
          color="forest"
          className="card-interactive"
        />
        <StatCard
          title="Distance Covered"
          value={<AnimatedCounter value={stats?.totalDistanceKm || 0} suffix=" km" />}
          subtext="Ecological logistics radius"
          icon={Compass}
          color="emerald"
          className="card-interactive"
        />
      </div>

      {/* Active Assignments */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-brandText-primary">Current Pickup Assignments</h3>
          <Link to="/volunteer/assignments" className="text-xs font-bold text-forest-800 hover:underline">
            Manage all ({activeTasks.length}) →
          </Link>
        </div>

        {activeTasks.length === 0 ? (
          <div className="p-8 text-center bg-surface-light rounded-2xl border border-surface-border">
            <p className="text-xs text-brandText-muted mb-3">
              You have no active pickups assigned right now.
            </p>
            <Link
              to="/volunteer/tasks"
              className="inline-flex items-center px-4 py-2 bg-forest-900 text-white rounded-xl text-xs font-bold"
            >
              Claim a Volunteer Task
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTasks.map((t) => (
              <div
                key={t._id}
                className="p-5 rounded-2xl bg-surface-light border border-surface-border flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded">
                      {t.donationId?.foodName}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-brandText-muted space-y-1">
                    <div>
                      From Donor: <strong className="text-brandText-primary">{t.donorId?.name} ({t.donorId?.city})</strong>
                    </div>
                    <div>
                      To Shelter: <strong className="text-brandText-primary">{t.ngoId?.name}</strong>
                    </div>
                    <div>
                      Quantity: <strong className="text-forest-900">{t.donationId?.quantity} kg</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <Link
                    to="/volunteer/routes"
                    className="flex-1 text-center py-2 px-3 bg-white hover:bg-slate-50 border border-surface-border rounded-xl text-xs font-bold text-brandText-primary"
                  >
                    View Map Route
                  </Link>
                  <Link
                    to="/volunteer/scan"
                    className="flex-1 text-center py-2 px-3 bg-forest-900 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition"
                  >
                    Verify QR Code
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards & Redemption Quick Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-lg text-slate-950 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-600" />
              Karma Points Reward Store
            </h3>
            <p className="text-xs font-semibold text-slate-700">
              You have <strong className="text-forest-950 font-black">{stats?.totalPoints || 0} Karma Points</strong> available to redeem.
            </p>
          </div>
          <Link
            to="/volunteer/rewards"
            className="inline-flex items-center gap-1 text-xs font-black text-forest-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition"
          >
            <span>Open Full Rewards Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Hotel Coupons */}
          <Link
            to="/volunteer/rewards"
            className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 transition flex flex-col justify-between space-y-2 group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🏨</span>
                <span className="text-xs font-black text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full">
                  500 PTS
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-950 mt-2">
                Hotel Coupons
              </h4>
              <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                15% - 20% OFF at The Residency Grand, Annapoorna Hospitality, and partner hotels.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 group-hover:underline inline-flex items-center gap-1">
              <span>{(stats?.totalPoints || 0) >= 500 ? 'Redeem Coupon' : `Need ${500 - (stats?.totalPoints || 0)} pts`}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          {/* Option 2: Exclusive Badges */}
          <Link
            to="/volunteer/rewards"
            className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/60 transition flex flex-col justify-between space-y-2 group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🛡️</span>
                <span className="text-xs font-black text-emerald-950 bg-emerald-200 px-2.5 py-0.5 rounded-full">
                  150 PTS
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-950 mt-2">
                Exclusive Badges
              </h4>
              <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                Unlock Food Hero, Green Champion, Community Star, and Helping Hands.
              </p>
            </div>
            <span className="text-xs font-bold text-forest-900 group-hover:underline inline-flex items-center gap-1">
              <span>{(stats?.totalPoints || 0) >= 150 ? 'Unlock Badge' : `Need ${150 - (stats?.totalPoints || 0)} pts`}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
