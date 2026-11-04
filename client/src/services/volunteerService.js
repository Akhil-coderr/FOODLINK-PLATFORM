import api from './api';

export const volunteerService = {
  getProfile: async () => {
    return await api.get('/volunteers/profile');
  },

  updateProfile: async (data) => {
    return await api.put('/volunteers/profile', data);
  },

  getAvailableTasks: async () => {
    return await api.get('/volunteers/tasks');
  },

  getMyAssignments: async () => {
    return await api.get('/volunteers/assignments');
  },

  getDashboardStats: async () => {
    return await api.get('/volunteers/dashboard');
  },

  getLeaderboard: async () => {
    return await api.get('/volunteers/leaderboard');
  },

  getAchievements: async () => {
    return await api.get('/volunteers/achievements');
  },
};
