import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { assignmentService } from '../../services/assignmentService';
import { Package, MapPin, Building, ArrowRight, Truck } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function VolunteerTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await volunteerService.getAvailableTasks();
      if (res.success && res.data) {
        setTasks(res.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      toast.error('Failed to load available tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleClaimTask = async (assignmentId) => {
    try {
      const res = await assignmentService.assignVolunteer(assignmentId);
      if (res.success) {
        toast.success('Pickup task assigned to you! Safe travels.');
        fetchTasks();
      }
    } catch (err) {
      toast.error(err.message || 'Error claiming task');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Available Pickup Tasks</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Surplus meals approved by donors ready for immediate transport to shelters.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Searching for pickup tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks currently awaiting dispatch"
          description="All accepted donations are currently fulfilled or in transit. Check back shortly!"
          icon={Package}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-3xl p-6 border border-surface-border shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-lg">
                    {t.donationId?.foodCategory || 'Cooked Meals'}
                  </span>
                  <StatusBadge status={t.status} />
                </div>

                <h3 className="font-bold text-base text-brandText-primary">
                  {t.donationId?.foodName}
                </h3>

                <div className="space-y-2 text-xs text-brandText-muted bg-surface-light p-3.5 rounded-2xl border border-surface-border">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-1.5 text-forest-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                      <strong className="text-brandText-primary">{t.donorId?.name}</strong> • {t.donorId?.address}, {t.donorId?.city}
                    </div>
                  </div>

                  <div className="flex items-start pt-1.5 border-t border-slate-200">
                    <Building className="w-4 h-4 mr-1.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Destination</span>
                      <strong className="text-brandText-primary">{t.ngoId?.name}</strong> • {t.ngoId?.city}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-brandText-muted">
                    Batch Quantity: <strong className="text-forest-900">{t.donationId?.quantity} kg</strong>
                  </span>
                  <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
                    +20 Karma Points
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleClaimTask(t._id)}
                className="w-full py-2.5 px-4 bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center"
              >
                <Truck className="w-4 h-4 mr-1.5" />
                Claim This Delivery Task
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
