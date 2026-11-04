import api from './api';

export const donationService = {
  getAll: async (params) => {
    return await api.get('/donations', { params });
  },

  getById: async (id) => {
    return await api.get(`/donations/${id}`);
  },

  getMyDonations: async (params) => {
    return await api.get('/donations/my-donations', { params });
  },

  getNearby: async (params) => {
    return await api.get('/donations/nearby', { params });
  },

  getExpiringSoon: async (params) => {
    return await api.get('/donations/expiring-soon', { params });
  },

  create: async (formData) => {
    return await api.post('/donations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: async (id, formData) => {
    return await api.put(`/donations/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: async (id) => {
    return await api.delete(`/donations/${id}`);
  },

  cancel: async (id) => {
    return await api.patch(`/donations/${id}/cancel`);
  },

  getStatistics: async () => {
    return await api.get('/donations/statistics');
  },
};
