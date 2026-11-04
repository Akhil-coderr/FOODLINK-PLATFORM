import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Derive title from current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'User & Stakeholder Directory';
    if (path.includes('/admin/donors')) return 'Donor Establishments Management';
    if (path.includes('/admin/ngos')) return 'NGO Accreditations & Verification';
    if (path.includes('/admin/volunteers')) return 'Volunteer Logistics Fleet';
    if (path.includes('/admin/donations')) return 'Food Surplus Donations Audit';
    if (path.includes('/admin/requests')) return 'NGO Pickup Requests Queue';
    if (path.includes('/admin/assignments')) return 'Volunteer Dispatch Logistics';
    if (path.includes('/admin/rewards')) return 'Karma Reward Catalog Management';
    if (path.includes('/admin/redemptions')) return 'Karma Reward Redemptions';
    if (path.includes('/admin/food-safety')) return 'Food Safety & Compliance Reports';
    if (path.includes('/admin/notifications')) return 'Platform Broadcast Notifications';
    if (path.includes('/admin/messages')) return 'Public Inquiries & Helpdesk';
    if (path.includes('/admin/analytics')) return 'System Analytics & Impact Telemetry';
    if (path.includes('/admin/reports')) return 'Regulatory CSV Data Exports';
    if (path.includes('/admin/settings')) return 'Platform Parameters & Config';
    if (path.includes('/admin/audit-logs')) return 'Security Audit Registry';
    return 'Admin Control Center';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        <AdminHeader
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-900 text-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
