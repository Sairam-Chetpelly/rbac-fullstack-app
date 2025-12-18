import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VisaTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({});
  const [countries, setCountries] = useState([]);
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, term: null });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchTerms();
    fetchCountries();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (filters.country) {
      fetchCountryVisaTypes(filters.country);
    } else {
      setCountryVisaTypes([]);
    }
  }, [filters.country]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await api.get('/visa-terms-conditions', { params });
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

  const fetchCountryVisaTypes = async (countryId) => {
    try {
      const response = await api.get(`/form-fields/country-visa-types/${countryId}`);
      setCountryVisaTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching visa types:', error);
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
    router.push(`/visa-terms-conditions/view/${term._id}`);
  };

  const handleEdit = (term) => {
    router.push(`/visa-terms-conditions/${term._id}`);
  };

  const handleDelete = (term) => {
    setDeleteModal({ isOpen: true, term });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/visa-terms-conditions/${deleteModal.term._id}`);
      toast.success('Terms deleted successfully!');
      setDeleteModal({ isOpen: false, term: null });
      fetchTerms();
    } catch (error) {
      toast.error('Failed to delete terms');
    }
  };

  const handleAdd = () => {
    router.push('/visa-terms-conditions/add');
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-lg">
            📋
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {item.countryVisaType?.name || 'General Terms'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'countryVisaType.name',
      label: 'Visa Type',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
          {value || 'General'}
        </span>
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
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      key: 'countryVisaType',
      label: 'Visa Type',
      type: 'select',
      options: countryVisaTypes.map(cvt => ({ value: cvt._id, label: cvt.name }))
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
    inactive: terms.filter(t => !t.isActive).length
  };

  return (
    <>
      <EnhancedTable
        title="📋 Visa Terms & Conditions"
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
        emptyIcon="📋"
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
        title="Delete Visa Terms & Conditions"
        message={`Are you sure you want to delete "${deleteModal.term?.title}"? This action cannot be undone.`}
        type="danger"
      />
    </>
  );
}