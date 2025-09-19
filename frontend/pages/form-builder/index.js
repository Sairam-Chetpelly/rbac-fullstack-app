import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function FormBuilder() {
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [formSections, setFormSections] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const router = useRouter();

  useEffect(() => {
    fetchVisaTypes();
  }, []);

  useEffect(() => {
    if (selectedVisa) {
      fetchVisaForm(selectedVisa._id);
    }
  }, [selectedVisa]);

  const fetchVisaTypes = async () => {
    try {
      const response = await api.get('/country-visa-types');
      setCountryVisaTypes(response.data);
      
      if (response.data.length > 0) {
        setSelectedVisa(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching visa types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisaForm = async (visaId) => {
    setFormLoading(true);
    try {
      const response = await api.get(`/visa-form/${visaId}`);
      setFormSections(response.data.sections);
      setFormFields(response.data.fields);
    } catch (error) {
      console.error('Error fetching visa form:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleVisaChange = (visa) => {
    setSelectedVisa(visa);
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
          <p className="text-gray-600">Loading form builder...</p>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">🏗️ Visa Form Builder</h1>
            <p className="text-sm sm:text-base text-gray-600">Build and preview visa application forms</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab('builder')}
              variant={activeTab === 'builder' ? 'primary' : 'outline'}
              icon="🏗️"
            >
              Builder
            </Button>
            <Button
              onClick={() => setActiveTab('preview')}
              variant={activeTab === 'preview' ? 'primary' : 'outline'}
              icon="👁️"
            >
              Preview
            </Button>
          </div>
        </div>

        {/* Visa Selection */}
        <Card title="Select Visa Type" icon="🎫">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryVisaTypes.map((cvt) => (
              <div
                key={cvt._id}
                onClick={() => handleVisaChange(cvt)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedVisa?._id === cvt._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{cvt.name}</h3>
                    <p className="text-sm text-gray-600">{cvt.country?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">${cvt.totalAmount}</span>
                  <p className="text-xs text-gray-500">{cvt.processingTimeMin}-{cvt.processingTimeMax} days</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {activeTab === 'builder' ? (
          <Card title="Form Builder" icon="🏗️">
            {formLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading form structure...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Form Sections & Fields</h3>
                  <Button onClick={() => router.push('/form-sections/add')} icon="➕" size="sm">
                    Add Section
                  </Button>
                </div>

              <div className="space-y-6">
                {formSections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const sectionFields = getFieldsBySection(section._id);
                    
                    return (
                      <div key={section._id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📝</span>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{section.name}</h4>
                              <p className="text-sm text-gray-600">{section.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => router.push(`/form-fields/add?section=${section._id}`)}
                              size="sm"
                              icon="➕"
                            >
                              Add Field
                            </Button>
                            <Button
                              onClick={() => router.push(`/form-sections/${section._id}`)}
                              variant="outline"
                              size="sm"
                              icon="✏️"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sectionFields.map((field) => (
                            <div key={field._id} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-700">{field.label}</span>
                                  {field.required && <span className="text-red-500">*</span>}
                                </div>
                                <Button
                                  onClick={() => router.push(`/form-fields/${field._id}`)}
                                  variant="ghost"
                                  size="sm"
                                  icon="✏️"
                                />
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-1 rounded-full ${
                                  field.type === 'file' ? 'bg-purple-100 text-purple-800' : 
                                  field.type === 'select' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {field.type}
                                </span>
                                <span className="text-gray-500">Order: {field.order}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {sectionFields.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No fields in this section</p>
                            <Button
                              onClick={() => router.push(`/form-fields/add?section=${section._id}`)}
                              size="sm"
                              icon="➕"
                              className="mt-2"
                            >
                              Add First Field
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {formSections.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No form sections found</h3>
                  <p className="text-gray-600 mb-6">Create your first form section to get started.</p>
                  <Button onClick={() => router.push('/form-sections/add')} icon="➕">
                    Create First Section
                  </Button>
                </div>
              )}
              </div>
            )}
          </Card>
        ) : (
          <Card title={`Form Preview - ${selectedVisa?.name || 'Select a visa type'}`} icon="👁️">
            {selectedVisa && (
              formLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading form preview...</p>
                </div>
              ) : (
                <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Pricing Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">${selectedVisa.vfsAmount}</div>
                      <div className="text-sm text-gray-600">VFS Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">${selectedVisa.consulateAmount}</div>
                      <div className="text-sm text-gray-600">Consulate Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">${selectedVisa.serviceAmount}</div>
                      <div className="text-sm text-gray-600">Service Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">${selectedVisa.totalAmount}</div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>
                </div>

                <form className="space-y-8">
                  {formSections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => {
                      const sectionFields = getFieldsBySection(section._id);
                      if (sectionFields.length === 0) return null;

                      return (
                        <div key={section._id} className="border border-gray-200 rounded-xl p-6">
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
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                  />
                                ) : field.type === 'select' ? (
                                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                                          <input type="radio" name={field.name} value={option} className="mr-2" />
                                          {option}
                                        </label>
                                      ))
                                    ) : (
                                      <>
                                        <label className="flex items-center">
                                          <input type="radio" name={field.name} className="mr-2" />
                                          Yes
                                        </label>
                                        <label className="flex items-center">
                                          <input type="radio" name={field.name} className="mr-2" />
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
                                          <input type="checkbox" name={field.name} value={option} className="mr-2" />
                                          {option}
                                        </label>
                                      ))
                                    ) : (
                                      <label className="flex items-center">
                                        <input type="checkbox" name={field.name} className="mr-2" />
                                        {field.label}
                                      </label>
                                    )}
                                  </div>
                                ) : field.type === 'file' ? (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    <input type="file" className="hidden" id={field.name} />
                                    <label htmlFor={field.name} className="cursor-pointer">
                                      <div className="text-4xl mb-2">📎</div>
                                      <div className="text-sm text-gray-600">Click to upload {field.label}</div>
                                    </label>
                                  </div>
                                ) : (
                                  <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                  <div className="flex gap-4 pt-6">
                    <Button type="button" className="flex-1" icon="💳">
                      Submit Application & Pay ${selectedVisa.totalAmount}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" icon="💾">
                      Save as Draft
                    </Button>
                  </div>
                </form>
                </div>
              )
            )}
          </Card>
        )}
      </div>
  );
}