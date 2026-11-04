import React, { useState, useEffect } from 'react';
import { ngoService } from '../../services/ngoService';
import { Inbox, Clock, Building, XCircle, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

export default function NGORequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await ngoService.getMyRequests();
      if (res.success && res.data?.requests) {
        setRequests(res.data.requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = (id) => {
    setCancelTarget(id);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const res = await ngoService.cancelRequest(cancelTarget);
      if (res.success) {
        toast.success('Request cancelled');
        setCancelTarget(null);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.message || 'Error cancelling request');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">My Food Requests</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Track the approval status of claims submitted to food donors.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No food requests placed"
          description="Browse available surplus batches to place a claim for your shelter."
          actionText="Browse Available Food"
          actionLink="/ngo/food"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-lg">
                    {r.donationId?.foodName || 'Donation Batch'}
                  </span>
                  <StatusBadge status={r.status} />
                </div>

                <div className="text-xs text-brandText-muted space-y-1">
                  <div>
                    Donor: <strong className="text-brandText-primary">{r.donorId?.name} ({r.donorId?.city})</strong>
                  </div>
                  <div>
                    Requested Quantity: <strong className="text-forest-900">{r.requestedQuantity} kg</strong>
                  </div>
                  {r.rejectionReason && (
                    <div className="text-rose-600 font-semibold">
                      Reason: {r.rejectionReason}
                    </div>
                  )}
                  <div>
                    Submitted on: {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {r.status === 'PENDING' && (
                <button
                  onClick={() => handleCancel(r._id)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                >
                  Cancel Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!cancelTarget}
        title="Cancel food request"
        message="Are you sure you want to cancel this food request?"
        confirmText="Cancel Request"
        cancelText="Keep Request"
        confirmVariant="danger"
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
        isLoading={cancelLoading}
      />
    </div>
  );
}
