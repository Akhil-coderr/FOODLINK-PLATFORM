import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showSuccess, showError } from '../../utils/notification';

const formatOAuthErrorMessage = (rawError) => {
  if (!rawError) return 'Authentication was not completed. Please try again.';
  const lower = rawError.toLowerCase();
  if (lower.includes('access_denied') || lower.includes('consent_required') || lower.includes('user_cancelled')) {
    return 'Sign-in was cancelled or permission was not granted.';
  }
  if (lower.includes('interaction_required') || lower.includes('login_required')) {
    return 'Authentication session timed out. Please sign in again.';
  }
  if (lower.includes('account_selection_required')) {
    return 'Please select an account to complete sign in.';
  }
  return rawError.length > 80 ? 'Authentication failed. Please try again.' : rawError;
};

export default function OAuthCallbackPage() {
  const [error, setError] = useState(null);
  const { setAuthSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const err = params.get('error');

      if (err) {
        const friendlyMessage = formatOAuthErrorMessage(err);
        // Navigate back to login with inline message, avoiding duplicate popup toasts
        navigate('/login', {
          state: { oauthError: friendlyMessage },
          replace: true,
        });
        return;
      }

      if (!token) {
        const missingTokenMsg = 'Authentication token missing from OAuth callback';
        navigate('/login', {
          state: { oauthError: missingTokenMsg },
          replace: true,
        });
        return;
      }

      try {
        localStorage.setItem('foodlink_token', token);
        const res = await authService.getCurrentUser();
        if (res.success && res.data) {
          setAuthSession(token, res.data);
          showSuccess(`Welcome back, ${res.data.name}!`, { eventId: 'auth-welcome' });

          // Redirect to appropriate dashboard based on authenticated role
          switch (res.data.role) {
            case 'donor':
              navigate('/donor/dashboard', { replace: true });
              break;
            case 'ngo':
              navigate('/ngo/dashboard', { replace: true });
              break;
            case 'volunteer':
              navigate('/volunteer/dashboard', { replace: true });
              break;
            case 'admin':
              navigate('/admin/dashboard', { replace: true });
              break;
            default:
              navigate('/', { replace: true });
          }
        } else {
          throw new Error('Failed to retrieve user profile');
        }
      } catch (e) {
        console.error('OAuth Callback processing error:', e);
        const failureMsg = 'Session establishment failed. Please try again.';
        navigate('/login', {
          state: { oauthError: failureMsg },
          replace: true,
        });
      }
    };

    handleCallback();
  }, [location.search, navigate, setAuthSession]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface-light">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-rose-200">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Authentication Failed</h2>
          <p className="text-sm text-brandText-muted mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light">
      <LoadingSpinner text="Completing secure OAuth authentication..." size="lg" />
    </div>
  );
}
