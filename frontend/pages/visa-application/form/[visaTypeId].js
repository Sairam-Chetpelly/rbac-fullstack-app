import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Save, CreditCard, Upload, CheckCircle, Eye, Edit } from 'lucide-react';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';

import api from '../../../lib/api';

const VisaApplicationForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { visaTypeId, draftId } = router.query;
  const [visaType, setVisaType] = useState(null);
  const [country, setCountry] = useState(null);
  const [formSections, setFormSections] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [applicationType, setApplicationType] = useState('individual');
  const [numberOfApplicants, setNumberOfApplicants] = useState(1);
  const [currentApplicant, setCurrentApplicant] = useState(0);
  const [relationships, setRelationships] = useState(['self']);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationNumber, setApplicationNumber] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [fileModal, setFileModal] = useState({ show: false, url: '', fileName: '', type: '' });

  useEffect(() => {
    if (visaTypeId) {
      fetchFormData();
    }
  }, [visaTypeId]);

  useEffect(() => {
    if (draftId && user) {
      loadDraftData();
    }
  }, [draftId, user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching form data for visa type:', visaTypeId);
      
      const [visaTypeResponse, formResponse] = await Promise.all([
        api.get(`/public/visa-types/${visaTypeId}`),
        api.get(`/public/visa-types/${visaTypeId}/form`)
      ]);

      console.log('Visa type response:', visaTypeResponse.data);
      console.log('Form response:', formResponse.data);

      setVisaType(visaTypeResponse.data.visaType);
      setCountry(visaTypeResponse.data.country);
      setFormSections(formResponse.data.sections || []);
      setFormFields(formResponse.data.fields || []);
    } catch (err) {
      console.error('Error fetching form data:', err);
      setError('Failed to load application form');
    } finally {
      setLoading(false);
    }
  };

  const loadDraftData = async () => {
    try {
      const response = await api.get(`/customer/draft/${draftId}`);
      const { application, formData: draftFormData, applicants } = response.data;
      
      setFormData(draftFormData || {});
      setApplicationType(application.applicationType || 'individual');
      setNumberOfApplicants(application.numberOfApplicants || 1);
      setCurrentDraftId(application._id);
      
      if (applicants && applicants.length > 0) {
        const relationshipList = applicants.map(app => app.relationship || 'self');
        setRelationships(relationshipList);
      }
      
      console.log('Loaded draft data:', draftFormData);
    } catch (err) {
      console.error('Error loading draft data:', err);
      setError('Failed to load draft data');
    }
  };

  const getFieldsBySection = (sectionId) => {
    return formFields.filter(field => field.formSection === sectionId).sort((a, b) => a.order - b.order);
  };

  const handleInputChange = (fieldName, value, applicantIndex = currentApplicant) => {
    if (applicationType === 'individual') {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    } else {
      setFormData(prev => {
        const newData = Array.isArray(prev) ? [...prev] : [];
        while (newData.length <= applicantIndex) {
          newData.push({});
        }
        newData[applicantIndex] = {
          ...newData[applicantIndex],
          [fieldName]: value
        };
        return newData;
      });
    }
  };

  const getCurrentFormData = () => {
    if (applicationType === 'individual') {
      return formData;
    }
    return Array.isArray(formData) && formData[currentApplicant] ? formData[currentApplicant] : {};
  };

  const handleApplicationTypeChange = (type) => {
    setApplicationType(type);
    if (type === 'individual') {
      setNumberOfApplicants(1);
      setCurrentApplicant(0);
      // Convert array format to object format if needed
      if (Array.isArray(formData) && formData.length > 0) {
        setFormData(formData[0] || {});
      }
    } else {
      // Convert object format to array format if needed
      if (!Array.isArray(formData)) {
        setFormData([formData]);
      }
    }
  };

  const handleNumberOfApplicantsChange = (num) => {
    setNumberOfApplicants(num);
    if (applicationType !== 'individual') {
      setFormData(prev => {
        const newData = Array.isArray(prev) ? [...prev] : [{}];
        while (newData.length < num) {
          newData.push({});
        }
        return newData.slice(0, num);
      });
      
      setRelationships(prev => {
        const newRelationships = [...prev];
        while (newRelationships.length < num) {
          newRelationships.push('other');
        }
        return newRelationships.slice(0, num);
      });
    }
    if (currentApplicant >= num) {
      setCurrentApplicant(0);
    }
  };

  const handleRelationshipChange = (index, relationship) => {
    setRelationships(prev => {
      const newRelationships = [...prev];
      newRelationships[index] = relationship;
      return newRelationships;
    });
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('fieldName', fieldName);
    
    try {
      const response = await api.post('/visa-applications/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const fileData = {
        filePath: response.data.filePath,
        fileName: file.name,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file)
      };
      
      handleInputChange(fieldName, fileData);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
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
    const url = fileUrl || `http://localhost:5000/uploads/applications/${filePath}`;
    
    setFileModal({
      show: true,
      url,
      fileName,
      type: fileType
    });
  };

  const handleFileDownload = async (fileData) => {
    if (typeof fileData === 'string') {
      try {
        fileData = JSON.parse(fileData);
      } catch (e) {
        return;
      }
    }
    
    const { fileName, filePath } = fileData;
    const url = `http://localhost:5000/uploads/applications/${filePath}`;
    
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

  const renderFilePreview = (fileData) => {
    if (!fileData) return null;
    
    // Handle string format (legacy)
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
            src={fileUrl || `http://localhost:5000/uploads/applications/${filePath}`}
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

  const validateForm = () => {
    const requiredFields = formFields.filter(field => field.required);
    const missingFields = [];
    
    if (applicationType === 'individual') {
      requiredFields.forEach(field => {
        const value = formData[field.name];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(field.label);
        }
      });
    } else {
      for (let i = 0; i < numberOfApplicants; i++) {
        const applicantData = Array.isArray(formData) && formData[i] ? formData[i] : {};
        requiredFields.forEach(field => {
          const value = applicantData[field.name];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(`${field.label} (Applicant ${i + 1})`);
          }
        });
      }
    }
    
    return missingFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n${missingFields.join('\n')}`);
      return;
    }
    
    setCurrentStep(2);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);

    try {
      if (draftId) {
        const updateResponse = await api.put(`/customer/draft/${currentDraftId || draftId}`, {
          formData
        });
        if (updateResponse) {
          setCurrentDraftId(currentDraftId || draftId);
          setCurrentStep(3);
        }
      } else {
        const draftResponse = await handleSaveDraft();
        if (draftResponse) {
          setCurrentDraftId(draftResponse.draftId);
          setCurrentStep(3);
        }
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    try {
      // Create Razorpay order
      const totalAmount = visaType.totalAmount * numberOfApplicants;
      const orderResponse = await api.post('/create-payment-order', {
        visaTypeId,
        amount: totalAmount
      });

      const { orderId, amount, currency } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Visa Application',
        description: `${visaType.name} - ${country.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            let submitResponse;
            if (draftId || currentDraftId) {
              // Submit draft with payment
              submitResponse = await api.post('/visa-applications/submit', {
                visaTypeId,
                draftId: currentDraftId || draftId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                formData,
                applicationType,
                numberOfApplicants,
                relationships
              });
            } else {
              // Submit new application with payment
              submitResponse = await api.post('/visa-applications/submit', {
                visaTypeId,
                draftId: currentDraftId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                formData,
                applicationType,
                numberOfApplicants,
                relationships
              });
            }

            setApplicationNumber(submitResponse.data.applicationNumber);
            setPaymentStatus('success');
            setCurrentStep(4);
          } catch (err) {
            console.error('Error submitting application:', err);
            alert('Payment successful but application submission failed. Please contact support.');
          }
        },
        prefill: {
          name: (() => {
            const primaryData = applicationType === 'individual' ? formData : (Array.isArray(formData) && formData[0] ? formData[0] : {});
            return (primaryData.firstName || '') + ' ' + (primaryData.lastName || '');
          })(),
          email: (() => {
            const primaryData = applicationType === 'individual' ? formData : (Array.isArray(formData) && formData[0] ? formData[0] : {});
            return primaryData.email || '';
          })(),
          contact: (() => {
            const primaryData = applicationType === 'individual' ? formData : (Array.isArray(formData) && formData[0] ? formData[0] : {});
            return primaryData.phone || '';
          })()
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error creating payment order:', err);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (!user) {
        alert('Please log in to save your application.');
        router.push('/login');
        return;
      }
      
      let response;
      if (currentDraftId || draftId) {
        // Update existing draft
        response = await api.put(`/customer/draft/${currentDraftId || draftId}`, {
          formData,
          applicationType,
          numberOfApplicants,
          relationships
        });
        response.data = { ...response.data, draftId: currentDraftId || draftId };
      } else {
        // Create new draft
        response = await api.post('/visa-applications/draft', {
          visaTypeId,
          formData,
          applicationType,
          numberOfApplicants,
          relationships
        });
      }
      alert('Draft saved successfully!');
      return response.data;
    } catch (err) {
      console.error('Error saving draft:', err);
      if (err.response?.status === 401) {
        alert('Please log in to save your application.');
        router.push('/login');
      } else {
        alert('Failed to save draft.');
      }
      throw err;
    }
  };

  const renderTabs = () => {
    const tabs = [
      { id: 1, name: 'Application Form', icon: '📝', description: 'Fill out your details' },
      { id: 2, name: 'Review', icon: '👁️', description: 'Verify information' },
      { id: 3, name: 'Payment', icon: '💳', description: 'Complete payment' },
      { id: 4, name: 'Tracking', icon: '📍', description: 'Application status' }
    ];

    return (
      <div className="mb-12">
        <div className="flex justify-between items-center relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 z-0">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (tabs.length - 1)) * 100}%` }}
            />
          </div>
          
          {tabs.map((tab, index) => {
            const isActive = currentStep === tab.id;
            const isCompleted = currentStep > tab.id;
            const isAccessible = tab.id <= Math.max(currentStep, 1);
            
            return (
              <div key={tab.id} className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => isAccessible && setCurrentStep(tab.id)}
                  disabled={!isAccessible}
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : isCompleted
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'
                      : isAccessible
                      ? 'bg-white border-gray-300 text-gray-600 hover:border-blue-300 hover:shadow-md'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-8 w-8" />
                  ) : (
                    <span className="text-xl">{tab.icon}</span>
                  )}
                </button>
                <div className="mt-3 text-center">
                  <div className={`font-semibold text-sm ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {tab.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const currentFormData = getCurrentFormData();
    
    return (
      <div className="animate-fadeIn">
        {/* Application Type Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Application Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <button
              type="button"
              onClick={() => handleApplicationTypeChange('individual')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                applicationType === 'individual'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="text-4xl mb-3">👤</div>
              <div className="font-bold text-lg">Individual</div>
              <div className="text-sm text-gray-600">Single applicant</div>
            </button>
            <button
              type="button"
              onClick={() => handleApplicationTypeChange('family')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                applicationType === 'family'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
              <div className="font-bold text-lg">Family</div>
              <div className="text-sm text-gray-600">Family members</div>
            </button>
            <button
              type="button"
              onClick={() => handleApplicationTypeChange('group')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                applicationType === 'group'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="text-4xl mb-3">👥</div>
              <div className="font-bold text-lg">Group</div>
              <div className="text-sm text-gray-600">Multiple travelers</div>
            </button>
          </div>
          
          {applicationType !== 'individual' && (
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">Number of Applicants:</label>
              <select
                value={numberOfApplicants}
                onChange={(e) => handleNumberOfApplicantsChange(parseInt(e.target.value))}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Applicant Navigation */}
        {applicationType !== 'individual' && numberOfApplicants > 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Applicant Navigation</h3>
              <div className="text-sm text-gray-600">
                {currentApplicant + 1} of {numberOfApplicants}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {[...Array(numberOfApplicants)].map((_, index) => {
                const applicantData = Array.isArray(formData) && formData[index] ? formData[index] : {};
                const hasData = Object.keys(applicantData).length > 0;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentApplicant(index)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      currentApplicant === index
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : hasData
                        ? 'border-green-300 bg-green-50 text-green-700 hover:border-green-400'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{index + 1}</span>
                      {hasData && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div className="text-xs">
                      {index === 0 ? 'Primary' : relationships[index] || 'Other'}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Relationship Selector for Current Applicant */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Relationship to Primary Applicant (#{currentApplicant + 1}):
              </label>
              <select
                value={relationships[currentApplicant] || 'self'}
                onChange={(e) => handleRelationshipChange(currentApplicant, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="self">Self (Primary Applicant)</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {formSections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Form Available</h3>
              <p className="text-gray-600 text-lg">The application form for this visa type is not yet configured.</p>
            </div>
          ) : (
            formSections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => {
                const sectionFields = getFieldsBySection(section._id);
                if (sectionFields.length === 0) return null;

                return (
                  <div 
                    key={section._id} 
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
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
                      {sectionFields.map((field) => (
                        <div key={field._id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className="block text-sm font-bold text-gray-800 mb-3">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          
                          {field.type === 'textarea' ? (
                            <textarea
                              name={field.name}
                              placeholder={field.placeholder}
                              value={currentFormData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                              rows={4}
                            />
                          ) : field.type === 'select' ? (
                            <select 
                              name={field.name}
                              value={currentFormData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                            >
                              <option value="">Select {field.label}</option>
                              {field.options && field.options.map((option, index) => (
                                <option key={index} value={option.toLowerCase().replace(/\s+/g, '-')}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'file' ? (
                            <div>
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group">
                                <input 
                                  type="file" 
                                  name={field.name}
                                  onChange={(e) => handleFileUpload(field.name, e.target.files[0])}
                                  required={field.required}
                                  className="hidden" 
                                  id={field.name}
                                  accept="image/*,.pdf"
                                />
                                <label htmlFor={field.name} className="cursor-pointer">
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                                    <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                                  </div>
                                  <div className="text-gray-600 font-medium">
                                    {currentFormData[field.name] ? (
                                      <span className="text-green-600 flex items-center justify-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        File uploaded successfully
                                      </span>
                                    ) : (
                                      `Click to upload ${field.label}`
                                    )}
                                  </div>
                                </label>
                              </div>
                              {currentFormData[field.name] && renderFilePreview(currentFormData[field.name])}
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              placeholder={field.placeholder}
                              value={currentFormData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}

          <div className="flex gap-6 pt-8">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-4 text-lg font-semibold"
            >
              <Eye className="h-5 w-5 mr-3" />
              Continue to Review
            </Button>
            {!draftId && (
              <Button 
                type="button" 
                onClick={handleSaveDraft}
                variant="outline" 
                className="flex-1 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 py-4 text-lg font-semibold transition-all duration-200"
              >
                <Save className="h-5 w-5 mr-3" />
                Save as Draft
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  };

  const renderReview = () => {
    return (
      <div className="animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Review Your Application</h3>
              <p className="text-gray-600 mt-1">Please verify all information before proceeding to payment.</p>
            </div>
          </div>
          
          {/* Application Type Summary */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Application Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-sm font-bold text-blue-800">Application Type</div>
                <div className="text-blue-900 font-medium capitalize">{applicationType}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-sm font-bold text-green-800">Number of Applicants</div>
                <div className="text-green-900 font-medium">{numberOfApplicants}</div>
              </div>
            </div>
          </div>

          {/* Applicant Data */}
          {applicationType === 'individual' ? (
            formSections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => {
                const sectionFields = getFieldsBySection(section._id);
                const hasData = sectionFields.some(field => formData[field.name] || field.required);
                
                if (!hasData) return null;

                return (
                  <div 
                    key={section._id} 
                    className="mb-8 pb-8 border-b border-gray-100 last:border-b-0 last:pb-0"
                  >
                    <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </span>
                      {section.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sectionFields.map((field) => {
                        const value = formData[field.name];
                        if (!value && !field.required) return null;

                        return (
                          <div key={field._id} className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
                            <div className="text-sm font-bold text-gray-800 mb-2">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <div className="text-gray-900 font-medium">
                              {!value && field.required ? (
                                <span className="italic text-red-600 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                  Required field - not filled
                                </span>
                              ) : field.type === 'file' ? (
                                <div>
                                  <span className="text-green-600 flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4" />
                                    File uploaded successfully
                                  </span>
                                  <span className="text-gray-900">{value?.fileName || 'File uploaded'}</span>
                                </div>
                              ) : (
                                <span className="text-gray-900">{value}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          ) : (
            [...Array(numberOfApplicants)].map((_, applicantIndex) => {
              const applicantData = Array.isArray(formData) && formData[applicantIndex] ? formData[applicantIndex] : {};
              
              return (
                <div key={applicantIndex} className="mb-12 pb-8 border-b-2 border-blue-100 last:border-b-0">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {applicantIndex + 1}
                      </span>
                      <div>
                        <div>{applicantIndex === 0 ? 'Primary Applicant' : `Applicant ${applicantIndex + 1}`}</div>
                        <div className="text-sm text-gray-600 font-normal capitalize">
                          Relationship: {relationships[applicantIndex] || 'Other'}
                        </div>
                      </div>
                    </h3>
                  </div>
                  
                  {formSections
                    .sort((a, b) => a.order - b.order)
                    .map((section, sectionIndex) => {
                      const sectionFields = getFieldsBySection(section._id);
                      const hasData = sectionFields.some(field => applicantData[field.name] || field.required);
                      
                      if (!hasData) return null;

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
                              const value = applicantData[field.name];
                              if (!value && !field.required) return null;

                              return (
                                <div key={field._id} className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 border border-gray-200">
                                  <div className="text-sm font-bold text-gray-800 mb-2">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </div>
                                  <div className="text-gray-900 font-medium">
                                    {!value && field.required ? (
                                      <span className="italic text-red-600 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        Required field - not filled
                                      </span>
                                    ) : field.type === 'file' ? (
                                      <div>
                                        <span className="text-green-600 flex items-center gap-2 mb-2">
                                          <CheckCircle className="h-4 w-4" />
                                          File uploaded successfully
                                        </span>
                                        <span className="text-gray-900">{value?.fileName || 'File uploaded'}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-900">{value}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })
          )}
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 text-amber-800">
              <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">Final Verification</span>
            </div>
            <p className="text-amber-700 mt-2 ml-11">
              Please ensure all information for {numberOfApplicants > 1 ? `all ${numberOfApplicants} applicants` : 'the applicant'} is accurate. Once you proceed to payment, modifications will not be possible.
            </p>
          </div>
          
          <div className="flex gap-6 pt-6">
            <Button 
              onClick={() => setCurrentStep(1)}
              variant="outline" 
              className="flex-1 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 py-4 text-lg font-semibold transition-all duration-200"
            >
              <Edit className="h-5 w-5 mr-3" />
              Edit Application
            </Button>
            <Button 
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-4 text-lg font-semibold"
            >
              <CheckCircle className="h-5 w-5 mr-3" />
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPayment = () => {
    return (
      <div className="animate-fadeIn">
        {/* Pricing Summary - Show only in payment tab */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-2xl p-8 border-2 border-blue-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-20 -mt-20"></div>
          <div className="relative">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">💰</span>
              Pricing Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="text-2xl font-bold text-blue-600">₹{visaType?.vfsAmount}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">VFS Fee {numberOfApplicants > 1 ? `(×${numberOfApplicants})` : ''}</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="text-2xl font-bold text-green-600">₹{visaType?.consulateAmount}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">Consulate Fee {numberOfApplicants > 1 ? `(×${numberOfApplicants})` : ''}</div>
              </div>
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="text-2xl font-bold text-purple-600">₹{visaType?.serviceAmount}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">Service Fee {numberOfApplicants > 1 ? `(×${numberOfApplicants})` : ''}</div>
              </div>
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">₹{visaType?.totalAmount * numberOfApplicants}</div>
                <div className="text-sm font-bold text-gray-700 mt-1">Total Amount</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Complete Payment</h3>
            <p className="text-gray-600 text-lg">
              Your application is ready. Complete the payment to submit your visa application.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-2xl p-8 mb-8 border-2 border-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative text-center">
              <div className="text-sm font-semibold text-gray-600 mb-2">Total Amount</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                ₹{visaType?.totalAmount * numberOfApplicants}
              </div>
              <div className="text-gray-600 font-medium">
                {visaType?.name} - {country?.name}
                {numberOfApplicants > 1 && <div className="text-sm mt-1">{numberOfApplicants} Applicants</div>}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Secure payment powered by Razorpay
              </div>
            </div>
          </div>
          
          <div className="flex gap-6">
            <Button 
              onClick={() => setCurrentStep(2)}
              variant="outline" 
              className="flex-1 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 py-4 text-lg font-semibold transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Back to Review
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-4 text-lg font-semibold"
            >
              <CreditCard className="h-5 w-5 mr-3" />
              Pay Now
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderTracking = () => {
    return (
      <div className="animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully! 🎉
            </h1>
            <p className="text-gray-600 text-lg">
              Your visa application has been submitted and payment processed successfully.
            </p>
          </div>

          {applicationNumber && (
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">Application Number</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {applicationNumber}
              </p>
              <p className="text-sm text-gray-500 mt-2">Keep this number for tracking your application</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <Button 
              onClick={() => router.push('/customer/dashboard')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-4 text-lg font-semibold"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 py-4 text-lg font-semibold transition-all duration-200"
            >
              Back to Home
            </Button>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">What's Next?</span>
            </div>
            <p className="text-blue-700">
              You will receive email updates about your application status. Processing typically takes 5-15 business days.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderForm();
      case 2:
        return renderReview();
      case 3:
        return renderPayment();
      case 4:
        return renderTracking();
      default:
        return renderForm();
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{!user ? 'Redirecting to login...' : 'Loading application form...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Form</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">{country?.flagEmoji || '🌍'}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Visa Application Form
                  </h1>
                  <p className="text-gray-600 text-lg font-medium mt-1">
                    {visaType?.name} - {country?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tab Navigation */}
          {renderTabs()}
          


          {/* Current Step Content */}
          {renderCurrentStep()}
        </div>

        {/* File Modal */}
        {fileModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{fileModal.fileName}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleFileDownload({ fileName: fileModal.fileName, filePath: fileModal.url.split('/').pop() })}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    Download
                  </button>
                  <button 
                    onClick={() => setFileModal({ show: false, url: '', fileName: '', type: '' })}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
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
    </>
  );
};

export default VisaApplicationForm;