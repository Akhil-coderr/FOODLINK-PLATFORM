import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { showSuccess, showError } from '../utils/notification';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('foodlink_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('foodlink_token'));
  const [loading, setLoading] = useState(true);
  const isLoggingOutRef = useRef(false);

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('foodlink_token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('foodlink_user', JSON.stringify(res.data));
          } else {
            // Silent cleanup without showing toast on initial mount
            logout({ notify: false });
          }
        } catch {
          logout({ notify: false });
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('foodlink_token', userToken);
        localStorage.setItem('foodlink_user', JSON.stringify(userData));
        showSuccess(`Welcome back, ${userData.name}!`, { eventId: 'auth-welcome' });
        return { success: true, user: userData };
      }
      const failureMsg = res.message || 'Login failed';
      showError(failureMsg, { eventId: 'auth-login-fail' });
      return { success: false, message: failureMsg };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      showError(msg, { eventId: 'auth-login-fail' });
      return { success: false, message: msg };
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const res = await authService.adminLogin(credentials);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('foodlink_token', userToken);
        localStorage.setItem('foodlink_user', JSON.stringify(userData));
        showSuccess(`Welcome to Admin Control Center, ${userData.name}!`, { eventId: 'auth-admin-welcome' });
        return { success: true, user: userData };
      }
      const failureMsg = res.message || 'Administrator authentication failed';
      showError(failureMsg, { eventId: 'auth-admin-fail' });
      return { success: false, message: failureMsg };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid administrator credentials';
      showError(msg, { eventId: 'auth-admin-fail' });
      return { success: false, message: msg };
    }
  };

  const setAuthSession = (userToken, userData) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('foodlink_token', userToken);
    localStorage.setItem('foodlink_user', JSON.stringify(userData));
  };

  const register = async (role, data) => {
    try {
      const sanitizedData = {
        ...data,
        email: data.email ? data.email.trim().toLowerCase() : data.email,
      };
      let res;
      if (role === 'donor') res = await authService.registerDonor(sanitizedData);
      else if (role === 'ngo') res = await authService.registerNGO(sanitizedData);
      else if (role === 'volunteer') res = await authService.registerVolunteer(sanitizedData);
      else throw new Error('Invalid role specified');

      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('foodlink_token', userToken);
        localStorage.setItem('foodlink_user', JSON.stringify(userData));
        showSuccess('Registration successful! Welcome to FoodLink.', { eventId: 'auth-register' });
        return { success: true, user: userData };
      }
      const failureMsg = res.message || 'Registration failed';
      showError(failureMsg, { eventId: 'auth-register-fail' });
      return { success: false, message: failureMsg };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      showError(msg, { eventId: 'auth-register-fail' });
      return { success: false, message: msg };
    }
  };

  const logout = async (options = { notify: true }) => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      await authService.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('foodlink_token');
      localStorage.removeItem('foodlink_user');
      if (options?.notify !== false) {
        showSuccess('Logged out successfully', { eventId: 'auth-logout' });
      }
      isLoggingOutRef.current = false;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('foodlink_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role,
        isVerifiedNGO: user?.role === 'ngo' ? user?.ngoProfile?.verificationStatus === 'approved' : true,
        login,
        adminLogin,
        setAuthSession,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
