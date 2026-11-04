const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Public or authenticated inspection of certificate by ID
router.get('/certificates/:certificateId', rewardController.getCertificateById);

// All subsequent routes require authentication
router.use(verifyToken);

router.get('/catalog', rewardController.getCatalog);
router.get('/karma/badge', rewardController.getKarmaBadge);
router.get('/karma/overview', requireRole('volunteer', 'admin'), rewardController.getKarmaOverview);
router.get('/redemptions', requireRole('volunteer', 'admin'), rewardController.getMyRedemptions);
router.get('/certificates', requireRole('volunteer', 'admin'), rewardController.getMyCertificates);
router.post('/redeem', requireRole('volunteer', 'admin'), rewardController.redeemReward);
router.patch(
  '/redemptions/:id/cancel',
  requireRole('volunteer', 'admin'),
  rewardController.cancelMyRedemption
);

module.exports = router;
