export const rolePermissions = {
  admin: ['dashboard', 'roles', 'users', 'status', 'settings', 'continents', 'countries', 'visa-types', 'country-visa-types', 'country-terms-conditions', 'visa-terms-conditions', 'form-sections', 'form-fields'],
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
    case 'continents':
      return permissions.includes('continents');
    case 'countries':
      return permissions.includes('countries');
    case 'visa-types':
      return permissions.includes('visa-types');
    case 'country-visa-types':
      return permissions.includes('country-visa-types');
    case 'country-terms-conditions':
      return permissions.includes('country-terms-conditions');
    case 'visa-terms-conditions':
      return permissions.includes('visa-terms-conditions');
    case 'form-sections':
      return permissions.includes('form-sections');
    case 'form-fields':
      return permissions.includes('form-fields');
    default:
      return false;
  }
};