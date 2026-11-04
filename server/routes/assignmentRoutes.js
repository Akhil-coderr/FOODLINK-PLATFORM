const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', verifyToken, assignmentController.getAll);
router.get('/:id', verifyToken, assignmentController.getById);
router.patch('/:id/assign', verifyToken, requireRole('admin', 'volunteer'), assignmentController.assignVolunteer);
router.patch('/:id/start', verifyToken, requireRole('volunteer', 'admin'), assignmentController.startPickup);
router.patch('/:id/complete-pickup', verifyToken, requireRole('volunteer', 'donor', 'admin'), assignmentController.completePickup);
router.patch('/:id/complete-delivery', verifyToken, requireRole('volunteer', 'ngo', 'admin'), assignmentController.completeDelivery);

module.exports = router;
