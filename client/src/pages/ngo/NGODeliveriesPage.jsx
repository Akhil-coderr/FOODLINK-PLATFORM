import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../services/assignmentService';
import { QRCodeSVG } from 'qrcode.react';
import { Truck, MapPin, CheckCircle2, QrCode, Phone, Clock } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function NGODeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.getAll({
        status: 'PICKED_UP',
      });
      if (res.success && res.data?.assignments) {
        setDeliveries(res.data.assignments);
      } else {
        setDeliveries([]);
      }
    } catch (err) {
      console.error('Error fetching deliveries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Incoming Deliveries</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Surplus meals currently en route to your shelter facility.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Locating in-transit deliveries..." />
      ) : deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries currently en route"
          description="When a volunteer collects your accepted donation and starts transit, delivery verification codes will appear here."
          icon={Truck}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deliveries.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-lg">
                    {a.donationId?.foodName}
                  </span>
                  <StatusBadge status={a.status} />
                </div>

                <div className="space-y-1.5 text-xs text-brandText-muted">
                  <div>
                    Volunteer: <strong className="text-brandText-primary">{a.volunteerId?.name || 'Assigned Courier'}</strong>
                  </div>
                  {a.volunteerId?.phone && (
                    <div>
                      Phone: <strong className="text-brandText-primary">{a.volunteerId.phone}</strong>
                    </div>
                  )}
                  <div>
                    Origin: <strong className="text-brandText-primary">{a.donorId?.name} ({a.donorId?.city})</strong>
                  </div>
                  <div>
                    Collected at: {a.pickupTime ? new Date(a.pickupTime).toLocaleTimeString() : 'Recently'}
                  </div>
                </div>
              </div>

              {/* Delivery Handover QR Presentation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-surface-border text-center space-y-2">
                <span className="text-xs font-bold text-brandText-primary block">
                  Show to Volunteer to Confirm Safe Delivery
                </span>
                <div className="bg-white p-3 rounded-xl border border-surface-border inline-block mx-auto shadow-xs">
                  <QRCodeSVG
                    value={a.deliveryVerificationSecretPlain || 'DL-SECURE'}
                    size={140}
                    level="H"
                  />
                </div>
                <p className="font-mono font-bold text-xs text-forest-900 tracking-wider">
                  {a.deliveryVerificationSecretPlain}
                </p>
                <p className="text-[10px] text-slate-500">
                  Scanning this marks the batch delivered and releases volunteer reward points.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
