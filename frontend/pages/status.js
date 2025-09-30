import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function Status() {
  const { user } = useAuth();
  const router = useRouter();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || !canAccess(user.role, 'status')) {
      window.location.href = '/dashboard';
      return;
    }
    fetchStatuses();
  }, [user]);

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/status');
      setStatuses(response.data);
    } catch (error) {
      toast.error('Failed to fetch statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (statusId) => {
    if (confirm('Are you sure you want to delete this status?')) {
      try {
        await api.delete(`/status/${statusId}`);
        toast.success('Status deleted successfully!');
        fetchStatuses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete status');
      }
    }
  };

  if (!user || !canAccess(user.role, 'status')) {
    return <div>Access denied</div>;
  }

  const canCreate = user.role === 'admin';
  const canDelete = user.role === 'admin';

  const filteredStatuses = statuses.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (statusName) => {
    const icons = {
      active: '✅',
      inactive: '❌',
      pending: '⏳'
    };
    return icons[statusName] || '⚡';
  };

  const getStatusColor = (color) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚡ Status Management</h1>
          <p className="text-gray-600">Manage system status options</p>
        </div>
        {canCreate && (
          <Button 
            onClick={() => router.push('/status/add')} 
            icon="➕"
            className="shadow-lg"
          >
            Add New Status
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search statuses by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              Total: {statuses.length}
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading statuses...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStatuses.map((status) => (
            <Card key={status._id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getStatusColor(status.color)} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {getStatusIcon(status.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 capitalize">{status.name}</h3>
                    <p className="text-gray-600 text-sm">{status.description}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">COLOR</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-${status.color}-500`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{status.color}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => router.push(`/status/${status._id}`)}
                    className="flex-1"
                    icon="👁️"
                  >
                    View
                  </Button>
                  {canCreate && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/status/${status._id}/edit`)}
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
                      onClick={() => handleDelete(status._id)}
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
      
      {!loading && filteredStatuses.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No statuses found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
}