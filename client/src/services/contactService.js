import api from './api';

export const contactService = {
  // Submit contact message
  sendMessage: async (data) => {
    const res = await api.post('/contact', data);
    return res.data;
  },

  // Get all contact inquiries (admin)
  getMessages: async (params = {}) => {
    const res = await api.get('/contact', { params });
    return res.data;
  },

  // Mark message as resolved or update status
  updateStatus: async (id, status) => {
    const res = await api.patch(`/contact/${id}`, { status });
    return res.data;
  },
};
