import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalNotificationContainer } from './utils/notification';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';

// Public & Auth Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AvailableFoodPage from './pages/public/AvailableFoodPage';
import FoodDetailsPage from './pages/public/FoodDetailsPage';
import PartnersPage from './pages/public/PartnersPage';
import PublicImpactPage from './pages/public/PublicImpactPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DonorRegisterPage from './pages/auth/DonorRegisterPage';
import NGORegisterPage from './pages/auth/NGORegisterPage';
import VolunteerRegisterPage from './pages/auth/VolunteerRegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import OAuthOnboardingPage from './pages/auth/OAuthOnboardingPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Donor Pages
import DonorDashboardPage from './pages/donor/DonorDashboardPage';
import AddDonationPage from './pages/donor/AddDonationPage';
import DonorDonationsPage from './pages/donor/DonorDonationsPage';
import DonorDonationDetailsPage from './pages/donor/DonorDonationDetailsPage';
import EditDonationPage from './pages/donor/EditDonationPage';
import DonorRequestsPage from './pages/donor/DonorRequestsPage';
import DonorPickupsPage from './pages/donor/DonorPickupsPage';
import DonorHistoryPage from './pages/donor/DonorHistoryPage';
import DonorAnalyticsPage from './pages/donor/DonorAnalyticsPage';
import DonorProfilePage from './pages/donor/DonorProfilePage';
import DonorNotificationsPage from './pages/donor/DonorNotificationsPage';

// NGO Pages
import NGODashboardPage from './pages/ngo/NGODashboardPage';
import NGOBrowseFoodPage from './pages/ngo/NGOBrowseFoodPage';
import NGOFoodDetailsPage from './pages/ngo/NGOFoodDetailsPage';
import NGOMatchingPage from './pages/ngo/NGOMatchingPage';
import NGORequestsPage from './pages/ngo/NGORequestsPage';
import NGODeliveriesPage from './pages/ngo/NGODeliveriesPage';
import NGOHistoryPage from './pages/ngo/NGOHistoryPage';
import NGOImpactPage from './pages/ngo/NGOImpactPage';
import NGOProfilePage from './pages/ngo/NGOProfilePage';
import NGONotificationsPage from './pages/ngo/NGONotificationsPage';

// Volunteer Pages
import VolunteerDashboardPage from './pages/volunteer/VolunteerDashboardPage';
import VolunteerTasksPage from './pages/volunteer/VolunteerTasksPage';
import VolunteerAssignmentsPage from './pages/volunteer/VolunteerAssignmentsPage';
import VolunteerRoutesPage from './pages/volunteer/VolunteerRoutesPage';
import VolunteerScanPage from './pages/volunteer/VolunteerScanPage';
import VolunteerHistoryPage from './pages/volunteer/VolunteerHistoryPage';
import VolunteerAchievementsPage from './pages/volunteer/VolunteerAchievementsPage';
import VolunteerRewardsPage from './pages/volunteer/VolunteerRewardsPage';
import VolunteerProfilePage from './pages/volunteer/VolunteerProfilePage';
import VolunteerNotificationsPage from './pages/volunteer/VolunteerNotificationsPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDonorsPage from './pages/admin/AdminDonorsPage';
import AdminNGOsPage from './pages/admin/AdminNGOsPage';
import AdminNGODetailsPage from './pages/admin/AdminNGODetailsPage';
import AdminVolunteersPage from './pages/admin/AdminVolunteersPage';
import AdminDonationsPage from './pages/admin/AdminDonationsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminAssignmentsPage from './pages/admin/AdminAssignmentsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminFoodSafetyPage from './pages/admin/AdminFoodSafetyPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminRedemptionsPage from './pages/admin/AdminRedemptionsPage';
import AdminRewardsPage from './pages/admin/AdminRewardsPage';

