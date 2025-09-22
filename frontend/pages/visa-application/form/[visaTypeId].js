import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Save, CreditCard, Upload, CheckCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      const { application, formData: draftFormData } = response.data;
      
      setFormData(draftFormData || {});
      setCurrentDraftId(application._id);
      
      console.log('Loaded draft data:', draftFormData);
    } catch (err) {
      console.error('Error loading draft data:', err);
      setError('Failed to load draft data');
    }
  };

  const getFieldsBySection = (sectionId) => {
    return formFields.filter(field => field.formSection === sectionId).sort((a, b) => a.order - b.order);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);
    
    try {
      const response = await api.post('/visa-applications/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: response.data.filePath
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (draftId) {
        // Update existing draft and show payment modal
        const updateResponse = await api.put(`/customer/draft/${currentDraftId || draftId}`, {
          formData
        });
        if (updateResponse) {
          setCurrentDraftId(currentDraftId || draftId);
          setShowPaymentModal(true);
        }
      } else {
        // First save as draft
        const draftResponse = await handleSaveDraft();
        if (draftResponse) {
          setCurrentDraftId(draftResponse.draftId);
          setShowPaymentModal(true);
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
      const orderResponse = await api.post('/create-payment-order', {
        visaTypeId,
        amount: visaType.totalAmount
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
                ...formData
              });
            } else {
              // Submit new application with payment
              submitResponse = await api.post('/visa-applications/submit', {
                visaTypeId,
                draftId: currentDraftId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                ...formData
              });
            }

            setShowPaymentModal(false);
            router.push(`/application-success?applicationNumber=${submitResponse.data.applicationNumber}`);
          } catch (err) {
            console.error('Error submitting application:', err);
            alert('Payment successful but application submission failed. Please contact support.');
          }
        },
        prefill: {
          name: (formData.firstName || '') + ' ' + (formData.lastName || ''),
          email: formData.email || '',
          contact: formData.phone || ''
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
          formData
        });
        response.data = { ...response.data, draftId: currentDraftId || draftId };
      } else {
        // Create new draft
        response = await api.post('/visa-applications/draft', {
          visaTypeId,
          formData
        });
      }
      if (!showPaymentModal) {
        alert('Draft saved successfully!');
      }
      return response.data;
    } catch (err) {
      console.error('Error saving draft:', err);
      if (err.response?.status === 401) {
        alert('Please log in to save your application.');
        router.push('/login');
      } else if (!showPaymentModal) {
        alert('Failed to save draft.');
      }
      throw err;
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              {/* <Button
                onClick={() => router.back()}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> */}
              <div className="flex items-center gap-3">
                <span className="text-4xl">{country?.flagEmoji || '🌍'}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Visa Application Form</h1>
                  <p className="text-gray-600">
                    {visaType?.name} - {country?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Pricing Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Pricing Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">${visaType?.vfsAmount}</div>
                <div className="text-sm text-gray-600">VFS Fee</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">${visaType?.consulateAmount}</div>
                <div className="text-sm text-gray-600">Consulate Fee</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">${visaType?.serviceAmount}</div>
                <div className="text-sm text-gray-600">Service Fee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">₹{visaType?.totalAmount}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {formSections.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Form Available</h3>
                <p className="text-gray-600">The application form for this visa type is not yet configured.</p>
              </div>
            ) : (
              formSections
                .sort((a, b) => a.order - b.order)
                .map((section) => {
                  const sectionFields = getFieldsBySection(section._id);
                  if (sectionFields.length === 0) return null;

                  return (
                    <div key={section._id} className="bg-white rounded-xl shadow-lg p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">📋</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{section.name}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sectionFields.map((field) => (
                          <div key={field._id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {field.type === 'textarea' ? (
                              <textarea
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                required={field.required}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                              />
                            ) : field.type === 'select' ? (
                              <select 
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                required={field.required}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select {field.label}</option>
                                {field.options && field.options.map((option, index) => (
                                  <option key={index} value={option.toLowerCase().replace(/\s+/g, '-')}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'radio' ? (
                              <div className="flex gap-4">
                                {field.options && field.options.length > 0 ? (
                                  field.options.map((option, index) => (
                                    <label key={index} className="flex items-center">
                                      <input 
                                        type="radio" 
                                        name={field.name} 
                                        value={option}
                                        checked={formData[field.name] === option}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        required={field.required}
                                        className="mr-2" 
                                      />
                                      {option}
                                    </label>
                                  ))
                                ) : (
                                  <>
                                    <label className="flex items-center">
                                      <input 
                                        type="radio" 
                                        name={field.name} 
                                        value="yes"
                                        checked={formData[field.name] === 'yes'}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        required={field.required}
                                        className="mr-2" 
                                      />
                                      Yes
                                    </label>
                                    <label className="flex items-center">
                                      <input 
                                        type="radio" 
                                        name={field.name} 
                                        value="no"
                                        checked={formData[field.name] === 'no'}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        required={field.required}
                                        className="mr-2" 
                                      />
                                      No
                                    </label>
                                  </>
                                )}
                              </div>
                            ) : field.type === 'checkbox' ? (
                              <div className="space-y-2">
                                {field.options && field.options.length > 0 ? (
                                  field.options.map((option, index) => (
                                    <label key={index} className="flex items-center">
                                      <input 
                                        type="checkbox" 
                                        name={field.name} 
                                        value={option}
                                        checked={(formData[field.name] || []).includes(option)}
                                        onChange={(e) => {
                                          const currentValues = formData[field.name] || [];
                                          const newValues = e.target.checked
                                            ? [...currentValues, option]
                                            : currentValues.filter(v => v !== option);
                                          handleInputChange(field.name, newValues);
                                        }}
                                        className="mr-2" 
                                      />
                                      {option}
                                    </label>
                                  ))
                                ) : (
                                  <label className="flex items-center">
                                    <input 
                                      type="checkbox" 
                                      name={field.name}
                                      checked={formData[field.name] || false}
                                      onChange={(e) => handleInputChange(field.name, e.target.checked)}
                                      required={field.required}
                                      className="mr-2" 
                                    />
                                    {field.label}
                                  </label>
                                )}
                              </div>
                            ) : field.type === 'file' ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <input 
                                  type="file" 
                                  name={field.name}
                                  onChange={(e) => handleFileUpload(field.name, e.target.files[0])}
                                  required={field.required}
                                  className="hidden" 
                                  id={field.name} 
                                />
                                <label htmlFor={field.name} className="cursor-pointer">
                                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <div className="text-sm text-gray-600">
                                    {formData[field.name] ? formData[field.name].name : `Click to upload ${field.label}`}
                                  </div>
                                </label>
                              </div>
                            ) : (
                              <input
                                type={field.type}
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                required={field.required}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : (draftId ? 'Submit Application' : 'Submit Application')}
              </Button>
              {!draftId && (
                <Button 
                  type="button" 
                  onClick={handleSaveDraft}
                  variant="outline" 
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h3>
              <p className="text-gray-600 mb-6">
                Your application has been saved. Complete the payment to submit your visa application.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">₹{visaType?.totalAmount}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowPaymentModal(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayment}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VisaApplicationForm;