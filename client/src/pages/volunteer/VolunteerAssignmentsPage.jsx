import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { volunteerService } from '../../services/volunteerService';
import { assignmentService } from '../../services/assignmentService';
import { Truck, MapPin, CheckCircle2, QrCode, Play, Building } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function VolunteerAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await volunteerService.getMyAssignments();
      if (res.success && res.data) {
        setAssignments(res.data);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStartPickup = async (id) => {
    try {
      const res = await assignmentService.startPickup(id);
      if (res.success) {
        toast.success('Pickup in progress. Follow map to donor kitchen.');
        fetchAssignments();
      }
    } catch (err) {
      toast.error(err.message || 'Error starting pickup');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">My Active Assignments</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Follow pickup steps, navigate routes, and verify handover QR codes.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="You do not have any tasks assigned. Explore available tasks to claim one."
          actionText="Browse Available Tasks"
          actionLink="/volunteer/tasks"
          icon={Truck}
        />
      ) : (
        <div className="space-y-6">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-6"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded">
                      Batch #{a._id.slice(-6)}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <h3 className="font-bold text-lg text-brandText-primary mt-1">
                    {a.donationId?.foodName} ({a.donationId?.quantity} kg)
                  </h3>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/volunteer/routes"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-brandText-primary text-xs font-bold rounded-xl transition"
                  >
                    View Map Route
                  </Link>
                  <Link
                    to="/volunteer/scan"
                    className="px-3.5 py-2 bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold rounded-xl transition flex items-center"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                    Scan QR
                  </Link>
                </div>
              </div>

              {/* Waypoints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-1">
                  <span className="text-[10px] font-bold uppercase text-forest-700 block">
                    1. Donor Kitchen (Collection)
                  </span>
                  <strong className="text-sm font-bold block text-brandText-primary">{a.donorId?.name}</strong>
                  <p className="text-brandText-muted">{a.donorId?.address}, {a.donorId?.city}</p>
                  <p className="text-slate-500 font-mono">Tel: {a.donorId?.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">
                    2. NGO Shelter (Destination)
                  </span>
                  <strong className="text-sm font-bold block text-brandText-primary">{a.ngoId?.name}</strong>
                  <p className="text-brandText-muted">{a.ngoId?.address}, {a.ngoId?.city}</p>
                  <p className="text-slate-500 font-mono">Tel: {a.ngoId?.phone}</p>
                </div>
              </div>

              {/* Stepper Actions */}
              <div className="pt-2 flex items-center justify-between">
                {a.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStartPickup(a._id)}
                    className="px-5 py-2.5 bg-forest-900 text-white text-xs font-bold rounded-xl hover:bg-forest-800 transition flex items-center"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Start Transit to Donor
                  </button>
                )}

                {a.status === 'PICKUP_IN_PROGRESS' && (
                  <Link
                    to="/volunteer/scan"
                    className="px-5 py-2.5 bg-forest-900 text-white text-xs font-bold rounded-xl hover:bg-forest-800 transition flex items-center"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                    Scan Donor's Pickup QR Code
                  </Link>
                )}

                {a.status === 'PICKED_UP' && (
                  <Link
                    to="/volunteer/scan"
                    className="px-5 py-2.5 bg-forest-900 text-white text-xs font-bold rounded-xl hover:bg-forest-800 transition flex items-center"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5" />
                    Scan NGO's Delivery QR Code
                  </Link>
                )}

                {a.status === 'COMPLETED' && (
                  <span className="text-xs font-bold text-forest-800 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-forest-600" />
                    Delivery Completed! +20 Karma Points Awarded
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
