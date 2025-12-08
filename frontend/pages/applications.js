import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedTable from '../components/EnhancedTable';
import StatusModal from '../components/StatusModal';
import AssignModal from '../components/AssignModal';
import PaymentModal from '../components/PaymentModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [statusModal, setStatusModal] = useState({ isOpen: false, applicationId: null, currentStatus: null });
  const [assignModal, setAssignModal] = useState({ isOpen: false, applicationId: null, currentEmployee: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, applicationId: null, payment: null });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchApplications(pagination.page);
    fetchStatuses();
    fetchCountries();
    fetchVisaTypes();
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      setEmployees([]);
      return;
    }
    try {
      const response = await api.get('/applications/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const fetchApplications = async (page = 1) => {
    try {
      const endpoint = user?.role === 'employee' ? '/applications/assigned' : '/applications';
      const response = await api.get(`${endpoint}?page=${page}&limit=12`);
      const apps = response.data.data || response.data;
      
      // Fetch payment status for each application
      const appsWithPayments = await Promise.all(
        apps.map(async (app) => {
          try {
            const paymentResponse = await api.get(`/applications/${app._id}`);
            return { ...app, paymentStatus: paymentResponse.data.payment?.status || 'pending' };
          } catch (error) {
            return { ...app, paymentStatus: 'pending' };
          }
        })
      );
      
      setApplications(appsWithPayments);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/applications/statuses');
      setStatuses(response.data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries');
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchVisaTypes = async () => {
    try {
      const response = await api.get('/country-visa-types');
      setVisaTypes(response.data);
    } catch (error) {
      console.error('Error fetching visa types:', error);
    }
  };

  const handleStatusChange = async (newStatusId, remarks, embassyVisitDateTime, visaDetails, visaFiles, courierDetails, courierFiles) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatusId);
      formData.append('remarks', remarks);
      if (embassyVisitDateTime) {
        formData.append('embassyVisitDateTime', embassyVisitDateTime);
      }
      
      if (visaDetails) {
        formData.append('visaDetails', JSON.stringify(visaDetails));
      }
      
      if (visaFiles && visaFiles.length > 0) {
        visaFiles.forEach((file, index) => {
          formData.append('visaFiles', file);
        });
      }
      
      if (courierDetails) {
        formData.append('courierDetails', JSON.stringify(courierDetails));
      }
      
      if (courierFiles && courierFiles.length > 0) {
        courierFiles.forEach((file, index) => {
          formData.append('courierFiles', file);
        });
      }
      
      await api.put(`/applications/${statusModal.applicationId}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchApplications();
      toast.success('Status updated successfully!');
      
      if (visaDetails || (visaFiles && visaFiles.length > 0) || courierDetails || (courierFiles && courierFiles.length > 0)) {
        toast.success('Notification has been sent to the applicant.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAssignEmployee = async (employeeId) => {
    try {
      await api.put(`/applications/${assignModal.applicationId}/assign`, { employeeId });
      fetchApplications();
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast.error('Failed to assign employee');
    }
  };

  const handlePaymentUpdate = async (paymentData) => {
    try {
      await api.put(`/applications/${paymentModal.applicationId}/payment`, paymentData);
      fetchApplications();
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
    }
  };



  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/export/csv', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Applications exported successfully!');
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('Failed to export applications');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    router.push(`/applications/view/${item._id}`);
  };

  const handleEdit = (item) => {
    router.push(`/applications/edit/${item._id}`);
  };

  const handleDelete = async (item) => {
    if (confirm(`Are you sure you want to delete application "${item.applicationNumber}"?`)) {
      try {
        await api.delete(`/applications/${item._id}`);
        toast.success('Application deleted successfully!');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to delete application');
      }
    }
  };

  const getStatusColor = (status) => {
    if (!status?.color) return 'bg-gray-100 text-gray-800';
    
    // Convert hex color to Tailwind classes
    const colorMap = {
      '#gray': 'bg-gray-100 text-gray-800',
      '#blue': 'bg-blue-100 text-blue-800',
      '#yellow': 'bg-yellow-100 text-yellow-800',
      '#green': 'bg-green-100 text-green-800',
      '#red': 'bg-red-100 text-red-800',
      '#purple': 'bg-purple-100 text-purple-800',
      '#indigo': 'bg-indigo-100 text-indigo-800',
      '#pink': 'bg-pink-100 text-pink-800'
    };
    
    return colorMap[status.color] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const baseColumns = [
    {
      key: 'applicationNumber',
      label: 'Application Details',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
            📋
          </div>
          <div>
            <div className="font-semibold text-gray-900 font-mono">{value}</div>
            <div className="text-sm text-gray-500">
              {item.user?.name} • {item.user?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'countryVisaType.country.name',
      label: 'Destination',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {item.countryVisaType?.country?.placeImage ? (
            <img 
              src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${item.countryVisaType.country.placeImage}`} 
              alt={item.countryVisaType?.country?.name}
              className="w-6 h-6 object-cover rounded"
            />
          ) : (
            <span className="text-lg">🌍</span>
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{item.countryVisaType?.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status.name',
      label: 'Status',
      sortable: true,
      render: (value, item) => (
        <button
          onClick={() => setStatusModal({ isOpen: true, applicationId: item._id, currentStatus: item.status })}
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)} hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1`}
        >
          <span className="text-xs">✏️</span>
          {(value || 'UNKNOWN').toUpperCase()}
        </button>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (value, item) => (
        <button
          onClick={async () => {
            try {
              const response = await api.get(`/applications/${item._id}`);
              setPaymentModal({ isOpen: true, applicationId: item._id, payment: response.data.payment });
            } catch (error) {
              console.error('Error fetching payment:', error);
              setPaymentModal({ isOpen: true, applicationId: item._id, payment: null });
            }
          }}
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(value || 'pending')} hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1`}
        >
          <span className="text-xs">💳</span>
          {(value || 'pending').toUpperCase()}
        </button>
      )
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      type: 'date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {value ? new Date(value).toLocaleDateString() : 'Not submitted'}
          </div>
          <div className="text-xs text-gray-500">
            {value ? 'Submitted' : 'Draft'}
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      sortable: true
    }
  ];

  // Add assignment column only for admin/manager
  const columns = user?.role === 'admin' || user?.role === 'manager' 
    ? [...baseColumns.slice(0, -1), {
        key: 'assignedTo.name',
        label: 'Assigned To',
        sortable: true,
        render: (value, item) => (
          <button
            onClick={() => setAssignModal({ isOpen: true, applicationId: item._id, currentEmployee: item.assignedTo })}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer font-medium flex items-center gap-1"
          >
            <span className="text-xs">👤</span>
            {value || 'Unassigned'}
          </button>
        )
      }, ...baseColumns.slice(-1)]
    : baseColumns;

  const filters = [
    {
      key: 'status.name',
      label: 'Status',
      type: 'select',
      options: statuses.map(status => ({
        value: status.name,
        label: status.name
      }))
    },
    {
      key: 'countryVisaType.country.name',
      label: 'Country',
      type: 'select',
      options: [...new Set(applications.map(app => app.countryVisaType?.country?.name).filter(Boolean))].map(name => ({
        value: name,
        label: name
      }))
    },
    {
      key: 'countryVisaType.name',
      label: 'Visa Type',
      type: 'select',
      options: [...new Set(applications.map(app => app.countryVisaType?.name).filter(Boolean))].map(name => ({
        value: name,
        label: name
      }))
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'success', label: 'Success' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ]
    }
  ];

  // Add assignment filter for admin/manager
  if (user?.role === 'admin' || user?.role === 'manager') {
    filters.push({
      key: 'assignedTo.name',
      label: 'Assigned To',
      type: 'select',
      options: [
        { value: '', label: 'Unassigned' },
        ...employees.map(emp => ({
          value: emp.name,
          label: emp.name
        }))
      ]
    });
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.paymentStatus === 'pending').length,
    success: applications.filter(app => app.paymentStatus === 'success').length,
    submitted: applications.filter(app => app.submittedAt).length,
    unassigned: applications.filter(app => !app.assignedTo).length
  };

  return (
    <>
      <EnhancedTable
        title={`📋 ${user?.role === 'employee' ? 'My Assigned Applications' : 'Applications Management'}`}
        data={applications}
        columns={columns}
        loading={loading}
        searchPlaceholder="🔍 Search by application number, name, email, or country..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No applications found"
        emptyIcon="📋"
        showStats={true}
        stats={stats}
        filters={filters}
        itemsPerPage={pagination.limit || 12}
        serverSidePagination={true}
        totalItems={pagination.total}
        currentPage={pagination.page}
        onPageChange={(page) => {
          setPagination(prev => ({ ...prev, page }));
          fetchApplications(page);
        }}
        onExport={(user?.role === 'admin' || user?.role === 'manager') ? handleExport : undefined}
        exportButtonText="Export CSV"
      />
      
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, applicationId: null, currentStatus: null })}
        onSubmit={handleStatusChange}
        statuses={statuses}
        currentStatus={statusModal.currentStatus}
      />
      
      <AssignModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, applicationId: null, currentEmployee: null })}
        onSubmit={handleAssignEmployee}
        employees={employees}
        currentEmployee={assignModal.currentEmployee}
      />
      
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, applicationId: null, payment: null })}
        onUpdate={handlePaymentUpdate}
        payment={paymentModal.payment}
      />
    </>
  );
}