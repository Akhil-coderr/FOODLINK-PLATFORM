import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const { adminLogin, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error('Please enter administrator email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminLogin({ email: cleanEmail, password });
      if (res.success && res.user) {
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          setAuthError('Access denied. This portal is restricted to authorized administrators.');
        }
      } else {
        setAuthError(res.message || 'Administrator authentication failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Access denied. This portal is restricted to authorized administrators.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800/90 p-8 sm:p-10 rounded-3xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
        {/* Admin Branding Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <ShieldCheck className="w-6 h-6 text-emerald-100" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Food<span className="text-emerald-400">Link</span>
              <span className="text-xs uppercase ml-2 px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-extrabold border border-emerald-700/60">
                Admin
              </span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Administrator Sign In
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            FoodLink Security & Platform Governance Control Center
          </p>
        </div>

        {/* Security Alert if access denied */}
        {authError && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-700/50 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Refused</p>
              <p className="mt-0.5">{authError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin@foodlink.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Master Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 transition flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Verifying Authorization...' : 'Sign In to Admin Portal'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-4 border-t border-slate-700/60 text-center space-y-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            🛡️ Authorized Administrators Only
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All system authentication attempts are cryptographically verified and logged into immutable audit registries.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              ← Return to Standard User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
