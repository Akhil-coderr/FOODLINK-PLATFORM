/**
 * Unit tests for FoodLink Global Notification Queue and Deduplication System
 */

class NotificationQueueManager {
  constructor() {
    this.queue = [];
    this.currentNotification = null;
    this.recentEvents = new Map();
    this.listeners = new Set();
    this.timer = null;
    this.exitTimer = null;
    this.paused = false;
    this.displayStartTime = 0;
    this.remainingDuration = 0;
    this.defaultDuration = 3500;
    this.idCounter = 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  getSnapshot() {
    return {
      current: this.currentNotification,
      queueCount: this.queue.length,
    };
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

    const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
    const eventKey = eventId ? `id:${eventId}` : `sig:${type}:${stringMessage.trim().toLowerCase()}`;

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

    this.timer = setTimeout(() => {
      this.dismiss(this.currentNotification?.id);
    }, this.currentNotification.duration);
  }

  dismiss(id, immediate = false) {
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

    this.currentNotification = {
      ...this.currentNotification,
      isExiting: true,
    };
    this.notify();

    this.exitTimer = setTimeout(() => {
      this.currentNotification = null;
      this.notify();
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
}

describe('FoodLink Global Notification System Tests', () => {
  let manager;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = new NotificationQueueManager();
  });

  afterEach(() => {
    manager.dismissAll();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('Invariant: Exactly ONE notification is visible at any given time', () => {
    manager.enqueue({ type: 'success', message: 'First Notification' });
    manager.enqueue({ type: 'error', message: 'Second Notification' });
    manager.enqueue({ type: 'info', message: 'Third Notification' });

    const snapshot = manager.getSnapshot();
    // Only one current notification is active
    expect(snapshot.current).not.toBeNull();
    expect(snapshot.current.message).toBe('First Notification');
    // Remaining items are held in sequential queue
    expect(snapshot.queueCount).toBe(2);
  });

  test('Sequential processing: notifications display one after another when previous finishes', () => {
    manager.enqueue({ type: 'success', message: 'Notice 1', duration: 1000 });
    manager.enqueue({ type: 'success', message: 'Notice 2', duration: 1000 });

    expect(manager.getSnapshot().current.message).toBe('Notice 1');
    expect(manager.getSnapshot().queueCount).toBe(1);

    // Fast-forward through duration + exit transition
    jest.advanceTimersByTime(1000);
    expect(manager.getSnapshot().current.isExiting).toBe(true);

    jest.advanceTimersByTime(300);
    // Notice 2 is now promoted to current
    expect(manager.getSnapshot().current.message).toBe('Notice 2');
    expect(manager.getSnapshot().queueCount).toBe(0);
  });

  test('Deduplication: Identical messages triggered rapidly are ignored', () => {
    manager.enqueue({ type: 'success', message: 'Welcome back, Anand!' });
    // Simulate React StrictMode double effect or rapid duplicate dispatch
    manager.enqueue({ type: 'success', message: 'Welcome back, Anand!' });

    const snapshot = manager.getSnapshot();
    expect(snapshot.current.message).toBe('Welcome back, Anand!');
    // No duplicate item queued!
    expect(snapshot.queueCount).toBe(0);
  });

  test('Deduplication: Explicit eventId suppresses duplicate event dispatches', () => {
    manager.enqueue({ eventId: 'auth-welcome', type: 'success', message: 'Welcome back, John!' });
    manager.enqueue({ eventId: 'auth-welcome', type: 'success', message: 'Welcome back, John!' });

    expect(manager.getSnapshot().queueCount).toBe(0);
  });

  test('Legitimate distinct notifications are preserved and not suppressed', () => {
    manager.enqueue({ type: 'success', message: 'Donation Batch #1 published' });
    manager.enqueue({ type: 'success', message: 'Donation Batch #2 published' });

    expect(manager.getSnapshot().current.message).toBe('Donation Batch #1 published');
    expect(manager.getSnapshot().queueCount).toBe(1);
  });

  test('Immediate manual dismissal triggers smooth transition to next queued item', () => {
    manager.enqueue({ type: 'info', message: 'Pending Request' });
    manager.enqueue({ type: 'success', message: 'Delivery Completed' });

    const currentId = manager.getSnapshot().current.id;
    manager.dismiss(currentId, true); // Immediate manual close

    expect(manager.getSnapshot().current.message).toBe('Delivery Completed');
    expect(manager.getSnapshot().queueCount).toBe(0);
  });

  test('Priority error notification displaces non-priority notifications', () => {
    manager.enqueue({ type: 'info', message: 'Background sync in progress' });
    manager.enqueue({ type: 'error', message: 'Critical Security Warning', priority: true });

    // The current item begins exiting immediately
    expect(manager.getSnapshot().current.isExiting).toBe(true);

    jest.advanceTimersByTime(300);
    expect(manager.getSnapshot().current.message).toBe('Critical Security Warning');
  });
});
