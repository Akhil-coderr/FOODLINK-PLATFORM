import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FOOD_CATEGORIES } from '../../constants';
import { Building2, MapPin, Compass, ArrowRight, ShieldAlert, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NGORegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    contactPerson: '',
    organizationName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641018',
    receivingCapacityKg: 250,
    acceptedFoodCategories: ['Cooked Meals', 'Raw Ingredients', 'Bakery Items', 'Fruits & Vegetables'],
    operatingHours: '08:00 AM - 09:00 PM',
    description: '',
    documents: ['https://foodlink.org/demo-docs/trust-registration-certificate.pdf'],
    latitude: 11.0045,
    longitude: 76.9616,
  });

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const exists = prev.acceptedFoodCategories.includes(category);
      if (exists) {
        return {
          ...prev,
          acceptedFoodCategories: prev.acceptedFoodCategories.filter((c) => c !== category),
        };
      } else {
        return {
          ...prev,
          acceptedFoodCategories: [...prev.acceptedFoodCategories, category],
        };
      }
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        toast.success('Coordinates retrieved!');
      },
      () => {
        toast.error('Unable to fetch location. Default coordinates kept.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.acceptedFoodCategories.length === 0) {
      toast.error('Please select at least one accepted food category');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        organizationName: formData.organizationName,
        registrationNumber: formData.registrationNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        receivingCapacityKg: Number(formData.receivingCapacityKg),
        acceptedFoodCategories: formData.acceptedFoodCategories,
        operatingHours: { hours: formData.operatingHours },
        description: formData.description,
        documents: formData.documents,
        location: {
          type: 'Point',
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
        },
      };

      const res = await register('ngo', payload);
      if (res.success) {
        navigate('/ngo/dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-border shadow-xl space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">
            Register NGO / Shelter Organization
          </h1>
          <p className="text-xs text-brandText-muted mt-1">
            Registered charities, orphanages, and community kitchens can claim surplus food for redistribution.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-950 font-bold">Verification Requirement</strong>
            All NGO accounts remain in pending status upon registration. An administrator will review your registration certificate before you can request food.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                NGO / Trust Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hope Foundation Shelter"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Registration / 80G Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NGO-TN-2021-98765"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Authorized Contact Person *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sister Mary or Rajesh Sharma"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98421 55678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="contact@hopeshelter.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Daily Food Receiving Capacity (kg) *
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                required
                value={formData.receivingCapacityKg}
                onChange={(e) => setFormData({ ...formData, receivingCapacityKg: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          {/* Categories Accepted */}
          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-2">
              Food Categories Accepted by Your Shelter *
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
              Shelter Delivery Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 52 Trichy Road, Singanallur"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="bg-surface-light p-4 rounded-2xl border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brandText-primary uppercase flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-blue-700" />
                GPS Coordinates (Used for smart matching algorithms)
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg flex items-center transition"
              >
                <Compass className="w-3.5 h-3.5 mr-1" />
                Fetch Device Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-brandText-muted mb-0.5">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-brandText-muted mb-0.5">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Organization Description / Demographics Served
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Caring for 120 elderly residents and day laborers in Coimbatore..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center"
          >
            {submitting ? 'Registering NGO...' : 'Submit NGO Registration for Review'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        <div className="text-center text-xs text-brandText-muted">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-forest-800 hover:text-forest-900">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
