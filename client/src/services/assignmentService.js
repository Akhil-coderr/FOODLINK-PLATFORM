import api from './api';

export const assignmentService = {
  getAll: async (params) => {
    return await api.get('/assignments', { params });
  },

  getById: async (id) => {
    return await api.get(`/assignments/${id}`);
  },

  assignVolunteer: async (assignmentId, volunteerId) => {
    return await api.patch(`/assignments/${assignmentId}/assign`, { volunteerId });
  },

  startPickup: async (assignmentId) => {
    return await api.patch(`/assignments/${assignmentId}/start`);
  },

  completePickup: async (assignmentId, code) => {
    return await api.patch(`/assignments/${assignmentId}/complete-pickup`, { code });
  },

  completeDelivery: async (assignmentId, code) => {
    return await api.patch(`/assignments/${assignmentId}/complete-delivery`, { code });
  },

  cancel: async (assignmentId, reason) => {
    return await api.patch(`/assignments/${assignmentId}/cancel`, { reason });
  },
};

export const qrService = {
  getTokens: async (assignmentId) => {
    return await api.post(`/qr/generate/${assignmentId}`);
  },

  verifyPickup: async (payload) => {
    return await api.post('/qr/verify-pickup', payload);
  },

  verifyDelivery: async (payload) => {
    return await api.post('/qr/verify-delivery', payload);
  },
};
