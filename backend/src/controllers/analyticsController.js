const User = require('../models/User');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');

// Get comprehensive analytics data
const getAnalytics = async (req, res) => {
  try {
    const { role } = req.user;
    const { period = '30d', type = 'overview' } = req.query;

    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;
    if (period === '365d') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let analytics = {};

    if (type === 'overview') {
      // Overview analytics
      if (role === 'admin' || role === 'manager') {
        const [
          totalUsers, newUsers, totalApplications, newApplications,
          totalPayments, newPayments, statusChanges
        ] = await Promise.all([
          User.countDocuments(),
          User.countDocuments({ createdAt: { $gte: startDate } }),
          Application.countDocuments(),
          Application.countDocuments({ createdAt: { $gte: startDate } }),
          Payment.countDocuments(),
          Payment.countDocuments({ createdAt: { $gte: startDate } }),
          ApplicationStatusHistory.countDocuments({ createdAt: { $gte: startDate } })
        ]);

        analytics = {
          users: { total: totalUsers, new: newUsers },
          applications: { total: totalApplications, new: newApplications },
          payments: { total: totalPayments, new: newPayments },
          activities: { statusChanges }
        };
      } else if (role === 'employee') {
        const [assignedApps, newAssignedApps, assignedPayments] = await Promise.all([
          Application.countDocuments({ assignedTo: req.user.id }),
          Application.countDocuments({ assignedTo: req.user.id, createdAt: { $gte: startDate } }),
          Payment.countDocuments({
            application: { $in: await Application.find({ assignedTo: req.user.id }).select('_id') }
          })
        ]);

        analytics = {
          applications: { total: assignedApps, new: newAssignedApps },
          payments: { total: assignedPayments }
        };
      }
    } else if (type === 'performance') {
      // Performance analytics
      const applicationsByStatus = await Application.aggregate([
        ...(role === 'employee' ? [{ $match: { assignedTo: req.user.id } }] : []),
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $lookup: { from: 'statuses', localField: '_id', foreignField: '_id', as: 'statusInfo' } },
        { $project: { status: { $arrayElemAt: ['$statusInfo.name', 0] }, count: 1 } }
      ]);

      const paymentsByStatus = await Payment.aggregate([
        ...(role === 'employee' ? [{
          $lookup: { from: 'applications', localField: 'application', foreignField: '_id', as: 'app' }
        }, { $match: { 'app.assignedTo': req.user.id } }] : []),
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      analytics = {
        applicationsByStatus,
        paymentsByStatus
      };
    } else if (type === 'trends') {
      // Trend analytics
      const dailyStats = await Application.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        ...(role === 'employee' ? [{ $match: { assignedTo: req.user.id } }] : []),
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      analytics = { dailyStats };
    }

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
};

// Get real-time metrics
const getRealTimeMetrics = async (req, res) => {
  try {
    const { role } = req.user;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let metrics = {};

    if (role === 'admin' || role === 'manager') {
      const [
        todayUsers, todayApplications, todayPayments,
        weekUsers, weekApplications, weekPayments,
        pendingApplications, pendingPayments
      ] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: today } }),
        Application.countDocuments({ createdAt: { $gte: today } }),
        Payment.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ createdAt: { $gte: thisWeek } }),
        Application.countDocuments({ createdAt: { $gte: thisWeek } }),
        Payment.countDocuments({ createdAt: { $gte: thisWeek } }),
        Application.countDocuments({ 'status.name': { $in: ['submitted', 'under_review'] } }),
        Payment.countDocuments({ status: 'pending' })
      ]);

      metrics = {
        today: { users: todayUsers, applications: todayApplications, payments: todayPayments },
        week: { users: weekUsers, applications: weekApplications, payments: weekPayments },
        pending: { applications: pendingApplications, payments: pendingPayments }
      };
    } else if (role === 'employee') {
      const [
        todayApplications, weekApplications, pendingApplications
      ] = await Promise.all([
        Application.countDocuments({ assignedTo: req.user.id, createdAt: { $gte: today } }),
        Application.countDocuments({ assignedTo: req.user.id, createdAt: { $gte: thisWeek } }),
        Application.countDocuments({ 
          assignedTo: req.user.id, 
          'status.name': { $in: ['submitted', 'under_review'] } 
        })
      ]);

      metrics = {
        today: { applications: todayApplications },
        week: { applications: weekApplications },
        pending: { applications: pendingApplications }
      };
    }

    res.json(metrics);
  } catch (error) {
    console.error('Real-time metrics error:', error);
    res.status(500).json({ message: 'Failed to fetch real-time metrics' });
  }
};

module.exports = {
  getAnalytics,
  getRealTimeMetrics
};