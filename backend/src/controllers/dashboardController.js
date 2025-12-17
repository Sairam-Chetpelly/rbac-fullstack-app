const User = require('../models/User');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;
    let stats = {};

    if (role === 'admin' || role === 'manager') {
      // Admin/Manager stats
      // Get users
      const users = await User.find();
      const applications = await Application.find().populate('status');
      const payments = await Payment.find();
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive).length;
      const pendingUsers = users.filter(u => u.status?.name === 'pending').length;
      const inactiveUsers = users.filter(u => !u.isActive).length;
      
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(app => ['submitted', 'under_review', 'pending_documents'].includes(app.status?.name)).length;
      const approvedApplications = applications.filter(app => app.status?.name === 'approved').length;
      const rejectedApplications = applications.filter(app => app.status?.name === 'rejected').length;
      
      const totalPayments = payments.length;
      const pendingPayments = payments.filter(pay => pay.status === 'pending').length;
      const completedPayments = payments.filter(pay => pay.status === 'completed').length;

      stats = {
        users: { total: totalUsers, active: activeUsers, pending: pendingUsers, inactive: inactiveUsers },
        applications: { total: totalApplications, pending: pendingApplications, approved: approvedApplications, rejected: rejectedApplications },
        payments: { total: totalPayments, pending: pendingPayments, completed: completedPayments }
      };
    } else if (role === 'employee') {
      // Employee stats - assigned applications
      const assignedApplications = await Application.find({ assignedTo: req.user._id }).populate('status');
      const assignedPayments = await Payment.find({ 
        application: { $in: assignedApplications.map(app => app._id) }
      });

      stats = {
        applications: {
          total: assignedApplications.length,
          pending: assignedApplications.filter(app => ['submitted', 'under_review', 'pending_documents'].includes(app.status?.name)).length,
          approved: assignedApplications.filter(app => app.status?.name === 'approved').length,
          rejected: assignedApplications.filter(app => app.status?.name === 'rejected').length
        },
        payments: {
          total: assignedPayments.length,
          pending: assignedPayments.filter(pay => pay.status === 'pending').length,
          completed: assignedPayments.filter(pay => pay.status === 'completed').length
        }
      };
    } else if (role === 'customer') {
      // Customer stats - their own applications
      const userApplications = await Application.find({ userId: req.user._id }).populate('status');
      const userPayments = await Payment.find({ 
        application: { $in: userApplications.map(app => app._id) }
      });

      stats = {
        applications: {
          total: userApplications.length,
          pending: userApplications.filter(app => ['submitted', 'under_review', 'pending_documents'].includes(app.status?.name)).length,
          approved: userApplications.filter(app => app.status?.name === 'approved').length,
          rejected: userApplications.filter(app => app.status?.name === 'rejected').length
        },
        payments: {
          total: userPayments.length,
          pending: userPayments.filter(pay => pay.status === 'pending').length,
          completed: userPayments.filter(pay => pay.status === 'completed').length
        }
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const { role } = req.user;
    let activities = [];

    if (role === 'admin' || role === 'manager') {
      // Get recent user registrations
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt')
        .catch(() => []);

      // Get recent applications
      const recentApplications = await Application.find()
        .populate('userId', 'name')
        .populate('status', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .catch(() => []);

      // Combine activities
      if (recentUsers) {
        recentUsers.forEach(user => {
          if (user && user.name) {
            activities.push({
              action: 'New user registered',
              user: user.name,
              details: `Role: ${user.role || 'Unknown'}`,
              time: user.createdAt || new Date(),
              icon: '👤',
              color: 'text-green-600'
            });
          }
        });
      }

      if (recentApplications) {
        recentApplications.forEach(app => {
          if (app) {
            activities.push({
              action: 'New application submitted',
              user: app.userId?.name || 'Unknown User',
              details: `Application ID: ${app.applicationId || 'N/A'}`,
              time: app.createdAt || new Date(),
              icon: '📋',
              color: 'text-blue-600'
            });
          }
        });
      }
    } else if (role === 'employee') {
      // Employee activities - assigned applications
      const recentApplications = await Application.find({ assignedTo: req.user._id })
        .populate('userId', 'name')
        .populate('status', 'name')
        .sort({ updatedAt: -1 })
        .limit(10)
        .catch(() => []);

      if (recentApplications) {
        recentApplications.forEach(app => {
          if (app) {
            activities.push({
              action: 'Application assigned',
              user: app.userId?.name || 'Unknown User',
              details: `${app.applicationId || 'N/A'} - ${app.status?.name || 'Unknown Status'}`,
              time: app.updatedAt || app.createdAt || new Date(),
              icon: '📋',
              color: 'text-blue-600'
            });
          }
        });
      }
    } else if (role === 'customer') {
      // Customer activities - their applications
      const recentApplications = await Application.find({ userId: req.user._id })
        .populate('status', 'name')
        .sort({ updatedAt: -1 })
        .limit(10)
        .catch(() => []);

      if (recentApplications) {
        recentApplications.forEach(app => {
          if (app) {
            activities.push({
              action: 'Your application updated',
              user: 'System',
              details: `${app.applicationId || 'N/A'} - ${app.status?.name || 'Unknown Status'}`,
              time: app.updatedAt || app.createdAt || new Date(),
              icon: '📋',
              color: 'text-blue-600'
            });
          }
        });
      }
    }

    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    activities = activities.slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activities' });
  }
};

// Get system status
const getSystemStatus = async (req, res) => {
  try {
    const status = [
      { service: 'Database', status: 'Online', icon: '🗄️', color: 'bg-green-100 text-green-800' },
      { service: 'API Server', status: 'Online', icon: '🌐', color: 'bg-green-100 text-green-800' },
      { service: 'Authentication', status: 'Online', icon: '🔐', color: 'bg-green-100 text-green-800' },
      { service: 'File Storage', status: 'Online', icon: '📁', color: 'bg-green-100 text-green-800' }
    ];

    res.json(status);
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({ message: 'Failed to fetch system status' });
  }
};

// Get chart data for analytics
const getChartData = async (req, res) => {
  try {
    const { role } = req.user;
    const { type, period = '7d' } = req.query;

    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let chartData = {};

    if (type === 'applications') {
      const applications = await Application.find({
        createdAt: { $gte: startDate },
        ...(role === 'employee' && { assignedTo: req.user._id }),
        ...(role === 'customer' && { userId: req.user._id })
      }).populate('status');

      // Group by date
      const dateGroups = {};
      applications.forEach(app => {
        const date = app.createdAt.toISOString().split('T')[0];
        if (!dateGroups[date]) {
          dateGroups[date] = { submitted: 0, approved: 0, rejected: 0, pending: 0 };
        }
        if (app.status?.name === 'approved') dateGroups[date].approved++;
        else if (app.status?.name === 'rejected') dateGroups[date].rejected++;
        else if (['submitted', 'under_review', 'pending_documents'].includes(app.status?.name)) dateGroups[date].pending++;
        dateGroups[date].submitted++;
      });

      chartData = {
        labels: Object.keys(dateGroups).sort(),
        datasets: [
          { label: 'Submitted', data: Object.values(dateGroups).map(d => d.submitted), color: '#3B82F6' },
          { label: 'Approved', data: Object.values(dateGroups).map(d => d.approved), color: '#10B981' },
          { label: 'Rejected', data: Object.values(dateGroups).map(d => d.rejected), color: '#EF4444' },
          { label: 'Pending', data: Object.values(dateGroups).map(d => d.pending), color: '#F59E0B' }
        ]
      };
    } else if (type === 'users' && (role === 'admin' || role === 'manager')) {
      const users = await User.find({
        createdAt: { $gte: startDate }
      }).populate('status');

      // Group by date
      const dateGroups = {};
      users.forEach(user => {
        const date = user.createdAt.toISOString().split('T')[0];
        if (!dateGroups[date]) {
          dateGroups[date] = { total: 0, active: 0, pending: 0, inactive: 0 };
        }
        dateGroups[date].total++;
        if (user.isActive) dateGroups[date].active++;
        else if (user.status?.name === 'pending') dateGroups[date].pending++;
        else if (!user.isActive) dateGroups[date].inactive++;
      });

      chartData = {
        labels: Object.keys(dateGroups).sort(),
        datasets: [
          { label: 'Total', data: Object.values(dateGroups).map(d => d.total), color: '#3B82F6' },
          { label: 'Active', data: Object.values(dateGroups).map(d => d.active), color: '#10B981' },
          { label: 'Pending', data: Object.values(dateGroups).map(d => d.pending), color: '#F59E0B' },
          { label: 'Inactive', data: Object.values(dateGroups).map(d => d.inactive), color: '#EF4444' }
        ]
      };
    }

    res.json(chartData);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: 'Failed to fetch chart data' });
  }
};

