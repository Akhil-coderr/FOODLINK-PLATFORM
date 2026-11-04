import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onClose,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
                confirmVariant === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-950 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-800 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md transition flex items-center cursor-pointer btn-press ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-forest-900 hover:bg-forest-800'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
