import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CountryTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({});
  const [countries, setCountries] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, term: null });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchTerms();
    fetchCountries();
  }, [pagination.page, pagination.limit, filters]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await api.get('/country-terms-conditions', { params });
      setTerms(response.data.data || response.data);
      if (response.data.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      toast.error('Failed to fetch terms');
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries/dropdown');
      setCountries(response.data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleView = (term) => {
    router.push(`/country-terms-conditions/view/${term._id}`);
  };

  const handleEdit = (term) => {
    router.push(`/country-terms-conditions/${term._id}`);
  };

  const handleDelete = (term) => {
    setDeleteModal({ isOpen: true, term });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/country-terms-conditions/${deleteModal.term._id}`);
      toast.success('Terms deleted successfully!');
      setDeleteModal({ isOpen: false, term: null });
      fetchTerms();
    } catch (error) {
      toast.error('Failed to delete terms');
    }
  };

  const handleAdd = () => {
    router.push('/country-terms-conditions/add');
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-lg">
            📜
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              Country Terms & Conditions
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'country.name',
      label: 'Country',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {item.country?.placeImage ? (
            <img 
              src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${item.country.placeImage}`} 
              alt={item.country?.name}
              className="w-6 h-6 object-cover rounded"
            />
          ) : (
            <span className="text-lg">🏞️</span>
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{item.country?.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'content',
      label: 'Content Preview',
      render: (value) => {
        const textContent = value?.replace(/<[^>]*>/g, '') || '';
        return (
          <div className="max-w-xs text-sm text-gray-600 truncate" title={textContent}>
            {textContent || 'No content preview available'}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
      key: 'country',
      label: 'Country',
      type: 'select',
      options: countries.map(c => ({ value: c._id, label: c.name }))
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
    active: terms.filter(t => t.isActive).length,
    inactive: terms.filter(t => !t.isActive).length,
    countries: [...new Set(terms.map(t => t.country?.name).filter(Boolean))].length
  };

  return (
    <>
      <EnhancedTable
        title="📜 Country Terms & Conditions"
        data={terms}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search terms by title or content..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonText="Add New Terms"
        emptyMessage="No terms found"
        emptyIcon="📜"
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
        onClose={() => setDeleteModal({ isOpen: false, term: null })}
        onConfirm={confirmDelete}
        title="Delete Terms & Conditions"
        message={`Are you sure you want to delete "${deleteModal.term?.title}"? This action cannot be undone.`}
        type="danger"
      />
    </>
  );
}