const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/profile', verifyToken, requireRole('volunteer', 'admin'), volunteerController.getProfile);
router.put('/profile', verifyToken, requireRole('volunteer', 'admin'), volunteerController.updateProfile);
router.get('/tasks', verifyToken, requireRole('volunteer', 'admin'), volunteerController.getAvailableTasks);
router.get('/assignments', verifyToken, requireRole('volunteer', 'admin'), volunteerController.getMyAssignments);
router.get('/dashboard', verifyToken, requireRole('volunteer', 'admin'), volunteerController.getDashboardStats);
router.get('/leaderboard', volunteerController.getLeaderboard);
router.get('/achievements', verifyToken, requireRole('volunteer', 'admin'), volunteerController.getAchievements);

module.exports = router;
