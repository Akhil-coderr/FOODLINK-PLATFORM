const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'foodlink_jwt_access_secret_dev_2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Generate a cryptographically signed OAuth state parameter
 */
const generateOAuthState = (provider, extra = {}) => {
  const payload = {
    provider,
    nonce: crypto.randomBytes(16).toString('hex'),
    timestamp: Date.now(),
    ...extra,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Verify and decode the OAuth state parameter
 */
const verifyOAuthState = (stateToken, expectedProvider) => {
  let decoded;
  try {
    decoded = jwt.verify(stateToken, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired OAuth state parameter. Please try logging in again.');
  }

  if (expectedProvider && decoded.provider !== expectedProvider) {
    throw new Error(`State provider mismatch: expected ${expectedProvider}, got ${decoded.provider}`);
  }
  return decoded;
};

/**
 * ==========================================
 * GOOGLE OAUTH 2.0 / OPENID CONNECT
 * ==========================================
 */
const getGoogleAuthUrl = (state) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || clientId === 'your-google-client-id') {
    return null;
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ].join(' '),
    state,
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

const exchangeGoogleCode = async (code) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured on the server');
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values).toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Failed to exchange Google authorization code');
  }

  // Fetch verified userinfo using access_token
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });

  const userInfo = await userResponse.json();
  if (!userResponse.ok) {
    throw new Error('Failed to retrieve verified Google profile');
  }

  return {
    provider: 'google',
    providerId: userInfo.sub,
    email: userInfo.email?.toLowerCase(),
    isEmailVerified: userInfo.email_verified === true || userInfo.email_verified === 'true',
    name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Google User',
    profileImage: userInfo.picture || '',
  };
};

module.exports = {
  generateOAuthState,
  verifyOAuthState,
  getGoogleAuthUrl,
  exchangeGoogleCode,
};
