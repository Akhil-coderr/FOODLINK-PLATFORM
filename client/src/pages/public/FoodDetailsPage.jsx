import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Thermometer,
  Package,
  Layers,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MapView from '../../components/common/MapView';
import toast from 'react-hot-toast';

export default function FoodDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await donationService.getById(id);
        if (res.success && res.data) {
          setDonation(res.data);
        } else {
          setError(res.message || 'Donation not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Listing link copied to clipboard!');
  };

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      toast('Please sign in with an NGO account to request food', { icon: 'ℹ️' });
      navigate('/login', { state: { returnTo: `/ngo/food/${id}` } });
      return;
    }

    if (user.role === 'ngo') {
      navigate(`/ngo/food/${id}`);
    } else {
      toast.error('Only verified NGO accounts can request food donations');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading food donation details..." size="lg" className="min-h-[50vh]" />;
  }

  if (error || !donation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border border-surface-border shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brandText-primary mb-2">Donation Unavailable</h2>
          <p className="text-sm text-brandText-muted mb-6">
            {error || 'This food listing may have expired, been claimed, or does not exist.'}
          </p>
          <Link
            to="/food"
            className="inline-flex items-center px-4 py-2 bg-forest-900 text-white rounded-xl text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Available Food
          </Link>
        </div>
      </div>
    );
  }

  const coords = donation.location?.coordinates
    ? [donation.location.coordinates[1], donation.location.coordinates[0]]
    : [11.0168, 76.9558];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/food"
          className="inline-flex items-center text-sm font-semibold text-brandText-muted hover:text-brandText-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Listings
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border border-surface-border bg-white hover:bg-slate-50 transition"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5 text-brandText-muted" />
          Share Listing
        </button>
      </div>

      {/* Main card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-surface-border shadow-sm">
            <div className="relative h-72 sm:h-96 bg-slate-100">
              <img
                src={
                  donation.imageUrl ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'
                }
                alt={donation.foodName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status={donation.status} className="text-sm px-3 py-1" />
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
                  {donation.foodCategory} • {donation.foodType}
                </span>
                <h1 className="text-3xl font-black text-brandText-primary tracking-tight">
                  {donation.foodName}
                </h1>
                <p className="text-sm text-brandText-muted mt-2 leading-relaxed">
                  {donation.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Quantity stats */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-forest-50/70 border border-forest-100">
                <div>
                  <span className="text-xs text-brandText-muted block">Total Quantity</span>
                  <strong className="text-xl font-black text-forest-900">
                    {donation.quantity} {donation.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-brandText-muted block">Est. Servings</span>
                  <strong className="text-xl font-black text-forest-900">
                    {donation.servings || Math.round(donation.quantity * 2.2)} meals
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-brandText-muted block">Status</span>
                  <strong className="text-base font-bold text-forest-800 uppercase">
                    {donation.status}
                  </strong>
                </div>
              </div>

              {/* Storage & Allergens */}
              <div className="space-y-4 pt-2 border-t border-slate-100 text-sm">
                <div className="flex items-center space-x-3">
                  <Thermometer className="w-5 h-5 text-forest-700 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-brandText-muted block">Storage Condition</span>
                    <strong className="font-semibold text-brandText-primary capitalize">
                      {donation.storageCondition || 'Ambient'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-forest-700 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-brandText-muted block">Packaging</span>
                    <strong className="font-semibold text-brandText-primary">
                      {donation.packagingCondition || 'Hygienically containerized for transit'}
                    </strong>
                  </div>
                </div>

                {donation.allergens && donation.allergens.length > 0 && (
                  <div>
                    <span className="text-xs text-brandText-muted block mb-1.5">Allergens Declared</span>
                    <div className="flex flex-wrap gap-1.5">
                      {donation.allergens.map((alg, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          {alg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {donation.specialInstructions && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-surface-border text-xs text-brandText-primary">
                    <strong className="block mb-1 text-slate-700">Special Handling Instructions:</strong>
                    {donation.specialInstructions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Time, Pickup Location & Request CTA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pickup Window Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-6">
            <h3 className="font-bold text-base text-brandText-primary flex items-center">
              <Clock className="w-5 h-5 mr-2 text-forest-700" />
              Pickup Schedule & Expiry
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="block font-semibold text-xs text-amber-800">Must be collected before:</span>
                <strong className="text-base font-bold">
                  {new Date(donation.expiryTime).toLocaleString()}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-brandText-muted block">Pickup Starts</span>
                  <strong className="text-brandText-primary">
                    {donation.pickupStartTime ? new Date(donation.pickupStartTime).toLocaleTimeString() : 'Immediate'}
                  </strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-brandText-muted block">Pickup Ends</span>
                  <strong className="text-brandText-primary">
                    {donation.pickupEndTime ? new Date(donation.pickupEndTime).toLocaleTimeString() : 'Before Expiry'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Claim CTA */}
            {donation.status === 'AVAILABLE' ? (
              <div className="pt-2">
                <button
                  onClick={handleRequestClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Claim / Request for NGO
                </button>
                <p className="text-[11px] text-center text-brandText-muted mt-2">
                  Requires verified NGO status. Prevents food overselling.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs font-semibold text-brandText-muted border border-surface-border">
                This donation is currently <strong>{donation.status}</strong> and is not open for public claiming.
              </div>
            )}
          </div>

          {/* Location Map Card */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-brandText-primary flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-forest-700" />
                Pickup Vicinity
              </h3>
              <span className="text-xs text-brandText-muted">{donation.city || 'Coimbatore'}</span>
            </div>

            <MapView
              center={coords}
              zoom={14}
              markers={[
                {
                  position: coords,
                  title: donation.foodName,
                  description: `${donation.quantity} ${donation.unit} available`,
                  type: 'donor',
                },
              ]}
              className="h-60 w-full"
            />
            <p className="text-[11px] text-brandText-muted">
              Exact donor contact phone number is provided to the verified NGO and assigned volunteer upon request confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
