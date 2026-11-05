import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Building2, Bike, ArrowRight, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const roles = [
    {
      title: 'Food Donor',
      description: 'Hotels, restaurants, colleges, event caterers, and corporate cafeterias wanting to donate surplus food.',
      badge: 'Zero Food Waste',
      icon: Utensils,
      color: 'forest',
      link: '/register/donor',
      buttonText: 'Register as Donor',
    },
    {
      title: 'NGO / Charity Shelter',
      description: 'Verified non-profits, orphanages, and community pantries that feed people in need.',
      badge: 'Subject to Verification',
      icon: Building2,
      color: 'blue',
      link: '/register/ngo',
      buttonText: 'Register NGO',
    },
    {
      title: 'Community Volunteer',
      description: 'Individuals with bikes, cars, or vans willing to transport surplus food safely and earn reward points.',
      badge: 'Earn Karma Points',
      icon: Bike,
      color: 'amber',
      link: '/register/volunteer',
      buttonText: 'Become a Volunteer',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold text-forest-700 tracking-wider uppercase bg-forest-50 px-3.5 py-1 rounded-full border border-forest-200">
          Join FoodLink
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-brandText-primary tracking-tight">
          Select Your Participation Role
        </h1>
        <p className="text-sm text-brandText-muted">
          Choose how you will participate in the food redistribution network. Each role gets a dedicated dashboard and specialized workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {roles.map((r, i) => {
          const Icon = r.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 border border-surface-border shadow-sm hover:shadow-xl transition duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center border border-forest-100 group-hover:bg-forest-900 group-hover:text-white transition duration-200">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {r.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-brandText-primary">{r.title}</h3>
                <p className="text-xs sm:text-sm text-brandText-muted leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="pt-8">
                <Link
                  to={r.link}
                  className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center group-hover:shadow-lg"
                >
                  <span>{r.buttonText}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Social Onboarding Quick Access */}
      <div className="max-w-md mx-auto pt-4 text-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-surface-light px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            OR REGISTER VIA SOCIAL IDENTITY
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        <div>
          <a
            href={`${(
              import.meta.env.VITE_API_URL ||
              (typeof window !== 'undefined' && window.location.origin.includes('onrender.com')
                ? `${window.location.origin}/api`
                : import.meta.env.PROD
                  ? 'https://foodlink-platform.onrender.com/api'
                  : 'http://localhost:5000/api')
            ).replace(/\/+$/, '')}/auth/google`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google Sign-Up
          </a>
        </div>
      </div>

      <div className="text-center text-xs text-brandText-muted pt-6">
        Already registered with FoodLink?{' '}
        <Link to="/login" className="font-bold text-forest-800 hover:text-forest-900 underline">
          Sign in to your dashboard
        </Link>
      </div>
    </div>
  );
}
