import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import PublicLayout from '../components/PublicLayout';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // Pages that should use public layout (no admin sidebar/header)
  const publicPages = [
    '/', '/home', '/login', '/register', '/forgot-password', '/reset-password',
    '/application-success'
  ];
  
  // Check if current page is a visa-related public page
  const isVisaPage = router.pathname.startsWith('/visa-types/') || 
                    router.pathname.startsWith('/visa-application/');
  
  const isPublicPage = publicPages.includes(router.pathname) || isVisaPage;
  
  // Use custom layout if component has one, otherwise use default layouts
  if (Component.getLayout) {
    return (
      <AuthProvider>
        {Component.getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    );
  }
  
  return (
    <AuthProvider>
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </AuthProvider>
  );
}