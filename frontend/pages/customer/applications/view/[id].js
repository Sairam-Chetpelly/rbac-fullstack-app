import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, FileText, Calendar, User, CreditCard, Clock, Edit, Download, Eye, X } from 'lucide-react';
import api from '../../../../lib/api';
import Button from '../../../../components/Button';
import CustomerLayout from '../../../../components/CustomerLayout';
import { useAuth } from '../../../../context/AuthContext';

export default function ViewApplication() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [application, setApplication] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileModal, setFileModal] = useState({ show: false, url: '', fileName: '', type: '' });

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await api.get(`/customer/application/${id}`);
      setApplication(response.data.application);
      setApplicants(response.data.applicants || []);
      setAnswers(response.data.answers);
      setStatusHistory(response.data.statusHistory);
      setPayment(response.data.payment);
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileView = (fileName, filePath, fileType) => {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}/uploads/applications/${filePath}`;
    
    // Detect file type from extension if not provided
    let detectedType = fileType;
    if (!detectedType && fileName) {
      const ext = fileName.toLowerCase().split('.').pop();
      if (['pdf'].includes(ext)) detectedType = 'application/pdf';
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) detectedType = 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
    }
    
    setFileModal({ show: true, url, fileName, type: detectedType });
  };

  const handleFileDownload = async (fileName, filePath) => {
    const url = `${process.env.API_BASE_URL.replace('/api', '')}/uploads/applications/${filePath}`;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusColor = (status) => {
    if (!status?.color) return 'bg-gray-100 text-gray-800';
    
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
              {application.countryVisaType?.country?.placeImage ? (
                <img 
                  src={`${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/countries/${application.countryVisaType.country.placeImage}`} 
                  alt={application.countryVisaType?.country?.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <span className="text-4xl">🌍</span>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {application.countryVisaType?.country?.name} - {application.countryVisaType?.visaType?.name}
                </h2>
                <p className="text-gray-600">Application #{application.applicationNumber}</p>
                <p className="text-sm text-gray-500">
                  Customer: {application.user?.name} ({application.user?.email})
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600 capitalize">
                    Type: {application.applicationType || 'individual'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Applicants: {application.numberOfApplicants || 1}
                  </span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status?.name?.toUpperCase() || 'UNKNOWN'}
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
            {application.embassyVisitDateTime && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Embassy Visit: {new Date(application.embassyVisitDateTime).toLocaleDateString()} at {new Date(application.embassyVisitDateTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Answers */}
        {answers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Application Details</h3>
            
            {application.applicationType === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {answers.map((answer) => {
                  const renderAnswerContent = () => {
                    if (!answer.answerText && !answer.answerFile) {
                      return <span className="text-gray-500 italic">No answer provided</span>;
                    }
                    
                    if (answer.field?.type === 'file' && (answer.answerFile || answer.answerText)) {
                      let fileName = '';
                      let filePath = '';
                      
                      if (answer.answerFile) {
                        fileName = answer.answerFile.split('/').pop();
                        filePath = answer.answerFile;
                      } else if (answer.answerText) {
                        try {
                          const fileData = JSON.parse(answer.answerText);
                          fileName = fileData.fileName || 'Unknown file';
                          filePath = fileData.filePath || '';
                        } catch (e) {
                          fileName = answer.answerText.includes('/') ? answer.answerText.split('/').pop() : answer.answerText;
                          filePath = answer.answerText;
                        }
                      }
                      
                      return (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{fileName}</span>
                          <button 
                            onClick={() => handleFileView(fileName, filePath)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    }
                    
                    return <span className="text-sm text-gray-900">{answer.answerText}</span>;
                  };
                  
                  return (
                    <div key={answer._id} className="border border-gray-200 rounded-lg p-4">
                      <dt className="text-sm font-medium text-gray-700 mb-2">
                        {answer.field?.label || answer.field?.name}
                      </dt>
                      <dd>{renderAnswerContent()}</dd>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-8">
                {[...Array(application.numberOfApplicants || 1)].map((_, applicantIndex) => {
                  const applicantAnswers = answers.filter(answer => answer.applicantIndex === applicantIndex);
                  const applicant = applicants.find(app => app.applicantIndex === applicantIndex);
                  
                  return (
                    <div key={applicantIndex} className="border-2 border-blue-100 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-100">
                        <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {applicantIndex + 1}
                        </span>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            {applicantIndex === 0 ? 'Primary Applicant' : `Applicant ${applicantIndex + 1}`}
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">
                            Relationship: {applicant?.relationship || 'Other'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {applicantAnswers.map((answer) => {
                          const renderAnswerContent = () => {
                            if (!answer.answerText && !answer.answerFile) {
                              return <span className="text-gray-500 italic">No answer provided</span>;
                            }
                            
                            if (answer.field?.type === 'file' && (answer.answerFile || answer.answerText)) {
                              let fileName = '';
                              let filePath = '';
                              
                              if (answer.answerFile) {
                                fileName = answer.answerFile.split('/').pop();
                                filePath = answer.answerFile;
                              } else if (answer.answerText) {
                                try {
                                  const fileData = JSON.parse(answer.answerText);
                                  fileName = fileData.fileName || 'Unknown file';
                                  filePath = fileData.filePath || '';
                                } catch (e) {
                                  fileName = answer.answerText.includes('/') ? answer.answerText.split('/').pop() : answer.answerText;
                                  filePath = answer.answerText;
                                }
                              }
                              
                              return (
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{fileName}</span>
                                  <button 
                                    onClick={() => handleFileView(fileName, filePath)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                </div>
                              );
                            }
                            
                            return <span className="text-sm text-gray-900">{answer.answerText}</span>;
                          };
                          
                          return (
                            <div key={answer._id} className="border border-gray-200 rounded-lg p-3">
                              <dt className="text-sm font-medium text-gray-700 mb-1">
                                {answer.field?.label || answer.field?.name}
                              </dt>
                              <dd>{renderAnswerContent()}</dd>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                        {history.status?.name?.toUpperCase() || 'UNKNOWN'}
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
                <dt className="text-sm font-medium text-gray-700 mb-1">Amount</dt>
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
          </div>
        )}

        {/* File Modal */}
        {fileModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{fileModal.fileName}</h3>
                <button 
                  onClick={() => setFileModal({ show: false, url: '', fileName: '', type: '' })}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
                {fileModal.type?.startsWith('image/') ? (
                  <img 
                    src={fileModal.url} 
                    alt={fileModal.fileName}
                    className="w-full h-auto max-h-full object-contain"
                  />
                ) : fileModal.type === 'application/pdf' || fileModal.fileName?.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={`${fileModal.url}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-[70vh] border-0"
                    title={fileModal.fileName}
                    allow="fullscreen"
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Preview not available for this file type</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}