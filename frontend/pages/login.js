import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../lib/auth';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginApi(email, password);
      login(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Illustration and Content - Hidden on mobile */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Logo */}
        <div className="mb-8 relative z-10">
          <div className="text-8xl mb-4 transform hover:scale-110 transition-transform duration-300">🛡️</div>
        </div>

        {/* Main Image/Icon */}
        <div className="mb-8 relative z-10">
          <div className="w-64 h-64 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl">🔐</div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center max-w-md relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Professional & Secure</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            "Advanced Role-Based Access Control for Modern Applications"
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
        {/* Tab Header */}
        <div className="flex border-b w-full max-w-md mb-8">
          <button
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 hover:scale-105 ${
              activeTab === 'login' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className="flex-1 py-4 px-6 text-center text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-105"
            onClick={() => window.location.href = '/register'}
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
                  <h4 className="font-semibold">Login Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md focus:scale-105"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md focus:scale-105"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {loading ? "Signing In..." : "Login"}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => window.location.href = '/forgot-password'}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:scale-105 transition-transform"
              >
                Forgot password?
              </button>
            </div>
            
            {/* Demo Account Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm font-medium mb-1">👤 Demo Account:</p>
              <p className="text-blue-700 text-sm">admin@example.com / admin123</p>
            </div>
            
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