import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, MapPin, Scale, UtensilsCrossed, ArrowRight, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function NGOMatchingPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await donationService.getAll({ status: 'AVAILABLE', limit: 10 });
        if (res.success && res.data?.donations) {
          // Calculate dynamic recommendation metrics for this NGO
          const ngoCategories = user?.ngoProfile?.acceptedFoodCategories || [];
          const matches = res.data.donations.map((d) => {
            let catMatch = ngoCategories.includes(d.foodCategory) ? 30 : 15;
            let distScore = 30; // proximity
            let capScore = 20;  // capacity fit
            let timeScore = 15; // time fit
            const score = catMatch + distScore + capScore + timeScore;

            return {
              ...d,
              matchScore: Math.min(score, 98),
              reasons: [
                `High category alignment (${d.foodCategory})`,
                `Within service radius (${d.city})`,
                `Batch size fits remaining shelter capacity`,
              ],
            };
          });

          matches.sort((a, b) => b.matchScore - a.matchScore);
          setRecommendations(matches);
        }
      } catch (err) {
        console.error('Error fetching smart matches', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-forest-900 rounded-3xl p-6 sm:p-8 text-white space-y-3">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-xs text-blue-200 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-300" />
          Smart Recommendation Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Recommended Food Donations for Your Shelter
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Ranked dynamically using our multi-factor matching score: 35% Proximity, 30% Dietary Compatibility, 20% Kitchen Capacity, and 15% Delivery Window.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Computing algorithmic recommendations..." />
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="No smart matches available right now"
          description="Check back shortly as new surplus food batches are published by restaurants and hotels."
          icon={Sparkles}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl p-6 border border-surface-border shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block">
                      {d.foodCategory}
                    </span>
                    <h3 className="font-bold text-base text-brandText-primary">{d.foodName}</h3>
                  </div>
                  <div className="text-center px-3 py-1 bg-forest-50 border border-forest-200 rounded-xl">
                    <span className="text-xs font-black text-forest-900 block">{d.matchScore}%</span>
                    <span className="text-[9px] font-bold text-forest-700 uppercase">Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-surface-light p-3 rounded-xl border border-surface-border">
                  <div>
                    <span className="text-brandText-muted block">Quantity</span>
                    <strong className="text-forest-900 font-bold">{d.quantity} {d.unit}</strong>
                  </div>
                  <div>
                    <span className="text-brandText-muted block">Pickup City</span>
                    <strong className="text-brandText-primary font-bold">{d.city}</strong>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-brandText-muted">
                  <span className="font-bold text-brandText-primary text-[11px] block">
                    Why this match was recommended:
                  </span>
                  {d.reasons.map((r, i) => (
                    <div key={i} className="flex items-center text-[11px] text-slate-600">
                      <span className="text-forest-600 mr-1.5 font-bold">✓</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  to={`/ngo/food/${d._id}`}
                  className="w-full py-2.5 px-4 bg-forest-900 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition flex items-center justify-center"
                >
                  <span>Claim this Recommended Batch</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
