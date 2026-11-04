import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartHandshake, Menu, X, User, LogOut, LayoutDashboard, PlusCircle, Bell } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import KarmaBadge from '../common/KarmaBadge';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'donor':
        return '/donor/dashboard';
      case 'ngo':
        return '/ngo/dashboard';
      case 'volunteer':
        return '/volunteer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-surface-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-white shadow-sm group-hover:bg-forest-800 transition">
                <HeartHandshake className="w-6 h-6 text-forest-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-forest-900 leading-none">
                  Food<span className="text-forest-500">Link</span>
                </span>
                <span className="text-[10px] font-semibold text-brandText-muted tracking-wider uppercase">
                  Redistribute Hope
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex ml-10 space-x-1">
              <Link
                to="/food"
                className="px-3 py-2 rounded-lg text-sm font-medium text-brandText-primary hover:text-forest-900 hover:bg-forest-50 transition"
              >
                Available Food
              </Link>
              <Link
                to="/how-it-works"
                className="px-3 py-2 rounded-lg text-sm font-medium text-brandText-primary hover:text-forest-900 hover:bg-forest-50 transition"
              >
                How It Works
              </Link>
              <Link
                to="/impact"
                className="px-3 py-2 rounded-lg text-sm font-medium text-brandText-primary hover:text-forest-900 hover:bg-forest-50 transition"
              >
                Live Impact
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 rounded-lg text-sm font-medium text-brandText-primary hover:text-forest-900 hover:bg-forest-50 transition"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="px-3 py-2 rounded-lg text-sm font-medium text-brandText-primary hover:text-forest-900 hover:bg-forest-50 transition"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <KarmaBadge />

                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-forest-900 bg-forest-50 hover:bg-forest-100 transition border border-forest-200"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2 text-forest-700" />
                  Dashboard
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-forest-200 text-forest-900">
                    {user.role}
                  </span>
                </Link>

                {user.role === 'donor' && (
                  <Link
                    to="/donor/donations/create"
                    className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-forest-900 hover:bg-forest-800 shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Donate Food
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-brandText-muted hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-brandText-primary hover:text-forest-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-forest-900 hover:bg-forest-800 shadow-sm transition"
                >
                  Join FoodLink
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brandText-primary hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-white px-4 pt-2 pb-6 space-y-1">
          <Link
            to="/food"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-brandText-primary hover:bg-forest-50"
          >
            Available Food
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-brandText-primary hover:bg-forest-50"
          >
            How It Works
          </Link>
          <Link
            to="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-brandText-primary hover:bg-forest-50"
          >
            Live Impact
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-brandText-primary hover:bg-forest-50"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-brandText-primary hover:bg-forest-50"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-surface-border">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <KarmaBadge className="w-full justify-center" />
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-forest-900 text-white"
                >
                  <span>Dashboard ({user.role})</span>
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 bg-rose-50"
                >
                  <span>Log Out</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg text-sm font-semibold border border-surface-border text-brandText-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg text-sm font-semibold bg-forest-900 text-white"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
