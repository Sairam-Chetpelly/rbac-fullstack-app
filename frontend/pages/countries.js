import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({});
  const [continents, setContinents] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, country: null });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCountries();
    fetchContinents();
  }, [pagination.page, pagination.limit, filters]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await api.get('/countries', { params });
      setCountries(response.data.data || response.data);
      if (response.data.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      toast.error('Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  };

  const fetchContinents = async () => {
    try {
      const response = await api.get('/continents');
      setContinents(response.data || []);
    } catch (error) {
      console.error('Error fetching continents:', error);
    }
  };

  const handleView = (country) => {
    router.push(`/countries/view/${country._id}`);
  };

  const handleEdit = (country) => {
    router.push(`/countries/${country._id}`);
  };

  const handleDelete = (country) => {
    setDeleteModal({ isOpen: true, country });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/countries/${deleteModal.country._id}`);
      toast.success('Country deleted successfully!');
      setDeleteModal({ isOpen: false, country: null });
      fetchCountries();
    } catch (error) {
      toast.error('Failed to delete country');
    }
  };

  const handleAdd = () => {
    router.push('/countries/add');
  };

  const columns = [
    {
      key: 'name',
      label: 'Country',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg overflow-hidden">
            {item.placeImage ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${item.placeImage}`} 
                alt={value}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              '🏞️'
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{item.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'continent.name',
      label: 'Continent',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || 'No description'}
        </div>
      )
    },
    {
      key: 'processingTimeMin',
      label: 'Processing Time',
      render: (value, item) => (
        <span className="text-sm text-gray-600">
          {value}-{item.processingTimeMax} days
        </span>
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
          {value ? 'Active' : 'Inactive'}
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

  const filterOptions = [
    {
      key: 'continent',
      label: 'Continent',
      type: 'select',
      options: continents.map(c => ({ value: c._id, label: c.name }))
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  const stats = {
    total: pagination.total,
    active: countries.filter(c => c.isActive).length,
    inactive: countries.filter(c => !c.isActive).length
  };

  return (
    <>
      <EnhancedTable
        title="🏞️ Countries Management"
        data={countries}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search countries by name, code, continent, or description..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonText="Add New Country"
        emptyMessage="No countries found"
        emptyIcon="🏞️"
        showStats={true}
        stats={stats}
        filters={filterOptions}
        serverSidePagination={true}
        totalItems={pagination.total}
        currentPage={pagination.page}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
      />
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, country: null })}
        onConfirm={confirmDelete}
        title="Delete Country"
        message={`Are you sure you want to delete "${deleteModal.country?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}