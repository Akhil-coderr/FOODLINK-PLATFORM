const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rate limiter for auth endpoints (higher headroom for development and automated test suites)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 1000, // 1000 in dev/test, 20 in prod
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register/donor', authLimiter, authController.registerDonor);
router.post('/register/ngo', authLimiter, authController.registerNGO);
router.post('/register/volunteer', authLimiter, authController.registerVolunteer);
router.post('/login', authLimiter, authController.login);
router.post('/admin/login', authLimiter, authController.adminLogin);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getMe);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.get('/verify-reset-token/:token', authLimiter, authController.verifyResetToken);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// OAuth Endpoints (Google OAuth)
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.post('/oauth/onboard', authLimiter, authController.oauthOnboard);

module.exports = router;
