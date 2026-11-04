import React, { useState, useEffect } from 'react';
import { Bell, Send, AlertTriangle, CheckCircle, Info, Flame, History, Users, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const [targetRole, setTargetRole] = useState('all');
  const [priority, setPriority] = useState('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchBroadcasts = async () => {
    setLoadingHistory(true);
    try {
      const res = await adminService.getBroadcasts();
      if (res.success && res.data?.broadcasts) {
        setBroadcasts(res.data.broadcasts);
      }
    } catch (err) {
      console.error('Failed to load broadcasts history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter notification headline and message content');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminService.sendBroadcast({
        title: title.trim(),
        message: message.trim(),
        targetRole,
        priority,
      });

      if (res.success) {
        toast.success(res.message || `Broadcast successfully dispatched!`);
        setTitle('');
        setMessage('');
        fetchBroadcasts();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch broadcast notification');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Flame className="w-3 h-3" /> Urgent Alert
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Milestone
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Info className="w-3 h-3" /> Advisory
          </span>
        );
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'donor':
        return <span className="text-amber-400 font-semibold uppercase text-[10px]">Donors</span>;
      case 'ngo':
        return <span className="text-emerald-400 font-semibold uppercase text-[10px]">NGOs</span>;
      case 'volunteer':
        return <span className="text-cyan-400 font-semibold uppercase text-[10px]">Volunteers</span>;
      default:
        return <span className="text-purple-400 font-semibold uppercase text-[10px]">All Users</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Bell className="w-7 h-7 text-emerald-400" />
          Broadcast Platform Notifications
        </h1>
        <p className="text-sm font-semibold text-slate-200 mt-1">
          Transmit real-time announcements, emergency advisories, and system notifications to active stakeholders.
        </p>
      </div>

      {/* Broadcast Creation Form */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 shadow-md">
        <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-700" /> Compose Platform Broadcast
        </h2>

        <form onSubmit={handleBroadcast} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
                Target Stakeholder Audience
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs sm:text-sm text-slate-950 font-black focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
              >
                <option value="all" className="text-slate-950 font-bold">Broadcast to All Users (Donors, NGOs, Volunteers)</option>
                <option value="donor" className="text-slate-950 font-bold">All Food Donors Only</option>
                <option value="ngo" className="text-slate-950 font-bold">Verified NGOs & Shelters Only</option>
                <option value="volunteer" className="text-slate-950 font-bold">Volunteer Logistics Network Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
                Urgency & Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs sm:text-sm text-slate-950 font-black focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
              >
                <option value="info" className="text-slate-950 font-bold">Informational Advisory</option>
                <option value="success" className="text-slate-950 font-bold">Impact Celebration & Milestone</option>
                <option value="warning" className="text-slate-950 font-bold">Safety Notice / Warning</option>
                <option value="urgent" className="text-slate-950 font-bold">Urgent Immediate Action Required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
              Notification Headline / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Urgent Surplus Meal Dispatch Needed in Gandhipuram"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs sm:text-sm text-slate-950 font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
              Notification Content / Body *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide exact details, pickup deadlines, or system notices..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs sm:text-sm text-slate-950 font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Transmitting Broadcast...' : 'Dispatch Broadcast'}
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History Panel */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" /> Dispatched Broadcast History
          </h2>
          <button
            onClick={fetchBroadcasts}
            className="p-2 rounded-xl border-2 border-slate-300 bg-white text-slate-950 hover:bg-slate-100 font-bold transition cursor-pointer flex items-center gap-1.5"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">Refresh</span>
          </button>
        </div>

        {loadingHistory ? (
          <LoadingSpinner text="Retrieving platform broadcast logs..." />
        ) : broadcasts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border-2 border-slate-200 rounded-xl">
            <Bell className="w-10 h-10 mx-auto mb-2 text-emerald-700" />
            <p className="text-xs font-black text-slate-950">No platform broadcasts sent yet</p>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">Use the form above to dispatch your first broadcast announcement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-slate-300 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black">
                <tr>
                  <th className="px-4 py-3 text-slate-950 font-black">Timestamp</th>
                  <th className="px-4 py-3 text-slate-950 font-black">Headline & Content</th>
                  <th className="px-4 py-3 text-slate-950 font-black">Audience</th>
                  <th className="px-4 py-3 text-slate-950 font-black">Priority</th>
                  <th className="px-4 py-3 text-slate-950 font-black text-right">Recipients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {broadcasts.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 text-slate-950 font-bold whitespace-nowrap text-xs">
                      {new Date(b.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 max-w-sm">
                      <p className="font-black text-slate-950 text-sm">{b.title}</p>
                      <p className="text-slate-950 font-bold text-xs line-clamp-2 mt-0.5">{b.message}</p>
                      {b.sentBy?.name && (
                        <p className="text-xs text-emerald-950 font-extrabold mt-1">Dispatched by: {b.sentBy.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getRoleBadge(b.targetRole)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getPriorityBadge(b.priority)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-950 font-black whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Users className="w-3.5 h-3.5 text-slate-900" />
                        {b.recipientCount || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
