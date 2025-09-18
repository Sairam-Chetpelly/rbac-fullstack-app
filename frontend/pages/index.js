import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    </div>
  );
}