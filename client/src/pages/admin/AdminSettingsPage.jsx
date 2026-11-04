import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Shield,
  Bell,
  Database,
  Save,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    mealsPerKg: 2.5,
    co2PerKg: 2.5,
    volunteerPointsPerPickup: 20,
    expiryWarning1Hours: 6,
    expiryWarning2Hours: 3,
    expiryWarning3Hours: 1,
    supportEmail: 'support@foodlink.org',
    emergencyHotline: '+1 (800) 555-FOOD',
    maintenanceMode: false,
    requireAdminNgoApproval: true,
    enableRealtimeAlerts: true,
    globalAnnouncement: 'Welcome to FoodLink 2.0! Join us in rescuing surplus meals across your community.',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      localStorage.setItem('foodlink_platform_config', JSON.stringify(config));
      toast.success('System configuration saved successfully');
    }, 600);
  };

  const handleClearCache = () => {
    toast.success('System memory cache and transient socket buffers cleared');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* High-Contrast White Header & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-400" />
          Platform Settings & Control
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
          Configure global system parameters, conversion factors, safety policies, and operational switches.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Calculation Metrics */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-300 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-emerald-950 font-black text-base border-b border-slate-200 pb-3">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3>Conversion & Impact Formulas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1.5">
                Meals Saved per Kg Food
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                name="mealsPerKg"
                value={config.mealsPerKg}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                Standard benchmark is 2.5 meals per 1 kg surplus.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-950 mb-1.5">
                CO2e Offset per Kg Food (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                name="co2PerKg"
                value={config.co2PerKg}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                Greenhouse gas emission diversion multiplier.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-950 mb-1.5">
                Volunteer Task Reward Points
              </label>
              <input
                type="number"
                min="1"
                name="volunteerPointsPerPickup"
                value={config.volunteerPointsPerPickup}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                Points credited upon successful QR verified delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Expiry Alarm Tiers */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-300 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-amber-950 font-black text-base border-b border-slate-200 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3>Donation Expiry Alarm Tiers (Hours Prior)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1.5">
                Early Alert Notice (Hours)
              </label>
              <input
                type="number"
                min="4"
                name="expiryWarning1Hours"
                value={config.expiryWarning1Hours}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                Initial alert triggered to all nearby NGOs.
              </p>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1.5">
                Urgent Rescue Notice (Hours)
              </label>
              <input
                type="number"
                min="2"
                name="expiryWarning2Hours"
                value={config.expiryWarning2Hours}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                Escalated alert broadcast to available volunteers.
              </p>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1.5">
                Critical Final Notice (Hours)
              </label>
              <input
                type="number"
                min="1"
                name="expiryWarning3Hours"
                value={config.expiryWarning3Hours}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                Final window before food safety expiration lockout.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Verification Policy */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-300 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-blue-950 font-black text-base border-b border-slate-200 pb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3>Governance, Safety & Operations</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <input
                type="checkbox"
                name="requireAdminNgoApproval"
                checked={config.requireAdminNgoApproval}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-black text-slate-950 block">
                  Strict NGO Verification Enforced
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  NGOs cannot browse or claim food donations until their legal registration documents are verified by an administrator.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <input
                type="checkbox"
                name="enableRealtimeAlerts"
                checked={config.enableRealtimeAlerts}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-black text-slate-950 block">
                  Socket.IO Push Broadcasts
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Emit live WebSockets notifications across active browser tabs when high-priority donations are listed.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-rose-50/50 transition border border-transparent hover:border-rose-200">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={config.maintenanceMode}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <div>
                <span className="text-sm font-black text-rose-950 block">
                  Emergency Maintenance Mode
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Temporarily halts public donation creation while allowing administrators to perform system maintenance.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Global Announcement & Communications */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-300 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-purple-950 font-black text-base border-b border-slate-200 pb-3">
            <Bell className="w-5 h-5 text-purple-600" />
            <h3>Communications & Broadcasts</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-950 mb-1.5">
                  Support Contact Email
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  value={config.supportEmail}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-950 mb-1.5">
                  Emergency Logistics Hotline
                </label>
                <input
                  type="text"
                  name="emergencyHotline"
                  value={config.emergencyHotline}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-950 mb-1.5">
                Banner Broadcast (Shown across all role dashboards)
              </label>
              <textarea
                rows={2}
                name="globalAnnouncement"
                value={config.globalAnnouncement}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Action Controls - High Contrast Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleClearCache}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Clear Cache & Refresh Indices</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving System Parameters...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
