import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, FileText, ExternalLink, Search } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PromptModal from '../../components/common/PromptModal';
import toast from 'react-hot-toast';

export default function AdminNGOsPage() {
  const [ngos, setNgos] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchNGOs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getNGOs({ status: statusFilter || undefined });
      if (res.success && res.data?.ngos) {
        setNgos(res.data.ngos);
      } else {
        setNgos([]);
      }
    } catch (err) {
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, [statusFilter]);

  const handleApprove = async (id, name) => {
    try {
      const res = await adminService.approveNGO(id, 'Approved by Administrator after credential audit.');
      if (res.success) {
        toast.success(`NGO "${name}" verified and approved!`);
        fetchNGOs();
      }
    } catch (err) {
      toast.error(err.message || 'Error approving NGO');
    }
  };

  const handleReject = (id, name) => {
    setRejectTarget({ id, name });
  };

  const submitReject = async (notes) => {
    if (!rejectTarget || !notes) return;
    const { id, name } = rejectTarget;
    setRejectTarget(null);

    try {
      const res = await adminService.rejectNGO(id, notes);
      if (res.success) {
        toast.success(`NGO "${name}" marked rejected`);
        fetchNGOs();
      }
    } catch (err) {
      toast.error(err.message || 'Error rejecting NGO');
    }
  };

  const filteredNgos = ngos.filter((ngo) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      ngo.organizationName?.toLowerCase().includes(term) ||
      ngo.registrationNumber?.toLowerCase().includes(term) ||
      ngo.city?.toLowerCase().includes(term) ||
      ngo.userId?.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            NGO Organization Verification
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Audit non-profit registration certificates, verify shelter capabilities, and approve food intake accounts.
          </p>
        </div>

        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shadow-xs cursor-pointer ${
                statusFilter === s
                  ? 'bg-forest-900 text-white'
                  : 'bg-white text-slate-950 hover:text-forest-900 border border-slate-300'
              }`}
            >
              {s ? s : 'All Applications'}
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
            placeholder="Search NGOs by organization name, registration number, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-950 font-bold bg-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading NGO verification applications..." />
      ) : filteredNgos.length === 0 ? (
        <EmptyState title="No NGO records found" description="There are no NGOs matching the selected criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNgos.map((ngo) => (
            <div
              key={ngo._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-md flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-950">{ngo.organizationName}</h3>
                    <span className="text-xs font-mono font-bold text-forest-900">Reg: {ngo.registrationNumber}</span>
                  </div>
                  <StatusBadge status={ngo.verificationStatus} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-950 font-bold block">Contact Person</span>
                    <strong className="text-slate-950 font-extrabold text-sm">{ngo.userId?.name}</strong>
                    <span className="text-forest-900 font-bold block text-[11px]">{ngo.userId?.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-950 font-bold block">Receiving Capacity</span>
                    <strong className="text-forest-950 font-extrabold text-sm">{ngo.receivingCapacityKg} kg / day</strong>
                    <span className="text-slate-950 font-bold block text-[11px]">{ngo.userId?.city}</span>
                  </div>
                </div>

                {ngo.description && (
                  <p className="text-xs font-medium text-slate-950 line-clamp-2">
                    {ngo.description}
                  </p>
                )}

                {/* Documents list */}
                {ngo.documents && ngo.documents.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase text-brandText-muted block mb-1">
                      Submitted Certificates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ngo.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-forest-800 hover:text-forest-900 bg-forest-50 hover:bg-forest-100 px-2.5 py-1 rounded-lg border border-forest-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 text-forest-600" />
                          View Document #{idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-brandText-muted">
                  Applied: {new Date(ngo.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center space-x-2">
                  {ngo.verificationStatus !== 'approved' && (
                    <button
                      onClick={() => handleApprove(ngo._id, ngo.organizationName)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Approve NGO
                    </button>
                  )}

                  {ngo.verificationStatus !== 'rejected' && (
                    <button
                      onClick={() => handleReject(ngo._id, ngo.organizationName)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl transition"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PromptModal
        isOpen={!!rejectTarget}
        title="Reject NGO application"
        description={
          rejectTarget
            ? `Please provide a rejection reason for ${rejectTarget.name}. The applicant will see this note.`
            : ''
        }
        label="Rejection reason"
        placeholder="e.g. Registration certificate could not be verified."
        required
        confirmText="Reject NGO"
        onConfirm={submitReject}
        onClose={() => setRejectTarget(null)}
      />
    </div>
  );
}
