import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AddRole() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const availablePermissions = [
    'dashboard', 'roles', 'roles:view', 'users', 'users:customers', 'status', 'settings'
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/roles');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/roles', formData);
      router.push('/roles');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePermissionChange = (permission) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({
      ...formData,
      permissions: updatedPermissions
    });
  };

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
          <h1 className="text-4xl font-bold text-gray-900">➕ Add New Role</h1>
          <p className="text-gray-600">Create a new system role</p>
        </div>
      </div>

      <Card title="Role Information" icon="🛡️">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Role Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Enter role name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Enter role description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              🔐 Permissions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePermissions.map(permission => (
                <label key={permission} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {permission.replace(':', ' - ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="submit" 
              disabled={loading}
              icon="💾"
              className="flex-1"
            >
              {loading ? 'Creating Role...' : 'Create Role'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/roles')}
              className="flex-1"
              icon="❌"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}