export default function App() {
  return (
    <>
      <GlobalNotificationContainer />
      <Routes>
      {/* ========================================================
          PUBLIC ROUTES (Wrapped in PublicLayout with Header & Footer)
          ======================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/food" element={<AvailableFoodPage />} />
        <Route path="/food/:id" element={<FoodDetailsPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/impact" element={<PublicImpactPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/donor" element={<DonorRegisterPage />} />
        <Route path="/register/ngo" element={<NGORegisterPage />} />
        <Route path="/register/volunteer" element={<VolunteerRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/auth/oauth-onboarding" element={<OAuthOnboardingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* ========================================================
          DEDICATED ADMIN LOGIN (Independent authentication UI)
          ======================================================== */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* ========================================================
          DONOR PORTAL ROUTES (/donor/*)
          ======================================================== */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['donor', 'admin']}>
              <DashboardLayout title="Donor Portal" />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/donor/dashboard" replace />} />
        <Route path="dashboard" element={<DonorDashboardPage />} />
        <Route path="donations" element={<DonorDonationsPage />} />
        <Route path="donations/create" element={<AddDonationPage />} />
        <Route path="donations/:id" element={<DonorDonationDetailsPage />} />
        <Route path="donations/:id/edit" element={<EditDonationPage />} />
        <Route path="requests" element={<DonorRequestsPage />} />
        <Route path="pickups" element={<DonorPickupsPage />} />
        <Route path="history" element={<DonorHistoryPage />} />
        <Route path="analytics" element={<DonorAnalyticsPage />} />
        <Route path="profile" element={<DonorProfilePage />} />
        <Route path="notifications" element={<DonorNotificationsPage />} />
      </Route>

      {/* ========================================================
          NGO PORTAL ROUTES (/ngo/*)
          ======================================================== */}
      <Route
        path="/ngo"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ngo', 'admin']}>
              <DashboardLayout title="NGO Portal" />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/ngo/dashboard" replace />} />
        <Route path="dashboard" element={<NGODashboardPage />} />
        <Route path="food" element={<NGOBrowseFoodPage />} />
        <Route path="food/:id" element={<NGOFoodDetailsPage />} />
        <Route path="matching" element={<NGOMatchingPage />} />
        <Route path="requests" element={<NGORequestsPage />} />
        <Route path="deliveries" element={<NGODeliveriesPage />} />
        <Route path="history" element={<NGOHistoryPage />} />
        <Route path="impact" element={<NGOImpactPage />} />
        <Route path="profile" element={<NGOProfilePage />} />
        <Route path="notifications" element={<NGONotificationsPage />} />
      </Route>

      {/* ========================================================
          VOLUNTEER PORTAL ROUTES (/volunteer/*)
          ======================================================== */}
      <Route
        path="/volunteer"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['volunteer', 'admin']}>
              <DashboardLayout title="Volunteer Portal" />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
        <Route path="dashboard" element={<VolunteerDashboardPage />} />
        <Route path="tasks" element={<VolunteerTasksPage />} />
        <Route path="assignments" element={<VolunteerAssignmentsPage />} />
        <Route path="routes" element={<VolunteerRoutesPage />} />
        <Route path="scan" element={<VolunteerScanPage />} />
        <Route path="history" element={<VolunteerHistoryPage />} />
        <Route path="achievements" element={<VolunteerAchievementsPage />} />
        <Route path="rewards" element={<VolunteerRewardsPage />} />
        <Route path="profile" element={<VolunteerProfilePage />} />
        <Route path="notifications" element={<VolunteerNotificationsPage />} />
      </Route>

      {/* ========================================================
          DEDICATED ADMIN CONTROL CENTER (/admin/*)
          Uses AdminLayout with dedicated 16-item sidebar
          ======================================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute redirectTo="/admin/login">
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="donors" element={<AdminDonorsPage />} />
        <Route path="ngos" element={<AdminNGOsPage />} />
        <Route path="ngos/:id" element={<AdminNGODetailsPage />} />
        <Route path="volunteers" element={<AdminVolunteersPage />} />
        <Route path="donations" element={<AdminDonationsPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="assignments" element={<AdminAssignmentsPage />} />
        <Route path="food-safety" element={<AdminFoodSafetyPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="rewards" element={<AdminRewardsPage />} />
        <Route path="redemptions" element={<AdminRedemptionsPage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}
