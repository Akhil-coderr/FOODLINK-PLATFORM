import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { ngoService } from '../../services/ngoService';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  Calendar,
  Thermometer,
  Package,
  ArrowLeft,
  AlertCircle,
  Building,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MapView from '../../components/common/MapView';
import toast from 'react-hot-toast';

export default function NGOFoodDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [requestedQty, setRequestedQty] = useState('');

  const isVerified = user?.ngoProfile?.verificationStatus === 'approved';

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await donationService.getById(id);
        if (res.success && res.data) {
          setDonation(res.data);
          setRequestedQty(res.data.quantity);
        }
      } catch (err) {
        toast.error('Failed to load donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error('Your NGO is pending verification. Only approved NGOs can claim food.');
      return;
    }

    setRequesting(true);
    try {
      const res = await ngoService.createRequest(id, {
        requestedQuantity: parseFloat(requestedQty),
        message,
      });

      if (res.success) {
        toast.success('Pickup request submitted to donor! We will alert you upon confirmation.');
        navigate('/ngo/requests');
      } else {
        toast.error(res.message || 'Request failed');
      }
    } catch (err) {
      toast.error(err.message || 'Error submitting request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading food details..." size="lg" />;

  if (!donation) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-surface-border text-center">
        <h3 className="font-bold text-lg mb-2">Food Listing Not Found</h3>
        <Link to="/ngo/food" className="text-xs font-bold text-forest-800 hover:underline">
          ← Back to food listings
        </Link>
      </div>
    );
  }

  const coords = donation.location?.coordinates
    ? [donation.location.coordinates[1], donation.location.coordinates[0]]
    : [11.0168, 76.9558];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/ngo/food"
        className="inline-flex items-center text-xs font-semibold text-brandText-muted hover:text-brandText-primary"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Available Food
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Food Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
                  {donation.foodCategory} • {donation.foodType}
                </span>
                <h1 className="text-2xl font-black text-brandText-primary">{donation.foodName}</h1>
                <p className="text-xs text-brandText-muted mt-1">{donation.description}</p>
              </div>
              <StatusBadge status={donation.status} className="text-sm px-3 py-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-light border border-surface-border text-xs">
              <div>
                <span className="text-brandText-muted block">Available Batch</span>
                <strong className="text-forest-900 font-bold text-base">
                  {donation.quantity} {donation.unit}
                </strong>
              </div>
              <div>
                <span className="text-brandText-muted block">Est. Meals</span>
                <strong className="text-brandText-primary font-bold text-base">
                  {donation.servings || Math.round(donation.quantity * 2.2)} meals
                </strong>
              </div>
            </div>

            <div className="space-y-3 text-xs text-brandText-primary pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Expires at: {new Date(donation.expiryTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-forest-600" />
                <span>Storage: <strong className="capitalize">{donation.storageCondition}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-forest-600" />
                <span>Pickup area: {donation.city}</span>
              </div>
            </div>

            <MapView
              center={coords}
              zoom={14}
              markers={[
                {
                  position: coords,
                  title: donation.foodName,
                  description: `${donation.quantity} ${donation.unit}`,
                  type: 'donor',
                },
              ]}
              className="h-52 w-full"
            />
          </div>
        </div>

        {/* Right Column: Request Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-5">
            <h3 className="font-bold text-base text-brandText-primary flex items-center">
              <UtensilsCrossed className="w-5 h-5 mr-2 text-forest-700" />
              Request Food for Shelter
            </h3>

            {!isVerified ? (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <p className="font-bold">Verification Pending</p>
                <p>
                  You cannot submit claim requests until an administrator verifies your NGO documents.
                </p>
              </div>
            ) : donation.status !== 'AVAILABLE' ? (
              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-brandText-muted text-center border border-surface-border">
                This food donation is currently in <strong>{donation.status}</strong> status and cannot be claimed.
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Requested Quantity ({donation.unit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max={donation.quantity}
                    required
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm"
                  />
                  <span className="text-[11px] text-brandText-muted block mt-1">
                    Max available: {donation.quantity} {donation.unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Message to Donor (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mention delivery timing or resident details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={requesting}
                  className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  {requesting ? 'Submitting Request...' : 'Submit Claim Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
