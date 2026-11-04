const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const rewardController = require('../controllers/rewardController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { upload } = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/donors', adminController.getDonors);
router.get('/ngos', adminController.getNGOs);
router.get('/ngos/:id', adminController.getNGOById);
router.patch('/ngos/:id/approve', adminController.approveNGO);
router.patch('/ngos/:id/reject', adminController.rejectNGO);
router.get('/volunteers', adminController.getVolunteers);
router.delete('/volunteers/:id', adminController.deleteVolunteer);
router.get('/donations', adminController.getDonations);
router.patch('/donations/:id/flag', adminController.flagDonation);
router.delete('/donations/:id', adminController.deleteDonation);
router.get('/requests', adminController.getRequests);
router.get('/assignments', adminController.getAssignments);
router.get('/analytics', adminController.getAnalytics);
router.get('/messages', adminController.getMessages);
router.patch('/messages/:id/status', adminController.updateMessageStatus);
router.post('/broadcast', adminController.sendBroadcast);
router.get('/broadcasts', adminController.getBroadcasts);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/reports', adminController.getReports);
router.get('/rewards', rewardController.adminListRewards);
router.post('/rewards', rewardController.adminCreateReward);
router.post(
  '/rewards/upload-image',
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Could not upload the image.',
        });
      }
      next();
    });
  },
  rewardController.adminUploadRewardImage
);
router.patch('/rewards/:id', rewardController.adminUpdateReward);
router.delete('/rewards/:id', rewardController.adminDeleteReward);
router.get('/redemptions', rewardController.adminListRedemptions);
router.post('/redemptions/manual', rewardController.adminRedeemForUser);
router.patch('/redemptions/:id/status', rewardController.adminUpdateRedemptionStatus);
router.get('/restaurants', rewardController.adminListRestaurants);
router.post('/restaurants', rewardController.adminCreateRestaurant);
router.patch('/restaurants/:id', rewardController.adminUpdateRestaurant);
router.delete('/restaurants/:id', rewardController.adminDeleteRestaurant);
router.get('/badges', rewardController.adminListBadges);
router.get('/certificates', rewardController.adminListCertificates);

module.exports = router;
