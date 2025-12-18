import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Continents() {
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, continent: null });
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

  const handleDelete = (continent) => {
    setDeleteModal({ isOpen: true, continent });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/continents/${deleteModal.continent._id}`);
      toast.success('Continent deleted successfully!');
      setDeleteModal({ isOpen: false, continent: null });
      fetchContinents();
    } catch (error) {
      toast.error('Failed to delete continent');
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

  const filters = [
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
    total: continents.length,
    active: continents.filter(c => c.isActive).length,
    inactive: continents.filter(c => !c.isActive).length
  };

  return (
    <>
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
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, continent: null })}
        onConfirm={confirmDelete}
        title="Delete Continent"
        message={`Are you sure you want to delete "${deleteModal.continent?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}