import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { User, Building, MapPin, Lock, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorProfilePage() {
  const { user, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Coimbatore',
    state: user?.state || 'Tamil Nadu',
    postalCode: user?.postalCode || '',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authService.updateProfile(formData);
      if (res.success) {
        toast.success('Profile updated successfully');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.message || 'Profile update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPass(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      if (res.success) {
        toast.success('Password changed successfully');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Password update failed');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Donor Account Profile</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Manage your organizational contact details, pickup location, and security credentials.
        </p>
      </div>

      {/* Main Profile Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-brandText-primary">Establishment Details</h2>
            <span className="text-xs text-forest-700 font-semibold">
              Organization: {user?.donorProfile?.organizationName || user?.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Pickup Address
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-brandText-primary">Update Security Password</h2>
            <p className="text-xs text-brandText-muted">Keep your account safe with a strong password.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            {changingPass ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
