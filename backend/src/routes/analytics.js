const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAnalytics, getRealTimeMetrics } = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(auth);

// Get comprehensive analytics
router.get('/', getAnalytics);

// Get real-time metrics
router.get('/realtime', getRealTimeMetrics);

module.exports = router;