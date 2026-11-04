import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  adminLogin: async (credentials) => {
    return await api.post('/auth/admin/login', credentials);
  },

  oauthOnboard: async (data) => {
    return await api.post('/auth/oauth/onboard', data);
  },
  
  registerDonor: async (data) => {
    return await api.post('/auth/register/donor', data);
  },

  registerNGO: async (data) => {
    return await api.post('/auth/register/ngo', data);
  },

  registerVolunteer: async (data) => {
    return await api.post('/auth/register/volunteer', data);
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  verifyResetToken: async (token) => {
    return await api.get(`/auth/verify-reset-token/${token}`);
  },

  resetPassword: async (token, password, confirmPassword) => {
    return await api.post('/auth/reset-password', { token, password, confirmPassword });
  },

  updateProfile: async (data) => {
    return await api.put('/users/profile', data);
  },

  changePassword: async (passwords) => {
    return await api.put('/users/change-password', passwords);
  },
};
