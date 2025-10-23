import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CountryTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await api.get('/country-terms-conditions');
      setTerms(response.data);
    } catch (error) {
      toast.error('Failed to fetch terms');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (term) => {
    router.push(`/country-terms-conditions/view/${term._id}`);
  };

  const handleEdit = (term) => {
    router.push(`/country-terms-conditions/${term._id}`);
  };

  const handleDelete = async (term) => {
    if (confirm(`Are you sure you want to delete "${term.title}"?`)) {
      try {
        await api.delete(`/country-terms-conditions/${term._id}`);
        toast.success('Terms deleted successfully!');
        fetchTerms();
      } catch (error) {
        toast.error('Failed to delete terms');
      }
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
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      sortable: true
    }
  ];

  const filters = [
    {
      key: 'country.name',
      label: 'Country',
      type: 'select',
      options: [...new Set(terms.map(t => t.country?.name).filter(Boolean))].map(name => ({
        value: name,
        label: name
      }))
    }
  ];

  const stats = {
    total: terms.length,
    active: terms.filter(t => t.status?.name === 'active').length,
    countries: [...new Set(terms.map(t => t.country?.name).filter(Boolean))].length
  };

  return (
    <EnhancedTable
      title="📜 Country Terms & Conditions"
      data={terms}
      columns={columns}
      loading={loading}
      searchPlaceholder="🔍 Search terms by title, country, or content..."
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      addButtonText="Add New Terms"
      emptyMessage="No terms found"
      emptyIcon="📜"
      showStats={true}
      stats={stats}
      filters={filters}
    />
  );
}