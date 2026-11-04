import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VEHICLE_TYPES } from '../../constants';
import { Bike, MapPin, Compass, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VolunteerRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Coimbatore',
    transportType: 'bike',
    maximumCapacityKg: 25,
    serviceRadiusKm: 15,
    availability: true,
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
        toast.success('Volunteer location pinned!');
      },
      () => {
        toast.error('Unable to fetch device location.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        transportType: formData.transportType,
        maximumCapacityKg: Number(formData.maximumCapacityKg),
        serviceRadiusKm: Number(formData.serviceRadiusKm),
        availability: formData.availability,
        location: {
          type: 'Point',
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
        },
      };

      const res = await register('volunteer', payload);
      if (res.success) {
        navigate('/volunteer/dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-border shadow-xl space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-3 border border-amber-100">
            <Bike className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">
            Register as Volunteer Hero
          </h1>
          <p className="text-xs text-brandText-muted mt-1">
            Transport surplus food from donor kitchens to shelters. Earn badges and karma points!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Karthik Rajan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Mobile / WhatsApp Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 99441 23456"
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
                placeholder="volunteer@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Vehicle / Transport Type *
              </label>
              <select
                value={formData.transportType}
                onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                {VEHICLE_TYPES.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Max Carrying Capacity (kg) *
              </label>
              <input
                type="number"
                min="5"
                max="500"
                required
                value={formData.maximumCapacityKg}
                onChange={(e) => setFormData({ ...formData, maximumCapacityKg: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Preferred Radius (km) *
              </label>
              <input
                type="number"
                min="2"
                max="50"
                required
                value={formData.serviceRadiusKm}
                onChange={(e) => setFormData({ ...formData, serviceRadiusKm: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Residential Area / Street *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gandhipuram, 5th Cross"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

          {/* GPS Coordinates */}
          <div className="bg-surface-light p-4 rounded-2xl border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brandText-primary uppercase flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-amber-700" />
                Home Base Location (for pickup alerts)
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg flex items-center transition"
              >
                <Compass className="w-3.5 h-3.5 mr-1" />
                Fetch GPS Location
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
            {submitting ? 'Registering...' : 'Complete Volunteer Registration'}
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
