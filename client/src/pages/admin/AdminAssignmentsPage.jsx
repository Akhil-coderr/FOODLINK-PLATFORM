import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { assignmentService } from '../../services/assignmentService';
import { Truck, UserPlus, CheckCircle2, MapPin, Building } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteers, setSelectedVolunteers] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, volRes] = await Promise.allSettled([
        adminService.getAssignments(),
        adminService.getVolunteers(),
      ]);

      if (assignRes.status === 'fulfilled' && assignRes.value?.data?.assignments) {
        setAssignments(assignRes.value.data.assignments);
      }

      if (volRes.status === 'fulfilled' && volRes.value?.data) {
        setVolunteers(volRes.value.data);
      }
    } catch (err) {
      toast.error('Failed to load dispatch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatch = async (assignmentId) => {
    const volId = selectedVolunteers[assignmentId];
    if (!volId) {
      toast.error('Please select a volunteer from the list');
      return;
    }

    try {
      const res = await assignmentService.assignVolunteer(assignmentId, volId);
      if (res.success) {
        toast.success('Volunteer dispatched and assigned to pickup task!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Dispatch failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Truck className="w-7 h-7 text-emerald-400" />
          Volunteer Dispatch Control
        </h1>
        <p className="text-sm font-semibold text-slate-300 mt-1">
          Assign verified volunteer couriers to accepted food donation claims.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading logistics records..." />
      ) : assignments.length === 0 ? (
        <EmptyState title="No assignments recorded" description="When donors accept NGO requests, pickup assignments appear here for volunteer dispatch." icon={Truck} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-lg">
                    {a.donationId?.foodName}
                  </span>
                  <StatusBadge status={a.status} />
                </div>

                <div className="space-y-2 text-xs bg-surface-light p-3.5 rounded-2xl border border-surface-border">
                  <div className="flex items-start">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-900 block">Donor Origin</span>
                      <strong className="text-slate-950 font-black text-xs">{a.donorId?.name}</strong> • <span className="text-slate-950 font-bold">{a.donorId?.address}, {a.donorId?.city}</span>
                    </div>
                  </div>
                  <div className="flex items-start pt-1.5 border-t border-slate-200">
                    <Building className="w-3.5 h-3.5 mr-1.5 text-blue-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-900 block">Shelter Destination</span>
                      <strong className="text-slate-950 font-black text-xs">{a.ngoId?.name}</strong> • <span className="text-slate-950 font-bold">{a.ngoId?.city}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-950 font-bold flex items-center justify-between">
                  <span>Batch Qty: <strong className="text-emerald-950 font-black">{a.donationId?.quantity} kg</strong></span>
                  <span>Assigned Courier: <strong className="text-slate-950 font-black">{a.volunteerId?.name || 'Unassigned'}</strong></span>
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                {a.status === 'UNASSIGNED' || !a.volunteerId ? (
                  <div className="flex gap-2">
                    <select
                      value={selectedVolunteers[a._id] || ''}
                      onChange={(e) =>
                        setSelectedVolunteers({ ...selectedVolunteers, [a._id]: e.target.value })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-300 text-xs bg-white text-slate-950 font-bold focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30"
                    >
                      <option value="" className="text-slate-950 font-bold">Select an available volunteer...</option>
                      {volunteers.map((v) => (
                        <option key={v._id} value={v.userId?._id} className="text-slate-950 font-bold">
                          {v.userId?.name} ({v.transportType} • {v.maximumCapacityKg}kg capacity)
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDispatch(a._id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Dispatch
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-black text-emerald-950 bg-emerald-100 p-2.5 rounded-xl border border-emerald-400 flex items-center justify-between">
                    <span>✓ Volunteer Dispatched: {a.volunteerId?.name}</span>
                    <span className="font-mono text-xs font-black">{a.volunteerId?.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
