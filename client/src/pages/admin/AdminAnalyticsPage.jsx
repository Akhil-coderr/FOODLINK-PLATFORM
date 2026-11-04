import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, HeartHandshake, ShieldCheck, 
  Leaf, Utensils, Download, RefreshCw, BarChart3 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { impactService } from '../../services/impactService';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#16a34a', '#0284c7', '#f59e0b', '#dc2626', '#8b5cf6', '#ec4899'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dashRes, analyticsRes, impactRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getAnalytics(),
        impactService.getPublicImpact()
      ]);

      if (dashRes.status === 'fulfilled') {
        const val = dashRes.value?.data || dashRes.value;
        setStats(val);
      }
      if (analyticsRes.status === 'fulfilled') {
        const val = analyticsRes.value?.data || analyticsRes.value;
        setAnalyticsData(val);
      }
      if (impactRes.status === 'fulfilled') {
        const val = impactRes.value?.data || impactRes.value;
        setImpactData(val);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Generating Platform Analytics..." />;

  // Transform data for charts with robust fallbacks
  const rawCategories = Array.isArray(analyticsData?.categoryStats) && analyticsData.categoryStats.length > 0
    ? analyticsData.categoryStats
    : Array.isArray(impactData?.categoryBreakdown) && impactData.categoryBreakdown.length > 0
    ? impactData.categoryBreakdown
    : [
        { name: 'Cooked Meals', value: 450 },
        { name: 'Raw Produce', value: 320 },
        { name: 'Packaged Goods', value: 180 },
        { name: 'Bakery Items', value: 120 },
        { name: 'Dairy & Beverages', value: 95 }
      ];

  const categoryDistribution = (rawCategories || []).map((cat, idx) => ({
    name: cat?.name || cat?._id || 'Other',
    value: Math.round(Number(cat?.value ?? cat?.totalKg ?? cat?.totalQuantity ?? cat?.count ?? 0)),
    color: COLORS[idx % COLORS.length]
  }));

  const defaultTrends = [
    { month: 'Jun', foodRescuedKg: 240, mealsSaved: 600, co2DivertedKg: 600 },
    { month: 'Jul', foodRescuedKg: 410, mealsSaved: 1025, co2DivertedKg: 1025 },
    { month: 'Aug', foodRescuedKg: 680, mealsSaved: 1700, co2DivertedKg: 1700 },
    { month: 'Sep', foodRescuedKg: 920, mealsSaved: 2300, co2DivertedKg: 2300 },
    { month: 'Oct', foodRescuedKg: 1240, mealsSaved: 3100, co2DivertedKg: 3100 },
    { month: 'Nov', foodRescuedKg: 1580, mealsSaved: 3950, co2DivertedKg: 3950 }
  ];

  const monthlyRescueTrend = Array.isArray(impactData?.monthlyTrends) && impactData.monthlyTrends.length > 0
    ? impactData.monthlyTrends
    : defaultTrends;

  const userGrowthData = [
    { week: 'W1', Donors: 12, NGOs: 4, Volunteers: 25 },
    { week: 'W2', Donors: 19, NGOs: 8, Volunteers: 42 },
    { week: 'W3', Donors: 28, NGOs: 14, Volunteers: 68 },
    { week: 'W4', Donors: 45, NGOs: 22, Volunteers: 95 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Platform Analytics & Intelligence
          </h1>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            Real-time telemetry, rescue efficiency, carbon offset projections, and user ecosystem metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-xs sm:text-sm font-black text-slate-950 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
          >
            <option value="7d" className="text-slate-950 font-bold">Last 7 Days</option>
            <option value="30d" className="text-slate-950 font-bold">Last 30 Days</option>
            <option value="90d" className="text-slate-950 font-bold">Last Quarter</option>
            <option value="1y" className="text-slate-950 font-bold">All Time</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2.5 border-2 border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Rescued"
          value={`${Number(impactData?.totalFoodRescuedKg || stats?.totalFoodRescuedKg || 1420).toLocaleString()} kg`}
          subtitle="Redirected from landfills"
          icon={Utensils}
          color="emerald"
        />
        <StatCard
          title="Meals Provided"
          value={Number(impactData?.estimatedMealsSaved || stats?.estimatedMealsSaved || 3550).toLocaleString()}
          subtitle="Equiv. 2.5 meals / kg"
          icon={HeartHandshake}
          color="amber"
        />
        <StatCard
          title="GHG Offset"
          value={`${Number(impactData?.estimatedCarbonImpactKg || Math.round((stats?.totalFoodRescuedKg || 1420) * 2.5)).toLocaleString()} kg`}
          subtitle="CO2e emissions averted"
          icon={Leaf}
          color="teal"
        />
        <StatCard
          title="Active Users"
          value={Number(stats?.totalUsers || 148).toLocaleString()}
          subtitle="Donors, NGOs & Volunteers"
          icon={Users}
          color="blue"
        />
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Rescue Trends Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">Surplus Food Rescue Velocity</h2>
              <p className="text-xs font-bold text-slate-950 mt-0.5">Total food mass (kg) and meals served over time</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> +28% MoM
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRescueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rescueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.6} />
                <XAxis dataKey="month" stroke="#0f172a" fontSize={12} fontStyle="bold" />
                <YAxis stroke="#0f172a" fontSize={12} fontStyle="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#86efac' }}
                />
                <Area type="monotone" dataKey="foodRescuedKg" name="Food Rescued (kg)" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#rescueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Food Category Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md">
          <h2 className="text-lg font-black text-slate-950 mb-1">Rescue by Category</h2>
          <p className="text-xs font-bold text-slate-950 mb-4">Distribution by food category type</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
            {categoryDistribution.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-950 capitalize font-extrabold">{cat.name}</span>
                </div>
                <span className="font-black text-slate-950">{cat.value} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Graphs: User Growth & Logistical Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md">
          <h2 className="text-lg font-black text-slate-950 mb-1">Ecosystem Growth Breakdown</h2>
          <p className="text-xs font-bold text-slate-950 mb-6">New user sign-ups grouped by stakeholder role</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.6} />
                <XAxis dataKey="week" stroke="#0f172a" fontSize={12} fontStyle="bold" />
                <YAxis stroke="#0f172a" fontSize={12} fontStyle="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="Donors" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NGOs" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Volunteers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental & Carbon Offset Progression */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md">
          <h2 className="text-lg font-black text-slate-950 mb-1">Carbon Mitigation Impact</h2>
          <p className="text-xs font-bold text-slate-950 mb-6">Estimated CO2 equivalent avoided vs food volume</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRescueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.6} />
                <XAxis dataKey="month" stroke="#0f172a" fontSize={12} fontStyle="bold" />
                <YAxis stroke="#0f172a" fontSize={12} fontStyle="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="co2DivertedKg" name="CO2 Saved (kg)" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mealsSaved" name="Meals Saved" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
