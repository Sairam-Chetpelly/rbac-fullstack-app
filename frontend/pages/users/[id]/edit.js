import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { canAccess } from '../../../lib/roles';
import api from '../../../lib/api';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';

export default function EditUser() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
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
      const [userRes, rolesRes, statusesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/status')
      ]);
      
      setRoles(rolesRes.data);
      setStatuses(statusesRes.data);
      
      const users = userRes.data.data || userRes.data;
      const foundUser = users.find(u => u._id === id);
      if (foundUser) {
        setFormData({
          name: foundUser.name,
          email: foundUser.email,
          mobile: foundUser.mobile || '',
          role: foundUser.role?._id || foundUser.role,
          status: foundUser.status?._id || foundUser.status
        });
      }
    } catch (error) {
      toast.error('Failed to fetch user');
    } finally {
      setFetchLoading(false);
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    if (!mobile) return true; // Optional field
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validateMobile(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      await api.put(`/users/${id}`, formData);
      toast.success('User updated successfully!');
      setTimeout(() => router.push(`/users/${id}`), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
                📱 Phone Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="Enter 10-digit phone number"
                pattern="\d{10}"
                maxLength="10"
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
                required
              >
                <option disabled value="">Select Role</option>
                {getRoleOptions().map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚡ Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                required
              >
                <option disabled value="">Select Status</option>
                {/* {statuses.map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                  </option>
                ))} */}
                {statuses.filter(status => status.category === "System").map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                  </option>
                ))}
              </select>
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