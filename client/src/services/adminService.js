import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },

  getPlatformStats: async () => {
    return await api.get('/admin/dashboard');
  },

  getUsers: async (params) => {
    return await api.get('/admin/users', { params });
  },

  updateUserStatus: async (id, status) => {
    return await api.patch(`/admin/users/${id}/status`, { status });
  },

  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },

  getDonors: async (params) => {
    return await api.get('/admin/donors', { params });
  },

  getNGOs: async (params) => {
    return await api.get('/admin/ngos', { params });
  },

  approveNGO: async (id, notes) => {
    return await api.patch(`/admin/ngos/${id}/approve`, { notes });
  },

  rejectNGO: async (id, notes) => {
    return await api.patch(`/admin/ngos/${id}/reject`, { notes });
  },

  getVolunteers: async (params) => {
    return await api.get('/admin/volunteers', { params });
  },

  deleteVolunteer: async (id) => {
    return await api.delete(`/admin/volunteers/${id}`);
  },

  getDonations: async (params) => {
    return await api.get('/admin/donations', { params });
  },

  flagDonation: async (id, reason) => {
    return await api.patch(`/admin/donations/${id}/flag`, { reason });
  },

  deleteDonation: async (id) => {
    return await api.delete(`/admin/donations/${id}`);
  },

  getRequests: async (params) => {
    return await api.get('/admin/requests', { params });
  },

  getAssignments: async (params) => {
    return await api.get('/admin/assignments', { params });
  },

  getAnalytics: async (params) => {
    return await api.get('/admin/analytics', { params });
  },

  getReports: async (type) => {
    return await api.get('/admin/reports', { params: { type } });
  },

  getMessages: async (params) => {
    return await api.get('/admin/messages', { params });
  },

  updateMessageStatus: async (id, status) => {
    return await api.patch(`/admin/messages/${id}/status`, { status });
  },

  getAuditLogs: async (params) => {
    return await api.get('/admin/audit-logs', { params });
  },

  getRedemptions: async (params) => {
    return await api.get('/admin/redemptions', { params });
  },

  sendBroadcast: async (data) => {
    return await api.post('/admin/broadcast', data);
  },

  getBroadcasts: async (params) => {
    return await api.get('/admin/broadcasts', { params });
  },

  updateRedemptionStatus: async (id, data) => {
    return await api.patch(`/admin/redemptions/${id}/status`, data);
  },

  redeemForUser: async (data) => {
    return await api.post('/admin/redemptions/manual', data);
  },

  getRewards: async () => {
    return await api.get('/admin/rewards');
  },

  createReward: async (data) => {
    return await api.post('/admin/rewards', data);
  },

  updateReward: async (id, data) => {
    return await api.patch(`/admin/rewards/${id}`, data);
  },

  deleteReward: async (id) => {
    return await api.delete(`/admin/rewards/${id}`);
  },

  uploadRewardImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return await api.post('/admin/rewards/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getRestaurants: async () => {
    return await api.get('/admin/restaurants');
  },

  createRestaurant: async (data) => {
    return await api.post('/admin/restaurants', data);
  },

  updateRestaurant: async (id, data) => {
    return await api.patch(`/admin/restaurants/${id}`, data);
  },

  deleteRestaurant: async (id) => {
    return await api.delete(`/admin/restaurants/${id}`);
  },

  getBadges: async () => {
    return await api.get('/admin/badges');
  },

  getCertificates: async (params) => {
    return await api.get('/admin/certificates', { params });
  },
};
