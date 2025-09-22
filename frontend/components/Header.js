import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Header = ({ sidebarWidth, isMobile, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  return (
    <header 
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl fixed top-0 right-0 z-40"
      style={{ left: isMobile ? '0' : sidebarWidth }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <span className="text-white text-xl">☰</span>
              </button>
            )}
            
            <img src="/optionslogo.png" alt="Logo" className="" />

          </div>
          
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="profile-button flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white text-sm lg:text-base font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white font-semibold text-sm lg:text-base truncate max-w-32">{user?.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <span className="text-white text-sm lg:text-base">▼</span>
            </button>

            {showProfileMenu && (
              <div className="profile-menu absolute right-0 mt-2 w-48 lg:w-56 bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-100 py-2 lg:py-3 z-50">
                <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm lg:text-base">{user?.name}</p>
                  <p className="text-sm lg:text-base text-gray-600">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    window.location.href = '/profile';
                  }}
                  className="w-full text-left px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  👤 Profile
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