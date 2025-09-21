import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import PublicLayout from '../components/PublicLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import VisaLayout from '../components/VisaLayout';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // Pages that don't require authentication
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  // Pages that don't use Layout (home, customer, and 404 pages)
  const noLayoutPages = ['/', '/home', '/404'];
  const isVisaPage = router.pathname.startsWith('/visa-types/') || 
                    router.pathname.startsWith('/visa-application/') ||
                    router.pathname === '/application-success';
  const isCustomerPage = router.pathname.startsWith('/customer/');
  const isNoLayoutPage = noLayoutPages.includes(router.pathname) || isCustomerPage;
  
  const isPublicPage = publicPages.includes(router.pathname);
  
  // Use custom layout if component has one, otherwise use default layouts
  if (Component.getLayout) {
    return (
      <AuthProvider>
        <ProtectedRoute>
          {Component.getLayout(<Component {...pageProps} />)}
        </ProtectedRoute>
      </AuthProvider>
    );
  }
  
  return (
    <AuthProvider>
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          {isNoLayoutPage ? (
            <Component {...pageProps} />
          ) : isVisaPage ? (
            <VisaLayout>
              <Component {...pageProps} />
            </VisaLayout>
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}