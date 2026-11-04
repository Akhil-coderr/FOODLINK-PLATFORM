import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  icon: Icon = PackageOpen,
  actionText,
  actionLink,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-surface-border shadow-sm my-6">
      <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center text-forest-700 mb-4 ring-8 ring-forest-50/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-brandText-primary mb-1">{title}</h3>
      <p className="text-sm text-brandText-muted max-w-sm mb-6">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-forest-900 hover:bg-forest-800 transition"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-forest-900 hover:bg-forest-800 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
