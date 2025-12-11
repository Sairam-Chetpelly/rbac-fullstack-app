import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';

const Sidebar = ({ isCollapsed, isMobile, onToggle }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState({});

  const getMenuGroups = () => {
    if (user?.role === 'employee') {
      return [
        { name: 'Dashboard', href: '/dashboard', permission: 'dashboard', icon: '🏠' },
        { name: 'Reports', href: '/reports', permission: 'dashboard', icon: '📊' },
        { name: 'Applications', href: '/applications', permission: 'applications', icon: '📋' },
        { name: 'Payments', href: '/payments', permission: 'payments', icon: '💳' }
      ];
    }
    
    return [
      { name: 'Dashboard', href: '/dashboard', permission: 'dashboard', icon: '🏠' },
      { name: 'Applications', href: '/applications', permission: 'applications', icon: '📋' },
      { name: 'Payments', href: '/payments', permission: 'payments', icon: '💳' },
      {
        name: 'User Management',
        icon: '👥',
        children: [
          { name: 'Users', href: '/users', permission: 'users', icon: '👤' },
          { name: 'Roles', href: '/roles', permission: 'roles', icon: '🔐' }
        ]
      },
      { name: 'Reports', href: '/reports', permission: 'dashboard', icon: '📊' },
      {
        name: 'System Configuration',
        icon: '⚙️',
        children: [
          { name: 'Continents', href: '/continents', permission: 'continents', icon: '🌍' },
          { name: 'Countries', href: '/countries', permission: 'countries', icon: '🏳️' },
          { name: 'Visa Types', href: '/visa-types', permission: 'visa-types', icon: '📋' },
          { name: 'Country Visas', href: '/country-visa-types', permission: 'country-visa-types', icon: '🎫' },
          { name: 'Country Terms', href: '/country-terms-conditions', permission: 'country-terms-conditions', icon: '📜' },
          { name: 'Visa Terms', href: '/visa-terms-conditions', permission: 'visa-terms-conditions', icon: '📃' },
          { name: 'Form Builder', href: '/form-builder', permission: 'form-sections', icon: '🏗️' },
          { name: 'Form Sections', href: '/form-sections', permission: 'form-sections', icon: '📑' },
          { name: 'Form Fields', href: '/form-fields', permission: 'form-fields', icon: '📄' },
          { name: 'Status', href: '/status', permission: 'status', icon: '⚡' },
          { name: 'Notifications', href: '/notification-settings', permission: 'settings', icon: '🔔' }
        ]
      },
    ];
  };
  
  const menuGroups = getMenuGroups();

  const toggleGroup = (groupName) => {
    if (isCollapsed) {
      // When collapsed, expand sidebar first
      onToggle();
      setTimeout(() => {
        setExpandedGroups({ [groupName]: true });
      }, 100);
    } else {
      setExpandedGroups(prev => {
        const newState = {};
        // Close all other groups
        Object.keys(prev).forEach(key => {
          newState[key] = false;
        });
        // Toggle the clicked group
        newState[groupName] = !prev[groupName];
        return newState;
      });
    }
  };

  const isGroupExpanded = (groupName) => expandedGroups[groupName];

  const hasAccessToGroup = (group) => {
    if (group.children) {
      return group.children.some(child => canAccess(user?.role, child.permission));
    }
    return canAccess(user?.role, group.permission);
  };

  const visibleGroups = menuGroups.filter(hasAccessToGroup);

  // Auto-expand group containing current page on mount/route change
  useEffect(() => {
    const currentGroup = menuGroups.find(group => 
      group.children?.some(child => router.pathname === child.href)
    );
    if (currentGroup) {
      setExpandedGroups({ [currentGroup.name]: true });
    }
  }, [router.pathname]);

  return (
    <div className={`bg-white/10 backdrop-blur-md border-r border-white/10 h-screen transition-all duration-300 fixed left-0 top-0 z-40 flex flex-col ${
      isMobile 
        ? (isCollapsed ? '-translate-x-full w-72' : 'translate-x-0 w-72')
        : (isCollapsed ? 'w-20' : 'w-72')
    }`} style={{ boxShadow: "0 2px 2px 2px rgba(255, 255, 255, 0.3)" }}>
      <div className="p-3 sm:p-4 lg:p-6 flex-shrink-0 pt-20 sm:pt-24">
        <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
          {!isCollapsed && (
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
            onClick={onToggle}
            className="p-3 rounded-2xl bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 transition-all duration-200 hover:scale-110 active:scale-95 text-orange-600 shadow-md"
          >
            <span className="text-xl">{isCollapsed ? '☰' : '✕'}</span>
          </button>
        </div>
      </div>
      
      <nav className="space-y-1 flex-1 overflow-y-auto sidebar-scroll px-3 sm:px-4 lg:px-6">
          {visibleGroups.map((group) => {
            if (group.children) {
              const isExpanded = isGroupExpanded(group.name);
              const hasActiveChild = group.children.some(child => router.pathname === child.href);
              return (
                <div key={group.name} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      hasActiveChild || isExpanded
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-l-4 border-orange-700 shadow-lg'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                    title={isCollapsed ? group.name : ''}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{group.icon}</span>
                      {!isCollapsed && <span className="truncate font-medium">{group.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                  {!isCollapsed && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1 pl-4">
                      {group.children.filter(child => canAccess(user?.role, child.permission)).map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            router.pathname === child.href
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                              : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          <span className="text-base">{child.icon}</span>
                          <span className="truncate">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <Link
                  key={group.name}
                  href={group.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
                    router.pathname === group.href
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-l-4 border-orange-700 shadow-lg'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? group.name : ''}
                >
                  <span className="text-lg">{group.icon}</span>
                  {!isCollapsed && <span className="truncate font-medium">{group.name}</span>}
                </Link>
              );
            }
          })}
      </nav>
      
      {!isCollapsed && (
        <div className="mt-2 mb-2 p-4 rounded-2xl border border-orange-200/50 shadow-lg flex-shrink-0 mx-3 sm:mx-4 lg:mx-6">
          <div className="text-center">
            <Link href="/" className="flex items-center">
              <img src="/optionslogo.png" alt="Logo" className="w-20 h-20 mx-auto mb-2 hover:scale-105 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;