const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { verifyToken } = require('../middleware/auth');

router.post('/generate/:assignmentId', verifyToken, qrController.generateQRPayload);
router.post('/verify-pickup', verifyToken, qrController.verifyPickup);
router.post('/verify-delivery', verifyToken, qrController.verifyDelivery);

module.exports = router;
