import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { MessageSquare, Mail, CheckCircle2, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await adminService.getMessages();
      if (res.success && res.data) {
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await adminService.updateMessageStatus(id, status);
      if (res.success) {
        toast.success(`Message marked as ${status}`);
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Mail className="w-7 h-7 text-emerald-400" />
          Public Inquiries & Contact Messages
        </h1>
        <p className="text-sm font-semibold text-slate-300 mt-1">
          Messages submitted by users, hotels, and charities via the public contact portal.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading messages..." />
      ) : messages.length === 0 ? (
        <EmptyState title="No contact messages" description="When visitors send questions via the contact page, they will appear here." icon={MessageSquare} />
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md flex flex-col md:flex-row items-start justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      m.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                        : m.status === 'read'
                        ? 'bg-blue-100 text-blue-950 border-blue-400'
                        : 'bg-amber-100 text-amber-950 border-amber-400'
                    }`}
                  >
                    {m.status}
                  </span>
                  <span className="text-xs font-bold text-slate-950">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>

                <h3 className="font-black text-base text-slate-950">{m.subject}</h3>
                <p className="text-xs text-slate-950 font-bold bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  "{m.message}"
                </p>

                <div className="text-xs text-slate-950 font-bold pt-1">
                  From: <strong className="text-slate-950 font-black">{m.name}</strong> • <a href={`mailto:${m.email}`} className="text-emerald-950 underline font-black">{m.email}</a>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                {m.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusChange(m._id, 'resolved')}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
                {m.status === 'unread' && (
                  <button
                    onClick={() => handleStatusChange(m._id, 'read')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-brandText-primary font-bold text-xs rounded-xl transition"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
