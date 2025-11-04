import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user || !canAccess(user.role, 'users')) {
      window.location.href = '/dashboard';
      return;
    }
    fetchUsers(currentPage);
  }, [user, currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      const response = await api.get(`/users?page=${page}&limit=12`);
      setUsers(response.data.data || response.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully!');
        fetchUsers(currentPage);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (!user || !canAccess(user.role, 'users')) {
    return <div>Access denied</div>;
  }

  const canCreate = ['admin', 'manager', 'employee'].includes(user.role);
  const canDelete = user.role === 'admin';

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role?.name || u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">👥 Users Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage user accounts and permissions</p>
        </div>
        {canCreate && (
          <Button 
            onClick={() => router.push('/users/add')} 
            icon="➕"
            className="shadow-lg w-full sm:w-auto"
            size="lg"
          >
            Add New User
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              Total: {pagination.total || users.length}
            </span>
            <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
              Active: {users.filter(u => (u.status?.name || u.status) === 'active').length}
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table
                data={filteredUsers}
                columns={[
                  {
                    key: 'name',
                    label: 'User',
                    render: (value, row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {value.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {value}
                            {row.isAgent && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">AGENT</span>}
                          </div>
                          <div className="text-sm text-gray-600">{row.email}</div>
                          {row.mobile && <div className="text-xs text-gray-500">📱 {row.mobile}</div>}
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'role',
                    label: 'Role',
                    render: (value) => (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(value)}`}>
                        {(value?.name || value || '').toUpperCase()}
                      </span>
                    )
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (value) => (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(value)}`}>
                        {(value?.name || value || '').toUpperCase()}
                      </span>
                    )
                  },
                  {
                    key: 'createdAt',
                    label: 'Created',
                    render: (value) => new Date(value).toLocaleDateString()
                  }
                ]}
                actions={[
                  {
                    label: 'View',
                    onClick: (row) => router.push(`/users/${row._id}`),
                    icon: '👁️'
                  },
                  {
                    label: 'Edit',
                    onClick: (row) => router.push(`/users/${row._id}/edit`),
                    icon: '✏️'
                  },
                  ...(canDelete ? [{
                    label: 'Delete',
                    onClick: (row) => handleDelete(row._id),
                    icon: '🗑️',
                    variant: 'danger'
                  }] : [])
                ]}
                emptyMessage="No users found"
              />
            </Card>
          </div>
          
          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-600">No users found</p>
                </div>
              </Card>
            ) : (
              filteredUsers.map((userData) => (
                <Card key={userData._id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate flex items-center gap-2">
                          {userData.name}
                          {userData.isAgent && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">AGENT</span>}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{userData.email}</p>
                        {userData.mobile && <p className="text-xs text-gray-500 truncate">📱 {userData.mobile}</p>}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(userData.role)}`}>
                        {(userData.role?.name || userData.role || '').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(userData.status)}`}>
                        {(userData.status?.name || userData.status || '').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => router.push(`/users/${userData._id}`)}
                        className="flex-1 bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-200"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => router.push(`/users/${userData._id}/edit`)}
                        className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(userData._id)}
                          className="bg-red-100 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-200"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 border rounded-lg ${
                    currentPage === i + 1 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              
              <span className="text-sm text-gray-600 ml-4">
                Page {currentPage} of {pagination.pages} ({pagination.total} total)
              </span>
            </div>
          )}
        </>
      )}
      
      {!loading && filteredUsers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
}