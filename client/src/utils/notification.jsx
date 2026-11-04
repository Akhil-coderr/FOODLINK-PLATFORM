import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Single-Popup Global Notification Manager for FoodLink.
 *
 * Invariant: At most ONE popup notification is visible anywhere on screen at any given time.
 * If multiple notifications arrive, they are queued and displayed sequentially.
 * Duplicate events within a deduplication window are automatically suppressed.
 */
class NotificationQueueManager {
  constructor() {
    this.queue = [];
    this.currentNotification = null;
    this.recentEvents = new Map(); // eventKey -> timestamp
    this.listeners = new Set();
    this.timer = null;
    this.exitTimer = null;
    this.paused = false;
    this.displayStartTime = 0;
    this.remainingDuration = 0;
    this.defaultDuration = 3500;
    this.idCounter = 0;
    // Cached snapshot to guarantee immutable reference stability across renders
    this.snapshot = { current: null, queueCount: 0 };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _updateSnapshot() {
    this.snapshot = {
      current: this.currentNotification,
      queueCount: this.queue.length,
    };
  }

  notify() {
    this._updateSnapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(this.snapshot);
      } catch (e) {
        console.error('Error notifying notification listener', e);
      }
    });
  }

  getSnapshot() {
    return this.snapshot;
  }

  _cleanupOldEvents() {
    const now = Date.now();
    for (const [key, timestamp] of this.recentEvents.entries()) {
      if (now - timestamp > 10000) {
        this.recentEvents.delete(key);
      }
    }
  }

  enqueue(options) {
    this._cleanupOldEvents();

    const now = Date.now();
    const type = options.type || 'info';
    const message = options.message || '';
    const eventId = options.eventId || options.id;
    const dedupWindow = options.dedupWindow || 1800;

    // Deduplication signature
    const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
    const eventKey = eventId ? `id:${eventId}` : `sig:${type}:${stringMessage.trim().toLowerCase()}`;

    // Suppress duplicate events within window
    const lastSeen = this.recentEvents.get(eventKey);
    if (lastSeen && now - lastSeen < dedupWindow) {
      return eventId || eventKey;
    }
    this.recentEvents.set(eventKey, now);

    this.idCounter += 1;
    const notificationItem = {
      id: eventId || `notif_${this.idCounter}_${now}`,
      eventId,
      type,
      title: options.title || null,
      message,
      duration: options.duration || this.defaultDuration,
      priority: Boolean(options.priority),
      createdAt: now,
      icon: options.icon || null,
    };

    if (notificationItem.priority && this.currentNotification) {
      // Priority items dismiss current notification early and display next
      this.queue.unshift(notificationItem);
      this.dismiss(this.currentNotification.id);
    } else {
      this.queue.push(notificationItem);
      if (!this.currentNotification) {
        this.processNext();
      } else {
        this.notify();
      }
    }

    return notificationItem.id;
  }

  processNext() {
    if (this.currentNotification) return;
    if (this.queue.length === 0) {
      this.notify();
      return;
    }

    const next = this.queue.shift();
    this.currentNotification = {
      ...next,
      isExiting: false,
    };
    this.paused = false;
    this.displayStartTime = Date.now();
    this.remainingDuration = this.currentNotification.duration;

    this.notify();

    // Start auto-dismiss countdown
    this.timer = setTimeout(() => {
      this.dismiss(this.currentNotification?.id);
    }, this.currentNotification.duration);
  }

  dismiss(id, immediate = false) {
    // If specific id is in queue, remove it from queue
    if (id) {
      this.queue = this.queue.filter((item) => item.id !== id && item.eventId !== id);
    }

    if (!this.currentNotification) {
      this.notify();
      return;
    }

    if (id && this.currentNotification.id !== id && this.currentNotification.eventId !== id) {
      this.notify();
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.exitTimer) {
      clearTimeout(this.exitTimer);
      this.exitTimer = null;
    }

    if (immediate) {
      this.currentNotification = null;
      this.notify();
      this.processNext();
      return;
    }

    // Trigger smooth exit animation
    this.currentNotification = {
      ...this.currentNotification,
      isExiting: true,
    };
    this.notify();

    this.exitTimer = setTimeout(() => {
      this.currentNotification = null;
      this.notify();
      // Brief pause between popups for smooth visual transition
      setTimeout(() => {
        this.processNext();
      }, 50);
    }, 220);
  }

  dismissAll() {
    this.queue = [];
    if (this.timer) clearTimeout(this.timer);
    if (this.exitTimer) clearTimeout(this.exitTimer);
    this.currentNotification = null;
    this.notify();
  }

  pause() {
    if (!this.currentNotification || this.paused || this.currentNotification.isExiting) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const elapsed = Date.now() - this.displayStartTime;
    this.remainingDuration = Math.max(800, this.currentNotification.duration - elapsed);
    this.paused = true;
  }

  resume() {
    if (!this.currentNotification || !this.paused || this.currentNotification.isExiting) return;
    this.paused = false;
    this.displayStartTime = Date.now();
    this.timer = setTimeout(() => {
      this.dismiss(this.currentNotification?.id);
    }, this.remainingDuration);
  }
}

