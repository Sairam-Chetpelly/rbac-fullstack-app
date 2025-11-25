import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import DashboardChart from '../components/DashboardChart';
import ProfessionalChart from '../components/ProfessionalChart';
import RealTimeWidget from '../components/RealTimeWidget';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      router.replace('/');
      return;
    }
    
    if (!canAccess(user.role, 'dashboard')) {
      router.replace('/');
      return;
    }
    
    fetchDashboardData();
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activitiesResponse, statusResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activities'),
        api.get('/dashboard/status')
      ]);
      
      setStats(statsResponse.data);
      setActivities(activitiesResponse.data);
      setSystemStatus(statusResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  // Redirect if no user or no access
  if (!user || !canAccess(user.role, 'dashboard')) {
    return null;
  }

  const getStatCards = () => {
    if (user.role === 'customer') {
      return [
        { title: 'My Applications', value: stats.applications?.total || 0, icon: '📋', color: 'from-blue-500 to-blue-600' },
        { title: 'Pending', value: stats.applications?.pending || 0, icon: '⏳', color: 'from-yellow-500 to-yellow-600' },
        { title: 'Approved', value: stats.applications?.approved || 0, icon: '✅', color: 'from-green-500 to-green-600' },
        { title: 'Payments Due', value: stats.payments?.pending || 0, icon: '💳', color: 'from-orange-500 to-orange-600' }
      ];
    } else if (user.role === 'employee') {
      return [
        { title: 'Assigned Applications', value: stats.applications?.total || 0, icon: '📋', color: 'from-blue-500 to-blue-600' },
        { title: 'Pending Review', value: stats.applications?.pending || 0, icon: '⏳', color: 'from-yellow-500 to-yellow-600' },
        { title: 'Approved', value: stats.applications?.approved || 0, icon: '✅', color: 'from-green-500 to-green-600' },
        { title: 'Pending Payments', value: stats.payments?.pending || 0, icon: '💳', color: 'from-orange-500 to-orange-600' }
      ];
    } else {
      return [
        { title: 'Total Users', value: stats.users?.total || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
        { title: 'Active Users', value: stats.users?.active || 0, icon: '✅', color: 'from-green-500 to-green-600' },
        { title: 'Total Applications', value: stats.applications?.total || 0, icon: '📋', color: 'from-purple-500 to-purple-600' },
        { title: 'Pending Payments', value: stats.payments?.pending || 0, icon: '💳', color: 'from-orange-500 to-orange-600' }
      ];
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };



  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={fetchDashboardData} icon="🔄">
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/reports'} icon="📊">
              View Reports
            </Button>
          </div>
        </div>
        <div className="w-full lg:w-80">
          <RealTimeWidget />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatCards().map((stat, index) => (
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
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent activities</div>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {formatTimeAgo(activity.time)}</p>
                    {activity.details && <p className="text-xs text-gray-400">{activity.details}</p>}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${activity.color?.replace('text-', 'bg-') || 'bg-blue-500'}`}></div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="System Status" icon="⚙️" className="h-fit">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading status...</div>
            ) : (
              systemStatus.map((system, index) => (
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
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Professional Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProfessionalChart 
          type="applications" 
          title="📊 Application Analytics" 
          period="30d" 
          chartType="line"
        />
        {(user.role === 'admin' || user.role === 'manager') && (
          <ProfessionalChart 
            type="users" 
            title="👥 User Growth Analytics" 
            period="30d" 
            chartType="bar"
          />
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Performance Overview" icon="🏆" className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {((stats.applications?.approved || 0) / Math.max(stats.applications?.total || 1, 1) * 100).toFixed(0)}%
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Success Rate</p>
                  <p className="text-sm text-gray-600">Applications approved</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {((stats.payments?.completed || 0) / Math.max(stats.payments?.total || 1, 1) * 100).toFixed(0)}%
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Payment Rate</p>
                  <p className="text-sm text-gray-600">Payments completed</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Status Distribution" icon="📊" className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <div className="space-y-3">
            {stats.applications && Object.entries(stats.applications).map(([key, value]) => {
              const total = stats.applications.total || 1;
              const percentage = ((value / total) * 100).toFixed(1);
              const colors = {
                total: 'bg-blue-500',
                pending: 'bg-yellow-500',
                approved: 'bg-green-500',
                rejected: 'bg-red-500'
              };
              
              return key !== 'total' && (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${colors[key]}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-sm font-bold">{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[key]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Quick Insights" icon="⚡" className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
          <div className="space-y-4">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.applications?.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.payments?.completed || 0}
              </div>
              <div className="text-sm text-gray-600">Completed Payments</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {stats.applications?.pending || 0}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}