import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CountryVisaTypes() {
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({});
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCountryVisaTypes();
    fetchCountries();
    fetchVisaTypes();
  }, [pagination.page, pagination.limit, filters]);

  const fetchCountryVisaTypes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await api.get('/country-visa-types', { params });
      setCountryVisaTypes(response.data.data || response.data);
      if (response.data.pagination) {
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      toast.error('Failed to fetch country visa types');
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

  const fetchVisaTypes = async () => {
    try {
      const response = await api.get('/visa-types');
      setVisaTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching visa types:', error);
    }
  };

  const handleView = (item) => {
    router.push(`/country-visa-types/view/${item._id}`);
  };

  const handleEdit = (item) => {
    router.push(`/country-visa-types/${item._id}`);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleDelete = async (item) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await api.delete(`/country-visa-types/${item._id}`);
        toast.success('Country visa type deleted successfully!');
        fetchCountryVisaTypes();
      } catch (error) {
        toast.error('Failed to delete country visa type');
      }
    }
  };

  const handleAdd = () => {
    router.push('/country-visa-types/add');
  };

  const columns = [
    {
      key: 'name',
      label: 'Visa Configuration',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-lg">
            🎫
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {item.country?.name} • {item.visaType?.name}
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
      key: 'visaType.name',
      label: 'Visa Type',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'processingTimeMin',
      label: 'Processing Time',
      render: (value, item) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {value} - {item.processingTimeMax}
          </div>
          <div className="text-xs text-gray-500">Processing period</div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Pricing',
      type: 'currency',
      sortable: true,
      render: (value, item) => (
        <div className="text-sm">
          <div className="font-bold text-green-600 text-lg">₹{value}</div>
          <div className="text-xs text-gray-500">
            Agent Discount: ₹{item.agentDiscount || '0'}
          </div>
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
      key: 'visaType',
      label: 'Visa Type',
      type: 'select',
      options: visaTypes.map(vt => ({ value: vt._id, label: vt.name }))
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
    active: countryVisaTypes.filter(item => item.isActive).length,
    inactive: countryVisaTypes.filter(item => !item.isActive).length,
    avgPrice: countryVisaTypes.length > 0 
      ? Math.round(countryVisaTypes.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0) / countryVisaTypes.length)
      : 0
  };

  return (
    <EnhancedTable
      title="🎫 Country Visa Types Management"
      data={countryVisaTypes}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search by name, country, visa type, or pricing..."
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      addButtonText="Add New Country Visa Type"
      emptyMessage="No country visa types found"
      emptyIcon="🎫"
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
  );
}