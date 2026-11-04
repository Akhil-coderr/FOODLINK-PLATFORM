import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ngoService } from '../../services/ngoService';
import { FOOD_CATEGORIES } from '../../constants';
import { Building2, ShieldCheck, Clock, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NGOProfilePage() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    receivingCapacityKg: user?.ngoProfile?.receivingCapacityKg || 250,
    acceptedFoodCategories: user?.ngoProfile?.acceptedFoodCategories || [],
    operatingHours: user?.ngoProfile?.operatingHours?.hours || '08:00 AM - 09:00 PM',
    description: user?.ngoProfile?.description || '',
  });

  const handleCategoryToggle = (cat) => {
    setFormData((prev) => {
      const exists = prev.acceptedFoodCategories.includes(cat);
      if (exists) {
        return {
          ...prev,
          acceptedFoodCategories: prev.acceptedFoodCategories.filter((c) => c !== cat),
        };
      } else {
        return {
          ...prev,
          acceptedFoodCategories: [...prev.acceptedFoodCategories, cat],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ngoService.updateProfile({
        receivingCapacityKg: Number(formData.receivingCapacityKg),
        acceptedFoodCategories: formData.acceptedFoodCategories,
        operatingHours: { hours: formData.operatingHours },
        description: formData.description,
      });

      if (res.success) {
        toast.success('NGO Profile updated successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">NGO Organization Profile</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Configure receiving capacity and accepted dietary categories for recommendation matches.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-brandText-primary">
                {user?.ngoProfile?.organizationName || user?.name}
              </h2>
              <span className="text-xs font-mono text-slate-500">
                Reg: {user?.ngoProfile?.registrationNumber}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
            {user?.ngoProfile?.verificationStatus || 'Pending'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Receiving Capacity (kg per day) *
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                required
                value={formData.receivingCapacityKg}
                onChange={(e) => setFormData({ ...formData, receivingCapacityKg: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Operating / Receiving Window *
              </label>
              <input
                type="text"
                required
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-2">
              Dietary Categories Accepted by Your Facility
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FOOD_CATEGORIES.map((cat) => {
                const selected = formData.acceptedFoodCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition ${
                      selected
                        ? 'bg-forest-900 text-white border-forest-900'
                        : 'bg-white text-brandText-primary border-surface-border hover:bg-slate-50'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Beneficiary Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Updating...' : 'Save Profile Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
