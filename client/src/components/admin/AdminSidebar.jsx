import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  Bike,
  Package,
  Inbox,
  Truck,
  AlertTriangle,
  Bell,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  Gift,
  Ticket,
  History,
  LogOut,
  X,
} from 'lucide-react';

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Donor Management', path: '/admin/donors', icon: Building2 },
    { name: 'NGO Verification', path: '/admin/ngos', icon: ShieldCheck },
    { name: 'Volunteer Management', path: '/admin/volunteers', icon: Bike },
    { name: 'Food Donations', path: '/admin/donations', icon: Package },
    { name: 'Pickup Requests', path: '/admin/requests', icon: Inbox },
    { name: 'Volunteer Assignments', path: '/admin/assignments', icon: Truck },
    { name: 'Reward Catalog', path: '/admin/rewards', icon: Gift },
    { name: 'Reward Redemptions', path: '/admin/redemptions', icon: Ticket },
    { name: 'Food Safety', path: '/admin/food-safety', icon: AlertTriangle },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Contact Messages', path: '/admin/messages', icon: MessageSquare },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight">FoodLink</span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded font-extrabold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Admin
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile Chip */}
          <div className="px-5 py-3.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-emerald-400 font-semibold truncate">Root Security Role</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Sign Out Admin
          </button>
        </div>
      </aside>
    </>
  );
}