export const notificationManager = new NotificationQueueManager();

// Centralized Notification API
export const showSuccess = (message, options = {}) => {
  return notificationManager.enqueue({
    ...options,
    type: 'success',
    message,
  });
};

export const showError = (message, options = {}) => {
  return notificationManager.enqueue({
    ...options,
    type: 'error',
    message,
  });
};

export const showWarning = (message, options = {}) => {
  return notificationManager.enqueue({
    ...options,
    type: 'warning',
    message,
  });
};

export const showInfo = (message, options = {}) => {
  return notificationManager.enqueue({
    ...options,
    type: 'info',
    message,
  });
};

export const dismissNotification = (id) => {
  notificationManager.dismiss(id);
};

export const clearNotificationQueue = () => {
  notificationManager.dismissAll();
};

// Resilient React hook for observing current popup state
export const useNotification = () => {
  const [state, setState] = useState(() => notificationManager.getSnapshot());

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe((snapshot) => {
      setState(snapshot);
    });
    return unsubscribe;
  }, []);

  return state;
};

// Backward-compatible toast interface matching react-hot-toast signatures
export const toast = (message, options = {}) => {
  return showInfo(message, options);
};

toast.success = (message, options = {}) => showSuccess(message, options);
toast.error = (message, options = {}) => showError(message, options);
toast.warning = (message, options = {}) => showWarning(message, options);
toast.info = (message, options = {}) => showInfo(message, options);
toast.dismiss = (id) => notificationManager.dismiss(id);
toast.remove = (id) => notificationManager.dismiss(id, true);
toast.loading = (message, options = {}) => showInfo(message, { ...options, duration: 8000 });

toast.promise = async (promise, { loading, success, error }, options = {}) => {
  const loadingId = loading ? toast.loading(loading, options) : null;
  try {
    const res = await (typeof promise === 'function' ? promise() : promise);
    if (loadingId) toast.dismiss(loadingId);
    const successMsg = typeof success === 'function' ? success(res) : success;
    if (successMsg) toast.success(successMsg, options);
    return res;
  } catch (err) {
    if (loadingId) toast.dismiss(loadingId);
    const errorMsg = typeof error === 'function' ? error(err) : error || err?.message || 'Action failed';
    if (errorMsg) toast.error(errorMsg, options);
    throw err;
  }
};

export const useToast = () => ({
  toast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  dismiss: dismissNotification,
});

/**
 * Floating Global Notification Pill (Toaster)
 * Redesigned to provide a modern, SaaS-grade authentication and alert experience.
 * Features:
 * - Floating fixed placement (top-5 right-5) without pushing document layout
 * - Soft backgrounds with clean contrast and rounded-2xl geometry
 * - Dedicated status badges with clear heading and short description
 * - Smooth slide-in/fade-out animations and manual dismissal
 */
