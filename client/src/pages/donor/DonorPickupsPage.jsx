import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../services/assignmentService';
import { QRCodeSVG } from 'qrcode.react';
import { Truck, MapPin, Clock, QrCode, Phone, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function DonorPickupsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await assignmentService.getAll({
          status: 'PICKUP_IN_PROGRESS',
        });
        if (res.success && res.data?.assignments) {
          setAssignments(res.data.assignments);
        } else {
          setAssignments([]);
        }
      } catch (err) {
        console.error('Error fetching pickups', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Active Pickup Tracking</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Monitor volunteer arrivals and present QR code upon physical food collection.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Locating active pickups..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No pickups currently in progress"
          description="When an assigned volunteer starts transit to your kitchen, live pickup tracking and collection codes appear here."
          icon={Truck}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-lg">
                    {a.donationId?.foodName}
                  </span>
                  <StatusBadge status={a.status} />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-brandText-muted">
                    <Truck className="w-4 h-4 mr-2 text-forest-600" />
                    <span>Volunteer: <strong className="text-brandText-primary">{a.volunteerId?.name || 'Assigned Driver'}</strong></span>
                  </div>
                  {a.volunteerId?.phone && (
                    <div className="flex items-center text-brandText-muted">
                      <Phone className="w-4 h-4 mr-2 text-forest-600" />
                      <span>Phone: <strong className="text-brandText-primary">{a.volunteerId.phone}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center text-brandText-muted">
                    <MapPin className="w-4 h-4 mr-2 text-forest-600" />
                    <span>Destination: <strong className="text-brandText-primary">{a.ngoId?.name} ({a.ngoId?.city})</strong></span>
                  </div>
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-surface-border text-center space-y-2">
                <span className="text-xs font-bold text-brandText-primary block">
                  Show to Volunteer to Verify Collection
                </span>
                <div className="bg-white p-3 rounded-xl border border-surface-border inline-block mx-auto shadow-xs">
                  <QRCodeSVG
                    value={a.pickupVerificationSecretPlain || 'PK-SECURE'}
                    size={140}
                    level="H"
                  />
                </div>
                <p className="font-mono font-bold text-xs text-forest-900 tracking-wider">
                  {a.pickupVerificationSecretPlain}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
