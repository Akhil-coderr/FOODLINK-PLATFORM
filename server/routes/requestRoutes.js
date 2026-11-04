const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');
const { requireRole, requireVerifiedNGO } = require('../middleware/rbac');

router.post('/', verifyToken, requireVerifiedNGO, requestController.createRequest);
router.get('/my-requests', verifyToken, requestController.getMyRequests);
router.get('/:id', verifyToken, requestController.getRequestById);
router.patch('/:id/accept', verifyToken, requestController.acceptRequest);
router.patch('/:id/reject', verifyToken, requestController.rejectRequest);
router.patch('/:id/cancel', verifyToken, requestController.cancelRequest);

// Donor or general list
router.get('/', verifyToken, requestController.getMyRequests);

module.exports = router;
