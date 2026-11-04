const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/profile', verifyToken, requireRole('ngo', 'admin'), ngoController.getProfile);
router.put('/profile', verifyToken, requireRole('ngo', 'admin'), ngoController.updateProfile);
router.get('/dashboard', verifyToken, requireRole('ngo', 'admin'), ngoController.getDashboardStats);
router.get('/recommendations/:donationId', verifyToken, ngoController.getRecommendations);
router.get('/', ngoController.getAll);

module.exports = router;
