import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Clock,
  Gift,
  RefreshCw,
  ShoppingBag,
  Ticket,
  XCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PromptModal from '../../components/common/PromptModal';

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED'];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, fulfilled: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchRedemptions = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await adminService.getRedemptions(
        filter === 'ALL' ? undefined : { status: filter }
      );
      if (res.success && res.data) {
        setRedemptions(res.data.redemptions || []);
        setStats(res.data.stats || { pending: 0, approved: 0, fulfilled: 0 });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load reward redemptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, [filter]);

  const updateStatus = async (redemption, status, adminNote = '') => {
    setUpdatingId(redemption._id);
    try {
      await adminService.updateRedemptionStatus(redemption._id, { status, adminNote });
      toast.success(`Redemption marked as ${status.toLowerCase()}.`);
      await fetchRedemptions(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update redemption');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = (redemption) => {
    setRejectTarget(redemption);
  };

  const submitReject = async (reason) => {
    if (!rejectTarget) return;
    const target = rejectTarget;
    setRejectTarget(null);
    await updateStatus(target, 'REJECTED', reason);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Karma Reward Redemptions</h1>
          <p className="text-xs text-slate-400">
            Review experience requests, issue rewards, and refund points when needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchRedemptions(false)}
          className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Pending Review</p>
            <p className="text-2xl font-black text-white">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/60 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Approved</p>
            <p className="text-2xl font-black text-white">{stats.approved}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Fulfilled</p>
            <p className="text-2xl font-black text-white">{stats.fulfilled}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
              filter === status
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {status === 'ALL' ? 'All Requests' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading reward redemptions..." />
      ) : redemptions.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl text-slate-400">
          <Gift className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p className="text-sm font-semibold">No redemptions found</p>
          <p className="text-xs mt-1">Volunteer reward requests will appear here.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Volunteer</th>
                  <th className="px-5 py-3.5">Reward</th>
                  <th className="px-5 py-3.5">Points</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Requested</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {redemptions.map((item) => {
                  const isCoupon = item.rewardCategory === 'coupon';
                  const busy = updatingId === item._id;
                  const canApprove = !isCoupon && item.status === 'PENDING';
                  const canFulfill = !isCoupon && ['PENDING', 'APPROVED'].includes(item.status);
                  const canReject = !isCoupon && ['PENDING', 'APPROVED'].includes(item.status);

                  return (
                    <tr key={item._id} className="hover:bg-slate-700/40 transition align-top">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                            {item.userId?.name ? item.userId.name[0].toUpperCase() : 'V'}
                          </div>
                          <div>
                            <p className="font-bold text-white">{item.userId?.name || 'Volunteer'}</p>
                            <p className="text-[11px] text-slate-400 font-normal">
                              {item.userId?.email} {item.userId?.phone ? `• ${item.userId.phone}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
                            {isCoupon ? (
                              <ShoppingBag className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Gift className="w-4 h-4 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.rewardName}</p>
                            {item.variant && (
                              <p className="text-[11px] text-slate-400">Brand: {item.variant}</p>
                            )}
                            {item.couponCode && (
                              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                                <Ticket className="w-3 h-3" />
                                {item.couponCode}
                              </p>
                            )}
                            {item.note && (
                              <p className="text-[11px] text-slate-400 mt-1">Note: {item.note}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-black text-amber-400">
                        {item.pointsCost.toLocaleString('en-IN')} pts
                        {item.pointsRefunded && (
                          <p className="text-[10px] font-semibold text-emerald-400 mt-1">Refunded</p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                        {item.adminNote && (
                          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[180px]">{item.adminNote}</p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-300">{formatDate(item.createdAt)}</td>

                      <td className="px-5 py-4">
                        {isCoupon ? (
                          <span className="block text-right text-[11px] font-semibold text-slate-500">
                            Instant coupon
                          </span>
                        ) : (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {canApprove && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => updateStatus(item, 'APPROVED')}
                                className="px-2.5 py-1 bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-300 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {canFulfill && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => updateStatus(item, 'FULFILLED')}
                                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
                              >
                                Fulfill
                              </button>
                            )}
                            {canReject && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleReject(item)}
                                className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                            {!canApprove && !canFulfill && !canReject && (
                              <span className="text-[11px] text-slate-500">No actions</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PromptModal
        isOpen={!!rejectTarget}
        title="Reject redemption"
        label="Reason"
        description={
          rejectTarget
            ? `Reason for rejecting "${rejectTarget.rewardName}"? The volunteer's points will be refunded.`
            : ''
        }
        placeholder="Explain why this redemption is being rejected..."
        confirmText="Reject & Refund"
        onConfirm={submitReject}
        onClose={() => setRejectTarget(null)}
      />
    </div>
  );
}
