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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    let url;
    
    // Handle different file path formats
    if (filePath.startsWith('http')) {
      url = filePath;
    } else if (filePath.startsWith('uploads/')) {
      url = `${baseUrl}/${filePath}`;
    } else {
      // For legacy format (just filename), construct full path
      url = `${baseUrl}/uploads/applications/${filePath}`;
    }
    
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    let url;
    
    // Handle different file path formats
    if (filePath.startsWith('http')) {
      url = filePath;
    } else if (filePath.startsWith('uploads/')) {
      url = `${baseUrl}/${filePath}`;
    } else {
      // For legacy format (just filename), construct full path
      url = `${baseUrl}/uploads/applications/${filePath}`;
    }
    
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
                  src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${application.countryVisaType.country.placeImage}`} 
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

        {/* Assigned Agent Details */}
        {application.assignedTo && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Assigned Agent</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-blue-900">{application.assignedTo.name}</h4>
                  <p className="text-blue-700">{application.assignedTo.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Answers */}
        {answers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Application Details</h3>
            
            {application.applicationType === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {answers.map((answer) => {
                  const renderAnswerContent = () => {
                    if (!answer.answerText && !answer.answerFile && (!answer.answerFiles || answer.answerFiles.length === 0)) {
                      return <span className="text-gray-500 italic">No answer provided</span>;
                    }
                    
                    if (answer.field?.type === 'file') {
                      // Handle multiple files
                      if (answer.answerFiles && answer.answerFiles.length > 0) {
                        return (
                          <div className="space-y-2">
                            {answer.answerFiles.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm flex-1">{file.originalName}</span>
                                <button 
                                  onClick={() => handleFileView(file.originalName, file.path || file.filename, file.mimetype)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // Handle single file (legacy)
                      if (answer.answerFile || answer.answerText) {
                        let fileName = '';
                        let filePath = '';
                        let fileType = '';
                        
                        if (answer.answerFile) {
                          fileName = answer.answerFile.split('/').pop();
                          filePath = answer.answerFile;
                        } else if (answer.answerText) {
                          try {
                            const fileData = JSON.parse(answer.answerText);
                            fileName = fileData.fileName || 'Unknown file';
                            filePath = fileData.filePath || fileData.url || '';
                            fileType = fileData.fileType || '';
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
                              onClick={() => handleFileView(fileName, filePath, fileType)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      }
                    }
                    
                    // Decode HTML entities and parse JSON arrays (for checkboxes)
                    let displayText = answer.answerText;
                    try {
                      // Decode HTML entities
                      const textarea = document.createElement('textarea');
                      textarea.innerHTML = displayText;
                      displayText = textarea.value;
                      
                      // Try to parse as JSON
                      const parsed = JSON.parse(displayText);
                      if (Array.isArray(parsed)) {
                        return <span className="text-sm text-gray-900">{parsed.join(', ')}</span>;
                      }
                      return <span className="text-sm text-gray-900">{String(parsed)}</span>;
                    } catch (e) {
                      // Not JSON, display as is
                    }
                    return <span className="text-sm text-gray-900">{displayText}</span>;
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
                            if (!answer.answerText && !answer.answerFile && (!answer.answerFiles || answer.answerFiles.length === 0)) {
                              return <span className="text-gray-500 italic">No answer provided</span>;
                            }
                            
                            if (answer.field?.type === 'file') {
                              // Handle multiple files
                              if (answer.answerFiles && answer.answerFiles.length > 0) {
                                return (
                                  <div className="space-y-1">
                                    {answer.answerFiles.map((file, fileIndex) => (
                                      <div key={fileIndex} className="flex items-center gap-2 p-1 bg-gray-50 rounded">
                                        <FileText className="h-3 w-3 text-blue-600" />
                                        <span className="text-xs flex-1">{file.originalName}</span>
                                        <button 
                                          onClick={() => handleFileView(file.originalName, file.path || file.filename, file.mimetype)}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              
                              // Handle single file (legacy)
                              if (answer.answerFile || answer.answerText) {
                                let fileName = '';
                                let filePath = '';
                                let fileType = '';
                                
                                if (answer.answerFile) {
                                  fileName = answer.answerFile.split('/').pop();
                                  filePath = answer.answerFile;
                                } else if (answer.answerText) {
                                  try {
                                    const fileData = JSON.parse(answer.answerText);
                                    fileName = fileData.fileName || 'Unknown file';
                                    filePath = fileData.filePath || fileData.url || '';
                                    fileType = fileData.fileType || '';
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
                                      onClick={() => handleFileView(fileName, filePath, fileType)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </button>
                                  </div>
                                );
                              }
                            }
                            
                            // Decode HTML entities and parse JSON arrays (for checkboxes)
                            let displayText = answer.answerText;
                            try {
                              // Decode HTML entities
                              const textarea = document.createElement('textarea');
                              textarea.innerHTML = displayText;
                              displayText = textarea.value;
                              
                              // Try to parse as JSON
                              const parsed = JSON.parse(displayText);
                              if (Array.isArray(parsed)) {
                                return <span className="text-sm text-gray-900">{parsed.join(', ')}</span>;
                              }
                              return <span className="text-sm text-gray-900">{String(parsed)}</span>;
                            } catch (e) {
                              // Not JSON, display as is
                            }
                            return <span className="text-sm text-gray-900">{displayText}</span>;
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

        {/* Visa Details */}
        {application.visaDetails && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Visa Issuance Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {application.visaDetails.visaNumber && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Visa Number</dt>
                  <dd className="text-lg font-bold text-green-600">{application.visaDetails.visaNumber}</dd>
                </div>
              )}
              {application.visaDetails.dateOfIssuance && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Date of Issuance</dt>
                  <dd className="text-sm font-semibold text-blue-800">
                    {new Date(application.visaDetails.dateOfIssuance).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {application.visaDetails.dateOfExpiry && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Date of Expiry</dt>
                  <dd className="text-sm font-semibold text-purple-800">
                    {new Date(application.visaDetails.dateOfExpiry).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {application.visaDetails.dateOfIssuance && application.visaDetails.dateOfExpiry && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Validity</dt>
                  <dd className="text-sm text-gray-900">
                    {Math.ceil((new Date(application.visaDetails.dateOfExpiry) - new Date(application.visaDetails.dateOfIssuance)) / (1000 * 60 * 60 * 24))} days
                  </dd>
                </div>
              )}
            </div>
            {application.visaDetails.additionalDetails && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <dt className="text-sm font-medium text-gray-700 mb-2">Additional Details</dt>
                <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {application.visaDetails.additionalDetails}
                </dd>
              </div>
            )}
          </div>
        )}

        {/* Visa Files */}
        {application.visaFiles && application.visaFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📎 Visa Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {application.visaFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} • 
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleFileView(file.originalName, file.path || file.filename, file.fileType)}
                      className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button 
                      onClick={() => handleFileDownload(file.originalName, file.path || file.filename)}
                      className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courier Details */}
        {application.courierDetails && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚚 Courier Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {application.courierDetails.visaNumber && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Visa Number</dt>
                  <dd className="text-lg font-bold text-blue-600">{application.courierDetails.visaNumber}</dd>
                </div>
              )}
              {application.courierDetails.courierName && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Courier Company</dt>
                  <dd className="text-sm font-semibold text-green-800">{application.courierDetails.courierName}</dd>
                </div>
              )}
              {application.courierDetails.shipmentRefNumber && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Tracking Number</dt>
                  <dd className="text-sm font-mono font-semibold text-purple-800">{application.courierDetails.shipmentRefNumber}</dd>
                </div>
              )}
              {application.courierDetails.shipmentDate && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">Shipment Date</dt>
                  <dd className="text-sm font-semibold text-orange-800">
                    {new Date(application.courierDetails.shipmentDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Courier Files */}
        {application.courierFiles && application.courierFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Courier Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {application.courierFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-orange-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} • 
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleFileView(file.originalName, file.path || file.filename, file.fileType)}
                      className="flex-1 px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button 
                      onClick={() => handleFileDownload(file.originalName, file.path || file.filename)}
                      className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
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
            {payment.razorpayOrderId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-700">Razorpay Order ID</dt>
                    <dd className="font-mono text-gray-900">{payment.razorpayOrderId}</dd>
                  </div>
                  {payment.paidAt && (
                    <div>
                      <dt className="font-medium text-gray-700">Payment Date</dt>
                      <dd className="text-gray-900">{new Date(payment.paidAt).toLocaleDateString()} at {new Date(payment.paidAt).toLocaleTimeString()}</dd>
                    </div>
                  )}
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

        {/* File Modal */}
        {fileModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{fileModal.fileName}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleFileDownload(fileModal.fileName, fileModal.url.split('/').pop())}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1 inline" />
                    Download
                  </button>
                  <button 
                    onClick={() => setFileModal({ show: false, url: '', fileName: '', type: '' })}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4 mr-1 inline" />
                    Close
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
                {fileModal.type?.startsWith('image/') ? (
                  <img 
                    src={fileModal.url} 
                    alt={fileModal.fileName}
                    className="w-full h-auto max-h-full object-contain"
                    onError={(e) => {
                      console.error('Image load error:', fileModal.url);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : fileModal.type === 'application/pdf' || fileModal.fileName?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-[70vh] flex flex-col">
                    <iframe 
                      src={`${fileModal.url}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-full border-0"
                      title={fileModal.fileName}
                      allow="fullscreen"
                      onLoad={() => console.log('PDF loaded successfully:', fileModal.url)}
                      onError={(e) => {
                        console.error('PDF load error:', fileModal.url);
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-center py-12 hidden">
                      <p className="text-red-600 mb-4">Failed to load PDF document.</p>
                      <button 
                        onClick={() => window.open(fileModal.url, '_blank')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Preview not available for this file type</p>
                    <p className="text-xs text-gray-500 mt-2">URL: {fileModal.url}</p>
                  </div>
                )}
                <div className="text-center py-12" style={{display: 'none'}}>
                  <p className="text-red-600">Failed to load file</p>
                  <p className="text-xs text-gray-500 mt-2">URL: {fileModal.url}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}