import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';

const Sidebar = ({ isCollapsed, isMobile, onToggle }) => {
  const { user } = useAuth();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', permission: 'dashboard', icon: '📊' },
    { name: 'Roles', href: '/roles', permission: 'roles', icon: '🛡️' },
    { name: 'Users', href: '/users', permission: 'users', icon: '👥' },
    { name: 'Status', href: '/status', permission: 'status', icon: '⚙️' },
    { name: 'Settings', href: '/settings', permission: 'settings', icon: '🔧' }
  ];

  const visibleItems = menuItems.filter(item => 
    canAccess(user?.role, item.permission.split(':')[0])
  );

  return (
    <div className={`bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen shadow-2xl transition-all duration-300 fixed left-0 top-0 z-30 ${
      isMobile 
        ? (isCollapsed ? '-translate-x-full w-72' : 'translate-x-0 w-72')
        : (isCollapsed ? 'w-20' : 'w-72')
    }`}>
      <div className="p-3 lg:p-6">
        <div className="flex justify-between items-center mb-4 lg:mb-8">
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-3 lg:p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg lg:text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-white text-sm lg:text-base">{user?.name}</p>
                <p className="text-gray-300 text-xs lg:text-sm capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 lg:p-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <span className="text-xl lg:text-2xl">{isCollapsed ? '☰' : '✕'}</span>
          </button>
        </div>
        
        <nav className="space-y-2 lg:space-y-3">
          {visibleItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 lg:gap-4 px-3 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                router.pathname === item.href
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-lg'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : ''}
            >
              <span className="text-lg lg:text-xl">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>
        
        {!isCollapsed && (
          <div className="mt-8 lg:mt-12 p-4 lg:p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl mb-2">🛡️</div>
              <p className="text-white font-semibold text-sm lg:text-base">RBAC System</p>
              <p className="text-gray-400 text-xs lg:text-sm">Secure Access Control</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;