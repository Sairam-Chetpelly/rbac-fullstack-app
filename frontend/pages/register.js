import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../lib/api';

export default function Register() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    nationality: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.mobile.trim() === '') {
      setError('Please enter a valid mobile number');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        nationality: formData.nationality || 'Not Specified'
      });

      alert('Registration successful! Please login to continue.');
      router.push('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
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
      {/* Left Side - Illustration and Content - Hidden on mobile */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Logo */}
        <div className="mb-8 relative z-10">
          <div className="text-8xl mb-4">🛡️</div>
        </div>

        {/* Main Image/Icon */}
        <div className="mb-8 relative z-10">
          <div className="w-64 h-64 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl">📝</div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center max-w-md relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Platform</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            "Create your account and get started with secure access control"
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
        {/* Tab Header */}
        <div className="flex border-b w-full max-w-md mb-8">
          <button
            className="flex-1 py-4 px-6 text-center text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
              activeTab === 'signup' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="w-full max-w-md">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <div>
                  <h4 className="font-semibold">Registration Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="nationality"
                placeholder="Nationality (Optional)"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re Enter Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
            
            {/* Mobile Logo */}
            <div className="md:hidden mt-12 text-center">
              <div className="text-4xl mb-2">🛡️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">RBAC Admin</h3>
              <p className="text-sm text-gray-600">Advanced Role-Based Access Control</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}