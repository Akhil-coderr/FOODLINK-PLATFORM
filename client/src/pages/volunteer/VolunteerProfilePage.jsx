import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { volunteerService } from '../../services/volunteerService';
import { VEHICLE_TYPES } from '../../constants';
import { Bike, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VolunteerProfilePage() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    transportType: user?.volunteerProfile?.transportType || 'bike',
    maximumCapacityKg: user?.volunteerProfile?.maximumCapacityKg || 25,
    serviceRadiusKm: user?.volunteerProfile?.serviceRadiusKm || 15,
    availability: user?.volunteerProfile?.availability !== undefined ? user?.volunteerProfile?.availability : true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await volunteerService.updateProfile({
        transportType: formData.transportType,
        maximumCapacityKg: Number(formData.maximumCapacityKg),
        serviceRadiusKm: Number(formData.serviceRadiusKm),
        availability: formData.availability,
      });

      if (res.success) {
        toast.success('Volunteer logistics preferences saved');
      }
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Volunteer Hero Profile</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Configure vehicle type, maximum capacity load, and dispatch availability.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-brandText-primary">{user?.name}</h2>
            <span className="text-xs text-brandText-muted">{user?.email} • {user?.city}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Vehicle / Transport Type *
            </label>
            <select
              value={formData.transportType}
              onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Max Capacity (kg) *
              </label>
              <input
                type="number"
                min="5"
                max="500"
                required
                value={formData.maximumCapacityKg}
                onChange={(e) => setFormData({ ...formData, maximumCapacityKg: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Service Radius (km) *
              </label>
              <input
                type="number"
                min="2"
                max="50"
                required
                value={formData.serviceRadiusKm}
                onChange={(e) => setFormData({ ...formData, serviceRadiusKm: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-surface-light rounded-xl border border-surface-border">
            <input
              type="checkbox"
              id="avail"
              checked={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
              className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
            />
            <label htmlFor="avail" className="text-xs font-semibold text-brandText-primary cursor-pointer">
              Available for real-time pickup alerts
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Updating...' : 'Save Logistics Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
