import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { canAccess } from '../../lib/roles';
import api from '../../lib/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ViewRole() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !canAccess(user.role, 'roles')) {
      router.push('/roles');
      return;
    }
    if (id) {
      fetchRole();
    }
  }, [user, id]);

  const fetchRole = async () => {
    try {
      const response = await api.get('/roles');
      const foundRole = response.data.find(r => r._id === id);
      setRoleData(foundRole);
    } catch (error) {
      console.error('Failed to fetch role:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleName) => {
    const icons = {
      admin: '👑',
      manager: '👨💼',
      employee: '👷',
      customer: '👤'
    };
    return icons[roleName] || '🛡️';
  };

  const getRoleColor = (roleName) => {
    const colors = {
      admin: 'from-red-500 to-red-600',
      manager: 'from-blue-500 to-blue-600',
      employee: 'from-green-500 to-green-600',
      customer: 'from-purple-500 to-purple-600'
    };
    return colors[roleName] || 'from-gray-500 to-gray-600';
  };

  const getPermissionIcon = (permission) => {
    const icons = {
      dashboard: '📊',
      roles: '🛡️',
      'roles:view': '👁️',
      users: '👥',
      'users:customers': '👤',
      status: '⚡',
      settings: '⚙️'
    };
    return icons[permission] || '🔹';
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading role details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Role not found</h3>
            <p className="text-gray-600 mb-4">The role you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/roles')}>
              Back to Roles
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/roles')}
          icon="←"
        >
          Back to Roles
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">👁️ Role Details</h1>
          <p className="text-gray-600">View role information</p>
        </div>
      </div>

      <Card>
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 bg-gradient-to-r ${getRoleColor(roleData.name)} rounded-3xl flex items-center justify-center text-white text-4xl shadow-lg`}>
              {getRoleIcon(roleData.name)}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{roleData.name}</h2>
              <p className="text-gray-600 text-lg">{roleData.description}</p>
              <div className="flex gap-3 mt-4">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  🔐 {roleData.permissions.length} Permissions
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  roleData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {roleData.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">🔐 Permissions</h3>
            <div className="grid grid-cols-1 gap-3">
              {roleData.permissions.map((permission, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">{getPermissionIcon(permission)}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {permission.replace(':', ' - ').replace('users:customers', 'users (customers only)')}
                    </span>
                    {permission.includes(':view') && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        View Only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Role ID</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                {roleData._id}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">
                {new Date(roleData.createdAt).toLocaleDateString('en-US', {
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
                onClick={() => router.push(`/roles/${roleData._id}/edit`)}
                icon="✏️"
                className="flex-1"
              >
                Edit Role
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => router.push('/roles')}
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