import axios from 'axios';
import { showError, showWarning } from '../utils/notification';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://foodlink-platform.onrender.com/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with strict notification ownership:
// - Interceptor handles centralized unexpected network/infrastructure errors (offline, 500, expired session)
// - Component catch blocks handle operation-specific validation messages
// - Flag _handled prevents duplicate error notifications between layers
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    // 1. Centralized network failure (server down or client offline)
    if (isNetworkError) {
      showError('Unable to connect to the server. Please check your internet connection.', {
        eventId: 'network-offline',
      });
      const enrichedError = new Error('Network offline or server unreachable');
      enrichedError._handled = true;
      return Promise.reject(enrichedError);
    }

    // 2. Centralized session expiration handling
    if (status === 401) {
      localStorage.removeItem('foodlink_token');
      localStorage.removeItem('foodlink_user');

      // Do not popup during initial silent auth check or login attempts
      const isAuthPath = error.config?.url?.includes('/auth/me') || error.config?.url?.includes('/auth/login');
      if (!isAuthPath) {
        showWarning('Your session has expired. Please sign in again.', {
          eventId: 'auth-session-expired',
        });
      }

      const enrichedError = error.response?.data || { success: false, message };
      enrichedError._handled = true;
      return Promise.reject(enrichedError);
    }

    // 3. Centralized 500 server crash handling
    if (status >= 500) {
      showError('Server encountered an issue. Please try again shortly.', {
        eventId: 'server-500-error',
      });
      const enrichedError = error.response?.data || { success: false, message };
      enrichedError._handled = true;
      return Promise.reject(enrichedError);
    }

    // 4. Operation-specific client errors (400, 403, 404, 422) are passed to page component handlers
    return Promise.reject(error.response?.data || { success: false, message, _handled: false });
  }
);

export default api;
