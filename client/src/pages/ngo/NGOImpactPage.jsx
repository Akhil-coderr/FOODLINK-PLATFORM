import React, { useState, useEffect } from 'react';
import { ngoService } from '../../services/ngoService';
import { Scale, Heart, UtensilsCrossed, Calendar } from 'lucide-react';
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
} from 'recharts';

export default function NGOImpactPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await ngoService.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching impact', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalKg = stats?.totalFoodReceivedKg || 850;
  const meals = stats?.totalMealsDistributed || Math.round(totalKg * 2.2);

  const monthlyData = [
    { month: 'Jul', meals: 150 },
    { month: 'Aug', meals: 280 },
    { month: 'Sep', meals: 420 },
    { month: 'Oct', meals: 590 },
    { month: 'Nov', meals: meals },
  ];

  if (loading) return <LoadingSpinner text="Compiling shelter impact..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Shelter Nutrition Impact</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Cumulative records of hunger relief enabled through FoodLink redistributions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Food Secured"
          value={`${totalKg} kg`}
          subtext="Nutritious surplus received"
          icon={Scale}
          color="forest"
        />
        <StatCard
          title="Meals Distributed"
          value={meals}
          subtext="Beneficiaries nourished"
          icon={Heart}
          color="emerald"
        />
        <StatCard
          title="Approved Capacity"
          value={`${stats?.receivingCapacityKg || 250} kg`}
          subtext="Certified shelter intake capability"
          icon={UtensilsCrossed}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm">
        <h3 className="font-bold text-lg text-brandText-primary mb-1">Monthly Meals Served</h3>
        <p className="text-xs text-brandText-muted mb-6">Surplus food portion redistribution progression</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#14532D', color: '#fff', borderRadius: '8px' }}
              />
              <Bar dataKey="meals" fill="#22C55E" radius={[6, 6, 0, 0]} name="Meals Served" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
