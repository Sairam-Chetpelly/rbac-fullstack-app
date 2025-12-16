import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries');
      setCountries(response.data);
    } catch (error) {
      toast.error('Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (country) => {
    router.push(`/countries/view/${country._id}`);
  };

  const handleEdit = (country) => {
    router.push(`/countries/${country._id}`);
  };

  const handleDelete = async (country) => {
    if (confirm(`Are you sure you want to delete "${country.name}"?`)) {
      try {
        await api.delete(`/countries/${country._id}`);
        toast.success('Country deleted successfully!');
        fetchCountries();
      } catch (error) {
        toast.error('Failed to delete country');
      }
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
      key: 'status.name',
      label: 'Status',
      type: 'status',
      sortable: true
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
      key: 'continent.name',
      label: 'Continent',
      type: 'select',
      options: [...new Set(countries.map(c => c.continent?.name).filter(Boolean))].map(name => ({
        value: name,
        label: name
      }))
    },
    {
      key: 'status.name',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ];

  const stats = {
    total: countries.length,
    active: countries.filter(c => c.status?.name === 'active').length,
    continents: [...new Set(countries.map(c => c.continent?.name).filter(Boolean))].length
  };

  return (
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
      filters={filters}
    />
  );
}