import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState('');

  const handleDownload = (reportType, filename) => {
    setDownloading(reportType);
    try {
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://foodlink-platform.onrender.com/api' : 'http://localhost:5000/api');
      const url = `${apiBase.replace(/\/+$/, '')}/admin/reports?type=${reportType}`;
      const token = localStorage.getItem('foodlink_token');

      // Use fetch with Authorization header to download CSV safely
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Download failed');
          return response.blob();
        })
        .then((blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          toast.success(`${filename} exported successfully!`);
        })
        .catch(() => {
          toast.error('Failed to export CSV report');
        })
        .finally(() => {
          setDownloading('');
        });
    } catch (err) {
      toast.error('Error initiating report export');
      setDownloading('');
    }
  };

  const reports = [
    {
      id: 'donations',
      title: 'Platform Donations Audit Report',
      description: 'Comprehensive CSV export of all published food batches, donors, quantities, statuses, and timestamps.',
      filename: 'foodlink_donations_audit.csv',
      icon: Database,
    },
    {
      id: 'impact',
      title: 'Verified Impact & CSR Report',
      description: 'Audited log of completed dropoffs, recipient shelters, kilograms diverted, meals saved, and carbon offsets.',
      filename: 'foodlink_verified_impact.csv',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-emerald-400" />
          Export Platform Reports
        </h1>
        <p className="text-sm font-semibold text-slate-300 mt-1">
          Generate and download verifiable CSV data reports for municipal, compliance, and corporate CSR reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          const isCurrent = downloading === r.id;

          return (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-base text-slate-950">{r.title}</h3>
                <p className="text-xs text-slate-950 font-bold leading-relaxed">{r.description}</p>
              </div>

              <button
                onClick={() => handleDownload(r.id, r.filename)}
                disabled={isCurrent}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                {isCurrent ? 'Generating CSV...' : `Download ${r.filename}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
