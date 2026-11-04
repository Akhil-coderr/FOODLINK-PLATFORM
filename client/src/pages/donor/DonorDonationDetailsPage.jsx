import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { qrService } from '../../services/assignmentService';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock,
  MapPin,
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowLeft,
  Thermometer,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MapView from '../../components/common/MapView';

export default function DonorDonationDetailsPage() {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await donationService.getById(id);
        if (res.success && res.data) {
          setDonation(res.data);

          // If donation has an accepted request or assignment, fetch QR token
          if (res.data.acceptedRequestId) {
            try {
              const qrRes = await qrService.getTokens(res.data.acceptedRequestId);
              if (qrRes.success && qrRes.data) {
                setQrData(qrRes.data);
              }
            } catch {
              // Ignore if assignment not ready
            }
          }
        }
      } catch (err) {
        console.error('Error fetching donation details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading donation details..." size="lg" />;

  if (!donation) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-surface-border text-center">
        <h3 className="font-bold text-lg mb-2">Donation Not Found</h3>
        <Link to="/donor/donations" className="text-sm font-semibold text-forest-800 hover:underline">
          ← Back to my donations
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
        to="/donor/donations"
        className="inline-flex items-center text-xs font-semibold text-brandText-muted hover:text-brandText-primary"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Donations
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
                  {donation.foodCategory}
                </span>
                <h1 className="text-2xl font-black text-brandText-primary">{donation.foodName}</h1>
                <p className="text-xs text-brandText-muted mt-1">{donation.description}</p>
              </div>
              <StatusBadge status={donation.status} className="text-sm px-3 py-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-light border border-surface-border text-xs">
              <div>
                <span className="text-brandText-muted block">Quantity</span>
                <strong className="text-forest-900 font-bold text-base">
                  {donation.quantity} {donation.unit}
                </strong>
              </div>
              <div>
                <span className="text-brandText-muted block">Estimated Servings</span>
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
                <span>Storage condition: <strong className="capitalize">{donation.storageCondition}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-forest-600" />
                <span>Pickup address: {donation.address}, {donation.city}</span>
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

        {/* Right Column: QR Code Display for Volunteer Collection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto border border-forest-100">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-brandText-primary">Collection Verification QR</h3>
              <p className="text-xs text-brandText-muted mt-1">
                Show this single-use code to the dispatched volunteer upon handover.
              </p>
            </div>

            {qrData?.pickupToken ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-surface-border inline-block mx-auto">
                <QRCodeSVG
                  value={qrData.pickupToken}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
                <span className="block font-mono font-bold text-sm text-forest-900 mt-2">
                  {qrData.pickupToken}
                </span>
                <span className="text-[10px] text-slate-500 block">Single-use encrypted token</span>
              </div>
            ) : donation.status === 'AVAILABLE' ? (
              <div className="p-6 bg-slate-50 rounded-xl text-xs text-brandText-muted border border-surface-border">
                QR verification code will activate once a verified NGO request is accepted.
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-200 font-semibold">
                ✓ Food successfully collected and verified by volunteer!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
