import api from './api';

export const impactService = {
  getPublicImpact: async () => {
    return await api.get('/impact/public');
  },

  getMonthlyTrends: async (params) => {
    return await api.get('/impact/monthly', { params });
  },
};

export const contactService = {
  sendMessage: async (data) => {
    return await api.post('/contact', data);
  },
};

export const notificationService = {
  getAll: async (params) => {
    return await api.get('/notifications', { params });
  },

  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await api.patch('/notifications/read-all');
  },

  delete: async (id) => {
    return await api.delete(`/notifications/${id}`);
  },
};
