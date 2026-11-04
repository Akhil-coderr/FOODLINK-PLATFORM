import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-surface-border shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mx-auto border border-forest-100">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-4xl font-black text-forest-900 block">404</span>
        <h1 className="text-xl font-bold text-brandText-primary">Page Not Found</h1>
        <p className="text-xs text-brandText-muted">
          The requested FoodLink destination does not exist or may have been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
