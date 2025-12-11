import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User, FileText, CreditCard, HelpCircle, List, LogOut, LayoutDashboard } from 'lucide-react';

const CustomerLayout = ({ children }) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);
  const sidebarWidth = sidebarCollapsed ? '80px' : '288px';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'My Applications', href: '/customer/applications', icon: FileText },
    { id: 'drafts', label: 'Draft Applications', href: '/customer/drafts', icon: List },
    { id: 'payments', label: 'Payment History', href: '/customer/payments', icon: CreditCard },
    { id: 'profile', label: 'My Profile', href: '/customer/profile', icon: User },
    { id: 'help', label: 'Help Center', href: '/customer/help', icon: HelpCircle },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (href) => {
    return router.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {!sidebarCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`bg-white/10 backdrop-blur-md border-r border-white/10 h-screen transition-all duration-300 fixed left-0 top-0 z-40 flex flex-col ${
        isMobile 
          ? (sidebarCollapsed ? '-translate-x-full w-72' : 'translate-x-0 w-72')
          : (sidebarCollapsed ? 'w-20' : 'w-72')
      }`} style={{ boxShadow: "0 2px 2px 2px rgba(255, 255, 255, 0.3)" }}>
        <div className="p-3 sm:p-4 lg:p-6 flex-shrink-0 pt-20 sm:pt-24">
          <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 mr-2 p-3 rounded-2xl border border-orange-200/50">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{user?.name}</p>
                  <p className="text-orange-600 text-xs capitalize font-medium">{user?.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-3 rounded-2xl bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 transition-all duration-200 hover:scale-110 active:scale-95 text-orange-600 shadow-md"
            >
              <span className="text-xl">{sidebarCollapsed ? '☰' : '✕'}</span>
            </button>
          </div>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto sidebar-scroll px-3 sm:px-4 lg:px-6">
          {menuItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-l-4 border-orange-700'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate font-medium">{item.label}</span>}
              </button>
            </Link>
          ))}
        </nav>
        
        {!sidebarCollapsed && (
          <div className="mt-2 mb-2 p-4  rounded-2xl border border-orange-200/50 shadow-lg flex-shrink-0 mx-3 sm:mx-4 lg:mx-6">
            <div className="text-center">
              <Link href="/" className="flex items-center">
                <img src="/optionslogo.png" alt="Logo" className="w-20 h-20 mx-auto mb-2 hover:scale-105 transition-transform duration-200" />
              </Link>
              {/* <p className="text-xs text-orange-600 font-medium">One World Visa</p> */}
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <header 
        className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg fixed top-0 right-0 z-40 transition-all duration-300"
        style={{ left: isMobile ? '0' : sidebarWidth, boxShadow: "0 2px 2px 2px rgba(255, 255, 255, 0.3)" }}
      >
        <div className={`px-3 sm:px-4 lg:px-6 xl:px-8 transition-all duration-300 ${scrolled ? 'py-1' : 'py-2'}`}>
          <div className={`flex items-center relative transition-all duration-300 ${scrolled ? 'h-12 sm:h-14 lg:h-16' : 'h-16 sm:h-18 lg:h-20'}`}>
            {isMobile && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-110 active:scale-95 absolute left-0"
              >
                <span className="text-gray-600 text-xl">☰</span>
              </button>
            )}
            
            <div className="flex-1 flex justify-center">
              <img src="/optionslogo.png" alt="Logo" className={`transition-all duration-300 ${scrolled ? 'h-12' : 'h-20'}`} />
            </div>
            
            <div className="relative absolute right-0" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`profile-button flex items-center rounded-2xl bg-gradient-to-r transition-all duration-300 hover:scale-105 active:scale-95 border shadow-md ${scrolled ? 'gap-1 lg:gap-2 p-1 lg:p-2' : 'gap-2 lg:gap-3 p-2 lg:p-3'}`}
              >
                <div className={`bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white font-bold transition-all duration-300 ${scrolled ? 'w-6 h-6 lg:w-8 lg:h-8 text-xs lg:text-sm' : 'w-8 h-8 lg:w-10 lg:h-10 text-sm lg:text-base'}`}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className={`text-gray-800 font-semibold truncate max-w-24 sm:max-w-32 transition-all duration-300 ${scrolled ? 'text-xs lg:text-sm' : 'text-sm lg:text-base'}`}>{user?.name}</p>
                  <span className={`inline-block rounded-full font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm transition-all duration-300 ${scrolled ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
                    {user?.role}
                  </span>
                </div>
                <span className={`text-gray-600 transition-all duration-300 ${scrolled ? 'text-xs lg:text-sm' : 'text-sm lg:text-base'}`}>▼</span>
              </button>

              {showProfileMenu && (
                <div className="profile-menu absolute right-0 mt-2 w-48 lg:w-56 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 py-3 z-50">
                  <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm lg:text-base">{user?.name}</p>
                    <p className="text-sm lg:text-base text-gray-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/customer/profile');
                    }}
                    className="w-full text-left px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    👤 My Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/customer/change-password');
                    }}
                    className="w-full text-left px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    🔐 Change Password
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 lg:pb-20 px-4 sm:px-6 lg:px-8 xl:px-10 min-h-screen transition-all duration-300 relative z-10 bg-white rounded-tl-2xl shadow-sm border-t border-l border-gray-200"
        style={{ marginLeft: isMobile ? '0' : sidebarWidth }}
      >
        <div className="max-w-full mx-auto">
          <div className="w-full overflow-hidden space-y-6">
            {children}
          </div>
        </div>
      </main>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl" style={{ boxShadow: "0 2px 2px 2px rgba(255, 255, 255, 0.3)" }}>
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          title="Chat on WhatsApp"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto" style={{ marginLeft: isMobile ? '0' : sidebarWidth }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-3 text-center text-sm text-gray-500">
            © 2025 One World Visa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;