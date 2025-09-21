import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function ViewApplication() {
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', remarks: '' });
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await api.get(`/applications/${id}`);
      setApplicationData(response.data);
      setStatusUpdate({ status: response.data.application.status, remarks: '' });
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await api.put(`/applications/${id}/status`, statusUpdate);
      alert('Status updated successfully');
      fetchApplicationDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8 p-4 sm:p-0">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="space-y-6 lg:space-y-8 p-4 sm:p-0">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h3>
            <p className="text-gray-600 mb-4">The requested application could not be found.</p>
            <Button onClick={() => router.push('/applications')}>Back to Applications</Button>
          </div>
        </Card>
      </div>
    );
  }

  const { application, answers, documents, statusHistory, payment } = applicationData;

  return (
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/applications')}
            icon="←"
            className="mb-4"
          >
            Back to Applications
          </Button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Application Details
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Application #{application.applicationNumber}
          </p>
        </div>
      </div>

      {/* Application Overview */}
      <Card title="Application Overview" icon="📋">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Application Number</label>
            <div className="font-mono text-lg">{application.applicationNumber}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Applicant</label>
            <div>
              <div className="font-semibold">{application.user?.name}</div>
              <div className="text-sm text-gray-600">{application.user?.email}</div>
              <div className="text-sm text-gray-600">{application.user?.mobile}</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Visa Type</label>
            <div className="flex items-center gap-2">
              <span className="text-lg">{application.countryVisaType?.country?.flagEmoji || '🌍'}</span>
              <div>
                <div className="font-semibold">{application.countryVisaType?.country?.name}</div>
                <div className="text-sm text-gray-600">{application.countryVisaType?.name}</div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Status</label>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
              {application.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Submitted Date</label>
            <div>{application.submittedAt ? new Date(application.submittedAt).toLocaleString() : 'Not submitted'}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Created Date</label>
            <div>{new Date(application.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </Card>

      {/* Status Update */}
      <Card title="Update Status" icon="🔄">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
            <select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
            <textarea
              value={statusUpdate.remarks}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, remarks: e.target.value })}
              placeholder="Add remarks for this status change..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              rows="3"
            />
          </div>
        </div>
        <div className="mt-6">
          <Button
            onClick={handleStatusUpdate}
            disabled={updating || statusUpdate.status === application.status}
            icon="💾"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </Card>

      {/* Application Answers */}
      <Card title="Application Form Data" icon="📝">
        {answers.length === 0 ? (
          <p className="text-gray-600">No form data available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {answers.map((answer) => (
              <div key={answer._id}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {answer.field?.label || answer.field?.name}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {answer.answerText || 'No answer provided'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Payment Information */}
      {payment && (
        <Card title="Payment Information" icon="💳">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
              <div className="text-lg font-semibold text-green-600">${payment.amount} {payment.currency}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                payment.status === 'success' ? 'bg-green-100 text-green-800' : 
                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {payment.status.toUpperCase()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID</label>
              <div className="font-mono text-sm">{payment.transactionId}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Status History */}
      <Card title="Status History" icon="📊">
        {statusHistory.length === 0 ? (
          <p className="text-gray-600">No status history available.</p>
        ) : (
          <div className="space-y-4">
            {statusHistory.map((history) => (
              <div key={history._id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(history.status)}`}>
                    {history.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="text-sm text-gray-600">
                    {new Date(history.changedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Changed by: {history.changedBy?.name || 'System'}
                </div>
                {history.remarks && (
                  <div className="text-sm text-gray-700">
                    <strong>Remarks:</strong> {history.remarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}