import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { BarChart3, Calendar, Scale, UtensilsCrossed, Leaf, Award } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function DonorAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  const COLORS = ['#14532D', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await donationService.getStatistics();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const totalKg = stats?.totalFoodRescuedKg || 120;
  const meals = Math.round(totalKg * 2.2);
  const carbon = Number((totalKg * 2.5).toFixed(1));

  const monthlyTrends = [
    { month: 'Jul', kg: 45 },
    { month: 'Aug', kg: 70 },
    { month: 'Sep', kg: 95 },
    { month: 'Oct', kg: 130 },
    { month: 'Nov', kg: totalKg },
  ];

  const categoryBreakdown = [
    { name: 'Cooked Meals', value: 55 },
    { name: 'Bakery Items', value: 25 },
    { name: 'Raw Ingredients', value: 15 },
    { name: 'Fruits & Veg', value: 5 },
  ];

  if (loading) return <LoadingSpinner text="Compiling donor analytics..." size="lg" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Donation Analytics & CSR</h1>
          <p className="text-xs text-brandText-muted mt-0.5">
            Monitor sustainability metrics, meal equivalents, and greenhouse gas offsets.
          </p>
        </div>

        {/* Time range selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-surface-border text-xs font-semibold bg-white"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last 1 Year</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Rescued Mass"
          value={`${totalKg} kg`}
          subtext="Certified diverted from landfill"
          icon={Scale}
          color="forest"
        />
        <StatCard
          title="Meals Provided"
          value={meals}
          subtext="Nutritious food portions"
          icon={UtensilsCrossed}
          color="blue"
        />
        <StatCard
          title="CO₂e Avoided"
          value={`${carbon} kg`}
          subtext="Direct greenhouse emissions offset"
          icon={Leaf}
          color="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm">
          <h3 className="font-bold text-lg text-brandText-primary mb-1">Redistribution Trajectory</h3>
          <p className="text-xs text-brandText-muted mb-6">Food rescued in kg per calendar month</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#14532D', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="kg" fill="#14532D" radius={[6, 6, 0, 0]} name="Kg Rescued" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm">
          <h3 className="font-bold text-lg text-brandText-primary mb-1">Category Breakdown</h3>
          <p className="text-xs text-brandText-muted mb-6">Distribution across your food items</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryBreakdown.map((e, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
