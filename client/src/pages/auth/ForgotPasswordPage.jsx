import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { KeyRound, Mail, ArrowRight, CheckCircle2, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(cleanEmail);
      setSubmittedEmail(cleanEmail);
      setSent(true);
      toast.success(res.message || 'Password reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Unable to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSent(false);
    setEmail('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-surface-border shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-3 border border-forest-100 shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-brandText-primary tracking-tight">Forgot Password?</h2>
          <p className="text-xs text-brandText-muted mt-1">
            Enter the email address registered with your FoodLink account to receive recovery instructions.
          </p>
        </div>

        {sent ? (
          <div className="space-y-5 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-emerald-950 font-bold">
                Reset Link Dispatched
              </p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                If an account exists for <strong className="font-semibold text-emerald-950">{submittedEmail}</strong>, we have sent instructions to reset your password.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">⏰ Valid for 15 Minutes</p>
                <p className="mt-0.5 text-amber-800 leading-normal">
                  For your account security, this single-use link expires in 15 minutes. Check your inbox and spam folder.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl border border-surface-border hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Another Email
              </button>
              <Link
                to="/login"
                className="flex-1 py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1.5">
                Registered Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brandText-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 transition"
                />
              </div>
              <p className="text-[11px] text-brandText-muted mt-1.5">
                We will send a one-time secure link to this address.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending Instructions...
                </>
              ) : (
                <>
                  Send Reset Instructions
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-brandText-muted pt-2 border-t border-slate-100">
          Remembered your password?{' '}
          <Link to="/login" className="font-bold text-forest-800 hover:text-forest-900">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
