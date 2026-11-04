import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { History, Shield, Search, RefreshCw, Clock, Terminal } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load security audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const act = (log.action || '').toLowerCase();
    const actor = (log.actorId?.name || '').toLowerCase();
    const email = (log.actorId?.email || '').toLowerCase();
    const entity = (log.entityType || '').toLowerCase();
    const s = search.toLowerCase();
    return act.includes(s) || actor.includes(s) || email.includes(s) || entity.includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-emerald-400" />
            Security Audit Logs & Platform Registry
          </h1>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            Immutable log entries tracking administrative approvals, account suspensions, and safety moderation.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 border-2 border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          title="Refresh Logs"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-950 font-bold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by action, administrator, email, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-slate-300 text-slate-950 font-bold bg-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving security audit log entries..." />
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border-2 border-slate-300 text-center shadow-md">
          <History className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <p className="text-sm font-black text-slate-950">No security audit logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black">
                <tr>
                  <th className="py-4 px-6 text-slate-950 font-black">Timestamp</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Action Event</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Actor (Admin)</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Target Entity</th>
                  <th className="py-4 px-6 text-slate-950 font-black">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 text-slate-950 font-bold whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-black">
                      <span className="px-2.5 py-1 rounded-md text-xs bg-emerald-100 text-emerald-950 border border-emerald-400 font-black font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-black text-slate-950 text-sm">{log.actorId?.name || 'Root System'}</p>
                      <p className="text-xs text-emerald-950 font-extrabold mt-0.5">{log.actorId?.email || 'system@foodlink.org'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-black text-slate-950 text-sm">{log.entityType}</p>
                      <p className="text-xs text-slate-900 font-bold font-mono mt-0.5">ID: #{log.entityId ? String(log.entityId).slice(-8) : 'N/A'}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-950 font-mono text-xs max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
