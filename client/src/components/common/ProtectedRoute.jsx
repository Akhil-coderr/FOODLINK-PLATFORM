import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <LoadingSpinner text="Checking authentication..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check account status
  if (user.accountStatus === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface-light">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-rose-200">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Account Suspended</h2>
          <p className="text-sm text-brandText-muted mb-6">
            Your FoodLink account has been suspended by an administrator. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
