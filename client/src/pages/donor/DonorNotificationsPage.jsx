import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/impactService';
import { Bell, CheckCheck, Trash2, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function DonorNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      if (res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All marked as read');
      fetchNotifs();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Notifications</h1>
          <p className="text-xs text-brandText-muted mt-0.5">Stay updated on claims, collections, and expiry alerts.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1 text-forest-700" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="You have no notifications at this time."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                n.isRead
                  ? 'bg-white border-surface-border'
                  : 'bg-forest-50/50 border-forest-200/80 shadow-xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-brandText-primary">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-forest-600 inline-block"></span>
                  )}
                </div>
                <p className="text-xs text-brandText-muted">{n.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleDelete(n._id)}
                className="text-slate-400 hover:text-rose-500 p-1"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
