import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VisaTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await api.get('/visa-terms-conditions');
      setTerms(response.data);
    } catch (error) {
      toast.error('Failed to fetch terms');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (term) => {
    router.push(`/visa-terms-conditions/view/${term._id}`);
  };

  const handleEdit = (term) => {
    router.push(`/visa-terms-conditions/${term._id}`);
  };

  const handleDelete = async (term) => {
    if (confirm(`Are you sure you want to delete "${term.title}"?`)) {
      try {
        await api.delete(`/visa-terms-conditions/${term._id}`);
        toast.success('Terms deleted successfully!');
        fetchTerms();
      } catch (error) {
        toast.error('Failed to delete terms');
      }
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
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ];

  const stats = {
    total: terms.length,
    active: terms.filter(t => t.status?.name === 'active').length
  };

  return (
    <EnhancedTable
      title="📋 Visa Terms & Conditions"
      data={terms}
      columns={columns}
      loading={loading}
      searchPlaceholder="🔍 Search terms by title or content..."
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      addButtonText="Add New Terms"
      emptyMessage="No terms found"
      emptyIcon="📋"
      showStats={true}
      stats={stats}
      filters={filters}
    />
  );
}