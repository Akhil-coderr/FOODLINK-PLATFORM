import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { PlusCircle, Search, Filter, Clock, Eye, Edit3, XCircle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

export default function DonorDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      const res = await donationService.getMyDonations({
        status: statusFilter || undefined,
      });
      if (res.success && res.data?.donations) {
        setDonations(res.data.donations);
      } else {
        setDonations([]);
      }
    } catch (err) {
      toast.error('Failed to load your donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, [statusFilter]);

  const handleCancel = (id) => {
    setCancelTarget(id);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const res = await donationService.cancel(cancelTarget);
      if (res.success) {
        toast.success('Donation listing cancelled');
        setCancelTarget(null);
        fetchMyDonations();
      }
    } catch (err) {
      toast.error(err.message || 'Error cancelling donation');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">My Food Donations</h1>
          <p className="text-xs text-brandText-muted mt-0.5">
            Manage your active and completed food redistribution batches.
          </p>
        </div>
        <Link
          to="/donor/donations/create"
          className="inline-flex items-center px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Add Donation
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {['', 'AVAILABLE', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'EXPIRED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === s
                ? 'bg-forest-900 text-white'
                : 'bg-white text-brandText-muted hover:text-brandText-primary border border-surface-border'
            }`}
          >
            {s ? s : 'All Batches'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your donations..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No food batches found"
          description={
            statusFilter
              ? `No donations found with status "${statusFilter}".`
              : 'You have not listed any surplus food yet.'
          }
          actionText="Publish Your First Batch"
          actionLink="/donor/donations/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-2xl border border-surface-border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block">
                      {d.foodCategory}
                    </span>
                    <h3 className="font-bold text-base text-brandText-primary line-clamp-1">{d.foodName}</h3>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                <div className="bg-surface-light rounded-xl p-3 grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-brandText-muted block">Quantity</span>
                    <strong className="text-forest-900 font-bold">
                      {d.quantity} {d.unit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-brandText-muted block">Est. Servings</span>
                    <strong className="text-brandText-primary font-bold">
                      {d.servings || Math.round(d.quantity * 2.2)} meals
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-brandText-muted space-y-1 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    <span>Expires: {new Date(d.expiryTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <Link
                  to={`/donor/donations/${d._id}`}
                  className="font-bold text-forest-800 hover:text-forest-900 inline-flex items-center"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Details
                </Link>

                <div className="flex items-center space-x-2">
                  {(d.status === 'AVAILABLE' || d.status === 'REQUESTED') && (
                    <Link
                      to={`/donor/donations/${d._id}/edit`}
                      className="p-1.5 text-slate-500 hover:text-forest-900 rounded-lg hover:bg-slate-100"
                      title="Edit listing"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  )}

                  {d.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleCancel(d._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Cancel listing"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!cancelTarget}
        title="Cancel food listing"
        message="Are you sure you want to cancel this food listing? It will no longer be visible to NGOs."
        confirmText="Cancel Listing"
        cancelText="Keep Listing"
        confirmVariant="danger"
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
        isLoading={cancelLoading}
      />
    </div>
  );
}
