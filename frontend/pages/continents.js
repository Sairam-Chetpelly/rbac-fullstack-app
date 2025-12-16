import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Continents() {
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchContinents();
  }, []);

  const fetchContinents = async () => {
    try {
      const response = await api.get('/continents');
      setContinents(response.data);
    } catch (error) {
      toast.error('Failed to fetch continents');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (continent) => {
    router.push(`/continents/view/${continent._id}`);
  };

  const handleEdit = (continent) => {
    router.push(`/continents/${continent._id}`);
  };

  const handleDelete = async (continent) => {
    if (confirm(`Are you sure you want to delete "${continent.name}"?`)) {
      try {
        await api.delete(`/continents/${continent._id}`);
        toast.success('Continent deleted successfully!');
        fetchContinents();
      } catch (error) {
        toast.error('Failed to delete continent');
      }
    }
  };

  const handleAdd = () => {
    router.push('/continents/add');
  };

  const columns = [
    {
      key: 'name',
      label: 'Continent',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
            🌍
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{item.slug}</div>
          </div>
        </div>
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
      key: 'status.name',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ];

  const stats = {
    total: continents.length,
    active: continents.filter(c => c.status?.name === 'active').length,
    inactive: continents.filter(c => c.status?.name === 'inactive').length
  };

  return (
    <EnhancedTable
      title="🌍 Continents Management"
      data={continents}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search continents by name, slug, or description..."
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      addButtonText="Add New Continent"
      emptyMessage="No continents found"
      emptyIcon="🌍"
      showStats={true}
      stats={stats}
      filters={filters}
    />
  );
}