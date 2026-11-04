import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Inbox, Filter, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import CustomSelect from '../../components/common/CustomSelect';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRequests({ status: statusFilter || undefined });
      if (res.success && res.data) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load pickup requests:', err);
      toast.error('Failed to load pickup requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-emerald-400" />
            NGO Pickup Requests Queue
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Audit and monitor NGO claims on surplus food donations across all municipal sectors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending Approval' },
              { value: 'ACCEPTED', label: 'Accepted by Donor' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            placeholder="All Statuses"
          />
          <button
            onClick={fetchRequests}
            className="p-2.5 border-2 border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
            title="Refresh Requests"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching pickup requests queue..." />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border-2 border-slate-300 text-center shadow-md">
          <EmptyState title="No pickup requests found" description="No requests matching this filter are in the system." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-slate-950 font-black">Donation Item</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Requesting NGO</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Donor Origin</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Quantity</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Requested At</th>
                  <th className="py-4 px-6 text-slate-950 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-bold text-slate-950">
                      <p className="text-slate-950 font-black text-sm">{r.donationId?.foodName || 'Food Item'}</p>
                      <span className="text-xs text-emerald-950 font-extrabold uppercase mt-0.5 block">{r.donationId?.foodCategory || 'Standard'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-black text-slate-950 text-sm">{r.ngoId?.name || 'NGO'}</p>
                      <p className="text-xs text-emerald-950 font-extrabold mt-0.5">{r.ngoId?.phone} • {r.ngoId?.city}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-black text-slate-950 text-sm">{r.donorId?.name || 'Donor'}</p>
                      <p className="text-xs text-emerald-950 font-extrabold mt-0.5">{r.donorId?.phone} • {r.donorId?.city}</p>
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-950 text-sm">
                      {r.requestedQuantity || r.donationId?.quantity} {r.donationId?.unit || 'kg'}
                    </td>
                    <td className="py-4 px-4 text-slate-950 font-bold text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
