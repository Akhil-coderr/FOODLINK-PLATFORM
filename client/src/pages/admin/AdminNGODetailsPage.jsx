import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { 
  ShieldCheck, ArrowLeft, Building, FileText, CheckCircle2, 
  XCircle, Clock, MapPin, Phone, Mail, Award, AlertCircle 
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function AdminNGODetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchNGODetails();
  }, [id]);

  const fetchNGODetails = async () => {
    setLoading(true);
    try {
      const res = await adminService.getNGOs(); // or single lookup
      if (res.success && res.data) {
        const found = (res.data.ngos || []).find((n) => n._id === id || n.userId?._id === id);
        if (found) {
          setNgo(found);
          setNotes(found.adminVerificationNotes || '');
        } else {
          toast.error('NGO record not found');
        }
      }
    } catch (err) {
      toast.error('Failed to load NGO record');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await adminService.approveNGO(ngo._id, notes || 'Verified by administrator');
      toast.success('NGO verification approved successfully!');
      fetchNGODetails();
    } catch (err) {
      toast.error('Failed to approve NGO');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notes) {
      toast.error('Please provide a reason or note for rejecting the application');
      return;
    }
    setProcessing(true);
    try {
      await adminService.rejectNGO(ngo._id, notes);
      toast.success('NGO verification application rejected');
      fetchNGODetails();
    } catch (err) {
      toast.error('Failed to reject NGO');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Retrieving NGO dossier..." />;

  if (!ngo) {
    return (
      <div className="p-8 text-center bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-base font-bold">NGO dossier not found</p>
        <Link to="/admin/ngos" className="mt-3 inline-block text-xs text-emerald-400 hover:underline">
          ← Return to NGO list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/ngos"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Verification Roster
        </Link>
        <StatusBadge status={ngo.verificationStatus} />
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-700/80 pb-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-lg">
              {ngo.organizationName ? ngo.organizationName[0].toUpperCase() : 'N'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{ngo.organizationName}</h2>
              <p className="text-xs text-slate-400">Reg No: {ngo.registrationNumber}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider">Contact & Location</h4>
            <div className="space-y-2 text-slate-300">
              <p><span className="text-slate-500">Contact Person:</span> {ngo.userId?.name || 'N/A'}</p>
              <p><span className="text-slate-500">Email:</span> {ngo.userId?.email || 'N/A'}</p>
              <p><span className="text-slate-500">Phone:</span> {ngo.userId?.phone || 'N/A'}</p>
              <p><span className="text-slate-500">City:</span> {ngo.userId?.city || 'Coimbatore'}</p>
              <p><span className="text-slate-500">Address:</span> {ngo.userId?.address || 'Standard Location'}</p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider">Operational Capacity</h4>
            <div className="space-y-2 text-slate-300">
              <p><span className="text-slate-500">Daily Receiving Capacity:</span> <strong className="text-emerald-400">{ngo.receivingCapacityKg} kg</strong></p>
              <p><span className="text-slate-500">Accepted Food Categories:</span> {(ngo.acceptedFoodCategories || []).join(', ') || 'All categories'}</p>
              <p><span className="text-slate-500">Operating Schedule:</span> {ngo.operatingHours?.hours || '08:00 AM - 09:00 PM'}</p>
              <p><span className="text-slate-500">Registered On:</span> {new Date(ngo.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Verification Action Box */}
        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-700 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Administrative Verification Decision
          </h4>
          <textarea
            rows={3}
            placeholder="Add verification notes, registration check details, or reason for rejection..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold rounded-xl text-xs transition disabled:opacity-50"
            >
              Reject Application
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              Approve & Accredit NGO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
