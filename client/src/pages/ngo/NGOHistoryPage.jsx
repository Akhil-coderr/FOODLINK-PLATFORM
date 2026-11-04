import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../services/assignmentService';
import { History, CheckCircle2, Scale, UtensilsCrossed, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function NGOHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await assignmentService.getAll({ status: 'COMPLETED' });
        if (res.success && res.data?.assignments) {
          setHistory(res.data.assignments);
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
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Distribution History</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Archived records of verified meals delivered to your shelter.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling distribution records..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No completed distributions yet"
          description="Verified delivery completions will appear here."
          icon={History}
        />
      ) : (
        <div className="space-y-4">
          {history.map((h) => (
            <div
              key={h._id}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                  Delivered on {new Date(h.completedAt || h.updatedAt).toLocaleDateString()}
                </span>
                <h3 className="font-bold text-base text-brandText-primary">
                  {h.donationId?.foodName || 'Food Donation'}
                </h3>
                <div className="text-xs text-brandText-muted flex items-center space-x-3 pt-1">
                  <span>Donor: <strong>{h.donorId?.name}</strong></span>
                  <span>Volunteer: <strong>{h.volunteerId?.name || 'Verified Courier'}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs bg-surface-light p-3 rounded-xl border border-surface-border">
                <div className="text-right">
                  <span className="text-brandText-muted block text-[10px]">Received</span>
                  <strong className="text-forest-900 font-bold">{h.donationId?.quantity} kg</strong>
                </div>
                <CheckCircle2 className="w-5 h-5 text-forest-600" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
