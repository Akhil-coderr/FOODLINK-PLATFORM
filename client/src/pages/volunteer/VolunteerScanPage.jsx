import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentService, qrService } from '../../services/assignmentService';
import QRScanner from '../../components/common/QRScanner';
import { QrCode, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '../../utils/notification';

export default function VolunteerScanPage() {
  const navigate = useNavigate();
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [verificationType, setVerificationType] = useState('pickup'); // 'pickup' | 'delivery'
  const [verifying, setVerifying] = useState(false);
  const isProcessingScanRef = useRef(false);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await assignmentService.getAll();
        if (res.success && res.data?.assignments) {
          const list = res.data.assignments.filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
          setActiveAssignments(list);
          if (list.length > 0) {
            setSelectedAssignmentId(list[0]._id);
            if (list[0].status === 'PICKED_UP') {
              setVerificationType('delivery');
            } else {
              setVerificationType('pickup');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching assignments', err);
      }
    };

    fetchActive();
  }, []);

  const handleScanSuccess = async (decodedText) => {
    if (verifying || isProcessingScanRef.current) return;
    if (!selectedAssignmentId) {
      showError('Please select an assignment first', { eventId: 'scan-no-assignment' });
      return;
    }

    isProcessingScanRef.current = true;
    setVerifying(true);
    try {
      if (verificationType === 'pickup') {
        const res = await qrService.verifyPickup({
          assignmentId: selectedAssignmentId,
          code: decodedText,
        });

        if (res.success) {
          showSuccess('Food collection verified from donor!', { eventId: `pickup-verified-${selectedAssignmentId}` });
          navigate('/volunteer/assignments');
        } else {
          showError(res.message || 'Verification failed', { eventId: 'pickup-failed' });
        }
      } else {
        const res = await qrService.verifyDelivery({
          assignmentId: selectedAssignmentId,
          code: decodedText,
        });

        if (res.success) {
          showSuccess('Delivery verified! +20 volunteer karma points awarded!', { eventId: `delivery-verified-${selectedAssignmentId}` });
          navigate('/volunteer/achievements');
        } else {
          showError(res.message || 'Verification failed', { eventId: 'delivery-failed' });
        }
      }
    } catch (err) {
      if (!err._handled) {
        showError(err.message || 'Invalid QR code or token', { eventId: 'scan-err' });
      }
    } finally {
      setVerifying(false);
      setTimeout(() => {
        isProcessingScanRef.current = false;
      }, 1000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-brandText-primary tracking-tight">QR Code Verification</h1>
        <p className="text-xs text-brandText-muted mt-0.5">
          Scan the donor's collection token or NGO's delivery token to verify handoff.
        </p>
      </div>

      {activeAssignments.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Select Active Assignment *
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                const match = activeAssignments.find((a) => a._id === e.target.value);
                if (match?.status === 'PICKED_UP') setVerificationType('delivery');
                else setVerificationType('pickup');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-surface-border bg-white"
            >
              {activeAssignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.donationId?.foodName} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setVerificationType('pickup')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                verificationType === 'pickup'
                  ? 'bg-forest-900 text-white border-forest-900'
                  : 'bg-white text-brandText-muted border-surface-border'
              }`}
            >
              Step 1: Verify Pickup
            </button>
            <button
              type="button"
              onClick={() => setVerificationType('delivery')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                verificationType === 'delivery'
                  ? 'bg-forest-900 text-white border-forest-900'
                  : 'bg-white text-brandText-muted border-surface-border'
              }`}
            >
              Step 2: Verify Delivery
            </button>
          </div>
        </div>
      )}

      {/* QR Scanner Component */}
      <QRScanner
        title={
          verificationType === 'pickup'
            ? "Scan Donor's Pickup Token"
            : "Scan NGO's Delivery Token"
        }
        description={
          verificationType === 'pickup'
            ? 'Align the donor kitchen collection QR code or enter the secret code manually.'
            : 'Align the NGO shelter delivery confirmation QR code to complete the task.'
        }
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
