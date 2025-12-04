import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TokenExpirationWarning from './TokenExpirationWarning';

const Layout = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarWidth = sidebarCollapsed ? '80px' : '288px';
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-menu') && !event.target.closest('.profile-button')) {
        // Close any open dropdowns
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500 mx-auto mb-6"></div>
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return children;
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <TokenExpirationWarning />
      {/* Mobile overlay for sidebar */}
      {!sidebarCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        isMobile={isMobile}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Header sidebarWidth={sidebarWidth} isMobile={isMobile} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main 
        className="pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 lg:pb-20 px-4 sm:px-6 lg:px-8 xl:px-10 min-h-screen transition-all duration-300 relative z-10 bg-white rounded-tl-2xl shadow-sm border-t border-l border-gray-200"
        style={{ 
          marginLeft: isMobile ? '0' : sidebarWidth
        }}
      >
        <div className="max-w-full mx-auto">
          <div className="w-full overflow-hidden space-y-6">
            {children}
          </div>
        </div>
      </main>
      <Footer sidebarWidth={isMobile ? '0' : sidebarWidth} />
    </div>
  );
};

export default Layout;