import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rewardService } from '../../services/rewardService';

const ACCENT_STYLES = {
  emerald: 'from-emerald-500 to-teal-600 ring-emerald-200',
  teal: 'from-teal-500 to-cyan-600 ring-teal-200',
  amber: 'from-amber-400 to-orange-500 ring-amber-200',
  sky: 'from-sky-500 to-blue-600 ring-sky-200',
  rose: 'from-rose-500 to-pink-600 ring-rose-200',
  orange: 'from-orange-500 to-red-500 ring-orange-200',
  yellow: 'from-yellow-400 to-amber-500 ring-yellow-200',
  red: 'from-red-500 to-rose-600 ring-red-200',
  violet: 'from-violet-500 to-purple-600 ring-violet-200',
  purple: 'from-purple-500 to-fuchsia-600 ring-purple-200',
  cyan: 'from-cyan-400 to-sky-500 ring-cyan-200',
  forest: 'from-emerald-600 to-green-800 ring-emerald-200',
};

/**
 * Karma badge logo shown in the site banner while logged in.
 * The badge is derived from lifetime earned Karma, so it never disappears
 * when points are spent on rewards.
 */
export default function KarmaBadge({ variant = 'compact', className = '' }) {
  const { isAuthenticated, user } = useAuth();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isAuthenticated || !user) {
        setProgress(null);
        return;
      }
      try {
        const res = await rewardService.getKarmaBadge();
        if (active && res?.success) setProgress(res.data);
      } catch {
        if (active) setProgress(null);
      }
    };

    load();
    window.addEventListener('karma:updated', load);
    window.addEventListener('focus', load);
    const interval = setInterval(load, 60000);
    return () => {
      active = false;
      window.removeEventListener('karma:updated', load);
      window.removeEventListener('focus', load);
      clearInterval(interval);
    };
  }, [isAuthenticated, user?._id]);

  const badge = progress?.currentBadge;
  if (!isAuthenticated || !badge) return null;

  const accent = ACCENT_STYLES[badge.accent] || ACCENT_STYLES.forest;
  const next = progress?.nextBadge;
  const tooltip = next
    ? `${badge.name} • ${progress.lifetimePoints} lifetime Karma. ${progress.pointsToNext} more to unlock ${next.name}.`
    : `${badge.name} • ${progress.lifetimePoints} lifetime Karma. Highest tier reached!`;

  if (variant === 'full') {
    return (
      <div
        title={tooltip}
        className={`rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 ${className}`}
      >
        <div
          className={`w-11 h-11 rounded-full bg-gradient-to-br ${accent} ring-2 flex items-center justify-center text-xl shadow-sm flex-shrink-0`}
        >
          <span aria-hidden="true">{badge.icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Karma Badge</p>
          <p className="text-sm font-extrabold text-slate-900 truncate">{badge.name}</p>
          <p className="text-[11px] font-semibold text-slate-500">
            {progress.lifetimePoints} lifetime pts
            {next ? ` • ${progress.pointsToNext} to ${next.name}` : ' • Max tier'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      title={tooltip}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 pl-1 pr-3 py-1 shadow-sm ${className}`}
    >
      <span
        className={`w-7 h-7 rounded-full bg-gradient-to-br ${accent} ring-2 flex items-center justify-center text-sm flex-shrink-0`}
        aria-hidden="true"
      >
        {badge.icon}
      </span>
      <span className="text-xs font-extrabold text-slate-800 whitespace-nowrap">{badge.name}</span>
      {typeof progress.lifetimePoints === 'number' && (
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 border-l border-slate-200 pl-2">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {progress.lifetimePoints}
        </span>
      )}
    </div>
  );
}
