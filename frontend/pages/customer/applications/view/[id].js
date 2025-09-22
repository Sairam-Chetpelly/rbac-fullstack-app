import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, FileText, Calendar, User, CreditCard, Clock, Download, Eye } from 'lucide-react';
import api from '../../../../lib/api';
import Button from '../../../../components/Button';
import CustomerLayout from '../../../../components/CustomerLayout';

export default function ViewApplication() {
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await api.get(`/customer/application/${id}`);
      setApplication(response.data.application);
      setAnswers(response.data.answers);
      setStatusHistory(response.data.statusHistory);
      setPayment(response.data.payment);
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!application) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <Button onClick={() => router.push('/customer/applications')}>
            Back to Applications
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/customer/applications')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
        </div>

        {/* Application Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{application.countryVisaType?.country?.flagEmoji || '🌍'}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {application.countryVisaType?.country?.name} - {application.countryVisaType?.visaType?.name}
                </h2>
                <p className="text-gray-600">Application #{application.applicationNumber}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
            {application.submittedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
              </div>
            )}
            {payment && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span>Paid: ₹{payment.amount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Answers */}
        {answers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {answers.map((answer) => {
                const renderAnswerContent = () => {
                  if (!answer.answerText && !answer.answerFile) {
                    return <span className="text-gray-500 italic">No answer provided</span>;
                  }
                  
                  // Handle file fields
                  if (answer.field?.type === 'file' && answer.answerFile) {
                    const fileName = answer.answerFile.split('/').pop();
                    const fileExt = fileName.split('.').pop().toLowerCase();
                    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt);
                    
                    return (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">{fileName}</span>
                        </div>
                        <div className="flex gap-1">
                          {isImage && (
                            <button 
                              onClick={() => window.open(`/api/uploads/${answer.answerFile}`, '_blank')}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => window.open(`/api/uploads/${answer.answerFile}`, '_blank')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle checkbox arrays
                  if (answer.field?.type === 'checkbox' && answer.answerText) {
                    try {
                      const values = JSON.parse(answer.answerText);
                      if (Array.isArray(values)) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {values.map((value, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {value}
                              </span>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      // Fall through to regular text display
                    }
                  }
                  
                  // Handle boolean values
                  if (answer.field?.type === 'radio' && (answer.answerText === 'true' || answer.answerText === 'false')) {
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        answer.answerText === 'true' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {answer.answerText === 'true' ? 'Yes' : 'No'}
                      </span>
                    );
                  }
                  
                  // Handle long text (textarea)
                  if (answer.field?.type === 'textarea' && answer.answerText && answer.answerText.length > 100) {
                    return (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{answer.answerText}</p>
                      </div>
                    );
                  }
                  
                  // Default text display
                  return <span className="text-sm text-gray-900">{answer.answerText}</span>;
                };
                
                return (
                  <div key={answer._id} className="border border-gray-200 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-700 mb-2">
                      {answer.field?.label || answer.field?.name}
                      {answer.field?.type && (
                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {answer.field.type}
                        </span>
                      )}
                    </dt>
                    <dd>
                      {renderAnswerContent()}
                    </dd>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status History */}
        {statusHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-4">
              {statusHistory.map((history) => (
                <div key={history._id} className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(history.status).replace('text-', 'bg-').replace('100', '500')}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {history.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(history.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {history.remarks && (
                      <p className="text-sm text-gray-600 mt-1">{history.remarks}</p>
                    )}
                    {history.changedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Updated by: {history.changedBy.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Information */}
        {payment && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-700 mb-1">Amount Paid</dt>
                <dd className="text-2xl font-bold text-green-600">₹{payment.amount}</dd>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-700 mb-1">Payment Status</dt>
                <dd className="text-sm font-semibold text-blue-800 capitalize">{payment.status}</dd>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-700 mb-1">Payment Method</dt>
                <dd className="text-sm text-gray-900 capitalize">{payment.paymentMethod || 'Online'}</dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-700 mb-1">Transaction ID</dt>
                <dd className="text-sm font-mono text-gray-900">{payment.transactionId}</dd>
              </div>
            </div>
            {payment.paidAt && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Payment Date: {new Date(payment.paidAt).toLocaleDateString()} at {new Date(payment.paidAt).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!payment && application.status !== 'draft' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Payment Pending</h3>
            <p className="text-yellow-700">No payment information found for this application.</p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}