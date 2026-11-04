import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, KeyRound, AlertCircle } from 'lucide-react';

export default function QRScanner({
  onScanSuccess,
  onScanFailure,
  title = 'Scan QR Code',
  description = 'Align the QR code within the frame to verify collection or delivery.',
}) {
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const scannerRef = useRef(null);

  useEffect(() => {
    let scanner = null;
    if (activeTab === 'camera') {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            if (onScanSuccess) {
              onScanSuccess(decodedText);
            }
          },
          (error) => {
            if (onScanFailure) {
              onScanFailure(error);
            }
          }
        );
        scannerRef.current = scanner;
      } catch (err) {
        console.error('Failed to initialize QR scanner:', err);
        setCameraError('Camera access unavailable. Please use the manual code entry option.');
        setActiveTab('manual');
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [activeTab]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    if (onScanSuccess) {
      onScanSuccess(manualCode.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-brandText-primary">{title}</h3>
        <p className="text-sm text-brandText-muted mt-1">{description}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border mb-6">
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center border-b-2 transition ${
            activeTab === 'camera'
              ? 'border-forest-900 text-forest-900'
              : 'border-transparent text-brandText-muted hover:text-brandText-primary'
          }`}
        >
          <Camera className="w-4 h-4 mr-2" />
          Camera Scanner
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center border-b-2 transition ${
            activeTab === 'manual'
              ? 'border-forest-900 text-forest-900'
              : 'border-transparent text-brandText-muted hover:text-brandText-primary'
          }`}
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Enter Code Manually
        </button>
      </div>

      {cameraError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {activeTab === 'camera' ? (
        <div className="flex flex-col items-center">
          <div
            id="qr-reader-container"
            className="w-full max-w-xs overflow-hidden rounded-xl border border-surface-border bg-slate-50"
          ></div>
          <p className="text-xs text-brandText-muted mt-4 text-center">
            Ensure proper lighting and hold the device steady.
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brandText-primary mb-1">
              Verification Code / Secret
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. PK-8F92A1B7 or DL-3C5E7D29"
              className="w-full px-4 py-2 border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 font-mono uppercase"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-forest-900 hover:bg-forest-800 text-white font-medium rounded-lg shadow-sm transition"
          >
            Verify Code
          </button>
          <p className="text-xs text-brandText-muted text-center">
            Verification tokens are generated single-use per pickup and delivery.
          </p>
        </form>
      )}
    </div>
  );
}
