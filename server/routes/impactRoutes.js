const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');

router.get('/public', impactController.getPublicImpact);
router.get('/monthly', impactController.getMonthlyTrends);

module.exports = router;
