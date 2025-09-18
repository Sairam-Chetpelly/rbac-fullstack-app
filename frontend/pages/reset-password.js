import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../lib/api';

export default function ResetPassword() {
  const router = useRouter();
  const { user } = useAuth();
  const { token } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        password: formData.password
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
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

  if (user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Illustration */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="mb-8 relative z-10">
          <div className="text-8xl mb-4">🔑</div>
        </div>

        <div className="mb-8 relative z-10">
          <div className="w-64 h-64 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl">🔒</div>
          </div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">New Password</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            "Create a strong new password for your account"
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
        <div className="flex border-b w-full max-w-md mb-8">
          {/* <button
            className="flex-1 py-4 px-6 text-center text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button
            className="flex-1 py-4 px-6 text-center text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/register')}
          >
            Sign Up
          </button> */}
          <button className="flex-1 py-4 px-6 text-center font-semibold bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500">
            Reset
          </button>
        </div>

        <div className="w-full max-w-md">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <div>
                  <h4 className="font-semibold">Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <div>
                  <h4 className="font-semibold">Success</h4>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:scale-105 focus:scale-105"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:scale-105 focus:scale-105"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:scale-105 focus:scale-105 active:scale-95"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-indigo-600 hover:text-indigo-700 font-medium hover:scale-105 transition-transform"
              >
                Back to Login
              </button>
            </div>
            
            <div className="md:hidden mt-12 text-center">
              <div className="text-4xl mb-2">🔑</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">RBAC Admin</h3>
              <p className="text-sm text-gray-600">Advanced Role-Based Access Control</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}