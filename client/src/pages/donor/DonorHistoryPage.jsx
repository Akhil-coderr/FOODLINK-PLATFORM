import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { History, CheckCircle2, Scale, UtensilsCrossed, Leaf, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function DonorHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await donationService.getMyDonations({ status: 'COMPLETED' });
        if (res.success && res.data?.donations) {
          setHistory(res.data.donations);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Donation Fulfillment History</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Archived records of all verified and completed food rescue deliveries from your establishment.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling history..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No completed donations yet"
          description="Once an NGO verifies receipt of your surplus meals, completed history records and impact certificates appear here."
          icon={History}
        />
      ) : (
        <div className="space-y-4">
          {history.map((h) => {
            const meals = h.servings || Math.round(h.quantity * 2.2);
            const carbonOffset = Number((h.quantity * 2.5).toFixed(1));

            return (
              <div
                key={h._id}
                className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                      {h.foodCategory}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Completed: {new Date(h.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-brandText-primary">{h.foodName}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-brandText-muted pt-1">
                    <span className="flex items-center font-semibold text-forest-900">
                      <Scale className="w-3.5 h-3.5 mr-1" />
                      {h.quantity} {h.unit} Saved
                    </span>
                    <span className="flex items-center font-semibold text-blue-700">
                      <UtensilsCrossed className="w-3.5 h-3.5 mr-1" />
                      {meals} Estimated Meals
                    </span>
                    <span className="flex items-center font-semibold text-emerald-700">
                      <Leaf className="w-3.5 h-3.5 mr-1" />
                      {carbonOffset} kg CO₂e Offset
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-forest-50 rounded-xl text-center self-end sm:self-center">
                  <CheckCircle2 className="w-6 h-6 text-forest-600 mx-auto" />
                  <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block mt-0.5">
                    Verified Handoff
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
