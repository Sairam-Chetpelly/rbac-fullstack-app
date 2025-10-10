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
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {value || 'General'}
        </span>
      )
    },
    {
      key: 'validityPeriod',
      label: 'Validity',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'entryType',
      label: 'Entry Type',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Multiple' ? 'bg-green-100 text-green-800' :
          value === 'Single' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value || 'N/A'}
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
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [...new Set(visaTypes.map(v => v.category).filter(Boolean))].map(cat => ({
        value: cat,
        label: cat
      }))
    },
    {
      key: 'entryType',
      label: 'Entry Type',
      type: 'select',
      options: [
        { value: 'Single', label: 'Single Entry' },
        { value: 'Multiple', label: 'Multiple Entry' }
      ]
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
      searchPlaceholder="🔍 Search visa types by name, category, or description..."
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