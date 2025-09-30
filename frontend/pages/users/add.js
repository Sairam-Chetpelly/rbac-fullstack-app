import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { canAccess } from '../../lib/roles';
import api from '../../lib/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

export default function AddUser() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    if (!user || !['admin', 'manager', 'employee'].includes(user.role)) {
      router.push('/users');
      return;
    }
    fetchRolesAndStatuses();
  }, [user]);

  const fetchRolesAndStatuses = async () => {
    try {
      const [rolesRes, statusesRes] = await Promise.all([
        api.get('/roles'),
        api.get('/status')
      ]);
      setRoles(rolesRes.data);
      setStatuses(statusesRes.data);
      
      // Set default values
      const customerRole = rolesRes.data.find(r => r.name === 'customer');
      const activeStatus = statusesRes.data.find(s => s.name === 'active');
      if (customerRole && activeStatus) {
        setFormData(prev => ({
          ...prev,
          role: customerRole._id,
          status: activeStatus._id
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch roles and statuses');
    }
  };

  const getRoleOptions = () => {
    const allowedRoles = {
      admin: ['admin', 'manager', 'employee', 'customer'],
      manager: ['employee', 'customer'],
      employee: ['customer']
    };
    const allowed = allowedRoles[user?.role] || [];
    return roles.filter(role => allowed.includes(role.name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/users', formData);
      toast.success('User created successfully!');
      setTimeout(() => router.push('/users'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/users')}
          icon="←"
          className="w-full sm:w-auto"
        >
          Back to Users
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">➕ Add New User</h1>
          <p className="text-sm sm:text-base text-gray-600">Create a new user account</p>
        </div>
      </div>

      <Card title="User Information" icon="👤">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                placeholder="Enter password"
                required
              />
            </div>

            <div>
              <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                🛡️ Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
              >
                <option value="">Select Role</option>
                {getRoleOptions().map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-3">
                ⚡ Status
              </label>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                {statuses.map(status => (
                  <label key={status._id} className="flex items-center gap-3 p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="status"
                      value={status._id}
                      checked={formData.status === status._id}
                      onChange={handleChange}
                      className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm lg:text-base font-medium text-gray-700 capitalize">
                      {status.name}
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
              {loading ? 'Creating User...' : 'Create User'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/users')}
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