import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusModal from '../components/StatusModal';
import AssignModal from '../components/AssignModal';
import PaymentModal from '../components/PaymentModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusModal, setStatusModal] = useState({ isOpen: false, applicationId: null, currentStatus: null });
  const [assignModal, setAssignModal] = useState({ isOpen: false, applicationId: null, currentEmployee: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, applicationId: null, payment: null });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchApplications(currentPage);
    fetchStatuses();
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchEmployees();
    }
  }, [user, currentPage]);

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
      const response = await api.get(`${endpoint}?page=${page}&limit=10`);
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

  const handleStatusChange = async (newStatusId, remarks, embassyVisitDateTime) => {
    try {
      await api.put(`/applications/${statusModal.applicationId}/status`, {
        status: newStatusId,
        remarks,
        embassyVisitDateTime
      });
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleAssignEmployee = async (employeeId) => {
    try {
      await api.put(`/applications/${assignModal.applicationId}/assign`, { employeeId });
      fetchApplications();
    } catch (error) {
      console.error('Error assigning employee:', error);
      alert('Failed to assign employee');
    }
  };

  const handlePaymentUpdate = async (paymentData) => {
    try {
      await api.put(`/applications/${paymentModal.applicationId}/payment`, paymentData);
      fetchApplications();
      alert('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application');
      }
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status?._id === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const baseColumns = [
    {
      key: 'applicationNumber',
      label: 'Application #',
      render: (value, row) => (
        <div className="font-mono text-sm">
          {value}
        </div>
      )
    },
    {
      key: 'user',
      label: 'Applicant',
      render: (value) => (
        <div>
          <div className="font-semibold">{value?.name}</div>
          <div className="text-sm text-gray-600">{value?.email}</div>
        </div>
      )
    },
    {
      key: 'countryVisaType',
      label: 'Visa Type',
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{value?.country?.flagEmoji || '🌍'}</span>
          <div>
            <div className="font-semibold">{value?.country?.name}</div>
            <div className="text-sm text-gray-600">{value?.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
            {value?.name?.toUpperCase() || 'UNKNOWN'}
          </span>
          <button
            onClick={() => setStatusModal({ isOpen: true, applicationId: row._id, currentStatus: value })}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            Change
          </button>
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (value, row) => {
        const getPaymentStatusColor = (status) => {
          const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            success: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
          };
          return colors[status] || 'bg-gray-100 text-gray-800';
        };
        
        return (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(value || 'pending')}`}>
              {(value || 'pending').toUpperCase()}
            </span>
            <button
              onClick={async () => {
                try {
                  const response = await api.get(`/applications/${row._id}`);
                  setPaymentModal({ isOpen: true, applicationId: row._id, payment: response.data.payment });
                } catch (error) {
                  console.error('Error fetching payment:', error);
                  setPaymentModal({ isOpen: true, applicationId: row._id, payment: null });
                }
              }}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
            >
              Update
            </button>
          </div>
        );
      }
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Not submitted'
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // Add assignment column only for admin/manager
  const columns = user?.role === 'admin' || user?.role === 'manager' 
    ? [...baseColumns.slice(0, -2), {
        key: 'assignedTo',
        label: 'Assigned To',
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {value?.name || 'Unassigned'}
            </span>
            <button
              onClick={() => setAssignModal({ isOpen: true, applicationId: row._id, currentEmployee: value })}
              className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
            >
              {value ? 'Reassign' : 'Assign'}
            </button>
          </div>
        )
      }, ...baseColumns.slice(-2)]
    : baseColumns;

  const actions = [
    {
      label: 'View',
      onClick: (row) => router.push(`/applications/view/${row._id}`),
      icon: '👁️'
    },
    {
      label: 'Edit',
      onClick: (row) => router.push(`/applications/edit/${row._id}`),
      icon: '✏️'
    },
    {
      label: 'Delete',
      onClick: (row) => handleDelete(row._id),
      icon: '🗑️',
      variant: 'danger'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            📋 {user?.role === 'employee' ? 'My Assigned Applications' : 'Applications Management'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {user?.role === 'employee' ? 'Applications assigned to you' : 'Manage visa applications and track their status'}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by application number, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status._id} value={status._id}>
                  {status.name}
                </option>
              ))}
            </select>
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              Total: {filteredApplications.length}
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table
                data={filteredApplications}
                columns={columns}
                actions={actions}
                canEdit={false}
                canDelete={false}
                emptyMessage="No applications found"
              />
            </Card>
          </div>
          
          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {filteredApplications.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-600">No applications found</p>
                </div>
              </Card>
            ) : (
              filteredApplications.map((app) => (
                <Card key={app._id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-sm font-semibold">{app.applicationNumber}</p>
                        <p className="text-xs text-gray-500">Application #</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status?.name?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    
                    <div>
                      <p className="font-semibold">{app.user?.name}</p>
                      <p className="text-sm text-gray-600">{app.user?.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{app.countryVisaType?.country?.flagEmoji || '🌍'}</span>
                      <div>
                        <p className="font-semibold text-sm">{app.countryVisaType?.country?.name}</p>
                        <p className="text-xs text-gray-600">{app.countryVisaType?.name}</p>
                      </div>
                    </div>
                    
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{app.assignedTo?.name || 'Unassigned'}</span>
                          <button
                            onClick={() => setAssignModal({ isOpen: true, applicationId: app._id, currentEmployee: app.assignedTo })}
                            className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                          >
                            {app.assignedTo ? 'Reassign' : 'Assign'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Not submitted'}</span>
                      <span>Created: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setStatusModal({ isOpen: true, applicationId: app._id, currentStatus: app.status })}
                        className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-200"
                      >
                        Change Status
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await api.get(`/applications/${app._id}`);
                            setPaymentModal({ isOpen: true, applicationId: app._id, payment: response.data.payment });
                          } catch (error) {
                            console.error('Error fetching payment:', error);
                            setPaymentModal({ isOpen: true, applicationId: app._id, payment: null });
                          }
                        }}
                        className="bg-green-100 text-green-600 px-3 py-2 rounded text-sm hover:bg-green-200"
                      >
                        💳 Payment
                      </button>
                      <button
                        onClick={() => router.push(`/applications/view/${app._id}`)}
                        className="bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-200"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => router.push(`/applications/edit/${app._id}`)}
                        className="bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-200"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 border rounded-lg ${
                    currentPage === i + 1 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              
              <span className="text-sm text-gray-600 ml-4">
                Page {currentPage} of {pagination.pages} ({pagination.total} total)
              </span>
            </div>
          )}
        </>
      )}
      
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
    </div>
  );
}