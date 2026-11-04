import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'forest',
  className = '',
}) {
  const colorSchemes = {
    forest: 'bg-forest-50 text-forest-800 border-forest-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-md hover:shadow-lg transition duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-slate-950 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorSchemes[color] || colorSchemes.forest}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-black text-slate-950 tracking-tight">{value}</div>
        {(subtext || trend) && (
          <div className="mt-2 flex items-center text-xs text-slate-950 font-bold gap-2">
            {trend && (
              <span className={`font-black ${trend.positive ? 'text-emerald-700' : 'text-rose-700'}`}>
                {trend.positive ? '↑' : '↓'} {trend.label}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
