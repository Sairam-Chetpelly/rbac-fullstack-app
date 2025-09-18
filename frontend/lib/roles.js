export const rolePermissions = {
  admin: ['dashboard', 'roles', 'users', 'status', 'settings'],
  manager: ['dashboard', 'roles:view', 'users', 'status'],
  employee: ['users:customers'],
  customer: ['dashboard']
};

export const hasPermission = (userRole, permission) => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

export const canAccess = (userRole, page) => {
  const permissions = rolePermissions[userRole] || [];
  
  switch (page) {
    case 'dashboard':
      return permissions.includes('dashboard');
    case 'roles':
      return permissions.includes('roles') || permissions.includes('roles:view');
    case 'users':
      return permissions.includes('users') || permissions.includes('users:customers');
    case 'status':
      return permissions.includes('status');
    case 'settings':
      return permissions.includes('settings');
    default:
      return false;
  }
};