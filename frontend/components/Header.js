import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Header = ({ sidebarWidth, isMobile, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-green-100 text-green-800',
      customer: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg fixed top-0 right-0 z-40 transition-all duration-300"
      style={{ left: isMobile ? '0' : sidebarWidth, boxShadow: "0 2px 2px 2px rgba(255, 255, 255, 0.3)" }}
    >
      <div className={`px-3 sm:px-4 lg:px-6 xl:px-8 transition-all duration-300 ${scrolled ? 'py-1' : 'py-2'}`}>
        <div className={`flex items-center relative transition-all duration-300 ${scrolled ? 'h-12 sm:h-14 lg:h-16' : 'h-16 sm:h-18 lg:h-20'}`}>
          {/* Mobile menu button - Left */}
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-110 active:scale-95 absolute left-0"
            >
              <span className="text-gray-600 text-xl">☰</span>
            </button>
          )}
          
          {/* Logo - Center */}
          <div className="flex-1 flex justify-center">
            <img src="/optionslogo.png" alt="Logo" className={`transition-all duration-300 ${scrolled ? 'h-12' : 'h-20'}`} />
          </div>
          
          {/* Profile - Right */}
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
                <span className={`inline-block rounded-full font-medium transition-all duration-300 ${scrolled ? 'px-2 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'} ${getRoleColor(user?.role)}`}>
                  {user?.role?.toUpperCase()}
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
                    const profileUrl = user?.role === 'customer' ? '/customer/profile' : '/profile';
                    window.location.href = profileUrl;
                  }}
                  className="w-full text-left px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  👤 My Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    const changePasswordUrl = user?.role === 'customer' ? '/customer/change-password' : '/change-password';
                    window.location.href = changePasswordUrl;
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
  );
};

export default Header;