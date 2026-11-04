import React, { useState, useEffect } from 'react';
import { ngoService } from '../../services/ngoService';
import { Inbox, CheckCircle2, XCircle, Clock, Building, MessageSquare } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function DonorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await ngoService.getIncomingRequests();
      if (res.success && res.data?.requests) {
        setRequests(res.data.requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      toast.error('Failed to load incoming requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await ngoService.acceptRequest(id);
      if (res.success) {
        toast.success('NGO request accepted! Volunteer pickup assignment initiated.');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.message || 'Error accepting request');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectingId) return;

    try {
      const res = await ngoService.rejectRequest(rejectingId, rejectReason);
      if (res.success) {
        toast.success('Request rejected');
        setRejectingId(null);
        setRejectReason('');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.message || 'Error rejecting request');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Incoming NGO Requests</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Review and approve donation claim requests from verified community partners.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No incoming requests"
          description="When an NGO requests one of your active food donations, it will be listed here for your approval."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                    Batch: {r.donationId?.foodName}
                  </span>
                  <StatusBadge status={r.status} />
                </div>

                <h3 className="font-bold text-base text-brandText-primary flex items-center">
                  <Building className="w-4 h-4 mr-1.5 text-slate-500" />
                  {r.ngoId?.name} ({r.ngoId?.city})
                </h3>

                {r.message && (
                  <p className="text-xs text-brandText-muted flex items-start bg-slate-50 p-2.5 rounded-lg border border-surface-border">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-slate-400" />
                    "{r.message}"
                  </p>
                )}

                <div className="flex items-center space-x-4 text-xs text-brandText-muted">
                  <span>Requested quantity: <strong>{r.requestedQuantity} kg</strong></span>
                  <span>Time: {new Date(r.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Action buttons if PENDING */}
              {r.status === 'PENDING' ? (
                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => handleAccept(r._id)}
                    className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Accept Request
                  </button>
                  <button
                    onClick={() => setRejectingId(r._id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl transition"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-brandText-muted">
                  Processed on {new Date(r.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-4">
            <h3 className="font-black text-xl text-slate-950 tracking-tight">Decline NGO Request</h3>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              Please specify a reason so the NGO understands why the donation cannot be fulfilled.
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <input
                type="text"
                required
                placeholder="e.g. Quantity already reserved for local event"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-600 transition"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-5 py-2.5 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md transition cursor-pointer btn-press"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
