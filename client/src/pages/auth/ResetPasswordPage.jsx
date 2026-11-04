import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Validate token on mount
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        setTokenError('No password reset token was provided in the URL.');
        setVerifying(false);
        return;
      }

      try {
        const res = await authService.verifyResetToken(token);
        if (isMounted) {
          if (res.success) {
            setTokenValid(true);
            setUserEmail(res.data?.email || '');
          } else {
            setTokenError(res.message || 'Password reset link is invalid or expired.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setTokenError(
            err.response?.data?.message ||
              err.message ||
              'This password reset link has expired or is invalid. Please request a new link.'
          );
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
  const getStrengthLabel = () => {
    if (strengthScore <= 2) return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-600' };
    if (strengthScore <= 4) return { text: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-600' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      toast.error('Please meet all password strength requirements');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.resetPassword(token, password, confirmPassword);
      if (res.success) {
        setCompleted(true);
        toast.success(res.message || 'Your password has been successfully reset!');
      } else {
        toast.error(res.message || 'Unable to update password');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Reset link has expired or is no longer valid. Please request a new link.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-surface-border shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-3 border border-forest-100 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-brandText-primary tracking-tight">Create New Password</h2>
          <p className="text-xs text-brandText-muted mt-1">
            Choose a secure, strong password to protect your FoodLink account.
          </p>
          {userEmail && (
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              Account: {userEmail}
            </div>
          )}
        </div>

        {/* Verifying Token State */}
        {verifying && (
          <div className="text-center py-8 space-y-3">
            <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Verifying secure token...</p>
          </div>
        )}

        {/* Invalid Token State */}
        {!verifying && !tokenValid && !completed && (
          <div className="space-y-5 py-2">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-rose-950 font-bold">
                Reset Link Expired or Invalid
              </p>
              <p className="text-xs text-rose-800 leading-relaxed">
                {tokenError || 'This password reset link has expired or has already been used.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                to="/forgot-password"
                className="w-full py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                Request a New Reset Link
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl border border-surface-border hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Completed State */}
        {!verifying && completed && (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base text-brandText-primary font-bold">
                Password Successfully Reset!
              </p>
              <p className="text-xs text-brandText-muted mt-1 leading-relaxed">
                Your credentials have been securely updated. You can now log into FoodLink with your new password.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-md transition w-full"
            >
              Sign In to FoodLink
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Reset Password Form */}
        {!verifying && tokenValid && !completed && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brandText-muted hover:text-brandText-primary cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength progress bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-brandText-muted">Strength</span>
                    <span className={`font-bold ${getStrengthLabel().textColor}`}>
                      {getStrengthLabel().text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthLabel().color}`}
                      style={{ width: `${(strengthScore / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brandText-muted hover:text-brandText-primary cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-[11px] mt-1 flex items-center gap-1 font-semibold ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Checklist */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                Password Requirements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                  {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-slate-400">•</span>}
                  8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUpperCase ? 'text-emerald-700 font-semibold' : ''}`}>
                  {hasUpperCase ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-slate-400">•</span>}
                  Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasLowerCase ? 'text-emerald-700 font-semibold' : ''}`}>
                  {hasLowerCase ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-slate-400">•</span>}
                  Lowercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                  {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-slate-400">•</span>}
                  One number (0-9)
                </span>
                <span className={`flex items-center gap-1 sm:col-span-2 ${hasSpecial ? 'text-emerald-700 font-semibold' : ''}`}>
                  {hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-slate-400">•</span>}
                  One special character (!@#$%...)
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !passwordsMatch || strengthScore < 5}
              className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-brandText-muted pt-2 border-t border-slate-100">
          Return to{' '}
          <Link to="/login" className="font-bold text-forest-800 hover:text-forest-900">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
