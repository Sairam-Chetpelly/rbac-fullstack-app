import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import EnhancedTable from '../components/EnhancedTable';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Status() {
  const { user } = useAuth();
  const router = useRouter();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [activeFilters, setActiveFilters] = useState({});
  const [filterTimeout, setFilterTimeout] = useState(null);

  useEffect(() => {
    if (!user || !canAccess(user.role, 'status')) {
      window.location.href = '/dashboard';
      return;
    }
    fetchStatuses(pagination.page, activeFilters);
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
      fetchStatuses(1, filters);
    }, 500);
    
    setFilterTimeout(timeout);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchStatuses(1, {});
  };

  const fetchStatuses = async (page = 1, filters = {}) => {
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
      
      const response = await api.get(`/status?${params.toString()}`);
      const statusData = response.data.data || response.data;
      
      setStatuses(statusData);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
      toast.error('Failed to fetch statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    router.push(`/status/${item._id}`);
  };

  const handleEdit = (item) => {
    router.push(`/status/${item._id}/edit`);
  };

  const handleDelete = async (item) => {
    if (confirm(`Are you sure you want to delete status "${item.name}"?`)) {
      try {
        await api.delete(`/status/${item._id}`);
        toast.success('Status deleted successfully!');
        fetchStatuses(pagination.page, activeFilters);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete status');
      }
    }
  };

  const handleAdd = () => {
    router.push('/status/add');
  };

  if (!user || !canAccess(user.role, 'status')) {
    return <div>Access denied</div>;
  }

  const canCreate = user.role === 'admin';
  const canEdit = user.role === 'admin';
  const canDelete = user.role === 'admin';

  const getCategoryColor = (category) => {
    const categoryColors = {
      'System': 'bg-blue-100 text-blue-800',
      'Application': 'bg-green-100 text-green-800',
      'Payment': 'bg-yellow-100 text-yellow-800',
      'Document': 'bg-purple-100 text-purple-800',
      'Processing': 'bg-indigo-100 text-indigo-800',
      'Visa': 'bg-red-100 text-red-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'name',
      label: 'Status Details',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="font-semibold text-gray-900 capitalize">{value}</div>
            </div>
            <div className="text-sm text-gray-500">{item.description || 'No description'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(value || 'General')}`}>
          {(value || 'General').toUpperCase()}
        </span>
      )
    },
    {
      key: 'color',
      label: 'Color',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-lg border-2 border-white shadow-sm"
            style={{ backgroundColor: value }}
          ></div>
          <span className="text-sm font-mono text-gray-600">{value}</span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? '✅ ACTIVE' : '❌ INACTIVE'}
        </span>
      )
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
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'System', label: 'System' },
        { value: 'Application', label: 'Application' },
        { value: 'Payment', label: 'Payment' },
        { value: 'Document', label: 'Document' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Visa', label: 'Visa' },
        { value: 'General', label: 'General' }
      ]
    },
    {
      key: 'isActive',
      label: 'Active Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      key: 'name',
      label: 'Status Name',
      type: 'text',
      placeholder: 'Enter status name'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Enter description'
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
    total: pagination.total || 0,
    active: statuses.filter(status => status.isActive).length,
    inactive: statuses.filter(status => !status.isActive).length,
    system: statuses.filter(status => status.category === 'System').length,
    application: statuses.filter(status => status.category === 'Application').length
  };

  return (
    <EnhancedTable
      title="⚡ Status Management"
      data={statuses}
      columns={columns}
      loading={loading}
      searchPlaceholder="🔍 Search by status name, description, or category..."
      onView={handleView}
      onEdit={canEdit ? handleEdit : undefined}
      onDelete={canDelete ? handleDelete : undefined}
      onAdd={canCreate ? handleAdd : undefined}
      addButtonText="Add New Status"
      emptyMessage="No statuses found"
      emptyIcon="⚡"
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
        fetchStatuses(page, activeFilters);
      }}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
    />
  );
}