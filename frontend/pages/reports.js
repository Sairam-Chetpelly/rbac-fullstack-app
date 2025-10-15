import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import DashboardChart from '../components/DashboardChart';
import ProfessionalChart from '../components/ProfessionalChart';

export default function Reports() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [period, setPeriod] = useState('30d');
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
    
    fetchReportData();
  }, [user, period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await api.get(`/dashboard/export?format=${format}&period=${period}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${period}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  if (!user || !canAccess(user.role, 'dashboard')) {
    return <div>Access denied</div>;
  }

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and data analysis</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => exportReport('csv')} icon="📄">
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('pdf')} icon="📋">
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'admin' || user.role === 'manager' ? (
          <>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.users?.total || 0}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.applications?.total || 0}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Approved Applications</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.applications?.approved || 0}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Payments</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.payments?.total || 0}</p>
                </div>
                <div className="text-4xl">💳</div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">My Applications</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.applications?.total || 0}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.applications?.pending || 0}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.applications?.approved || 0}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stats.applications?.rejected || 0}</p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Professional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProfessionalChart 
          type="applications" 
          title="📈 Application Trends Analysis" 
          period={period}
          chartType="line"
        />
        {(user.role === 'admin' || user.role === 'manager') && (
          <ProfessionalChart 
            type="users" 
            title="👥 User Registration Analytics" 
            period={period}
            chartType="bar"
          />
        )}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 gap-8">
        <Card title="Comprehensive Analytics Dashboard" icon="📊" className="bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfessionalChart 
              type="applications" 
              title="Application Status Flow" 
              period={period}
              chartType="bar"
            />
            {(user.role === 'admin' || user.role === 'manager') && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Approval Rate</span>
                    <span className="text-xl font-bold text-blue-600">
                      {stats.applications ? ((stats.applications.approved / Math.max(stats.applications.total, 1)) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Payment Success</span>
                    <span className="text-xl font-bold text-green-600">
                      {stats.payments ? ((stats.payments.completed / Math.max(stats.payments.total, 1)) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Processing Time</span>
                    <span className="text-xl font-bold text-yellow-600">2.3 days</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Application Status Breakdown" icon="📊">
          <div className="space-y-4">
            {stats.applications && Object.entries(stats.applications).map(([key, value]) => {
              const labels = {
                total: 'Total Applications',
                pending: 'Pending Review',
                approved: 'Approved',
                rejected: 'Rejected'
              };
              const colors = {
                total: 'bg-blue-500',
                pending: 'bg-yellow-500',
                approved: 'bg-green-500',
                rejected: 'bg-red-500'
              };
              
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colors[key]}`}></div>
                    <span className="font-medium text-gray-900">{labels[key]}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{value}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {(user.role === 'admin' || user.role === 'manager') && (
          <Card title="User Status Breakdown" icon="👥">
            <div className="space-y-4">
              {stats.users && Object.entries(stats.users).map(([key, value]) => {
                const labels = {
                  total: 'Total Users',
                  active: 'Active Users',
                  pending: 'Pending Approval',
                  inactive: 'Inactive Users'
                };
                const colors = {
                  total: 'bg-blue-500',
                  active: 'bg-green-500',
                  pending: 'bg-yellow-500',
                  inactive: 'bg-red-500'
                };
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${colors[key]}`}></div>
                      <span className="font-medium text-gray-900">{labels[key]}</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{value}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}