import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { canAccess } from '../../lib/roles';
import api from '../../lib/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ViewUser() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !canAccess(user.role, 'users')) {
      router.push('/users');
      return;
    }
    if (id) {
      fetchUser();
    }
  }, [user, id]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users');
      const users = response.data.data || response.data;
      const foundUser = users.find(u => u._id === id);
      setUserData(foundUser);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const roleName = role?.name || role || '';
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      employee: 'bg-green-100 text-green-800 border-green-200',
      customer: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status) => {
    const statusName = status?.name || status || '';
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[statusName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">User not found</h3>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/users')}>
              Back to Users
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
          onClick={() => router.push('/users')}
          icon="←"
        >
          Back to Users
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">👁️ User Details</h1>
          <p className="text-gray-600">View user information</p>
        </div>
      </div>

      <Card>
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{userData.name}</h2>
              <p className="text-gray-600 text-lg">{userData.email}</p>
              {userData.mobile && (
                <p className="text-gray-600">📱 {userData.mobile}</p>
              )}
              <div className="flex gap-3 mt-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRoleColor(userData.role)}`}>
                  🛡️ {(userData.role?.name || userData.role || '').toUpperCase()}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(userData.status)}`}>
                  ⚡ {(userData.status?.name || userData.status || '').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">User ID</label>
                <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                  {userData._id}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Created At</label>
                <p className="text-gray-900">
                  {new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(userData.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Account Status</label>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: userData.status?.color || '#6B7280' }}></div>
                  <span className="text-gray-900 capitalize">{userData.status?.name || userData.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button 
              onClick={() => router.push(`/users/${userData._id}/edit`)}
              icon="✏️"
              className="flex-1"
            >
              Edit User
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/users')}
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