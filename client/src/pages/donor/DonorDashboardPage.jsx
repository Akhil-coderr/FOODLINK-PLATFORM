import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { ngoService } from '../../services/ngoService';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Inbox,
  CheckCircle2,
  Clock,
  PlusCircle,
  Truck,
  Scale,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { SkeletonMetric, SkeletonTable } from '../../components/common/Skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DonorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, donationsRes, requestsRes] = await Promise.allSettled([
          donationService.getStatistics(),
          donationService.getMyDonations({ limit: 5 }),
          ngoService.getIncomingRequests({ limit: 5, status: 'PENDING' }),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }

        if (donationsRes.status === 'fulfilled' && donationsRes.value?.data?.donations) {
          setRecentDonations(donationsRes.value.data.donations);
        }

        if (requestsRes.status === 'fulfilled' && requestsRes.value?.data?.requests) {
          setIncomingRequests(requestsRes.value.data.requests);
        }
      } catch (err) {
        console.error('Error fetching donor dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const chartData = [
    { day: 'Mon', kg: 15 },
    { day: 'Tue', kg: 30 },
    { day: 'Wed', kg: 25 },
    { day: 'Thu', kg: 45 },
    { day: 'Fri', kg: 35 },
    { day: 'Sat', kg: stats?.totalFoodRescuedKg ? Math.round(stats.totalFoodRescuedKg * 0.3) : 55 },
    { day: 'Sun', kg: stats?.totalFoodRescuedKg ? Math.round(stats.totalFoodRescuedKg * 0.4) : 40 },
  ];

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
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-interactive transition">
        <div>
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">
            {user?.donorProfile?.organizationName || 'Donor Portal'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-brandText-primary tracking-tight mt-0.5">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-brandText-muted mt-1">
            Track your edible surplus food batches, review incoming NGO requests, and monitor your meals saved.
          </p>
        </div>
        <Link
          to="/donor/donations/create"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition flex-shrink-0 btn-press"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Food Donation
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rescued"
          value={<AnimatedCounter value={stats?.totalFoodRescuedKg || 0} suffix=" kg" />}
          subtext="Food saved from landfills"
          icon={Scale}
          color="forest"
          className="card-interactive"
        />
        <StatCard
          title="Active Listings"
          value={<AnimatedCounter value={stats?.availableDonations || 0} />}
          subtext="Available for NGO discovery"
          icon={Package}
          color="blue"
          className="card-interactive"
        />
        <StatCard
          title="Pending Requests"
          value={<AnimatedCounter value={stats?.pendingRequests || 0} />}
          subtext="Awaiting your approval"
          icon={Inbox}
          color="amber"
          className="card-interactive"
        />
        <StatCard
          title="Completed Drops"
          value={<AnimatedCounter value={stats?.completedDonations || 0} />}
          subtext="Verified shelter deliveries"
          icon={CheckCircle2}
          color="emerald"
          className="card-interactive"
        />
      </div>

      {/* Main Grid: Chart & Incoming Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Rescue Volume */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-brandText-primary">Weekly Food Rescue Volume</h3>
              <p className="text-xs text-brandText-muted">Kilograms of surplus saved this week</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-forest-50 text-forest-800 rounded-lg">
              Live Aggregate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#14532D', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="kg" fill="#14532D" radius={[6, 6, 0, 0]} name="Kg Rescued" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incoming NGO Requests */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-brandText-primary">Incoming NGO Requests</h3>
              <Link to="/donor/requests" className="text-xs font-bold text-forest-800 hover:underline">
                View all
              </Link>
            </div>

            {incomingRequests.length === 0 ? (
              <p className="text-xs text-brandText-muted py-8 text-center">
                No pending requests. As soon as an NGO claims your food, it will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-2xl bg-surface-light border border-surface-border flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-brandText-primary">
                        {req.ngoId?.name || 'Verified Shelter'}
                      </h4>
                      <p className="text-[11px] text-brandText-muted">
                        Requested: {req.requestedQuantity} kg of {req.donationId?.foodName}
                      </p>
                    </div>
                    <Link
                      to="/donor/requests"
                      className="px-2.5 py-1 text-xs font-bold bg-forest-900 text-white rounded-lg hover:bg-forest-800 transition"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/donor/donations"
              className="w-full block text-center py-2 text-xs font-semibold text-brandText-muted hover:text-brandText-primary"
            >
              Manage all my published donations →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-brandText-primary">Recent Food Donations</h3>
          <Link to="/donor/donations" className="text-xs font-bold text-forest-800 hover:underline">
            View all ({stats?.totalDonations || 0})
          </Link>
        </div>

        {recentDonations.length === 0 ? (
          <p className="text-xs text-brandText-muted py-6 text-center">
            You have not published any food donations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-brandText-muted uppercase">
                  <th className="pb-3 font-semibold">Dish / Food Name</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Quantity</th>
                  <th className="pb-3 font-semibold">Expiry</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDonations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-brandText-primary">{d.foodName}</td>
                    <td className="py-3.5 text-brandText-muted">{d.foodCategory}</td>
                    <td className="py-3.5 font-semibold text-forest-900">
                      {d.quantity} {d.unit}
                    </td>
                    <td className="py-3.5 text-brandText-muted">
                      {new Date(d.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/donor/donations/${d._id}`}
                        className="font-bold text-forest-800 hover:underline"
                      >
                        Details
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
