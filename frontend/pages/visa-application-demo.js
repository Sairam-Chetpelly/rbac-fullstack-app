import { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../lib/api';

export default function VisaApplicationDemo() {
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cvtResponse, sectionsResponse, fieldsResponse] = await Promise.all([
        api.get('/country-visa-types'),
        api.get('/form-sections'),
        api.get('/form-fields')
      ]);
      
      setCountryVisaTypes(cvtResponse.data);
      setFormSections(sectionsResponse.data);
      setFormFields(fieldsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldsBySection = (sectionId) => {
    return formFields
      .filter(field => field.formSection?._id === sectionId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visa application data...</p>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">🌍 Visa Application System Demo</h1>
          <p className="text-lg text-gray-600">Sample data for visa application forms with pricing</p>
        </div>

        {/* Visa Types & Pricing */}
        <Card title="Available Visa Types & Pricing" icon="💰">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {countryVisaTypes.map((cvt) => (
              <div key={cvt._id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🎫</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{cvt.name}</h3>
                    <p className="text-sm text-gray-600">{cvt.country?.name} - {cvt.visaType?.name}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">VFS Fee:</span>
                    <span className="font-semibold">${cvt.vfsAmount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Consulate Fee:</span>
                    <span className="font-semibold">${cvt.consulateAmount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Service Fee:</span>
                    <span className="font-semibold">${cvt.serviceAmount}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-100 rounded-lg px-3">
                    <span className="font-bold text-blue-900">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-900">${cvt.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Processing Time:</span>
                    <span>{cvt.processingTimeMin}-{cvt.processingTimeMax} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sample Application Form */}
        <Card title="Sample Visa Application Form (US Tourist Visa)" icon="📋">
          <div className="space-y-8">
            {formSections
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const sectionFields = getFieldsBySection(section._id);
                if (sectionFields.length === 0) return null;

                return (
                  <div key={section._id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">📝</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{section.name}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sectionFields.map((field) => (
                        <div key={field._id} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          
                          {field.type === 'textarea' ? (
                            <textarea
                              placeholder={field.placeholder}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                              disabled
                            />
                          ) : field.type === 'select' ? (
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled
                            >
                              <option>Select {field.label}</option>
                            </select>
                          ) : field.type === 'radio' ? (
                            <div className="flex gap-4">
                              <label className="flex items-center">
                                <input type="radio" name={field.name} className="mr-2" disabled />
                                Yes
                              </label>
                              <label className="flex items-center">
                                <input type="radio" name={field.name} className="mr-2" disabled />
                                No
                              </label>
                            </div>
                          ) : field.type === 'file' ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <span className="text-gray-500">📎 Upload {field.label}</span>
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled
                            />
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${field.type === 'file' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">Required</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Summary */}
        <Card title="System Summary" icon="📊">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{countryVisaTypes.length}</div>
              <div className="text-sm text-gray-600">Visa Types</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{formSections.length}</div>
              <div className="text-sm text-gray-600">Form Sections</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{formFields.length}</div>
              <div className="text-sm text-gray-600">Form Fields</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600">$140-$225</div>
              <div className="text-sm text-gray-600">Price Range</div>
            </div>
          </div>
        </Card>
      </div>
  );
}