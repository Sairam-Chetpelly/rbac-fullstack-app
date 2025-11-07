import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Save, Upload, CheckCircle, Eye } from 'lucide-react';
import Button from '../../../components/Button';
import Layout from '../../../components/Layout';
import api from '../../../lib/api';

const EditApplication = () => {
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState(null);
  const [formSections, setFormSections] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fileModal, setFileModal] = useState({ show: false, url: '', fileName: '', type: '' });
  const [uploadingFiles, setUploadingFiles] = useState({});

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/applications/${id}`);
      const { application: appData, answers: answersData } = response.data;
      
      setApplication(appData);
      setAnswers(answersData || []);

      // Fetch form structure
      if (appData?.countryVisaType?._id) {
        const formResponse = await api.get(`/public/visa-types/${appData.countryVisaType._id}/form`);
        setFormSections(formResponse.data.sections || []);
        setFormFields(formResponse.data.fields || []);
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const getFieldsBySection = (sectionId) => {
    return formFields.filter(field => field.formSection === sectionId).sort((a, b) => a.order - b.order);
  };

  const getAnswerValue = (fieldId, applicantIndex = 0) => {
    const answer = answers.find(ans => 
      ans.field?._id === fieldId && ans.applicantIndex === applicantIndex
    );
    return answer?.answerText || answer?.answerFile || answer?.answerFiles || '';
  };

  const handleAnswerChange = (fieldId, value, applicantIndex = 0) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(ans => 
        ans.field?._id === fieldId && ans.applicantIndex === applicantIndex
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], answerText: value };
        return updated;
      } else {
        return [...prev, {
          _id: `temp-${Date.now()}-${Math.random()}`,
          field: { _id: fieldId },
          applicantIndex,
          answerText: value
        }];
      }
    });
  };

  const handleFileUpload = async (fieldId, files, applicantIndex = 0) => {
    if (!files || files.length === 0) return;
    
    const fieldKey = `${fieldId}-${applicantIndex}`;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const filesToUpload = Array.from(files);
    
    // Check file sizes
    for (const file of filesToUpload) {
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 5MB limit. Please select smaller files.`);
        return;
      }
    }
    
    try {
      setUploadingFiles(prev => ({ ...prev, [fieldKey]: true }));
      
      const uploadFormData = new FormData();
      filesToUpload.forEach(file => {
        uploadFormData.append('files', file);
      });
      
      const response = await api.post('/visa-applications/upload-multiple', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const uploadedFiles = response.data.files.map(file => ({
        filename: file.filename,
        originalName: file.originalName,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: file.uploadedAt
      }));
      
      // Get existing files and append new ones
      const existingAnswer = answers.find(ans => 
        ans.field?._id === fieldId && ans.applicantIndex === applicantIndex
      );
      const existingFiles = existingAnswer?.answerFiles || [];
      const allFiles = [...existingFiles, ...uploadedFiles];
      
      setAnswers(prev => {
        const existingIndex = prev.findIndex(ans => 
          ans.field?._id === fieldId && ans.applicantIndex === applicantIndex
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], answerFiles: allFiles };
          return updated;
        } else {
          return [...prev, {
            _id: `temp-${Date.now()}-${Math.random()}`,
            field: { _id: fieldId },
            applicantIndex,
            answerFiles: allFiles
          }];
        }
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const handleFileView = (fileData) => {
    if (typeof fileData === 'string') {
      try {
        fileData = JSON.parse(fileData);
      } catch (e) {
        return;
      }
    }
    
    const { fileName, fileType, fileUrl, filePath } = fileData;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    let url;
    
    if (fileUrl) {
      url = fileUrl;
    } else if (filePath?.startsWith('uploads/')) {
      url = `${baseUrl}/${filePath}`;
    } else {
      url = `${baseUrl}/uploads/applications/${filePath}`;
    }
    
    setFileModal({
      show: true,
      url,
      fileName,
      type: fileType
    });
  };

  const handleFileRemove = (fieldId, applicantIndex, fileIndex = null) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(ans => 
        ans.field?._id === fieldId && ans.applicantIndex === applicantIndex
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        const answer = updated[existingIndex];
        
        if (fileIndex !== null && answer.answerFiles) {
          // Remove specific file from array
          const newFiles = answer.answerFiles.filter((_, index) => index !== fileIndex);
          updated[existingIndex] = { ...answer, answerFiles: newFiles.length > 0 ? newFiles : [] };
        } else {
          // Remove all files
          updated[existingIndex] = { ...answer, answerFiles: [], answerFile: null };
        }
        
        return updated;
      }
      return prev;
    });
  };

  const renderFilePreview = (fileData, fieldId, applicantIndex) => {
    if (!fileData) return null;
    
    // Handle array of files
    if (Array.isArray(fileData)) {
      if (fileData.length === 0) return null;
      
      return (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{fileData.length} file(s) uploaded</span>
            <button
              type="button"
              onClick={() => handleFileRemove(fieldId, applicantIndex)}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Remove All
            </button>
          </div>
          {fileData.map((file, index) => {
            const isImage = file.mimetype?.startsWith('image/');
            const isPDF = file.mimetype === 'application/pdf';
            const fileSize = file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '';
            
            return (
              <div key={index} className="relative group border border-gray-200 rounded-lg p-3">
                <button
                  type="button"
                  onClick={() => handleFileRemove(fieldId, applicantIndex, index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
                
                {isImage ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/${file.path}`}
                      alt={file.originalName}
                      className="w-16 h-16 object-cover rounded border cursor-pointer"
                      onClick={() => handleFileView({
                        fileName: file.originalName,
                        fileType: file.mimetype,
                        filePath: file.path
                      })}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">{fileSize}</p>
                    </div>
                  </div>
                ) : isPDF ? (
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleFileView({
                    fileName: file.originalName,
                    fileType: file.mimetype,
                    filePath: file.path
                  })}>
                    <span className="text-red-600 text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800 truncate">{file.originalName}</p>
                      <p className="text-xs text-red-600">PDF Document • {fileSize}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-xl">📎</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">{fileSize}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    
    // Handle single file (legacy support)
    if (typeof fileData === 'string') {
      try {
        fileData = JSON.parse(fileData);
      } catch (e) {
        return <span className="text-sm text-gray-600">{fileData}</span>;
      }
    }
    
    const { fileName, fileType, fileUrl, filePath } = fileData;
    const isImage = fileType?.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    
    if (isImage) {
      return (
        <div className="mt-4">
          <img 
            src={fileUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/uploads/applications/${filePath}`}
            alt={fileName}
            className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200 cursor-pointer"
            onClick={() => handleFileView(fileData)}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <p className="text-xs text-gray-500 mt-2">{fileName}</p>
        </div>
      );
    }
    
    if (isPDF) {
      return (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-2xl">📄</span>
            <div>
              <p className="text-sm font-medium text-red-800">{fileName}</p>
              <p className="text-xs text-red-600">PDF Document</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">{fileName}</p>
      </div>
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/applications/${id}`, { answers });
      alert('Application updated successfully');
      router.push(`/applications/view/${id}`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  if (!loading && error) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Application</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
    );
  }

  if (!application) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
            <Button onClick={() => router.push('/applications')}>
              Back to Applications
            </Button>
          </div>
        </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Edit Application - One World Visa</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-100 h-100  rounded-2xl flex items-center justify-center shadow-lg">
                    {application.countryVisaType?.country?.placeImage ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/uploads/countries/${application.countryVisaType.country.placeImage}`} 
                        alt={application.countryVisaType?.country?.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-3xl">🌍</span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Edit Application
                    </h1>
                    <p className="text-gray-600 text-lg font-medium mt-1">
                      {application.countryVisaType?.country?.name} - {application.countryVisaType?.visaType?.name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push(`/applications/view/${id}`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Application Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Application Details</h3>
                <p className="text-gray-600 mt-1">Application #{application.applicationNumber}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-sm font-bold text-blue-800">Customer</div>
                <div className="text-blue-900 font-medium">{application.user?.name}</div>
                <div className="text-blue-700 text-sm">{application.user?.email}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-sm font-bold text-green-800">Application Type</div>
                <div className="text-green-900 font-medium capitalize">{application.applicationType || 'individual'}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm font-bold text-purple-800">Applicants</div>
                <div className="text-purple-900 font-medium">{application.numberOfApplicants || 1}</div>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-8">
            {formSections.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Form Available</h3>
                <p className="text-gray-600 text-lg">The form structure for this application is not available.</p>
              </div>
            ) : (
              application.applicationType === 'individual' ? (
                formSections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => {
                    const sectionFields = getFieldsBySection(section._id);
                    if (sectionFields.length === 0) return null;

                    return (
                      <div 
                        key={section._id} 
                        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">📋</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{section.name}</h3>
                            <p className="text-gray-600 mt-1">{section.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {sectionFields.map((field) => {
                            const currentValue = getAnswerValue(field._id, 0);
                            
                            return (
                              <div key={field._id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                <label className="block text-sm font-bold text-gray-800 mb-3">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                
                                {field.type === 'textarea' ? (
                                  <textarea
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={currentValue}
                                    onChange={(e) => handleAnswerChange(field._id, e.target.value, 0)}
                                    required={field.required}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                    rows={4}
                                  />
                                ) : field.type === 'select' ? (
                                  <select 
                                    name={field.name}
                                    value={currentValue}
                                    onChange={(e) => handleAnswerChange(field._id, e.target.value, 0)}
                                    required={field.required}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                                  >
                                    <option disabled value="">Select {field.label}</option>
                                    {field.options && field.options.map((option, index) => (
                                      <option key={index} value={option.toLowerCase().replace(/\s+/g, '-')}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : field.type === 'checkbox' ? (
                                  <div className="space-y-3">
                                    {field.options && field.options.map((option, index) => {
                                      const isChecked = currentValue.includes(option);
                                      return (
                                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                              const values = currentValue ? currentValue.split(',').filter(v => v) : [];
                                              if (e.target.checked) {
                                                values.push(option);
                                              } else {
                                                const idx = values.indexOf(option);
                                                if (idx > -1) values.splice(idx, 1);
                                              }
                                              handleAnswerChange(field._id, values.join(','), 0);
                                            }}
                                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                                          />
                                          <span className="text-gray-700">{option}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : field.type === 'radio' ? (
                                  <div className="space-y-3">
                                    {field.options && field.options.map((option, index) => (
                                      <label key={index} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`${field.name}-0`}
                                          value={option}
                                          checked={currentValue === option}
                                          onChange={(e) => handleAnswerChange(field._id, e.target.value, 0)}
                                          className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : field.type === 'file' ? (
                                  <div>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group">
                                      <input 
                                        type="file" 
                                        name={field.name}
                                        onChange={(e) => handleFileUpload(field._id, e.target.files, 0)}
                                        required={field.required && (!currentValue || (Array.isArray(currentValue) && currentValue.length === 0))}
                                        className="hidden" 
                                        id={field.name}
                                        accept="image/*,.pdf,.doc,.docx"
                                        multiple
                                        disabled={uploadingFiles[`${field._id}-0`]}
                                      />
                                      <label htmlFor={field.name} className="cursor-pointer">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                                          {uploadingFiles[`${field._id}-0`] ? (
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                          ) : (
                                            <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                                          )}
                                        </div>
                                        <div className="text-gray-600 font-medium">
                                          {uploadingFiles[`${field._id}-0`] ? (
                                            <div className="text-blue-600">Uploading files...</div>
                                          ) : currentValue && (Array.isArray(currentValue) ? currentValue.length > 0 : true) ? (
                                            <span className="text-green-600 flex items-center justify-center gap-2">
                                              <CheckCircle className="h-5 w-5" />
                                              {Array.isArray(currentValue) 
                                                ? `${currentValue.length} file(s) uploaded`
                                                : 'File uploaded successfully'
                                              }
                                            </span>
                                          ) : (
                                            <div>
                                              <div>Click to upload {field.label}</div>
                                              <div className="text-xs text-gray-500 mt-1">Select multiple files (Max 5MB per file)</div>
                                            </div>
                                          )}
                                        </div>
                                      </label>
                                    </div>
                                    {currentValue && renderFilePreview(currentValue, field._id, 0)}
                                  </div>
                                ) : (
                                  <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={currentValue}
                                    onChange={(e) => handleAnswerChange(field._id, e.target.value, 0)}
                                    required={field.required}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="space-y-8">
                  {[...Array(application.numberOfApplicants || 1)].map((_, applicantIndex) => (
                    <div key={applicantIndex} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                          <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {applicantIndex + 1}
                          </span>
                          <div>
                            <div>{applicantIndex === 0 ? 'Primary Applicant' : `Applicant ${applicantIndex + 1}`}</div>
                          </div>
                        </h3>
                      </div>
                      
                      {formSections
                        .sort((a, b) => a.order - b.order)
                        .map((section, sectionIndex) => {
                          const sectionFields = getFieldsBySection(section._id);
                          if (sectionFields.length === 0) return null;

                          return (
                            <div 
                              key={`${applicantIndex}-${section._id}`} 
                              className="mb-6 pb-6 border-b border-gray-100 last:border-b-0"
                            >
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-sm">
                                  {sectionIndex + 1}
                                </span>
                                {section.name}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sectionFields.map((field) => {
                                  const currentValue = getAnswerValue(field._id, applicantIndex);
                                  
                                  return (
                                    <div key={field._id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                      <label className="block text-sm font-bold text-gray-800 mb-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                      </label>
                                      
                                      {field.type === 'textarea' ? (
                                        <textarea
                                          value={currentValue}
                                          onChange={(e) => handleAnswerChange(field._id, e.target.value, applicantIndex)}
                                          rows={3}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                      ) : field.type === 'select' ? (
                                        <select
                                          value={currentValue}
                                          onChange={(e) => handleAnswerChange(field._id, e.target.value, applicantIndex)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                          <option disabled value="">Select an option</option>
                                          {field.options?.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                          ))}
                                        </select>
                                      ) : field.type === 'checkbox' ? (
                                        <div className="space-y-2">
                                          {field.options && field.options.map((option, index) => {
                                            const isChecked = currentValue.includes(option);
                                            return (
                                              <label key={index} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={(e) => {
                                                    const values = currentValue ? currentValue.split(',').filter(v => v) : [];
                                                    if (e.target.checked) {
                                                      values.push(option);
                                                    } else {
                                                      const idx = values.indexOf(option);
                                                      if (idx > -1) values.splice(idx, 1);
                                                    }
                                                    handleAnswerChange(field._id, values.join(','), applicantIndex);
                                                  }}
                                                  className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700 text-sm">{option}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      ) : field.type === 'radio' ? (
                                        <div className="space-y-2">
                                          {field.options && field.options.map((option, index) => (
                                            <label key={index} className="flex items-center gap-2 cursor-pointer">
                                              <input
                                                type="radio"
                                                name={`${field.name}-${applicantIndex}`}
                                                value={option}
                                                checked={currentValue === option}
                                                onChange={(e) => handleAnswerChange(field._id, e.target.value, applicantIndex)}
                                                className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                                              />
                                              <span className="text-gray-700 text-sm">{option}</span>
                                            </label>
                                          ))}
                                        </div>
                                      ) : field.type === 'file' ? (
                                        <div>
                                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <input 
                                              type="file" 
                                              onChange={(e) => handleFileUpload(field._id, e.target.files, applicantIndex)}
                                              className="hidden" 
                                              id={`${field.name}-${applicantIndex}`}
                                              accept="image/*,.pdf,.doc,.docx"
                                              multiple
                                              disabled={uploadingFiles[`${field._id}-${applicantIndex}`]}
                                            />
                                            <label htmlFor={`${field.name}-${applicantIndex}`} className="cursor-pointer">
                                              {uploadingFiles[`${field._id}-${applicantIndex}`] ? (
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                              ) : (
                                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                              )}
                                              <div className="text-gray-600">
                                                {uploadingFiles[`${field._id}-${applicantIndex}`] ? (
                                                  'Uploading files...'
                                                ) : currentValue && (Array.isArray(currentValue) ? currentValue.length > 0 : true) ? (
                                                  Array.isArray(currentValue) 
                                                    ? `${currentValue.length} file(s) uploaded - click to add more`
                                                    : 'File uploaded - click to change'
                                                ) : (
                                                  `Upload ${field.label} (multiple files)`
                                                )}
                                              </div>
                                            </label>
                                          </div>
                                          {currentValue && renderFilePreview(currentValue, field._id, applicantIndex)}
                                        </div>
                                      ) : (
                                        <input
                                          type={field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                                          value={currentValue}
                                          onChange={(e) => handleAnswerChange(field._id, e.target.value, applicantIndex)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

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
                  Close
                </button>
              </div>
              <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
                {fileModal.type?.startsWith('image/') ? (
                  <img 
                    src={fileModal.url} 
                    alt={fileModal.fileName}
                    className="w-full h-auto max-h-full object-contain"
                  />
                ) : fileModal.type === 'application/pdf' ? (
                  <iframe 
                    src={fileModal.url} 
                    className="w-full h-[70vh]"
                    title={fileModal.fileName}
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
    </div>
  );
};

export default EditApplication;