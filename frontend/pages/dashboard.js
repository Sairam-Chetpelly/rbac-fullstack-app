import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      window.location.href = '/';
      return;
    }
    

    
    if (!canAccess(user.role, 'dashboard')) {
      window.location.href = '/';
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      if (user.role === 'employee') {
        // Employee stats - assigned applications and payments
        const [appsResponse, paymentsResponse] = await Promise.all([
          api.get('/applications/assigned'),
          api.get('/applications/assigned/payments')
        ]);
        
        const applications = appsResponse.data;
        const payments = paymentsResponse.data;
        
        setStats({
          totalUsers: applications.length,
          activeUsers: applications.filter(app => 
            app.status?.name?.toLowerCase().includes('submitted') || 
            app.status?.name?.toLowerCase().includes('review')
          ).length,
          pendingUsers: payments.filter(pay => pay.status === 'pending').length,
          inactiveUsers: applications.filter(app => 
            app.status?.name?.toLowerCase().includes('approved') || 
            app.status?.name?.toLowerCase().includes('rejected')
          ).length
        });
      } else if (canAccess(user.role, 'users')) {
        // Admin/Manager stats - all users
        const response = await api.get('/users');
        const users = response.data;
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter(u => (u.status?.name || u.status) === 'active').length,
          pendingUsers: users.filter(u => (u.status?.name || u.status) === 'pending').length,
          inactiveUsers: users.filter(u => (u.status?.name || u.status) === 'inactive').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !canAccess(user.role, 'dashboard')) {
    return <div>Access denied</div>;
  }

  const statCards = user.role === 'employee' ? [
    { title: 'Total Applications', value: stats.totalUsers, icon: '📋', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Pending Review', value: stats.activeUsers, icon: '⏳', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { title: 'Pending Payments', value: stats.pendingUsers, icon: '💳', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    { title: 'Completed', value: stats.inactiveUsers, icon: '✅', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' }
  ] : [
    { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Active Users', value: stats.activeUsers, icon: '✅', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { title: 'Pending Users', value: stats.pendingUsers, icon: '⏳', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { title: 'Inactive Users', value: stats.inactiveUsers, icon: '❌', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-600' }
  ];

  const recentActivities = [
    { action: 'New user registered', user: 'John Doe', time: '2 hours ago', icon: '👤', color: 'text-green-600' },
    { action: 'User role updated', user: 'Jane Smith', time: '4 hours ago', icon: '🛡️', color: 'text-blue-600' },
    { action: 'User status changed', user: 'Mike Johnson', time: '6 hours ago', icon: '⚡', color: 'text-yellow-600' },
    { action: 'System backup completed', user: 'System', time: '1 day ago', icon: '💾', color: 'text-purple-600' }
  ];

  const systemStatus = [
    { service: 'Database', status: 'Online', icon: '🗄️', color: 'bg-green-100 text-green-800' },
    { service: 'API Server', status: 'Online', icon: '🌐', color: 'bg-green-100 text-green-800' },
    { service: 'Authentication', status: 'Online', icon: '🔐', color: 'bg-green-100 text-green-800' },
    { service: 'File Storage', status: 'Online', icon: '📁', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} icon="🔄">
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Recent Activity" icon="📈" className="h-fit">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="System Status" icon="⚙️" className="h-fit">
          <div className="space-y-4">
            {systemStatus.map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{system.icon}</span>
                  <span className="text-sm font-semibold text-gray-900">{system.service}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${system.color} flex items-center gap-1`}>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {system.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {user.role === 'admin' && (
        <Card title="Quick Actions" icon="⚡" className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = '/users/add'} 
              className="h-20 flex-col gap-2"
              icon="👤"
            >
              Add New User
            </Button>
            <Button 
              onClick={() => window.location.href = '/users'} 
              variant="outline"
              className="h-20 flex-col gap-2"
              icon="👥"
            >
              Manage Users
            </Button>
            <Button 
              onClick={() => window.location.href = '/settings'} 
              variant="secondary"
              className="h-20 flex-col gap-2"
              icon="⚙️"
            >
              System Settings
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}