import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { volunteerService } from '../../services/volunteerService';
import { Award, Trophy, Medal, Star, ShieldCheck, Gift, Check } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function VolunteerAchievementsPage() {
  const [achieveData, setAchieveData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const [achieveRes, leaderRes] = await Promise.allSettled([
          volunteerService.getAchievements(),
          volunteerService.getLeaderboard(),
        ]);

        if (achieveRes.status === 'fulfilled' && achieveRes.value?.data) {
          setAchieveData(achieveRes.value.data);
        }

        if (leaderRes.status === 'fulfilled' && leaderRes.value?.data) {
          setLeaderboard(leaderRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching achievements', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGamification();
  }, []);

  if (loading) return <LoadingSpinner text="Loading achievements & leaderboard..." size="lg" />;

  const badgeProgress = achieveData?.badgeProgress;
  const lifetimePoints = achieveData?.lifetimePoints ?? achieveData?.points ?? 0;

  return (
    <div className="space-y-8">
      {/* Points Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-forest-800 to-forest-950 rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Volunteer Rewards & Recognition
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Your Karma Points: {achieveData?.points || 0} pts
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-lg">
            Earn 20 verifiable karma points for every successful surplus food collection and shelter delivery.
            You have earned <strong className="text-amber-200">{lifetimePoints}</strong> lifetime Karma Points.
          </p>
        </div>
        {badgeProgress?.currentBadge ? (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-4 py-3 flex-shrink-0">
            <span className="text-3xl" aria-hidden="true">{badgeProgress.currentBadge.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Current Badge</p>
              <p className="text-sm font-black text-white">{badgeProgress.currentBadge.name}</p>
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 flex-shrink-0">
            <Trophy className="w-10 h-10 text-amber-300" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-brandText-primary">Spend your karma points</p>
            <p className="text-xs text-brandText-muted">
              Trade points for Hotel Coupons and exclusive Badges.
            </p>
          </div>
        </div>
        <Link
          to="/volunteer/rewards"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-sm font-bold transition flex-shrink-0"
        >
          <Gift className="w-4 h-4 mr-2" />
          Redeem Rewards
        </Link>
      </div>

      {/* Karma Badge Ladder */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-brandText-primary flex items-center gap-2">
              <Award className="w-5 h-5 text-forest-700" /> Karma Badge Ladder
            </h3>
            <p className="text-xs text-brandText-muted">
              Badges unlock automatically from lifetime earned Karma and appear as a logo in your site banner.
            </p>
          </div>
          {badgeProgress?.currentBadge && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-forest-200 bg-forest-50 px-3.5 py-2">
              <span className="text-2xl" aria-hidden="true">{badgeProgress.currentBadge.icon}</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-forest-800">Current Badge</p>
                <p className="text-sm font-black text-forest-950">{badgeProgress.currentBadge.name}</p>
              </div>
            </div>
          )}
        </div>

        {badgeProgress ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-brandText-primary">
                <span>{badgeProgress.lifetimePoints} lifetime Karma Points</span>
                <span>
                  {badgeProgress.nextBadge
                    ? `${badgeProgress.pointsToNext} more to ${badgeProgress.nextBadge.name}`
                    : 'Highest badge tier reached 🎉'}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-forest-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${badgeProgress.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {(badgeProgress.allBadges || []).map((tier) => (
                <div
                  key={tier.id}
                  title={tier.description}
                  className={`rounded-2xl border-2 p-3 flex items-center gap-2.5 transition ${
                    tier.earned
                      ? 'border-amber-200 bg-amber-50/70'
                      : 'border-slate-200 bg-slate-50 opacity-70'
                  }`}
                >
                  <span className={`text-2xl ${tier.earned ? '' : 'grayscale'}`} aria-hidden="true">
                    {tier.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-brandText-primary truncate">{tier.name}</p>
                    <p className="text-[10px] font-bold text-brandText-muted">{tier.threshold} pts</p>
                  </div>
                  {tier.earned && <Check className="w-4 h-4 text-forest-600 ml-auto flex-shrink-0" />}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs font-semibold text-brandText-muted bg-slate-50 border border-slate-200 rounded-xl p-3">
            Complete verified deliveries to start earning Karma and unlock your first badge at 100 points.
          </p>
        )}
      </div>

      {/* Badges Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-brandText-primary">Milestone Badges</h3>
        <p className="text-xs text-brandText-muted">Digital badges unlocked through verified deliveries</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
          {achieveData?.badges?.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl border text-center flex flex-col justify-between space-y-2 transition ${
                b.earned
                  ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <span className="text-3xl block mb-2">{b.earned ? '🏆' : '🔒'}</span>
                <strong className="block text-xs font-bold text-brandText-primary">{b.name}</strong>
                <p className="text-[11px] text-brandText-muted mt-1 leading-snug">{b.desc}</p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full inline-block mx-auto ${
                  b.earned ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {b.earned ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Leaderboard */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Medal className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-lg text-brandText-primary">Volunteer Community Leaderboard</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border text-brandText-muted uppercase">
                <th className="pb-3 font-semibold">Rank</th>
                <th className="pb-3 font-semibold">Volunteer Hero</th>
                <th className="pb-3 font-semibold">City</th>
                <th className="pb-3 font-semibold">Deliveries</th>
                <th className="pb-3 font-semibold text-right">Karma Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50/50">
                  <td className="py-3.5 font-black text-sm text-forest-900">
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                  </td>
                  <td className="py-3.5 font-bold text-brandText-primary">{item.name}</td>
                  <td className="py-3.5 text-brandText-muted">{item.city}</td>
                  <td className="py-3.5 font-semibold text-brandText-primary">{item.completedTasks} drops</td>
                  <td className="py-3.5 text-right font-black text-forest-900">{item.totalPoints} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
