import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartHandshake, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthError, setOauthError] = useState('');
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated as admin, redirect to admin dashboard; otherwise to respective portal
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'donor') {
        navigate('/donor/dashboard', { replace: true });
      } else if (user.role === 'ngo') {
        navigate('/ngo/dashboard', { replace: true });
      } else if (user.role === 'volunteer') {
        navigate('/volunteer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Check for OAuth error in navigation state or URL search params
  useEffect(() => {
    const stateErr = location.state?.oauthError;
    const params = new URLSearchParams(location.search);
    const queryErr = params.get('oauthError');
    const incomingError = stateErr || queryErr;

    if (incomingError) {
      setOauthError(incomingError);
      // Clean query parameter from browser URL so it is consumed exactly once
      if (queryErr) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location.search, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login({ email: cleanEmail, password });
      if (res.success && res.user) {
        const returnTo = location.state?.from?.pathname || location.state?.returnTo;
        if (returnTo) {
          navigate(returnTo);
          return;
        }

        switch (res.user.role) {
          case 'donor':
            navigate('/donor/dashboard');
            break;
          case 'ngo':
            navigate('/ngo/dashboard');
            break;
          case 'volunteer':
            navigate('/volunteer/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'https://foodlink-platform.onrender.com
/api');
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-surface-border shadow-xl">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-white shadow-sm">
              <HeartHandshake className="w-6 h-6 text-forest-400" />
            </div>
            <span className="text-2xl font-black text-forest-900 tracking-tight">
              Food<span className="text-forest-500">Link</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-brandText-primary tracking-tight">Welcome Back</h2>
          <p className="text-xs text-brandText-muted mt-1">
            Sign in to access your donor, NGO, or volunteer account.
          </p>
        </div>

        {/* OAuth Error Alert if any */}
        {oauthError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{oauthError}</span>
          </div>
        )}

        {/* OAuth Buttons (Google Single Sign-On) */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider displaying OR */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            OR
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brandText-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-brandText-primary uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-forest-700 hover:text-forest-900"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brandText-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brandText-muted hover:text-brandText-primary"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-brandText-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-forest-800 hover:text-forest-900">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
