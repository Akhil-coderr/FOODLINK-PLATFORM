import React from 'react';

const STATUS_CONFIGS = {
  AVAILABLE: { bg: 'bg-emerald-100', text: 'text-emerald-950 font-black', border: 'border-emerald-400', label: 'Available' },
  REQUESTED: { bg: 'bg-amber-100', text: 'text-amber-950 font-black', border: 'border-amber-400', label: 'Requested' },
  ACCEPTED: { bg: 'bg-blue-100', text: 'text-blue-950 font-black', border: 'border-blue-400', label: 'Accepted' },
  VOLUNTEER_ASSIGNED: { bg: 'bg-indigo-100', text: 'text-indigo-950 font-black', border: 'border-indigo-400', label: 'Volunteer Assigned' },
  PICKUP_IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-950 font-black', border: 'border-purple-400', label: 'Pickup In Progress' },
  PICKED_UP: { bg: 'bg-cyan-100', text: 'text-cyan-950 font-black', border: 'border-cyan-400', label: 'Picked Up' },
  DELIVERED: { bg: 'bg-teal-100', text: 'text-teal-950 font-black', border: 'border-teal-400', label: 'Delivered' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-950 font-black', border: 'border-emerald-500', label: 'Completed' },
  REJECTED: { bg: 'bg-rose-100', text: 'text-rose-950 font-black', border: 'border-rose-400', label: 'Rejected' },
  CANCELLED: { bg: 'bg-slate-200', text: 'text-slate-950 font-black', border: 'border-slate-400', label: 'Cancelled' },
  EXPIRED: { bg: 'bg-red-100', text: 'text-red-950 font-black', border: 'border-red-400', label: 'Expired' },
  FLAGGED: { bg: 'bg-yellow-100', text: 'text-yellow-950 font-black', border: 'border-yellow-400', label: 'Flagged for Review' },
  // Reward redemption statuses
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-950 font-black', border: 'border-amber-400', label: 'Pending Review' },
  APPROVED: { bg: 'bg-blue-100', text: 'text-blue-950 font-black', border: 'border-blue-400', label: 'Approved' },
  FULFILLED: { bg: 'bg-emerald-100', text: 'text-emerald-950 font-black', border: 'border-emerald-400', label: 'Fulfilled' },
  // User/NGO statuses
  active: { bg: 'bg-emerald-100', text: 'text-emerald-950 font-black', border: 'border-emerald-500', label: 'Active' },
  inactive: { bg: 'bg-slate-200', text: 'text-slate-950 font-black', border: 'border-slate-400', label: 'Inactive' },
  suspended: { bg: 'bg-rose-100', text: 'text-rose-950 font-black', border: 'border-rose-500', label: 'Suspended' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-950 font-black', border: 'border-amber-500', label: 'Pending Review' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-950 font-black', border: 'border-emerald-500', label: 'Approved' },
};

export default function StatusBadge({ status, className = '' }) {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS[normalized] || {
    bg: 'bg-slate-200',
    text: 'text-slate-950 font-black',
    border: 'border-slate-400',
    label: status || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${config.bg} ${config.text} ${config.border} shadow-2xs ${className}`}
    >
      <span className="w-2 h-2 rounded-full mr-1.5 bg-current shrink-0"></span>
      {config.label}
    </span>
  );
}
