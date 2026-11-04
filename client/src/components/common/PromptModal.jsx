import React, { useEffect, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

/**
 * In-page replacement for window.prompt().
 * Collects a short text value (e.g. a rejection reason) inside a modal dialog
 * instead of using a native browser popup.
 */
export default function PromptModal({
  isOpen,
  title = 'Provide Details',
  label = 'Reason',
  description = '',
  placeholder = 'Type your response here...',
  defaultValue = '',
  confirmText = 'Submit',
  cancelText = 'Cancel',
  required = false,
  isLoading = false,
  onConfirm,
  onClose,
}) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (required && !trimmed) {
      setError(`${label} is required.`);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-forest-100 text-forest-900 shadow-xs">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-950 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {description && (
          <p className="text-sm font-semibold text-slate-800 mb-3 leading-relaxed">{description}</p>
        )}

        <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
          {label}
          {required && <span className="text-rose-600"> *</span>}
        </label>
        <textarea
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError('');
          }}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2.5 text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-600 resize-y"
          autoFocus
        />
        {error && <p className="mt-1.5 text-xs font-bold text-rose-600">{error}</p>}

        <div className="flex justify-end space-x-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 text-xs font-black text-white bg-forest-900 hover:bg-forest-800 rounded-xl shadow-md transition cursor-pointer btn-press"
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </form>
    </div>
  );
}
