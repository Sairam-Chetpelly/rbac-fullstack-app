import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../../components/EnhancedTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function FormSections() {
  const [formSections, setFormSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({});
  const [countries, setCountries] = useState([]);
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, section: null });
  const router = useRouter();

  useEffect(() => {
    fetchFormSections();
    fetchCountries();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (filters.country) {
      fetchCountryVisaTypes(filters.country);
    } else {
      setCountryVisaTypes([]);
    }
  }, [filters.country]);

  const fetchFormSections = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await api.get('/form-sections', { params });
      setFormSections(response.data.data || response.data);
      if (response.data.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      toast.error('Failed to fetch form sections');
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

  const handleView = (section) => {
    router.push(`/form-sections/view/${section._id}`);
  };

  const handleEdit = (section) => {
    router.push(`/form-sections/${section._id}`);
  };

  const handleDelete = (section) => {
    setDeleteModal({ isOpen: true, section });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/form-sections/${deleteModal.section._id}`);
      toast.success('Form section deleted successfully!');
      setDeleteModal({ isOpen: false, section: null });
      fetchFormSections();
    } catch (error) {
      toast.error('Failed to delete form section');
    }
  };

  const handleAdd = () => {
    router.push('/form-sections/add');
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
            📑
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              Order: {item.order}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'country',
      label: 'Country',
      render: (value, item) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          {item.countryVisaType?.country?.name || 'No country'}
        </span>
      )
    },
    {
      key: 'countryVisaType.name',
      label: 'Visa Type',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {value || 'No visa type'}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="max-w-xs text-sm text-gray-600 truncate" title={value}>
          {value || 'No description'}
        </div>
      )
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
    active: formSections.filter(s => s.isActive).length,
    inactive: formSections.filter(s => !s.isActive).length
  };

  return (
    <>
      <EnhancedTable
        title="📑 Form Sections"
        data={formSections}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search sections by name or description..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonText="Add Form Section"
        emptyMessage="No form sections found"
        emptyIcon="📑"
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
        onClose={() => setDeleteModal({ isOpen: false, section: null })}
        onConfirm={confirmDelete}
        title="Delete Form Section"
        message={`Are you sure you want to delete "${deleteModal.section?.name}"? This action cannot be undone.`}
        type="danger"
      />
    </>
  );
}