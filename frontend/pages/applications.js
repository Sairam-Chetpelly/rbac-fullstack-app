import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
        remarks: `Status changed to ${newStatus} by admin`
      });
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
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
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
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
            {value.replace('_', ' ').toUpperCase()}
          </span>
          <select
            value={value}
            onChange={(e) => handleStatusChange(row._id, e.target.value)}
            className="text-xs border rounded px-1 py-0.5"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )
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

  const actions = [
    {
      label: 'View',
      onClick: (row) => router.push(`/applications/view/${row._id}`),
      icon: '👁️'
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">📋 Applications Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage visa applications and track their status</p>
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
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
        <Card>
          <Table
            data={filteredApplications}
            columns={columns}
            actions={actions}
            emptyMessage="No applications found"
          />
        </Card>
      )}
    </div>
  );
}