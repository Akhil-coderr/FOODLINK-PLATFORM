import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../context/AuthContext';
import {
  FOOD_CATEGORIES,
  FOOD_TYPES,
  QUANTITY_UNITS,
  STORAGE_CONDITIONS,
} from '../../constants';
import {
  PlusCircle,
  MapPin,
  Clock,
  Upload,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddDonationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Default times: prepared now, expiry in 6 hours, pickup window immediately until 5 hours
  const now = new Date();
  const defaultExpiry = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultPickupEnd = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    foodCategory: FOOD_CATEGORIES[0],
    foodType: 'cooked',
    quantity: '',
    unit: 'kg',
    servings: '',
    preparedAt: new Date().toISOString().slice(0, 16),
    expiryTime: defaultExpiry,
    pickupStartTime: new Date().toISOString().slice(0, 16),
    pickupEndTime: defaultPickupEnd,
    storageCondition: 'ambient',
    allergens: '',
    packagingCondition: 'Hygienically packaged in food-grade containers',
    specialInstructions: '',
    address: user?.address || '105 Avinashi Road',
    city: user?.city || 'Coimbatore',
    state: user?.state || 'Tamil Nadu',
    postalCode: user?.postalCode || '641004',
    latitude: user?.location?.coordinates ? user.location.coordinates[1] : 11.0168,
    longitude: user?.location?.coordinates ? user.location.coordinates[0] : 76.9558,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const q = parseFloat(formData.quantity);
    if (!q || q <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    const exp = new Date(formData.expiryTime);
    if (exp <= new Date()) {
      toast.error('Expiry time must be in the future');
      return;
    }

    const pickupEnd = new Date(formData.pickupEndTime);
    if (pickupEnd > exp) {
      toast.error('Pickup window must close before the food expiry time');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await donationService.create(data);
      if (res.success) {
        toast.success('Food donation published successfully!');
        navigate('/donor/donations');
      } else {
        toast.error(res.message || 'Failed to publish donation');
      }
    } catch (err) {
      toast.error(err.message || 'Error publishing food donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-surface-border">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Food Donation Form</span>
            <h1 className="text-2xl font-black text-brandText-primary tracking-tight">
              Publish Surplus Food Batch
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Food Basics */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-brandText-muted tracking-wider">
              1. Food Item Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Food / Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vegetable Dum Biryani & Dal Makhani"
                  value={formData.foodName}
                  onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Food Category *
                </label>
                <select
                  value={formData.foodCategory}
                  onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  {FOOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Description / Preparation Notes
              </label>
              <textarea
                rows={2}
                placeholder="Mention cooking method, fresh ingredients, or menu context..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  placeholder="e.g. 25"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  {QUANTITY_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Estimated Portions / Servings
                </label>
                <input
                  type="number"
                  placeholder="Auto-calculated if blank"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Expiry & Storage */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase text-brandText-muted tracking-wider">
              2. Timestamps & Safe Storage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Food Prepared Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.preparedAt}
                  onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Safe Expiry Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.expiryTime}
                  onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Pickup Starts *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.pickupStartTime}
                  onChange={(e) => setFormData({ ...formData, pickupStartTime: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Pickup Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.pickupEndTime}
                  onChange={(e) => setFormData({ ...formData, pickupEndTime: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Current Storage Condition *
                </label>
                <select
                  value={formData.storageCondition}
                  onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
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
                  Allergen Information (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Dairy, Gluten, Shellfish"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Image and Location */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase text-brandText-muted tracking-wider">
              3. Image & Kitchen Pickup Location
            </h3>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Upload Food Image (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-brandText-primary rounded-xl text-xs font-semibold flex items-center transition border border-surface-border">
                  <Upload className="w-4 h-4 mr-2 text-forest-800" />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Kitchen / Pickup Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Special Loading Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Park near service elevator loading dock on 2nd basement"
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center"
            >
              {submitting ? 'Publishing Food...' : 'Publish Food Donation'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
