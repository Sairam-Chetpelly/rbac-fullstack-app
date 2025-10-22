import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function FormBuilder() {
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [formSections, setFormSections] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  
  // Form data
  const [sectionForm, setSectionForm] = useState({
    name: '',
    description: '',
    order: 1,
    countryVisaType: '',
    status: ''
  });
  
  const [fieldForm, setFieldForm] = useState({
    name: '',
    label: '',
    type: 'text',
    placeholder: '',
    defaultValue: '',
    required: false,
    order: 1,
    formSection: '',
    status: '',
    options: [],
    validationRules: {}
  });
  
  const [newOption, setNewOption] = useState('');
  const [statuses, setStatuses] = useState([]);
  
  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'password', label: 'Password' },
    { value: 'number', label: 'Number' },
    { value: 'tel', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Drop Down' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
    { value: 'file', label: 'File' },
    { value: 'date', label: 'Date' }
  ];

  const router = useRouter();

  useEffect(() => {
    fetchVisaTypes();
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (selectedVisa) {
      fetchVisaForm(selectedVisa._id);
    }
  }, [selectedVisa]);

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/status');
      setStatuses(response.data);
    } catch (error) {
      toast.error('Failed to fetch statuses');
    }
  };

  const fetchVisaTypes = async () => {
    try {
      const response = await api.get('/country-visa-types');
      setCountryVisaTypes(response.data);
    } catch (error) {
      toast.error('Failed to fetch visa types');
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
      toast.error('Failed to fetch visa form');
    } finally {
      setFormLoading(false);
    }
  };

  const handleVisaSelect = (visa) => {
    setSelectedVisa(visa);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const getFieldsBySection = (sectionId) => {
    return formFields
      .filter(field => field.formSection?._id === sectionId)
      .sort((a, b) => a.order - b.order);
  };

  const filteredVisaTypes = countryVisaTypes.filter(visa =>
    visa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visa.country?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Section CRUD operations
  const openSectionModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        name: section.name,
        description: section.description || '',
        order: section.order,
        countryVisaType: section.countryVisaType?._id || selectedVisa?._id || '',
        status: section.status?._id || (statuses.find(s => s.name === 'active')?._id || '')
      });
    } else {
      setEditingSection(null);
      setSectionForm({
        name: '',
        description: '',
        order: formSections.length + 1,
        countryVisaType: selectedVisa?._id || '',
        status: statuses.find(s => s.name === 'active')?._id || ''
      });
    }
    setShowSectionModal(true);
  };

  const saveSectionForm = async () => {
    try {
      const sectionData = {
        ...sectionForm,
        countryVisaType: sectionForm.countryVisaType || selectedVisa._id
      };

      if (editingSection) {
        await api.put(`/form-sections/${editingSection._id}`, sectionData);
        toast.success('Section updated successfully!');
      } else {
        await api.post('/form-sections', sectionData);
        toast.success('Section created successfully!');
      }
      
      setShowSectionModal(false);
      fetchVisaForm(selectedVisa._id);
    } catch (error) {
      toast.error('Failed to save section');
    }
  };

  const handleSectionChange = (e) => {
    setSectionForm({
      ...sectionForm,
      [e.target.name]: e.target.value
    });
  };

  const deleteSection = async (sectionId) => {
    if (confirm('Are you sure you want to delete this section?')) {
      try {
        await api.delete(`/form-sections/${sectionId}`);
        toast.success('Section deleted successfully!');
        fetchVisaForm(selectedVisa._id);
      } catch (error) {
        toast.error('Failed to delete section');
      }
    }
  };

  // Field CRUD operations
  const openFieldModal = (field = null, sectionId = null) => {
    if (field) {
      setEditingField(field);
      setFieldForm({
        name: field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder || '',
        defaultValue: field.defaultValue || '',
        required: field.required || false,
        order: field.order,
        formSection: field.formSection?._id || '',
        status: field.status?._id || '',
        options: field.options || [],
        validationRules: field.validationRules || {}
      });
      setSelectedSectionId(field.formSection?._id);
    } else {
      setEditingField(null);
      const sectionFields = getFieldsBySection(sectionId);
      setFieldForm({
        name: '',
        label: '',
        type: 'text',
        placeholder: '',
        defaultValue: '',
        required: false,
        order: sectionFields.length + 1,
        formSection: sectionId,
        status: statuses.find(s => s.name === 'active')?._id || '',
        options: [],
        validationRules: {}
      });
      setSelectedSectionId(sectionId);
    }
    setShowFieldModal(true);
  };

  const saveFieldForm = async () => {
    try {
      const fieldData = {
        ...fieldForm,
        formSection: fieldForm.formSection || selectedSectionId,
        name: fieldForm.name || fieldForm.label.toLowerCase().replace(/\s+/g, '_')
      };

      if (editingField) {
        await api.put(`/form-fields/${editingField._id}`, fieldData);
        toast.success('Field updated successfully!');
      } else {
        await api.post('/form-fields', fieldData);
        toast.success('Field created successfully!');
      }
      
      setShowFieldModal(false);
      fetchVisaForm(selectedVisa._id);
    } catch (error) {
      toast.error('Failed to save field');
    }
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Auto-generate name from label
    if (name === 'label' && newValue) {
      const autoName = newValue.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      setFieldForm({
        ...fieldForm,
        [name]: newValue,
        name: autoName
      });
    } else {
      setFieldForm({
        ...fieldForm,
        [name]: newValue
      });
    }
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFieldForm({
        ...fieldForm,
        options: [...fieldForm.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    setFieldForm({
      ...fieldForm,
      options: fieldForm.options.filter((_, i) => i !== index)
    });
  };

  const handleValidationChange = (field, value) => {
    setFieldForm({
      ...fieldForm,
      validationRules: {
        ...fieldForm.validationRules,
        [field]: value || undefined
      }
    });
  };

  const deleteField = async (fieldId) => {
    if (confirm('Are you sure you want to delete this field?')) {
      try {
        await api.delete(`/form-fields/${fieldId}`);
        toast.success('Field deleted successfully!');
        fetchVisaForm(selectedVisa._id);
      } catch (error) {
        toast.error('Failed to delete field');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Form Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🏗️</span>
              <h1 className="text-xl font-bold text-gray-900">Visa Form Builder</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'builder'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Builder
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Visa Selection */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Visa Type</h2>
            
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full p-4 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {selectedVisa ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{selectedVisa.country?.flagEmoji || '🌍'}</span>
                      <div>
                        <div className="font-medium text-gray-900">{selectedVisa.name}</div>
                        <div className="text-sm text-gray-500">
                          {selectedVisa.country?.name} • ${selectedVisa.totalAmount}
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Choose a visa type...</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-3 border-b">
                    <input
                      type="text"
                      placeholder="Search visa types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredVisaTypes.map((visa) => (
                      <button
                        key={visa._id}
                        onClick={() => handleVisaSelect(visa)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{visa.country?.flagEmoji || '🌍'}</span>
                          <div>
                            <div className="font-medium text-gray-900">{visa.name}</div>
                            <div className="text-sm text-gray-500">
                              {visa.country?.name} • ${visa.totalAmount} • {visa.processingTimeMin}-{visa.processingTimeMax} days
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedVisa && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">₹{selectedVisa.totalAmount}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  {selectedVisa.agentDiscount && selectedVisa.agentDiscount !== '0' && (
                    <div>
                      <div className="text-lg font-semibold text-orange-600">₹{selectedVisa.agentDiscount}</div>
                      <div className="text-xs text-gray-600">Agent Discount</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {!selectedVisa ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Visa Type</h3>
              <p className="text-gray-600">Choose a visa configuration to start building forms</p>
            </div>
          </div>
        ) : activeTab === 'builder' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Form Sections</h2>
              <Button onClick={() => openSectionModal()} icon="➕">
                Add Section
              </Button>
            </div>

            {formLoading ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading form structure...</p>
              </div>
            ) : formSections.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Form Sections</h3>
                <p className="text-gray-600 mb-6">Create your first section to start building the form</p>
                <Button onClick={() => openSectionModal()} icon="➕">
                  Create First Section
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {formSections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const sectionFields = getFieldsBySection(section._id);
                    
                    return (
                      <div key={section._id} className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">📝</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                                <p className="text-sm text-gray-600">{section.description}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => openFieldModal(null, section._id)}
                                size="sm"
                                variant="outline"
                                icon="➕"
                              >
                                <span className="hidden sm:inline">Add Field</span>
                              </Button>
                              <Button
                                onClick={() => openSectionModal(section)}
                                size="sm"
                                variant="ghost"
                                icon="✏️"
                              >
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <Button
                                onClick={() => deleteSection(section._id)}
                                size="sm"
                                variant="danger"
                                icon="🗑️"
                              >
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </div>
                          </div>

                          {sectionFields.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                              <p className="text-gray-500 mb-4">No fields in this section</p>
                              <Button
                                onClick={() => openFieldModal(null, section._id)}
                                size="sm"
                                icon="➕"
                              >
                                Add First Field
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {sectionFields.map((field) => (
                                <div key={field._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-gray-900">{field.label}</span>
                                      {field.required && <span className="text-red-500">*</span>}
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={() => openFieldModal(field)}
                                        size="sm"
                                        variant="ghost"
                                        icon="✏️"
                                      />
                                      <Button
                                        onClick={() => deleteField(field._id)}
                                        size="sm"
                                        variant="danger"
                                        icon="🗑️"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      field.type === 'file' ? 'bg-purple-100 text-purple-800' : 
                                      field.type === 'select' ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {field.type}
                                    </span>
                                    <span className="text-xs text-gray-500">Order: {field.order}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Form Preview - {selectedVisa.name}</h2>

              {formLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading preview...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Pricing Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-green-600">₹{selectedVisa.totalAmount}</div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                      </div>
                      {selectedVisa.agentDiscount && selectedVisa.agentDiscount !== '0' && (
                        <div>
                          <div className="text-xl font-bold text-orange-600">₹{selectedVisa.agentDiscount}</div>
                          <div className="text-sm text-gray-600">Agent Discount Available</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <form className="space-y-8">
                    {formSections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const sectionFields = getFieldsBySection(section._id);
                        if (sectionFields.length === 0) return null;

                        return (
                          <div key={section._id} className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-6">
                              <span className="text-xl">📋</span>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                                <p className="text-sm text-gray-600">{section.description}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {sectionFields.map((field) => (
                                <div key={field._id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  
                                  {field.type === 'textarea' ? (
                                    <textarea
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows={3}
                                    />
                                  ) : field.type === 'select' ? (
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                      <option disabled value="">Select {field.label}</option>
                                      {field.options && field.options.map((option, index) => (
                                        <option key={index} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  ) : field.type === 'file' ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                                      <div className="text-2xl mb-2">📎</div>
                                      <div className="text-sm text-gray-600">Click to upload {field.label}</div>
                                    </div>
                                  ) : field.type === 'checkbox' ? (
                                    <div className="space-y-3">
                                      {field.options && field.options.map((option, index) => (
                                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            value={option}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                          />
                                          <span className="text-gray-700">{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : field.type === 'radio' ? (
                                    <div className="space-y-3">
                                      {field.options && field.options.map((option, index) => (
                                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={field.name}
                                            value={option}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                          />
                                          <span className="text-gray-700">{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <input
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                    <div className="flex space-x-4 pt-6">
                      <Button className="flex-1" icon="💳">
                        Submit & Pay ${selectedVisa.totalAmount}
                      </Button>
                      <Button variant="outline" className="flex-1" icon="💾">
                        Save Draft
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section Modal */}
      {showSectionModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h3>
              <button
                onClick={() => setShowSectionModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={sectionForm.name}
                  onChange={handleSectionChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form section name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order *</label>
                <input
                  type="number"
                  name="order"
                  value={sectionForm.order}
                  onChange={handleSectionChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter display order"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Visa Type *</label>
                <select
                  name="countryVisaType"
                  value={sectionForm.countryVisaType}
                  onChange={handleSectionChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Visa Type</option>
                  {countryVisaTypes.map((cvt) => (
                    <option key={cvt._id} value={cvt._id}>
                      {cvt.name} - {cvt.country?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select
                  name="status"
                  value={sectionForm.status}
                  onChange={handleSectionChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status._id} value={status._id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={sectionForm.description}
                  onChange={handleSectionChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form section description"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button onClick={saveSectionForm} className="flex-1" icon="💾">
                {editingSection ? 'Update Section' : 'Create Section'}
              </Button>
              <Button 
                onClick={() => setShowSectionModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}


      {/* Field Modal */}
      {showFieldModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h3>
              <button
                onClick={() => setShowFieldModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Label *</label>
                <input
                  type="text"
                  name="label"
                  value={fieldForm.label}
                  onChange={handleFieldChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter field label (e.g., First Name)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={fieldForm.name}
                  onChange={handleFieldChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Auto-generated from label"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                <select
                  name="type"
                  value={fieldForm.type}
                  onChange={handleFieldChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Field Type</option>
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order *</label>
                <input
                  type="number"
                  name="order"
                  value={fieldForm.order}
                  onChange={handleFieldChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter display order"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Form Section</label>
                <select
                  name="formSection"
                  value={fieldForm.formSection}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Form Section</option>
                  {formSections.map((section) => (
                    <option key={section._id} value={section._id}>
                      {section.name} - {section.countryVisaType?.name || 'No Visa'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select
                  name="status"
                  value={fieldForm.status}
                  onChange={handleFieldChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status._id} value={status._id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Placeholder</label>
                <input
                  type="text"
                  name="placeholder"
                  value={fieldForm.placeholder}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter placeholder text"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Value</label>
                <input
                  type="text"
                  name="defaultValue"
                  value={fieldForm.defaultValue}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter default value"
                />
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="required"
                    checked={fieldForm.required}
                    onChange={handleFieldChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-semibold text-gray-700">
                    Required Field
                  </label>
                </div>
              </div>

              {/* Options for select, radio, checkbox */}
              {(fieldForm.type === 'select' || fieldForm.type === 'radio' || fieldForm.type === 'checkbox') && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {fieldForm.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...fieldForm.options];
                            newOptions[index] = e.target.value;
                            setFieldForm({ ...fieldForm, options: newOptions });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Add new option"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Rules */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(fieldForm.type === 'text' || fieldForm.type === 'textarea' || fieldForm.type === 'email') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
                        <input
                          type="number"
                          value={fieldForm.validationRules.minLength || ''}
                          onChange={(e) => handleValidationChange('minLength', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Length</label>
                        <input
                          type="number"
                          value={fieldForm.validationRules.maxLength || ''}
                          onChange={(e) => handleValidationChange('maxLength', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                    </>
                  )}
                  {fieldForm.type === 'number' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Value</label>
                        <input
                          type="number"
                          value={fieldForm.validationRules.min || ''}
                          onChange={(e) => handleValidationChange('min', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Value</label>
                        <input
                          type="number"
                          value={fieldForm.validationRules.max || ''}
                          onChange={(e) => handleValidationChange('max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pattern (Regex)</label>
                    <input
                      type="text"
                      value={fieldForm.validationRules.pattern || ''}
                      onChange={(e) => handleValidationChange('pattern', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ^[a-zA-Z]+$"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Error Message</label>
                    <input
                      type="text"
                      value={fieldForm.validationRules.customMessage || ''}
                      onChange={(e) => handleValidationChange('customMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Custom validation error message"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button onClick={saveFieldForm} className="flex-1" icon="💾">
                {editingField ? 'Update Field' : 'Create Field'}
              </Button>
              <Button 
                onClick={() => setShowFieldModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}