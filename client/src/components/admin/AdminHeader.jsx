import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Menu, Bell, ShieldCheck, ExternalLink, Globe } from 'lucide-react';
import KarmaBadge from '../common/KarmaBadge';

export default function AdminHeader({ onMenuClick, title = 'Control Center' }) {
  const { user } = useAuth();
  const { unreadCount, isConnected } = useSocket();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-white">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 hidden sm:block" />
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <KarmaBadge className="hidden sm:inline-flex" />

        {/* Socket live status */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isConnected ? 'Realtime Engine Active' : 'Connecting Engine...'}</span>
        </div>

        {/* Public site link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition flex items-center gap-1"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Public Site</span>
        </Link>

        {/* Admin notifications shortcut */}
        <Link
          to="/admin/notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          )}
        </Link>

        {/* Admin profile chip */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden md:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
