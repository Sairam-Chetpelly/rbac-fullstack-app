import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VisaTypes() {
  const [visaTypes, setVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, visaType: null });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchVisaTypes();
  }, []);

  const fetchVisaTypes = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const url = `/visa-types${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('API URL:', url);
      console.log('Filters:', filters);
      const response = await api.get(url);
      
      // Ensure isActive field exists for all visa types
      const visaTypesWithActive = response.data.map(vt => ({
        ...vt,
        isActive: vt.isActive !== undefined ? vt.isActive : true
      }));
      
      setVisaTypes(visaTypesWithActive);
    } catch (error) {
      console.error('Error fetching visa types:', error);
      toast.error('Failed to fetch visa types');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    console.log('Filter change received:', filters);
    fetchVisaTypes(filters);
  };

  const handleView = (visaType) => {
    router.push(`/visa-types/view/${visaType._id}`);
  };

  const handleEdit = (visaType) => {
    router.push(`/visa-types/admin/${visaType._id}`);
  };

  const handleDelete = (visaType) => {
    setDeleteModal({ isOpen: true, visaType });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/visa-types/${deleteModal.visaType._id}`);
      toast.success('Visa type deleted successfully!');
      setDeleteModal({ isOpen: false, visaType: null });
      fetchVisaTypes();
    } catch (error) {
      toast.error('Failed to delete visa type');
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
    total: visaTypes.length,
    active: visaTypes.filter(v => v.isActive).length,
    inactive: visaTypes.filter(v => !v.isActive).length
  };

  return (
    <>
      <EnhancedTable
        title="📋 Visa Types Management"
        data={visaTypes}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search visa types by name, description..."
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
        onFilterChange={handleFilterChange}
        serverSidePagination={true}
      />
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, visaType: null })}
        onConfirm={confirmDelete}
        title="Delete Visa Type"
        message={`Are you sure you want to delete "${deleteModal.visaType?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}