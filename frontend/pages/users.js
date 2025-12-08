import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import EnhancedTable from '../components/EnhancedTable';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [toggleLoading, setToggleLoading] = useState({});

  useEffect(() => {
    if (!user || !canAccess(user.role, 'users')) {
      window.location.href = '/dashboard';
      return;
    }
    fetchUsers(pagination.page);
  }, [user]);

  const fetchUsers = async (page = 1) => {
    try {
      const response = await api.get(`/users?page=${page}&limit=12`);
      setUsers(response.data.data || response.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else {
        // Fallback pagination if backend doesn't provide it
        const totalUsers = response.data.length || 0;
        setPagination({
          page: page,
          limit: 10,
          total: totalUsers,
          pages: Math.ceil(totalUsers / 10)
        });
      }
      console.log('Pagination:', response.data.pagination || 'No pagination from backend');
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };



  const toggleUserStatus = async (userId) => {
    setToggleLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      toast.success(response.data.message);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    } finally {
      setToggleLoading(prev => ({ ...prev, [userId]: false }));
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

  const handleDelete = async (item) => {
    if (confirm(`Are you sure you want to delete user "${item.name}"?`)) {
      try {
        await api.delete(`/users/${item._id}`);
        toast.success('User deleted successfully!');
        fetchUsers(pagination.page);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
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

  const getStatusColor = (status) => {
    const statusName = status?.name || status || '';
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[statusName] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      key: 'status.name',
      label: 'Status',
      sortable: true,
      render: (value, item) => {
        const canToggle = canToggleStatus && !toggleLoading[item._id];
        return (
          <button
            onClick={() => canToggle && toggleUserStatus(item._id)}
            disabled={!canToggle}
            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)} ${
              canToggle ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
            } transition-opacity flex items-center gap-1`}
          >
            {toggleLoading[item._id] && <span className="text-xs">⏳</span>}
            {(value || item.status || '').toUpperCase()}
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
      key: 'role.name',
      label: 'Role',
      type: 'select',
      options: [...new Set(users.map(user => user.role?.name || user.role).filter(Boolean))].map(role => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1)
      }))
    },
    {
      key: 'status.name',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ];

  const stats = {
    total: pagination.total || users.length,
    active: users.filter(u => (u.status?.name || u.status) === 'active').length,
    inactive: users.filter(u => (u.status?.name || u.status) === 'inactive').length,
    admins: users.filter(u => (u.role?.name || u.role) === 'admin').length,
    agents: users.filter(u => u.isAgent).length
  };

  return (
    <EnhancedTable
      title="👥 Users Management"
      data={users}
      columns={columns}
      loading={loading}
      searchPlaceholder="🔍 Search users by name, email, or role..."
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
      itemsPerPage={pagination.limit || 12}
      serverSidePagination={true}
      totalItems={pagination.total}
      currentPage={pagination.page}
      onPageChange={(page) => {
        setPagination(prev => ({ ...prev, page }));
        fetchUsers(page);
      }}
      onExport={(user?.role === 'admin' || user?.role === 'manager') ? handleExport : undefined}
      exportButtonText="Export CSV"
    />
  );
}