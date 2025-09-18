import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { canAccess } from '../../../lib/roles';
import api from '../../../lib/api';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function EditUser() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
  });

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
      const foundUser = response.data.find(u => u._id === id);
      if (foundUser) {
        setFormData({
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          status: foundUser.status
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const getRoleOptions = () => {
    if (user?.role === 'admin') return ['admin', 'manager', 'employee', 'customer'];
    if (user?.role === 'manager') return ['employee', 'customer'];
    if (user?.role === 'employee') return ['customer'];
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/users/${id}`, formData);
      router.push(`/users/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
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

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
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
          onClick={() => router.push(`/users/${id}`)}
          icon="←"
        >
          Back to User
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">✏️ Edit User</h1>
          <p className="text-gray-600">Update user information</p>
        </div>
      </div>

      <Card title="Edit User Information" icon="✏️">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🛡️ Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                disabled={!getRoleOptions().includes(formData.role) && user.role !== 'admin'}
              >
                {getRoleOptions().map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚡ Status
              </label>
              <div className="flex flex-col gap-2">
                {['active', 'inactive', 'pending'].map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status === 'active' ? 'bg-green-500' :
                        status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="submit" 
              disabled={loading}
              icon="💾"
              className="flex-1"
            >
              {loading ? 'Updating User...' : 'Update User'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/users/${id}`)}
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