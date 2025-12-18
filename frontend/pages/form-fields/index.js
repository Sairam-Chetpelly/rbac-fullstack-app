import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../../components/EnhancedTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function FormFields() {
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({});
  const [countries, setCountries] = useState([]);
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [formSections, setFormSectionsFilter] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, field: null });
  const router = useRouter();

  useEffect(() => {
    fetchFormFields();
    fetchCountries();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (filters.country) {
      fetchCountryVisaTypes(filters.country);
    } else {
      setCountryVisaTypes([]);
      setFormSectionsFilter([]);
    }
  }, [filters.country]);

  useEffect(() => {
    if (filters.countryVisaType) {
      fetchFormSectionsForFilter(filters.countryVisaType);
    } else {
      setFormSectionsFilter([]);
    }
  }, [filters.countryVisaType]);

  const fetchFormFields = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await api.get('/form-fields', { params });
      setFormFields(response.data.data || response.data);
      if (response.data.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      toast.error('Failed to fetch form fields');
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

  const fetchFormSectionsForFilter = async (countryVisaTypeId) => {
    try {
      const response = await api.get(`/form-fields/form-sections/${countryVisaTypeId}`);
      setFormSectionsFilter(response.data || []);
    } catch (error) {
      console.error('Error fetching form sections:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleView = (field) => {
    router.push(`/form-fields/view/${field._id}`);
  };

  const handleEdit = (field) => {
    router.push(`/form-fields/${field._id}`);
  };

  const handleDelete = (field) => {
    setDeleteModal({ isOpen: true, field });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/form-fields/${deleteModal.field._id}`);
      toast.success('Form field deleted successfully!');
      setDeleteModal({ isOpen: false, field: null });
      fetchFormFields();
    } catch (error) {
      toast.error('Failed to delete form field');
    }
  };

  const handleAdd = () => {
    router.push('/form-fields/add');
  };

  const columns = [
    {
      key: 'label',
      label: 'Label',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-lg">
            📝
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {item.name} • Order: {item.order}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'country',
      label: 'Country',
      render: (value, item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {item.formSection?.countryVisaType?.country?.name || 'No country'}
        </span>
      )
    },
    {
      key: 'countryVisaType',
      label: 'Visa Type',
      render: (value, item) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          {item.formSection?.countryVisaType?.name || 'No visa type'}
        </span>
      )
    },
    {
      key: 'formSection.name',
      label: 'Section',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {value || 'No section'}
        </span>
      )
    },
    {
      key: 'required',
      label: 'Required',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Required' : 'Optional'}
        </span>
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
      key: 'formSection',
      label: 'Form Section',
      type: 'select',
      options: formSections.map(fs => ({ value: fs._id, label: fs.name }))
    },
    {
      key: 'type',
      label: 'Field Type',
      type: 'select',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'email', label: 'Email' },
        { value: 'number', label: 'Number' },
        { value: 'select', label: 'Select' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'radio', label: 'Radio' },
        { value: 'file', label: 'File' },
        { value: 'date', label: 'Date' },
        { value: 'textarea', label: 'Textarea' }
      ]
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
    active: formFields.filter(f => f.isActive).length,
    inactive: formFields.filter(f => !f.isActive).length,
    required: formFields.filter(f => f.required).length
  };

  return (
    <>
      <EnhancedTable
        title="📝 Form Fields"
        data={formFields}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search fields by name, label, or type..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonText="Add Form Field"
        emptyMessage="No form fields found"
        emptyIcon="📝"
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
        onClose={() => setDeleteModal({ isOpen: false, field: null })}
        onConfirm={confirmDelete}
        title="Delete Form Field"
        message={`Are you sure you want to delete "${deleteModal.field?.label}"? This action cannot be undone.`}
        type="danger"
      />
    </>
  );
}