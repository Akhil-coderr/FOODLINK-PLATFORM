import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-surface-border shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Access Restricted</h1>
        <p className="text-sm text-brandText-muted">
          Your current account role ({user?.role || 'Guest'}) does not have permission to view or manage this administrative resource.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
