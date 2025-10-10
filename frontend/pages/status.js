import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import api from '../lib/api';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function Status() {
  const { user } = useAuth();
  const router = useRouter();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getStatusCategory = (name) => {
    if (['active', 'inactive', 'pending', 'verified', 'suspended', 'blocked'].includes(name)) {
      return 'System';
    }
    if (['draft', 'submitted', 'under-review', 'documents-required', 'interview-scheduled', 'approved', 'rejected', 'cancelled'].includes(name)) {
      return 'Application';
    }
    if (['payment-pending', 'payment-completed', 'payment-failed', 'refunded'].includes(name)) {
      return 'Payment';
    }
    if (['document-uploaded', 'document-verified', 'document-rejected'].includes(name)) {
      return 'Document';
    }
    if (['in-progress', 'on-hold', 'completed'].includes(name)) {
      return 'Processing';
    }
    if (['visa-issued', 'visa-expired', 'visa-cancelled'].includes(name)) {
      return 'Visa';
    }
    return 'General';
  };

  if (!user || !canAccess(user.role, 'status')) {
    return <div>Access denied</div>;
  }

  const canCreate = user.role === 'admin';
  const canDelete = user.role === 'admin';

  // Filter and sort data
  let filteredStatuses = statuses.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStatusCategory(s.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortColumn) {
    filteredStatuses.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      if (sortColumn === 'category') {
        aValue = getStatusCategory(a.name);
        bValue = getStatusCategory(b.name);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredStatuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStatuses = filteredStatuses.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚡ Status Management</h1>
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

      {/* Search and Stats */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search statuses by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              Total: {statuses.length}
            </span>
            {searchTerm && (
              <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                Filtered: {filteredStatuses.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading statuses...</p>
          </div>
        ) : filteredStatuses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No statuses found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'No statuses available'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Status <SortIcon column="name" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-2">
                        Category <SortIcon column="category" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('isActive')}
                    >
                      <div className="flex items-center gap-2">
                        Active <SortIcon column="isActive" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedStatuses.map((status) => {
                    const category = getStatusCategory(status.name);
                    const categoryColors = {
                      'System': 'bg-blue-100 text-blue-800',
                      'Application': 'bg-green-100 text-green-800',
                      'Payment': 'bg-yellow-100 text-yellow-800',
                      'Document': 'bg-purple-100 text-purple-800',
                      'Processing': 'bg-indigo-100 text-indigo-800',
                      'Visa': 'bg-red-100 text-red-800',
                      'General': 'bg-gray-100 text-gray-800'
                    };
                    
                    return (
                      <tr key={status._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: status.color }}
                            ></div>
                            <div>
                              <div className="font-semibold text-gray-900 capitalize">
                                {status.name.replace(/-/g, ' ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={status.description}>
                            {status.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-200 shadow-sm"
                              style={{ backgroundColor: status.color }}
                            ></div>
                            <span className="text-sm font-mono text-gray-600">{status.color}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category]}`}>
                            {category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            status.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {status.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/status/${status._id}`)}
                              icon="👁️"
                            >
                              View
                            </Button>
                            {canCreate && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/status/${status._id}/edit`)}
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStatuses.length)} of {filteredStatuses.length} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <Button
                            key={page}
                            size="sm"
                            variant={currentPage === page ? 'primary' : 'outline'}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}