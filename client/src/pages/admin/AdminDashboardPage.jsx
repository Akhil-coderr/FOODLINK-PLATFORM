import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Users,
  ShieldCheck,
  Package,
  Inbox,
  Truck,
  Scale,
  UtensilsCrossed,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling platform metrics..." size="lg" />;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-forest-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-forest-300 uppercase tracking-wider">
            Platform Administration & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">System Control Center</h1>
          <p className="text-xs sm:text-sm text-forest-100 max-w-xl">
            Real-time oversight over multi-tenant user authentication, NGO credential auditing, and verified food redistribution transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/ngos"
            className="px-4 py-2.5 bg-white text-forest-900 text-xs font-bold rounded-xl shadow-md hover:bg-forest-50 transition"
          >
            Review Pending NGOs
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 bg-forest-800 text-white border border-forest-700 text-xs font-bold rounded-xl hover:bg-forest-700 transition"
          >
            Export CSV Reports
          </Link>
        </div>
      </div>

      {/* Stats Grid 1: Ecosystem Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtext="Across all 4 system roles"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Verified NGOs"
          value={`${stats?.verifiedNGOs || 0} / ${stats?.totalNGOs || 0}`}
          subtext="Audited shelter facilities"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Food Donors"
          value={stats?.totalDonors || 0}
          subtext="Hotels, hostels & caterers"
          icon={Package}
          color="forest"
        />
        <StatCard
          title="Volunteer Couriers"
          value={stats?.totalVolunteers || 0}
          subtext="Active transport network"
          icon={Truck}
          color="amber"
        />
      </div>

      {/* Stats Grid 2: Redistribution Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rescued Mass"
          value={`${stats?.totalFoodRescuedKg?.toLocaleString() || 0} kg`}
          subtext="Diverted from urban landfills"
          icon={Scale}
          color="forest"
        />
        <StatCard
          title="Meals Saved"
          value={stats?.estimatedMealsSaved?.toLocaleString() || 0}
          subtext="Nutritious portions distributed"
          icon={UtensilsCrossed}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          subtext="Awaiting donor action"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title="Flagged / Safety"
          value={stats?.flaggedDonations || 0}
          subtext="Audited batches"
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Food Donations */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-950">Recent Food Donations Published</h3>
            <Link to="/admin/donations" className="text-xs font-bold text-forest-900 hover:underline">
              View all ({stats?.totalDonations || 0})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-950 uppercase font-black">
                  <th className="pb-3 text-slate-950 font-black">Food Item</th>
                  <th className="pb-3 text-slate-950 font-black">Donor</th>
                  <th className="pb-3 text-slate-950 font-black">Quantity</th>
                  <th className="pb-3 text-slate-950 font-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stats?.recentDonations?.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="py-3 font-extrabold text-slate-950">{d.foodName}</td>
                    <td className="py-3 font-semibold text-slate-950">{d.donorId?.name}</td>
                    <td className="py-3 font-black text-forest-950">{d.quantity} {d.unit}</td>
                    <td className="py-3">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Registered Users */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-950">Recently Registered Users</h3>
            <Link to="/admin/users" className="text-xs font-bold text-forest-900 hover:underline">
              Manage all →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentUsers?.map((u) => (
              <div
                key={u._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-slate-950">{u.name}</h4>
                  <p className="text-[11px] font-bold text-forest-900">{u.email} • <span className="text-slate-950">{u.city}</span></p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
