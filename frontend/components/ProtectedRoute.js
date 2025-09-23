import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Public pages that don't require authentication
  const publicPages = ['/', '/home', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, loading, router, isPublicPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && !isPublicPage) {
    return null;
  }

  return children;
};

export default ProtectedRoute;