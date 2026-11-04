import api from './api';

export const rewardService = {
  getCatalog: async () => {
    return await api.get('/rewards/catalog');
  },

  getKarmaOverview: async () => {
    return await api.get('/rewards/karma/overview');
  },

  getKarmaBadge: async () => {
    return await api.get('/rewards/karma/badge');
  },

  getMyRedemptions: async () => {
    return await api.get('/rewards/redemptions');
  },

  getMyCertificates: async () => {
    return await api.get('/rewards/certificates');
  },

  getCertificateById: async (id) => {
    return await api.get(`/rewards/certificates/${id}`);
  },

  redeem: async (data) => {
    return await api.post('/rewards/redeem', data);
  },

  cancelRedemption: async (id) => {
    return await api.patch(`/rewards/redemptions/${id}/cancel`);
  },
};
