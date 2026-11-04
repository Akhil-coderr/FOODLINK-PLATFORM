import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Bike, Search, Award, MapPin, Phone, Mail, RefreshCw, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getVolunteers();
      if (res.success && res.data) {
        setVolunteers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load volunteers:', err);
      toast.error('Failed to load volunteers fleet');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`Volunteer status changed to ${newStatus}`);
      fetchVolunteers();
    } catch (err) {
      toast.error('Failed to update volunteer status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteVolunteer(deleteTarget._id);
      if (res.success) {
        toast.success('Volunteer removed successfully');
        setDeleteTarget(null);
        fetchVolunteers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove volunteer');
    } finally {
      setDeleting(false);
    }
  };

  const getDisplayName = (volunteer) => {
    const name = (volunteer.userId?.name || '').trim();
    if (name && name.toLowerCase() !== 'volunteer') return name;
    const email = (volunteer.userId?.email || '').trim();
    if (email) return email.split('@')[0];
    return 'Unnamed volunteer';
  };

  const filtered = volunteers.filter((v) => {
    const name = (v.userId?.name || '').toLowerCase();
    const email = (v.userId?.email || '').toLowerCase();
    const city = (v.userId?.city || '').toLowerCase();
    const s = search.toLowerCase();
    return name.includes(s) || email.includes(s) || city.includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bike className="w-7 h-7 text-emerald-400" />
            Volunteer Logistics Fleet
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Dispatch fleet management, points leaderboard, transport modes, and logistics compliance.
          </p>
        </div>
        <button
          onClick={fetchVolunteers}
          className="p-2.5 border-2 border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          title="Refresh Volunteers"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-950 font-bold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search volunteers by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-slate-300 text-slate-950 font-bold bg-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-xs"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading volunteers roster..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border-2 border-slate-300 text-center shadow-md">
          <Bike className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <p className="text-sm font-extrabold text-slate-950">No volunteers found matching your query</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-slate-950 font-black">Volunteer</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Vehicle & Range</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Capacity</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Completed Tasks</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Reward Points</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Status</th>
                  <th className="py-4 px-6 text-slate-950 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-bold text-slate-950">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center text-xs shadow-xs">
                          {getDisplayName(v)[0]?.toUpperCase() || 'V'}
                        </div>
                        <div>
                          <p className="text-slate-950 font-black text-sm">{getDisplayName(v)}</p>
                          <p className="text-xs text-emerald-950 font-extrabold mt-0.5">{v.userId?.email}</p>
                          <p className="text-xs text-slate-950 font-bold mt-0.5">{v.userId?.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize font-black text-slate-950 text-sm block">{v.transportType || 'Bike'}</span>
                      <p className="text-xs text-emerald-950 font-extrabold mt-0.5">Radius: {v.serviceRadiusKm || 15} km</p>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-950 text-sm">
                      {v.maximumCapacityKg || 25} kg
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-950 text-xs">
                      {v.completedTasks || 0} deliveries
                    </td>
                    <td className="py-4 px-4 font-black text-amber-950 text-sm">
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-400 px-2.5 py-1 rounded-full font-black">
                        <Award className="w-3.5 h-3.5 text-amber-700" />
                        {v.totalPoints || 0} pts
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={v.userId?.accountStatus || 'active'} />
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {v.userId?.accountStatus === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(v.userId?._id, 'suspended')}
                          className="px-3.5 py-1.5 text-xs font-black rounded-lg text-rose-950 bg-rose-100 hover:bg-rose-200 border border-rose-300 transition shadow-xs cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(v.userId?._id, 'active')}
                          className="px-3.5 py-1.5 text-xs font-black rounded-lg text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition shadow-xs cursor-pointer"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(v)}
                        className="px-3.5 py-1.5 text-xs font-black rounded-lg text-white bg-rose-600 hover:bg-rose-700 border border-rose-800 transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                        title="Remove volunteer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Remove this volunteer?"
        message={
          deleteTarget
            ? `"${getDisplayName(deleteTarget)}" and their volunteer account will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmText="Remove Volunteer"
        cancelText="Keep Volunteer"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        isLoading={deleting}
      />
    </div>
  );
}
