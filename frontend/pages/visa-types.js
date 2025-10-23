import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VisaTypes() {
  const [visaTypes, setVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchVisaTypes();
  }, []);

  const fetchVisaTypes = async () => {
    try {
      const response = await api.get('/visa-types');
      setVisaTypes(response.data);
    } catch (error) {
      toast.error('Failed to fetch visa types');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (visaType) => {
    router.push(`/visa-types/view/${visaType._id}`);
  };

  const handleEdit = (visaType) => {
    router.push(`/visa-types/admin/${visaType._id}`);
  };

  const handleDelete = async (visaType) => {
    if (confirm(`Are you sure you want to delete "${visaType.name}"?`)) {
      try {
        await api.delete(`/visa-types/${visaType._id}`);
        toast.success('Visa type deleted successfully!');
        fetchVisaTypes();
      } catch (error) {
        toast.error('Failed to delete visa type');
      }
    }
  };

  const handleAdd = () => {
    router.push('/visa-types/add');
  };

  const columns = [
    {
      key: 'name',
      label: 'Visa Type',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
            📋
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs" title={item.description}>
              {item.description || 'No description'}
            </div>
          </div>
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

  const filters = [];

  const stats = {
    total: visaTypes.length,
    active: visaTypes.filter(v => v.status?.name === 'active').length,
    categories: [...new Set(visaTypes.map(v => v.category).filter(Boolean))].length
  };

  return (
    <EnhancedTable
      title="📋 Visa Types Management"
      data={visaTypes}
      columns={columns}
      loading={loading}
      searchPlaceholder="🔍 Search visa types by name, description..."
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      addButtonText="Add New Visa Type"
      emptyMessage="No visa types found"
      emptyIcon="📋"
      showStats={true}
      stats={stats}
      filters={filters}
    />
  );
}