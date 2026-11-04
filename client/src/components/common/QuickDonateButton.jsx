import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshake, ArrowRight } from 'lucide-react';

export default function QuickDonateButton() {
  const location = useLocation();
  const path = location.pathname;
  const [isExpanded, setIsExpanded] = useState(false);

  // Hide on auth pages, creation forms, admin portal, or dashboard pages where sidebar nav already handles it
  const isExcluded =
    path.startsWith('/admin') ||
    path.includes('/login') ||
    path.includes('/register') ||
    path.includes('/donations/create') ||
    path.includes('/donor') ||
    path.includes('/ngo') ||
    path.includes('/volunteer');

  if (isExcluded) return null;

  return (
    <aside
      aria-label="Quick food donation"
      className="fixed bottom-5 right-5 z-30 pointer-events-auto"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={() => setIsExpanded((prev) => !prev)}
    >
      <Link
        to="/donor/donations/create"
        className={`group flex items-center rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-xl border-2 border-forest-600/50 transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-forest-500/30 ${
          isExpanded ? 'h-11 px-3.5 gap-2' : 'h-11 w-11 justify-center'
        }`}
        title="Quick Donate Food"
      >
        <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-200">
          <HeartHandshake className="w-4 h-4 text-white" />
        </span>
        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-300 font-extrabold tracking-tight ${
            isExpanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          Quick Donate
        </span>
        {isExpanded && (
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        )}
      </Link>
    </aside>
  );
}
