import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, User, FileText, CreditCard, Bell, HelpCircle, List, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

const CustomerLayout = ({ children }) => {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

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
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b' : 'bg-white/90 backdrop-blur-sm shadow-sm border-b'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex items-center">
                <img src="/optionslogo.png" alt="Logo" className="h-20 sm:h-20 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link href="/customer/profile">
                <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)] sm:h-[calc(100vh-81px)]">
        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
        )}
        
        {/* Sidebar */}
        <div className={`${
          showMobileMenu ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'
        } lg:block lg:relative lg:w-80 xl:w-96 bg-white border-r border-gray-200 flex flex-col`}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6 lg:block">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Navigation</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 sm:p-6 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="bg-white rounded-lg shadow-sm border min-h-full">
                <div className="p-4 sm:p-6 lg:p-8">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;