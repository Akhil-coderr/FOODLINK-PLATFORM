const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, notificationController.getAll);
router.patch('/read-all', verifyToken, notificationController.markAllAsRead);
router.patch('/:id/read', verifyToken, notificationController.markAsRead);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;
