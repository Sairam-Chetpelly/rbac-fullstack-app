import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../lib/auth';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-4xl font-bold text-white mb-2">RBAC Admin</h1>
          <p className="text-blue-200">Secure Role-Based Access Control</p>
        </div>
        
        <Card title="Welcome Back" icon="🔐" className="backdrop-blur-xl bg-white/10 border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 backdrop-blur-sm transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 backdrop-blur-sm transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="lg">
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30">
            <p className="text-blue-100 text-sm font-medium mb-1">👤 Demo Account:</p>
            <p className="text-white text-sm">admin@example.com / admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
}