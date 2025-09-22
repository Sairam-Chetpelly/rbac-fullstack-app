import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, User, FileText, CreditCard, Bell, HelpCircle, List, LogOut, Menu, X } from 'lucide-react';

const CustomerLayout = ({ children }) => {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/customer/dashboard', icon: User },
    { id: 'applications', label: 'My Applications', href: '/customer/applications', icon: FileText },
    { id: 'profile', label: 'My Profile', href: '/customer/profile', icon: User },
    { id: 'payments', label: 'Payment History', href: '/customer/payments', icon: CreditCard },
    { id: 'drafts', label: 'Draft Applications', href: '/customer/drafts', icon: List },
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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-b' : 'bg-white/60 backdrop-blur-sm shadow-sm border-b'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Home
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <Link href="/customer/dashboard" className="flex items-center gap-2">
                <img src="/optionslogo.png" alt="Logo" className="w-100" />
                {/* <h1 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">Customer Portal</h1> */}
              </Link>
            </div>
            <Link href="/customer/profile">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all text-sm">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
        >
          <Menu className="w-4 h-4" />
          Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {showMobileMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
          )}
          
          <div className={`${
            showMobileMenu ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'
          } lg:block lg:relative lg:w-80 bg-white rounded-lg shadow-sm border p-6`}>
            <div className="flex justify-between items-center mb-6 lg:block">
              <h2 className="text-xl font-semibold">Navigation</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;