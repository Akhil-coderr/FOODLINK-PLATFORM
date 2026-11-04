import api from './api';

export const ngoService = {
  getProfile: async () => {
    return await api.get('/ngos/profile');
  },

  updateProfile: async (data) => {
    return await api.put('/ngos/profile', data);
  },

  getAll: async (params) => {
    return await api.get('/ngos', { params });
  },

  getNearby: async (params) => {
    return await api.get('/ngos/nearby', { params });
  },

  getRecommendations: async (donationId) => {
    return await api.get(`/ngos/recommendations/${donationId}`);
  },

  getDashboardStats: async () => {
    return await api.get('/ngos/dashboard');
  },

  getImpactStats: async () => {
    return await api.get('/ngos/impact');
  },

  // Pickup Requests from NGO
  createRequest: async (donationId, data) => {
    return await api.post('/requests', { donationId, ...data });
  },

  getMyRequests: async (params) => {
    return await api.get('/requests/my-requests', { params });
  },

  getRequestById: async (id) => {
    return await api.get(`/requests/${id}`);
  },

  cancelRequest: async (id) => {
    return await api.patch(`/requests/${id}/cancel`);
  },

  // Donor side requests
  getIncomingRequests: async (params) => {
    return await api.get('/requests', { params });
  },

  acceptRequest: async (id) => {
    return await api.patch(`/requests/${id}/accept`);
  },

  rejectRequest: async (id, reason) => {
    return await api.patch(`/requests/${id}/reject`, { reason });
  },
};
