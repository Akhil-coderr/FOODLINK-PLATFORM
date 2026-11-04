import React from 'react';

export function SkeletonText({ className = '', lines = 1 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-md skeleton-shimmer ${
            i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'
          } ${className}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden shadow-xs ${className}`}>
      <div className="h-44 w-full rounded-xl skeleton-shimmer mb-4" />
      <div className="h-3 w-20 rounded-md skeleton-shimmer mb-2.5" />
      <div className="h-5 w-3/4 rounded-md skeleton-shimmer mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded-md skeleton-shimmer" />
        <div className="h-3 w-5/6 rounded-md skeleton-shimmer" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 w-24 rounded-md skeleton-shimmer" />
        <div className="h-8 w-20 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonMetric({ className = '' }) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 rounded-md skeleton-shimmer" />
        <div className="w-9 h-9 rounded-xl skeleton-shimmer" />
      </div>
      <div className="h-8 w-32 rounded-md skeleton-shimmer mb-2" />
      <div className="h-3 w-40 rounded-md skeleton-shimmer" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-4 rounded-md skeleton-shimmer w-20" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 grid grid-cols-4 gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-4 rounded-md skeleton-shimmer ${
                  c === 0 ? 'w-32' : c === 1 ? 'w-20' : c === 2 ? 'w-24' : 'w-16 ml-auto'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skeleton({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
}
