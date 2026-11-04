import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { ShieldCheck, ShieldAlert, Thermometer, CheckCircle2, Clock } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function AdminFoodSafetyPage() {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlagged = async () => {
      setLoading(true);
      try {
        const res = await adminService.getDonations({ status: 'FLAGGED' });
        if (res.success && res.data?.donations) {
          setFlagged(res.data.donations);
        } else {
          setFlagged([]);
        }
      } catch (err) {
        console.error('Error fetching safety data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlagged();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-7 h-7 text-emerald-400" />
          Food Safety & Compliance Center
        </h1>
        <p className="text-sm font-semibold text-slate-300 mt-1">
          Audited hygiene standards, flagged donation reviews, and temperature safety protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-300 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-950">Safety Standard</span>
            <Thermometer className="w-5 h-5 text-emerald-700" />
          </div>
          <strong className="text-xl font-black text-slate-950 block">Thermal Rule</strong>
          <p className="text-xs text-slate-950 font-bold">
            Hot food held &ge;60°C; Chilled items &le;4°C. Automated warnings triggered on overdue pickup.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-300 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-950">Expiry Limits</span>
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <strong className="text-xl font-black text-slate-950 block">Scheduled Cron Guard</strong>
          <p className="text-xs text-slate-950 font-bold">
            Batches entering final 1-hour window trigger critical alerts; expired batches automatically lock.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-300 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-950">Single-Use Chain</span>
            <ShieldCheck className="w-5 h-5 text-blue-700" />
          </div>
          <strong className="text-xl font-black text-slate-950 block">Dual QR Verification</strong>
          <p className="text-xs text-slate-950 font-bold">
            Handoffs validated with SHA-256 tokens at donor kitchen and shelter gate. Zero unverified drops.
          </p>
        </div>
      </div>

      {/* Flagged batches */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md space-y-4">
        <h3 className="font-black text-lg text-slate-950">Flagged Food Batches Under Review</h3>

        {loading ? (
          <LoadingSpinner text="Checking safety logs..." />
        ) : flagged.length === 0 ? (
          <div className="p-8 text-center bg-forest-50/50 rounded-2xl border border-forest-100">
            <CheckCircle2 className="w-8 h-8 text-forest-600 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-forest-950">All Safety Checks Passing</h4>
            <p className="text-xs text-forest-700 mt-1">
              There are currently zero flagged food items on the platform. All active listings adhere to temperature and packaging guidelines.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flagged.map((f) => (
              <div
                key={f._id}
                className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-amber-950">{f.foodName}</h4>
                  <p className="text-xs text-amber-800 mt-0.5">Flag Reason: {f.flagReason}</p>
                  <span className="text-[11px] text-amber-700 font-mono block mt-1">
                    Donor: {f.donorId?.name} ({f.city})
                  </span>
                </div>
                <StatusBadge status="FLAGGED" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
