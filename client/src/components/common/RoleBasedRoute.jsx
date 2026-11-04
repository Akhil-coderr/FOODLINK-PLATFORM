import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function RoleBasedRoute({ allowedRoles = [], children, requireVerified = false }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <LoadingSpinner text="Verifying permissions..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If role is NGO and requires verification to perform certain action
  if (requireVerified && user.role === 'ngo' && user.ngoProfile?.verificationStatus !== 'approved') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
          <h3 className="text-lg font-bold mb-2">NGO Verification Pending</h3>
          <p className="text-sm text-amber-800 mb-4">
            Your NGO account is currently pending administrative verification. Once verified, you will be able to request and receive food donations.
          </p>
          <p className="text-xs text-amber-700">
            Current status: <strong>{user.ngoProfile?.verificationStatus || 'Pending'}</strong>
          </p>
        </div>
      </div>
    );
  }

  return children;
}
