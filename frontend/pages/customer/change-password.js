import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lock } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/Button';
import CustomerLayout from '../../components/CustomerLayout';
import toast from 'react-hot-toast';

export default function CustomerChangePassword() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'customer') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
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

  if (!user) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">Password Security</h3>
              <p className="text-gray-600">Update your account password</p>
              <p className="text-sm text-gray-500">Keep your account secure with a strong password</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white"
                  placeholder="Enter your current password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white"
                  placeholder="Confirm your new password"
                  required
                />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-yellow-800">Security Tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use at least 6 characters</li>
                <li>• Include letters, numbers, and symbols</li>
                <li>• Don't use personal information</li>
                <li>• Keep your password secure</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => router.push('/customer/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
}