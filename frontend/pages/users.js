import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || !canAccess(user.role, 'users')) {
      window.location.href = '/dashboard';
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
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
        fetchUsers();
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
              Total: {users.length}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4 lg:gap-6">
          {filteredUsers.map((userData) => (
            <Card key={userData._id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <div className="space-y-4">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg lg:text-2xl font-bold shadow-lg">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">{userData.name}</h3>
                    <p className="text-sm lg:text-base text-gray-600 truncate">{userData.email}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(userData.role)}`}>
                    {(userData.role?.name || userData.role || '').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(userData.status)}`}>
                    {(userData.status?.name || userData.status || '').toUpperCase()}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => router.push(`/users/${userData._id}`)}
                    className="flex-1"
                    icon="👁️"
                  >
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => router.push(`/users/${userData._id}/edit`)}
                    className="flex-1"
                    icon="✏️"
                  >
                    Edit
                  </Button>
                  {canDelete && (
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(userData._id)}
                      icon="🗑️"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
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