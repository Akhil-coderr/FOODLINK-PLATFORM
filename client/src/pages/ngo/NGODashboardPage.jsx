import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ngoService } from '../../services/ngoService';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Inbox,
  CheckCircle2,
  Scale,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Truck,
  Building,
  Heart,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { SkeletonMetric, SkeletonCard } from '../../components/common/Skeleton';

export default function NGODashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const isVerified = user?.ngoProfile?.verificationStatus === 'approved';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, reqsRes, donRes] = await Promise.allSettled([
          ngoService.getDashboardStats(),
          ngoService.getMyRequests({ limit: 5 }),
          donationService.getAll({ limit: 4, status: 'AVAILABLE' }),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }

        if (reqsRes.status === 'fulfilled' && reqsRes.value?.data?.requests) {
          setMyRequests(reqsRes.value.data.requests);
        }

        if (donRes.status === 'fulfilled' && donRes.value?.data?.donations) {
          setNearbyDonations(donRes.value.data.donations);
        }
      } catch (err) {
        console.error('Error fetching NGO dashboard', err);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Verification Pending Banner if applicable */}
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 flex items-start space-x-4 shadow-xs card-interactive transition">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-amber-950">NGO Verification In Progress</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your registration documents are currently under administrative review. You can browse food listings and explore the smart matching recommendations. Once approved, you can request food batches.
            </p>
            <span className="inline-block text-[11px] font-bold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded mt-1">
              Status: {user?.ngoProfile?.verificationStatus || 'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-interactive transition">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {user?.ngoProfile?.organizationName || 'Verified NGO Shelter'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brandText-primary tracking-tight mt-0.5">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-brandText-muted mt-1">
            Browse fresh donations in your area, request meals for your shelter, and verify deliveries.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/ngo/food"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition btn-press"
          >
            <Compass className="w-4 h-4 mr-2" />
            Browse Food
          </Link>
          <Link
            to="/ngo/matching"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold text-sm border border-blue-200 transition btn-press"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-blue-700" />
            Smart Matches
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Food Distributed"
          value={<AnimatedCounter value={stats?.totalFoodReceivedKg || 0} suffix=" kg" />}
          subtext="Total surplus meals served"
          icon={Scale}
          color="forest"
          className="card-interactive"
        />
        <StatCard
          title="Meals Provided"
          value={<AnimatedCounter value={stats?.totalMealsDistributed || 0} />}
          subtext="Nutritious portions"
          icon={Heart}
          color="emerald"
          className="card-interactive"
        />
        <StatCard
          title="My Requests"
          value={<AnimatedCounter value={stats?.totalRequests || 0} />}
          subtext={`${stats?.pendingRequests || 0} pending review`}
          icon={Inbox}
          color="amber"
          className="card-interactive"
        />
        <StatCard
          title="Receiving Capacity"
          value={`${stats?.receivingCapacityKg || 250} kg`}
          subtext="Daily kitchen storage limit"
          icon={Building}
          color="blue"
          className="card-interactive"
        />
      </div>

      {/* Recommended Food Near You */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-brandText-primary">Available Food Donations Nearby</h3>
            <p className="text-xs text-brandText-muted">Active surplus batches matching your intake profile</p>
          </div>
          <Link to="/ngo/food" className="text-xs font-bold text-forest-800 hover:underline">
            View all listings →
          </Link>
        </div>

        {nearbyDonations.length === 0 ? (
          <p className="text-xs text-brandText-muted py-6 text-center">
            No new donations available in your area right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyDonations.map((d) => (
              <div
                key={d._id}
                className="p-4 rounded-2xl bg-surface-light border border-surface-border flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block">
                    {d.foodCategory}
                  </span>
                  <h4 className="font-bold text-sm text-brandText-primary line-clamp-1">{d.foodName}</h4>
                  <div className="text-xs text-brandText-muted mt-1">
                    Qty: <strong className="text-forest-900">{d.quantity} {d.unit}</strong> • {d.city}
                  </div>
                </div>

                <Link
                  to={`/ngo/food/${d._id}`}
                  className="w-full text-center py-1.5 px-3 bg-forest-900 text-white rounded-lg text-xs font-bold hover:bg-forest-800 transition"
                >
                  View & Request
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Requests Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-brandText-primary">My Recent Pickup Requests</h3>
          <Link to="/ngo/requests" className="text-xs font-bold text-forest-800 hover:underline">
            View all requests ({stats?.totalRequests || 0})
          </Link>
        </div>

        {myRequests.length === 0 ? (
          <p className="text-xs text-brandText-muted py-6 text-center">
            You have not made any food requests yet. Browse available listings to request meals.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-brandText-muted uppercase">
                  <th className="pb-3 font-semibold">Food Batch</th>
                  <th className="pb-3 font-semibold">Donor Organization</th>
                  <th className="pb-3 font-semibold">Quantity</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-brandText-primary">{r.donationId?.foodName}</td>
                    <td className="py-3.5 text-brandText-muted">{r.donorId?.name}</td>
                    <td className="py-3.5 font-semibold text-forest-900">{r.requestedQuantity} kg</td>
                    <td className="py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link to={`/ngo/requests`} className="font-bold text-forest-800 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
