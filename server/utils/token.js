const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'foodlink_jwt_access_secret_dev_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'foodlink_jwt_refresh_secret_dev_2026';

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// Cryptographic SHA-256 hash for QR codes and verification tokens
const hashToken = (token) => {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

// Generate random secure token string with prefix
const generateRandomSecret = (prefix = 'SEC') => {
  const randomHex = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `${prefix}-${randomHex}`;
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateRandomSecret,
};
