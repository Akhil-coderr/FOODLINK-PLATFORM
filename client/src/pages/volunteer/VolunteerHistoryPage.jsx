import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { assignmentService } from '../../services/assignmentService';
import { History, Award, CheckCircle2, Clock, MapPin } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function VolunteerHistoryPage() {
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
        console.error('Error fetching volunteer history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Completed Volunteer Trips</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          History of all verified food collections and shelter handovers you have executed.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling completed tasks..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No completed trips yet"
          description="Once you complete verified pickups and dropoffs, your trip archive will appear here."
          icon={History}
        />
      ) : (
        <div className="space-y-4">
          {history.map((h) => (
            <div
              key={h._id}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                  Delivered on {new Date(h.completedAt || h.updatedAt).toLocaleDateString()}
                </span>
                <h3 className="font-bold text-base text-brandText-primary">
                  {h.donationId?.foodName} ({h.donationId?.quantity} kg)
                </h3>
                <div className="text-xs text-brandText-muted flex flex-wrap gap-4 pt-1">
                  <span>From: <strong>{h.donorId?.name}</strong></span>
                  <span>To: <strong>{h.ngoId?.name}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold self-end sm:self-center">
                <Award className="w-4 h-4 text-amber-600" />
                <span>+20 Karma Points</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
