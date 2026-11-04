import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { volunteerService } from '../services/volunteerService';
import {
  HeartHandshake,
  LayoutDashboard,
  PlusCircle,
  Package,
  Inbox,
  Truck,
  History,
  BarChart3,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Compass,
  Sparkles,
  Award,
  Gift,
  QrCode,
  ShieldCheck,
  Users,
  Building,
  CheckCircle2,
  FileText,
  MessageSquare,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import KarmaBadge from '../components/common/KarmaBadge';

export default function DashboardLayout({ title = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [milestoneBadge, setMilestoneBadge] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBadge = async () => {
      if (user?.role === 'volunteer') {
        try {
          const res = await volunteerService.getAchievements();
          if (res?.data?.badgeProgress?.currentBadge) {
            setMilestoneBadge(res.data.badgeProgress.currentBadge);
          } else if (res?.data?.currentBadge) {
            setMilestoneBadge(res.data.currentBadge);
          }
        } catch (err) {
          // ignore
        }
      }
    };
    fetchBadge();
  }, [user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'donor':
        return [
          { name: 'Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
          { name: 'Add Donation', path: '/donor/donations/create', icon: PlusCircle },
          { name: 'My Donations', path: '/donor/donations', icon: Package },
          { name: 'Incoming Requests', path: '/donor/requests', icon: Inbox },
          { name: 'Pickup Tracking', path: '/donor/pickups', icon: Truck },
          { name: 'Donation History', path: '/donor/history', icon: History },
          { name: 'Analytics', path: '/donor/analytics', icon: BarChart3 },
          { name: 'Notifications', path: '/donor/notifications', icon: Bell },
          { name: 'My Profile', path: '/donor/profile', icon: User },
        ];
      case 'ngo':
        return [
          { name: 'Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
          { name: 'Browse Food', path: '/ngo/food', icon: Compass },
          { name: 'Smart Matching', path: '/ngo/matching', icon: Sparkles },
          { name: 'My Requests', path: '/ngo/requests', icon: Inbox },
          { name: 'Incoming Deliveries', path: '/ngo/deliveries', icon: Truck },
          { name: 'Distribution History', path: '/ngo/history', icon: History },
          { name: 'Our Impact', path: '/ngo/impact', icon: BarChart3 },
          { name: 'Notifications', path: '/ngo/notifications', icon: Bell },
          { name: 'NGO Profile', path: '/ngo/profile', icon: User },
        ];
      case 'volunteer':
        return [
          { name: 'Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
          { name: 'Available Tasks', path: '/volunteer/tasks', icon: Package },
          { name: 'My Assignments', path: '/volunteer/assignments', icon: Truck },
          { name: 'Pickup Routes', path: '/volunteer/routes', icon: Compass },
          { name: 'Scan QR Verification', path: '/volunteer/scan', icon: QrCode },
          { name: 'Completed History', path: '/volunteer/history', icon: History },
          { name: 'Points & Badges', path: '/volunteer/achievements', icon: Award },
          { name: 'Redeem Rewards', path: '/volunteer/rewards', icon: Gift },
          { name: 'Notifications', path: '/volunteer/notifications', icon: Bell },
          { name: 'Volunteer Profile', path: '/volunteer/profile', icon: User },
        ];
      case 'admin':
        return [
          { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Users & Roles', path: '/admin/users', icon: Users },
          { name: 'NGO Verification', path: '/admin/ngos', icon: ShieldCheck },
          { name: 'Donations Audit', path: '/admin/donations', icon: Package },
          { name: 'Pickup Requests', path: '/admin/requests', icon: Inbox },
          { name: 'Volunteer Dispatch', path: '/admin/assignments', icon: Truck },
          { name: 'Contact Messages', path: '/admin/messages', icon: MessageSquare },
          { name: 'Safety Reports', path: '/admin/food-safety', icon: AlertTriangle },
          { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
          { name: 'Export Reports', path: '/admin/reports', icon: FileText },
          { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-surface-light flex flex-col md:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-border flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 px-6 border-b border-surface-border flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-forest-900 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5 text-forest-400" />
              </div>
              <span className="font-extrabold text-lg text-forest-900 tracking-tight">
                Food<span className="text-forest-500">Link</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-brandText-muted hover:text-brandText-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Badge */}
          <div className="px-6 py-4 bg-forest-50/60 border-b border-surface-border/60">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-forest-900 text-forest-100 flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-brandText-primary truncate">{user?.name}</p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-forest-200 text-forest-900">
                  {user?.role} Portal
                </span>
              </div>
            </div>
            {user?.role === 'ngo' && user?.ngoProfile?.verificationStatus !== 'approved' && (
              <div className="mt-2 text-[11px] text-amber-700 font-semibold bg-amber-100/70 p-1.5 rounded">
                Verification: {user?.ngoProfile?.verificationStatus || 'Pending'}
              </div>
            )}
            <KarmaBadge variant="full" className="mt-3" />
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition btn-press ${
                    isActive
                      ? 'bg-forest-900 text-white shadow-sm border-l-4 border-forest-400 pl-3'
                      : 'text-brandText-muted hover:text-brandText-primary hover:bg-slate-100 hover:pl-4 transition-all'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mr-3 ${isActive ? 'text-forest-300' : 'text-brandText-muted'}`}
                  />
                  <span>{item.name}</span>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-surface-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition btn-press cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-surface-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-brandText-muted hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-brandText-primary">{title}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <KarmaBadge className="hidden sm:inline-flex" />
            <Link
              to="/"
              className="text-xs font-semibold text-forest-700 hover:text-forest-900 px-3 py-1.5 rounded-lg border border-forest-200 hover:bg-forest-50 transition"
            >
              Public Site
            </Link>

            {/* Notification shortcut */}
            <Link
              to={`/${user?.role}/notifications`}
              className="relative p-2 rounded-lg text-brandText-muted hover:text-brandText-primary hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </Link>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-forest-900 text-white flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
