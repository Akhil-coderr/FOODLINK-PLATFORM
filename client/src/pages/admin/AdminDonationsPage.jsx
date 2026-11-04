import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Package, AlertTriangle, Trash2, Clock, MapPin, Eye, Search, X } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [flagTarget, setFlagTarget] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagLoading, setFlagLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDonations({ status: statusFilter || undefined });
      if (res.success && res.data?.donations) {
        setDonations(res.data.donations);
      } else {
        setDonations([]);
      }
    } catch (err) {
      showMessage('error', 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  const handleFlag = (id) => {
    setFlagTarget(id);
    setFlagReason('');
  };

  const submitFlag = async () => {
    if (!flagTarget) return;
    if (!flagReason.trim()) {
      showMessage('error', 'Please specify reason for flagging this donation for safety audit');
      return;
    }
    setFlagLoading(true);
    try {
      const res = await adminService.flagDonation(flagTarget, flagReason.trim());
      if (res.success) {
        showMessage('success', 'Donation flagged for review');
        setFlagTarget(null);
        setFlagReason('');
        fetchDonations();
      } else {
        showMessage('error', res.message || 'Error flagging donation');
      }
    } catch (err) {
      showMessage('error', err.message || 'Error flagging donation');
    } finally {
      setFlagLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await adminService.deleteDonation(deleteTarget);
      if (res.success) {
        showMessage('success', 'Donation removed');
        setDeleteTarget(null);
        fetchDonations();
      } else {
        showMessage('error', res.message || 'Error deleting donation');
      }
    } catch (err) {
      showMessage('error', err.message || 'Error deleting donation');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredDonations = donations.filter((d) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      d.foodName?.toLowerCase().includes(term) ||
      d.foodCategory?.toLowerCase().includes(term) ||
      d.donorId?.name?.toLowerCase().includes(term) ||
      d.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {message.text && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-emerald-400" />
            Platform Food Donations Audit
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Monitor all surplus batches, enforce food safety standards, and moderate fraudulent listings.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', 'AVAILABLE', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'FLAGGED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                statusFilter === s
                  ? 'bg-forest-900 text-white'
                  : 'bg-white text-slate-950 hover:text-forest-900 border border-slate-300'
              }`}
            >
              {s ? s : 'All Batches'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-md flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-950 font-bold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search food donations by food name, category, donor, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-950 font-bold bg-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching donations audit table..." />
      ) : filteredDonations.length === 0 ? (
        <EmptyState title="No donations found" description="There are no food batches matching this criteria." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-slate-950 font-black">Food Batch</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Donor Establishment</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Category & Qty</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Status</th>
                  <th className="py-4 px-6 text-slate-950 font-black text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDonations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <strong className="block text-slate-950 font-extrabold text-sm">{d.foodName}</strong>
                      <span className="text-xs font-bold text-forest-900 block mt-0.5">{d.city}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-slate-950 block text-xs">{d.donorId?.name}</span>
                      <span className="text-xs font-semibold text-forest-900 block">{d.donorId?.phone}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-forest-950 text-sm block">{d.quantity} {d.unit}</span>
                      <span className="text-xs font-bold text-slate-950">{d.foodCategory}</span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {d.status !== 'FLAGGED' && (
                        <button
                          onClick={() => handleFlag(d._id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                          title="Flag for review"
                        >
                          Flag
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {flagTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xl font-black text-slate-950 tracking-tight">Flag donation for safety audit</h3>
              <button onClick={() => setFlagTarget(null)} className="text-slate-500 hover:text-slate-950 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">Specify reason for flagging this donation for safety audit:</p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-xl p-3 text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600"
              rows={4}
              placeholder="Enter reason..."
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setFlagTarget(null)}
                className="px-5 py-2.5 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                disabled={flagLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitFlag}
                disabled={flagLoading}
                className="px-5 py-2.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition cursor-pointer btn-press"
              >
                {flagLoading ? 'Flagging...' : 'Flag Donation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete donation"
        message="Are you sure you want to delete this donation from the platform?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
