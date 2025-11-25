import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

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
    return <LoadingSpinner size="lg" fullScreen />;
  }

  if (!user && !isPublicPage) {
    return null;
  }

  return children;
};

export default ProtectedRoute;