// Export dashboard data
const exportDashboardData = async (req, res) => {
  try {
    const { format = 'csv', period = '30d' } = req.query;
    const { role } = req.user;
    
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let exportData = [];
    
    if (role === 'admin' || role === 'manager') {
      // Export user and application data
      const [users, applications] = await Promise.all([
        User.find({ createdAt: { $gte: startDate } }).populate('role'),
        Application.find({ createdAt: { $gte: startDate } }).populate('status userId')
      ]);
      
      if (format === 'csv') {
        const csvData = [
          ['Type', 'Date', 'Name', 'Email', 'Status', 'Role'],
          ...users.map(user => [
            'User',
            user.createdAt.toISOString().split('T')[0],
            user.name,
            user.email,
            user.isActive ? 'active' : 'inactive',
            user.role?.name || user.role
          ]),
          ...applications.map(app => [
            'Application',
            app.createdAt.toISOString().split('T')[0],
            app.userId?.name || 'N/A',
            app.userId?.email || 'N/A',
            app.status?.name || 'N/A',
            'Application'
          ])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=dashboard-report-${period}.csv`);
        return res.send(csvContent);
      }
    }
    
    res.status(400).json({ message: 'Invalid export format or insufficient permissions' });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getSystemStatus,
  getChartData,
  exportDashboardData
};