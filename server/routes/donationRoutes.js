const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { upload } = require('../middleware/upload');

// Public listing
router.get('/', donationController.getAll);

// Authenticated donor endpoints
router.get('/my-donations', verifyToken, requireRole('donor', 'admin'), donationController.getMyDonations);
router.get('/statistics', verifyToken, requireRole('donor', 'admin'), donationController.getStatistics);

// Single donation (public)
router.get('/:id', donationController.getById);

// Donor CRUD
router.post('/', verifyToken, requireRole('donor', 'admin'), upload.single('image'), donationController.create);
router.put('/:id', verifyToken, requireRole('donor', 'admin'), upload.single('image'), donationController.update);
router.delete('/:id', verifyToken, requireRole('donor', 'admin'), donationController.delete);
router.patch('/:id/cancel', verifyToken, requireRole('donor', 'admin'), donationController.cancel);

module.exports = router;
