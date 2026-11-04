import React, { useRef, useState } from 'react';
import { X, Download, ShieldCheck, Award, Calendar, Hash, CheckCircle2, HeartHandshake } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CertificateModal({ certificate, isOpen, onClose }) {
  const [downloadError, setDownloadError] = useState('');

  if (!isOpen || !certificate) return null;

  const certificateRef = useRef(null);

  const handlePrint = () => {
    setDownloadError('');
    const printContent = certificateRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setDownloadError('Please allow popups or use your browser\'s download/print option to save your certificate as a PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FoodLink Certificate - ${certificate.certificateId}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 24px;
              background-color: #ffffff;
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .cert-box {
              border: 12px double #14532d;
              padding: 36px 48px;
              background: radial-gradient(circle at center, #ffffff 60%, #f0fdf4 100%);
              border-radius: 16px;
              box-sizing: border-box;
              min-height: 90vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              position: relative;
            }
            .cert-title {
              font-family: 'Cinzel', serif;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: 2px;
              color: #14532d;
              margin: 12px 0 6px 0;
              text-transform: uppercase;
            }
            .cert-subtitle {
              font-size: 13px;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: #15803d;
              font-weight: 700;
              margin-bottom: 24px;
            }
            .recipient-name {
              font-family: 'Cinzel', serif;
              font-size: 38px;
              font-weight: 900;
              color: #020617;
              border-bottom: 2px solid #bbf7d0;
              display: inline-block;
              padding: 0 40px 8px 40px;
              margin: 16px 0;
            }
            .message {
              font-size: 15px;
              line-height: 1.6;
              color: #334155;
              max-width: 750px;
              margin: 0 auto 24px auto;
            }
            .stats-bar {
              display: flex;
              justify-content: center;
              gap: 48px;
              margin: 20px 0;
            }
            .stat-item {
              text-align: center;
            }
            .stat-val {
              font-size: 26px;
              font-weight: 800;
              color: #14532d;
            }
            .stat-lbl {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
              letter-spacing: 1px;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .cert-meta {
              text-align: left;
              font-size: 11px;
              color: #64748b;
              line-height: 1.6;
            }
            .sig-block {
              text-align: right;
            }
            .sig-line {
              font-family: 'Cinzel', serif;
              font-weight: 700;
              color: #14532d;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div>
              <div style="font-size: 22px; font-weight: 900; color: #14532d; letter-spacing: 2px;">🌱 FOODLINK PLATFORM</div>
              <div class="cert-title">Certificate of Volunteer Impact</div>
              <div class="cert-subtitle">Community Food Recovery & Hunger Relief</div>
            </div>

            <div>
              <div style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">This certificate is proudly awarded to</div>
              <div class="recipient-name">${certificate.recipientName}</div>
              <div class="message">${certificate.appreciationMessage || 'In grateful recognition of exemplary volunteer service, food salvage logistics, and active dedication to eliminating hunger across community shelters.'}</div>

              <div class="stats-bar">
                <div class="stat-item">
                  <div class="stat-val">${certificate.completedDeliveries || 0}</div>
                  <div class="stat-lbl">Verified Deliveries</div>
                </div>
                <div class="stat-item">
                  <div class="stat-val">${certificate.estimatedMealsSaved || 0}</div>
                  <div class="stat-lbl">Meals Rescued</div>
                </div>
                <div class="stat-item">
                  <div class="stat-val">100 PTS</div>
                  <div class="stat-lbl">Karma Dedicated</div>
                </div>
              </div>
            </div>

            <div class="footer-row">
              <div class="cert-meta">
                <div><strong>Certificate ID:</strong> ${certificate.certificateId}</div>
                <div><strong>Date of Issuance:</strong> ${new Date(certificate.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                <div><strong>Status:</strong> Digitally Verified & Sealed</div>
              </div>
              <div class="sig-block">
                <div style="height: 30px; font-size: 18px; color: #14532d; font-weight: 900;">FoodLink Executive Board</div>
                <div class="sig-line">Director of Community Logistics</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Authenticity Hash: ${(certificate.verificationHash || '').slice(0, 20)}...</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-forest-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Digital Achievement Certificate</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {downloadError && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium">
            {downloadError}
          </div>
        )}

        {/* Certificate Display Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div
            ref={certificateRef}
            className="w-full max-w-3xl bg-white p-8 sm:p-12 rounded-2xl border-8 border-double border-forest-900 shadow-xl flex flex-col justify-between text-center relative"
            style={{
              background: 'radial-gradient(circle at center, #ffffff 60%, #f0fdf4 100%)',
            }}
          >
            {/* Header Badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-950 font-black text-xs uppercase tracking-wider mb-2 border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-forest-900" /> Verified Volunteer Milestone
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-wider uppercase font-serif mt-1">
                Certificate of Volunteer Impact
              </h2>
              <p className="text-xs font-bold text-forest-800 tracking-widest uppercase mt-0.5">
                FoodLink Food Redistribution & Rescue Network
              </p>
            </div>

            {/* Recipient Body */}
            <div className="my-8 space-y-4">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                This official digital certificate is proudly presented to
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-serif border-b-2 border-emerald-300 inline-block px-8 pb-2">
                {certificate.recipientName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 max-w-xl mx-auto leading-relaxed pt-2">
                {certificate.appreciationMessage ||
                  'In grateful recognition of exemplary volunteer service, food salvage logistics, and active dedication to eliminating hunger across community shelters.'}
              </p>

              {/* Verified Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4 bg-white/80 p-3 rounded-xl border border-emerald-200">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-forest-950">
                    {certificate.completedDeliveries || 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-900 tracking-wider">
                    Deliveries
                  </div>
                </div>
                <div className="text-center border-x border-slate-200">
                  <div className="text-xl sm:text-2xl font-black text-forest-950">
                    {certificate.estimatedMealsSaved || 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-900 tracking-wider">
                    Meals Rescued
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-forest-950">100</div>
                  <div className="text-[10px] font-bold uppercase text-slate-900 tracking-wider">
                    Karma Spent
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Metadata & Signature */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-left text-xs gap-4">
              <div className="space-y-1 text-slate-900 font-semibold">
                <div className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-forest-900" />
                  <span>Certificate ID:</span>
                  <strong className="text-slate-950 font-mono font-black">{certificate.certificateId}</strong>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-forest-900" />
                  <span>Issued:</span>
                  <strong className="text-slate-950">
                    {new Date(certificate.issueDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              </div>

              {/* QR Verification Seal */}
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-xs">
                  <QRCodeSVG
                    value={`${window.location.origin}/api/rewards/certificates/${certificate.certificateId}`}
                    size={48}
                    level="M"
                  />
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-forest-950">Executive Board Seal</div>
                  <div className="text-[10px] font-bold text-slate-900">FoodLink Community Trust</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-900 font-bold">
            Verified Certificate ID: <span className="font-mono text-forest-950">{certificate.certificateId}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-950 hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-black shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
