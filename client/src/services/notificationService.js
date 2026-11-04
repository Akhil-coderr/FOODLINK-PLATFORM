import api from './api';

export const notificationService = {
  // Get all notifications for current authenticated user
  getAll: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  // Mark specific notification as read
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
