import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';

const Sidebar = ({ isCollapsed, isMobile, onToggle }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState({});

  const menuGroups = [
    { name: 'Dashboard', href: '/dashboard', permission: 'dashboard', icon: '🏠' },
    {
      name: 'User Management',
      icon: '👥',
      children: [
        { name: 'Users', href: '/users', permission: 'users', icon: '👤' },
        { name: 'Roles', href: '/roles', permission: 'roles', icon: '🔐' }
      ]
    },
    {
      name: 'Location Management',
      icon: '🗺️',
      children: [
        { name: 'Continents', href: '/continents', permission: 'continents', icon: '🌍' },
        { name: 'Countries', href: '/countries', permission: 'countries', icon: '🏳️' }
      ]
    },
    {
      name: 'Visa Management',
      icon: '📄',
      children: [
        { name: 'Visa Types', href: '/visa-types', permission: 'visa-types', icon: '📋' },
        { name: 'Country Visas', href: '/country-visa-types', permission: 'country-visa-types', icon: '🎫' },
        { name: 'Country Terms', href: '/country-terms-conditions', permission: 'country-terms-conditions', icon: '📜' },
        { name: 'Visa Terms', href: '/visa-terms-conditions', permission: 'visa-terms-conditions', icon: '📃' }
      ]
    },
    {
      name: 'Form Management',
      icon: '📝',
      children: [
        { name: 'Form Builder', href: '/form-builder', permission: 'form-sections', icon: '🏗️' },
        { name: 'Form Sections', href: '/form-sections', permission: 'form-sections', icon: '📑' },
        { name: 'Form Fields', href: '/form-fields', permission: 'form-fields', icon: '📄' }
      ]
    },
    { name: 'Applications', href: '/applications', permission: 'applications', icon: '📋' },
    { name: 'Payments', href: '/payments', permission: 'payments', icon: '💳' },
    { name: 'Status', href: '/status', permission: 'status', icon: '⚡' },
    { name: 'Settings', href: '/settings', permission: 'settings', icon: '⚙️' }
  ];

  const toggleGroup = (groupName) => {
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
        
        <nav className="space-y-1">
          {visibleGroups.map((group) => {
            if (group.children) {
              const isExpanded = isGroupExpanded(group.name);
              const hasActiveChild = group.children.some(child => router.pathname === child.href);
              return (
                <div key={group.name} className="mb-1">
                  <button
                    onClick={() => !isCollapsed && toggleGroup(group.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      hasActiveChild || isExpanded
                        ? 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-500'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
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
                    <div className="ml-8 mt-1 space-y-1  pl-4">
                      {group.children.filter(child => canAccess(user?.role, child.permission)).map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            router.pathname === child.href
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-l-4 border-blue-400'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
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
          <div className="mt-8 lg:mt-12 p-4 lg:p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-center">
              <img src="/optionslogo.png" alt="Logo" className="w-100 lg:w-100  mx-auto mb-2" />
              {/* <p className="text-white font-semibold text-sm lg:text-base">RBAC System</p>
              <p className="text-gray-400 text-xs lg:text-sm">Secure Access Control</p> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;