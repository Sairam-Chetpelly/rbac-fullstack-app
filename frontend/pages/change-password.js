import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import CustomerLayout from '../components/CustomerLayout';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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

  const getRedirectPath = () => {
    if (user?.role === 'customer') return '/customer/dashboard';
    return '/dashboard';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const content = (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push(getRedirectPath())}
          icon="←"
        >
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔐 Change Password</h1>
          <p className="text-gray-600">Update your account password</p>
        </div>
      </div>

      <Card title="Password Settings" icon="🔐">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔑 New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Enter new password (min 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✅ Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Confirm your new password"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-lg">⚠️</span>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">Security Tips</h3>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Use at least 6 characters</li>
                  <li>• Include letters, numbers, and symbols</li>
                  <li>• Don't use personal information</li>
                  <li>• Keep your password secure</li>
                </ul>
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
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(getRedirectPath())}
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

  if (user.role === 'customer') {
    return (
      <CustomerLayout>
        {content}
      </CustomerLayout>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {content}
    </div>
  );
}