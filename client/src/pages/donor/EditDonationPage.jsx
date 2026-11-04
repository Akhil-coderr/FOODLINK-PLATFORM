import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { FOOD_CATEGORIES, STORAGE_CONDITIONS } from '../../constants';
import { Edit3, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function EditDonationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    foodCategory: '',
    quantity: '',
    storageCondition: 'ambient',
    specialInstructions: '',
  });

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await donationService.getById(id);
        if (res.success && res.data) {
          const d = res.data;
          setFormData({
            foodName: d.foodName || '',
            description: d.description || '',
            foodCategory: d.foodCategory || '',
            quantity: d.quantity || '',
            storageCondition: d.storageCondition || 'ambient',
            specialInstructions: d.specialInstructions || '',
          });
        }
      } catch (err) {
        toast.error('Failed to load donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((k) => data.append(k, formData[k]));
      const res = await donationService.update(id, data);
      if (res.success) {
        toast.success('Donation updated successfully');
        navigate('/donor/donations');
      }
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading donation details..." />;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-surface-border shadow-sm space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-surface-border">
        <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
          <Edit3 className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-black text-brandText-primary">Edit Food Donation Batch</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
            Dish / Food Name *
          </label>
          <input
            type="text"
            required
            value={formData.foodName}
            onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Food Category *
            </label>
            <select
              value={formData.foodCategory}
              onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
            >
              {FOOD_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Quantity *
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
            Storage Condition
          </label>
          <select
            value={formData.storageCondition}
            onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
          >
            {STORAGE_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
            Description
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
          className="w-full py-3 px-4 rounded-xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
