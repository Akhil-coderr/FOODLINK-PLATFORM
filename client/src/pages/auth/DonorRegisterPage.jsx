import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DONOR_ORGANIZATION_TYPES } from '../../constants';
import { Utensils, MapPin, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    organizationName: '',
    organizationType: 'restaurant',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641014',
    latitude: 11.0168,
    longitude: 76.9558,
  });

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
        toast.success('Current coordinates fetched!');
      },
      () => {
        toast.error('Unable to fetch device location. Default coordinates kept.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        location: {
          type: 'Point',
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
        },
      };

      const res = await register('donor', payload);
      if (res.success) {
        navigate('/donor/dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-border shadow-xl space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-3 border border-forest-100">
            <Utensils className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">
            Register as Food Donor
          </h1>
          <p className="text-xs text-brandText-muted mt-1">
            Publish surplus food from your hotel, hostel, restaurant, or catering kitchen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Organization / Hotel Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Residency Banquet"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Organization Type *
              </label>
              <select
                value={formData.organizationType}
                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                {DONOR_ORGANIZATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Official Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="donor@organization.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
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

          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Kitchen / Pickup Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 142 Avinashi Road, Near Hope College"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="bg-surface-light p-4 rounded-2xl border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brandText-primary uppercase flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-forest-700" />
                GPS Coordinates (for Volunteer Routing)
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs font-semibold text-forest-800 bg-forest-100 hover:bg-forest-200 px-2.5 py-1 rounded-lg flex items-center transition"
              >
                <Compass className="w-3.5 h-3.5 mr-1" />
                Use My Device GPS
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center"
          >
            {submitting ? 'Creating Account...' : 'Complete Donor Registration'}
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
