const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboardStats, getRecentActivities, getSystemStatus, getChartData, exportDashboardData } = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(auth);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get recent activities
router.get('/activities', getRecentActivities);

// Get system status
router.get('/status', getSystemStatus);

// Get chart data for analytics
router.get('/charts', getChartData);

// Export dashboard data
router.get('/export', exportDashboardData);

module.exports = router;