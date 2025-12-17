import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import EnhancedTable from '../components/EnhancedTable';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [activeFilters, setActiveFilters] = useState({});
  const [filterTimeout, setFilterTimeout] = useState(null);
  const [toggleLoading, setToggleLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', user: null, action: null });

  useEffect(() => {
    if (!user || !canAccess(user.role, 'users')) {
      window.location.href = '/dashboard';
      return;
    }
    fetchUsers(pagination.page, activeFilters);
  }, [user]);

  useEffect(() => {
    return () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }
    };
  }, [filterTimeout]);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchUsers(1, filters);
    }, 500);
    
    setFilterTimeout(timeout);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers(1, {});
  };

  const fetchUsers = async (page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/users?${params.toString()}`);
      const userData = response.data.data || response.data;
      
      setUsers(userData);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };



  const toggleUserStatus = (userId) => {
    const user = users.find(u => u._id === userId);
    const currentStatus = user?.isActive;
    const newStatus = !currentStatus;
    
    setConfirmModal({
      isOpen: true,
      type: newStatus ? 'success' : 'warning',
      user: user,
      action: 'toggle',
      title: `${newStatus ? 'Activate' : 'Deactivate'} User`,
      message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} user "${user?.name}"?`,
      confirmText: newStatus ? 'Activate' : 'Deactivate'
    });
  };

  const handleToggleConfirm = async () => {
    const userId = confirmModal.user?._id;
    setToggleLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      toast.success(response.data.message);
      fetchUsers(pagination.page, activeFilters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    } finally {
      setToggleLoading(prev => ({ ...prev, [userId]: false }));
      setConfirmModal({ isOpen: false, type: '', user: null, action: null });
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/export/csv', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Users data exported successfully!');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !canAccess(user.role, 'users')) {
    return <div>Access denied</div>;
  }

  const canCreate = ['admin', 'manager', 'employee'].includes(user.role);
  const canDelete = user.role === 'admin';
  const canToggleStatus = ['admin', 'manager'].includes(user.role);

  const handleView = (item) => {
    router.push(`/users/${item._id}`);
  };

  const handleEdit = (item) => {
    router.push(`/users/${item._id}/edit`);
  };

  const handleDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      user: item,
      action: 'delete',
      title: 'Delete User',
      message: `Are you sure you want to permanently delete user "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete User'
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/users/${confirmModal.user._id}`);
      toast.success('User deleted successfully!');
      fetchUsers(pagination.page, activeFilters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setConfirmModal({ isOpen: false, type: '', user: null, action: null });
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.action === 'delete') {
      handleDeleteConfirm();
    } else if (confirmModal.action === 'toggle') {
      handleToggleConfirm();
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, type: '', user: null, action: null });
  };

  const handleAdd = () => {
    router.push('/users/add');
  };

  const getRoleColor = (role) => {
    const roleName = role?.name || role || '';
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      employee: 'bg-green-100 text-green-800 border-green-200',
      customer: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const columns = [
    {
      key: 'name',
      label: 'User Details',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
            👤
          </div>
          <div>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              {value}
              {item.isAgent && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">AGENT</span>}
            </div>
            <div className="text-sm text-gray-500">
              {item.email}
            </div>
            {item.mobile && <div className="text-xs text-gray-500">📱 {item.mobile}</div>}
          </div>
        </div>
      )
    },
    {
      key: 'role.name',
      label: 'Role',
      sortable: true,
      render: (value, item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(item.role)}`}>
          {(value || item.role || '').toUpperCase()}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value, item) => {
        const canToggle = canToggleStatus && !toggleLoading[item._id];
        return (
          <button
            onClick={() => canToggle && toggleUserStatus(item._id)}
            disabled={!canToggle}
            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.isActive)} ${
              canToggle ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
            } transition-opacity flex items-center gap-1`}
          >
            {toggleLoading[item._id] && <span className="text-xs">⏳</span>}
            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
          </button>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      sortable: true
    }
  ];

  const filters = [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'employee', label: 'Employee' },
        { value: 'customer', label: 'Customer' }
      ]
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      key: 'isAgent',
      label: 'Agent Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Agent' },
        { value: 'false', label: 'Regular User' }
      ]
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter user name'
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Enter email address'
    },
    {
      key: 'mobile',
      label: 'Mobile',
      type: 'text',
      placeholder: 'Enter mobile number'
    },
    {
      key: 'dateFrom',
      label: 'Created From',
      type: 'date',
      placeholder: 'Select start date'
    },
    {
      key: 'dateTo',
      label: 'Created To',
      type: 'date',
      placeholder: 'Select end date'
    }
  ];

  const stats = {
    total: pagination.total || users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => (u.role?.name || u.role) === 'admin').length,
    agents: users.filter(u => u.isAgent).length
  };

  return (
    <>
      <EnhancedTable
        title="👥 Users Management"
        data={users}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search users by name, email, or role..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={canDelete ? handleDelete : undefined}
        onAdd={canCreate ? handleAdd : undefined}
        addButtonText="Add New User"
        emptyMessage="No users found"
        emptyIcon="👥"
        showStats={true}
        stats={stats}
        filters={filters}
        activeFilters={activeFilters}
        itemsPerPage={pagination.limit || 10}
        serverSidePagination={true}
        totalItems={pagination.total}
        currentPage={pagination.page}
        onPageChange={(page) => {
          setPagination(prev => ({ ...prev, page }));
          fetchUsers(page, activeFilters);
        }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onExport={(user?.role === 'admin' || user?.role === 'manager') ? handleExport : undefined}
        exportButtonText="Export CSV"
      />
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </>
  );
}