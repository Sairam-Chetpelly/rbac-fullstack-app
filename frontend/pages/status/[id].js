import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { canAccess } from '../../lib/roles';
import api from '../../lib/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ViewStatus() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !canAccess(user.role, 'status')) {
      router.push('/status');
      return;
    }
    if (id) {
      fetchStatus();
    }
  }, [user, id]);

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/status/${id}`);
      setStatusData(response.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusName) => {
    const icons = {
      active: '✅',
      inactive: '❌',
      pending: '⏳'
    };
    return icons[statusName] || '⚡';
  };

  const getStatusColor = (color) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading status details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Status not found</h3>
            <p className="text-gray-600 mb-4">The status you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/status')}>
              Back to Status
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/status')}
          icon="←"
        >
          Back to Status
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">👁️ Status Details</h1>
          <p className="text-gray-600">View status information</p>
        </div>
      </div>

      <Card>
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 bg-gradient-to-r ${getStatusColor(statusData.color)} rounded-3xl flex items-center justify-center text-white text-4xl shadow-lg`}>
              {getStatusIcon(statusData.name)}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{statusData.name}</h2>
              <p className="text-gray-600 text-lg">{statusData.description}</p>
              <div className="flex gap-3 mt-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 bg-${statusData.color}-100 text-${statusData.color}-800`}>
                  <div className={`w-3 h-3 rounded-full bg-${statusData.color}-500`}></div>
                  {statusData.color.toUpperCase()}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  statusData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {statusData.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Status ID</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                {statusData._id}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">
                {new Date(statusData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            {user.role === 'admin' && (
              <Button 
                onClick={() => router.push(`/status/${statusData._id}/edit`)}
                icon="✏️"
                className="flex-1"
              >
                Edit Status
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => router.push('/status')}
              className="flex-1"
              icon="📋"
            >
              Back to List
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}