export const GlobalNotificationContainer = () => {
  const { current, queueCount } = useNotification();

  if (!current) {
    return null;
  }

  const { id, type, title, message, isExiting, icon } = current;

  // Infer high-level category heading if explicit title wasn't passed
  const getDerivedTitle = () => {
    if (title) return title;
    const msgLower = (typeof message === 'string' ? message : '').toLowerCase();
    if (msgLower.includes('welcome back') || msgLower.includes('welcome to admin')) {
      return 'Signed In Successfully';
    }
    if (msgLower.includes('logged out') || msgLower.includes('logout')) {
      return 'Session Concluded';
    }
    if (msgLower.includes('registration successful') || msgLower.includes('registered')) {
      return 'Account Verified';
    }
    if (msgLower.includes('invalid') || msgLower.includes('fail') || msgLower.includes('error')) {
      return 'Authentication Notice';
    }
    if (type === 'success') return 'Action Successful';
    if (type === 'error') return 'Attention Required';
    if (type === 'warning') return 'Notice';
    return 'Information';
  };

  const themeStyles = {
    success: {
      wrapper: 'bg-[#059669] border-2 border-[#34d399] text-white shadow-2xl shadow-black/50',
      inlineBg: '#059669',
      inlineBorder: '#34d399',
      inlineText: '#ffffff',
      iconContainer: 'bg-white text-[#059669] shadow-md',
      defaultIcon: <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />,
      heading: 'text-white font-black text-sm tracking-tight',
      description: 'text-emerald-50 font-bold text-xs leading-relaxed',
      accentGlow: 'ring-4 ring-emerald-400/30',
      badge: 'bg-emerald-900 text-white border border-emerald-400/40',
      closeBtn: 'text-white hover:bg-white/20',
    },
    error: {
      wrapper: 'bg-[#dc2626] border-2 border-[#f87171] text-white shadow-2xl shadow-black/50',
      inlineBg: '#dc2626',
      inlineBorder: '#f87171',
      inlineText: '#ffffff',
      iconContainer: 'bg-white text-[#dc2626] shadow-md',
      defaultIcon: <AlertCircle className="w-5 h-5 stroke-[2.5]" />,
      heading: 'text-white font-black text-sm tracking-tight',
      description: 'text-rose-50 font-bold text-xs leading-relaxed',
      accentGlow: 'ring-4 ring-rose-400/30',
      badge: 'bg-rose-900 text-white border border-rose-400/40',
      closeBtn: 'text-white hover:bg-white/20',
    },
    warning: {
      wrapper: 'bg-[#d97706] border-2 border-[#fcd34d] text-white shadow-2xl shadow-black/50',
      inlineBg: '#d97706',
      inlineBorder: '#fcd34d',
      inlineText: '#ffffff',
      iconContainer: 'bg-white text-[#d97706] shadow-md',
      defaultIcon: <AlertTriangle className="w-5 h-5 stroke-[2.5]" />,
      heading: 'text-white font-black text-sm tracking-tight',
      description: 'text-amber-50 font-bold text-xs leading-relaxed',
      accentGlow: 'ring-4 ring-amber-400/30',
      badge: 'bg-amber-900 text-white border border-amber-300/40',
      closeBtn: 'text-white hover:bg-white/20',
    },
    info: {
      wrapper: 'bg-[#2563eb] border-2 border-[#60a5fa] text-white shadow-2xl shadow-blue-950/40',
      inlineBg: '#2563eb',
      inlineBorder: '#60a5fa',
      inlineText: '#ffffff',
      iconContainer: 'bg-white text-[#2563eb] shadow-md',
      defaultIcon: <Info className="w-5 h-5 stroke-[2.5]" />,
      heading: 'text-white font-black text-sm tracking-tight',
      description: 'text-blue-50 font-bold text-xs leading-relaxed',
      accentGlow: 'ring-4 ring-blue-400/30',
      badge: 'bg-blue-900 text-white border border-blue-400/40',
      closeBtn: 'text-white hover:bg-white/20',
    },
  };

  const theme = themeStyles[type] || themeStyles.info;
  const headingText = getDerivedTitle();

  return (
    <aside
      className="fixed top-5 right-5 z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="System Notifications"
    >
      <div
        onMouseEnter={() => notificationManager.pause()}
        onMouseLeave={() => notificationManager.resume()}
        style={{
          backgroundColor: theme.inlineBg,
          borderColor: theme.inlineBorder,
          color: theme.inlineText,
        }}
        className={`pointer-events-auto relative w-full rounded-2xl border-2 ${theme.wrapper} ${theme.accentGlow} p-4 shadow-2xl flex items-start gap-3.5 transition-all duration-250 ease-out ${
          isExiting
            ? 'opacity-0 -translate-y-2 scale-95'
            : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-3'
        }`}
      >
        {/* Vibrant status icon badge */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${theme.iconContainer}`}
        >
          {icon ? (
            typeof icon === 'string' ? (
              <span className="text-sm font-black">{icon}</span>
            ) : (
              icon
            )
          ) : (
            theme.defaultIcon
          )}
        </div>

        {/* Text Container: Clear heading + short readable description */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              style={{ color: '#ffffff' }}
              className={`text-sm font-black tracking-tight ${theme.heading}`}
            >
              {headingText}
            </h4>
            {queueCount > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${theme.badge}`}>
                +{queueCount} next
              </span>
            )}
          </div>
          <div
            style={{ color: '#ffffff', opacity: 0.95 }}
            className={`text-xs ${theme.description} break-words mt-1 leading-relaxed`}
          >
            {message}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => notificationManager.dismiss(id, true)}
          className={`p-1.5 rounded-lg ${theme.closeBtn} transition flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40`}
          aria-label="Dismiss notification"
          title="Dismiss notification"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </aside>
  );
};

// Aliased as Toaster so existing imports work out of the box
export const Toaster = GlobalNotificationContainer;

export default toast;
