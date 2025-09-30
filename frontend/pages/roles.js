import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function Roles() {
  const { user } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || !canAccess(user.role, 'roles')) {
      window.location.href = '/dashboard';
      return;
    }
    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await api.delete(`/roles/${roleId}`);
        toast.success('Role deleted successfully!');
        fetchRoles();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  if (!user || !canAccess(user.role, 'roles')) {
    return <div>Access denied</div>;
  }

  const canCreate = user.role === 'admin';
  const canDelete = user.role === 'admin';
  const isViewOnly = user.role === 'manager';

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (roleName) => {
    const icons = {
      admin: '👑',
      manager: '👨‍💼',
      employee: '👷',
      customer: '👤'
    };
    return icons[roleName] || '🛡️';
  };

  const getRoleColor = (roleName) => {
    const colors = {
      admin: 'from-red-500 to-red-600',
      manager: 'from-blue-500 to-blue-600',
      employee: 'from-green-500 to-green-600',
      customer: 'from-purple-500 to-purple-600'
    };
    return colors[roleName] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🛡️ Roles Management</h1>
          <p className="text-gray-600">Manage system roles and permissions</p>
        </div>
        {canCreate && (
          <Button 
            onClick={() => router.push('/roles/add')} 
            icon="➕"
            className="shadow-lg"
          >
            Add New Role
          </Button>
        )}
        {isViewOnly && (
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2">
            👁️ View Only Access
          </div>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search roles by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              Total: {roles.length}
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading roles...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <Card key={role._id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getRoleColor(role.name)} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {getRoleIcon(role.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 capitalize">{role.name}</h3>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">PERMISSIONS ({role.permissions.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {permission}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => router.push(`/roles/${role._id}`)}
                    className="flex-1"
                    icon="👁️"
                  >
                    View
                  </Button>
                  {canCreate && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/roles/${role._id}/edit`)}
                      className="flex-1"
                      icon="✏️"
                    >
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(role._id)}
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
      
      {!loading && filteredRoles.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
}