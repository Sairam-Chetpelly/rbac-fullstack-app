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
  const [librarySections, setLibrarySections] = useState([]);
  const [showSectionLibraryModal, setShowSectionLibraryModal] = useState(false);
  const [showSaveSectionModal, setShowSaveSectionModal] = useState(false);
  const [selectedSectionForSave, setSelectedSectionForSave] = useState(null);
  const [sectionSaveForm, setSectionSaveForm] = useState({ category: 'General', description: '' });
  const [libraryFields, setLibraryFields] = useState([]);
  const [showFieldLibraryModal, setShowFieldLibraryModal] = useState(false);
  const [showSaveFieldModal, setShowSaveFieldModal] = useState(false);
  const [selectedFieldForSave, setSelectedFieldForSave] = useState(null);
  const [fieldSaveForm, setFieldSaveForm] = useState({ category: 'General', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [fieldLibrarySearchTerm, setFieldLibrarySearchTerm] = useState('');
  const [sectionLibrarySearchTerm, setSectionLibrarySearchTerm] = useState('');
  
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
    const header = document.querySelector('header');
    const sidebar = document.querySelector('div[class*="bg-white/10 backdrop-blur-md border-r"]');
    
    if (showSectionModal || showFieldModal || showSectionLibraryModal || showSaveSectionModal || showFieldLibraryModal || showSaveFieldModal) {
      if (header) {
        header.style.zIndex = '-1';
        header.style.visibility = 'hidden';
      }
      if (sidebar) {
        sidebar.style.zIndex = '0';
      }
    } else {
      if (header) {
        header.style.zIndex = '';
        header.style.visibility = '';
      }
      if (sidebar) {
        sidebar.style.zIndex = '';
      }
    }
    
    return () => {
      if (header) {
        header.style.zIndex = '';
        header.style.visibility = '';
      }
      if (sidebar) {
        sidebar.style.zIndex = '';
      }
    };
  }, [showSectionModal, showFieldModal, showSectionLibraryModal, showSaveSectionModal, showFieldLibraryModal, showSaveFieldModal]);

  useEffect(() => {
    fetchVisaTypes();
    fetchStatuses();
    fetchLibrarySections();
    fetchLibraryFields();
  }, []);

  useEffect(() => {
    if (selectedVisa) {
      fetchVisaForm(selectedVisa._id);
    }
  }, [selectedVisa]);

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/status');
      setStatuses(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch statuses');
    }
  };

  const fetchLibrarySections = async () => {
    try {
      const response = await api.get('/section-library');
      setLibrarySections(response.data);
    } catch (error) {
      console.error('Failed to fetch library sections:', error);
    }
  };

  const fetchLibraryFields = async () => {
    try {
      const response = await api.get('/field-library');
      setLibraryFields(response.data);
    } catch (error) {
      console.error('Failed to fetch library fields:', error);
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
    const scrollPosition = window.pageYOffset;
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
      await fetchVisaForm(selectedVisa._id);
      setTimeout(() => window.scrollTo(0, scrollPosition), 0);
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
      const scrollPosition = window.pageYOffset;
      try {
        await api.delete(`/form-sections/${sectionId}`);
        toast.success('Section deleted successfully!');
        await fetchVisaForm(selectedVisa._id);
        setTimeout(() => window.scrollTo(0, scrollPosition), 0);
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
    const scrollPosition = window.pageYOffset;
    try {
      const sectionId = fieldForm.formSection || selectedSectionId;
      const selectedSection = formSections.find(s => s._id === sectionId);
      const sectionPrefix = selectedSection ? selectedSection.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : 'section';
      const baseName = fieldForm.label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      let uniqueName = fieldForm.name || `${sectionPrefix}_${baseName}`;
      
      // Check for duplicate names within the same section
      const sectionFields = getFieldsBySection(sectionId);
      const existingNames = sectionFields
        .filter(f => !editingField || f._id !== editingField._id)
        .map(f => f.name);
      
      let counter = 1;
      let originalName = uniqueName;
      while (existingNames.includes(uniqueName)) {
        uniqueName = `${originalName}_${counter}`;
        counter++;
      }
      
      const fieldData = {
        ...fieldForm,
        formSection: sectionId,
        name: uniqueName
      };

      if (editingField) {
        await api.put(`/form-fields/${editingField._id}`, fieldData);
        toast.success('Field updated successfully!');
      } else {
        await api.post('/form-fields', fieldData);
        toast.success('Field created successfully!');
      }
      
      setShowFieldModal(false);
      await fetchVisaForm(selectedVisa._id);
      setTimeout(() => window.scrollTo(0, scrollPosition), 0);
    } catch (error) {
      toast.error('Failed to save field');
    }
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Auto-generate name from label with section prefix and duplicate prevention
    if (name === 'label' && newValue) {
      const baseName = newValue.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      const selectedSection = formSections.find(s => s._id === (fieldForm.formSection || selectedSectionId));
      const sectionPrefix = selectedSection ? selectedSection.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : 'section';
      let autoName = `${sectionPrefix}_${baseName}`;
      
      // Check for duplicates in the same section
      const sectionFields = getFieldsBySection(fieldForm.formSection || selectedSectionId);
      const existingNames = sectionFields
        .filter(f => !editingField || f._id !== editingField._id)
        .map(f => f.name);
      
      let counter = 1;
      let originalName = autoName;
      while (existingNames.includes(autoName)) {
        autoName = `${originalName}_${counter}`;
        counter++;
      }
      
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
      const scrollPosition = window.pageYOffset;
      try {
        await api.delete(`/form-fields/${fieldId}`);
        toast.success('Field deleted successfully!');
        await fetchVisaForm(selectedVisa._id);
        setTimeout(() => window.scrollTo(0, scrollPosition), 0);
      } catch (error) {
        toast.error('Failed to delete field');
      }
    }
  };

  // Section Library functions
  const saveSectionToLibrary = async () => {
    if (!selectedSectionForSave) return;
    
    try {
      await api.post('/section-library/save-section', {
        sectionId: selectedSectionForSave._id,
        category: sectionSaveForm.category,
        description: sectionSaveForm.description
      });
      toast.success('Section saved to library!');
      setShowSaveSectionModal(false);
      setSelectedSectionForSave(null);
      setSectionSaveForm({ category: 'General', description: '' });
      fetchLibrarySections();
    } catch (error) {
      toast.error('Failed to save section to library');
    }
  };

  const addSectionFromLibrary = async (librarySectionId) => {
    if (!selectedVisa) {
      toast.error('Please select a visa first');
      return;
    }
    
    try {
      await api.post('/section-library/create-section', {
        librarySectionId,
        visaId: selectedVisa._id,
        order: formSections.length + 1
      });
      toast.success('Section added from library!');
      setShowSectionLibraryModal(false);
      fetchVisaForm(selectedVisa._id);
    } catch (error) {
      toast.error('Failed to add section from library');
    }
  };

  const deleteLibrarySection = async (sectionId) => {
    if (confirm('Are you sure you want to delete this library section?')) {
      try {
        await api.delete(`/section-library/${sectionId}`);
        toast.success('Library section deleted!');
        fetchLibrarySections();
      } catch (error) {
        toast.error('Failed to delete library section');
      }
    }
  };

  // Field Library functions
  const saveFieldToLibrary = async () => {
    if (!selectedFieldForSave) return;
    
    try {
      await api.post('/field-library/save-field', {
        fieldId: selectedFieldForSave._id,
        category: fieldSaveForm.category,
        description: fieldSaveForm.description
      });
      toast.success('Field saved to library!');
      setShowSaveFieldModal(false);
      setSelectedFieldForSave(null);
      setFieldSaveForm({ category: 'General', description: '' });
      fetchLibraryFields();
    } catch (error) {
      toast.error('Failed to save field to library');
    }
  };

  const addFieldFromLibrary = async (libraryFieldId, sectionId) => {
    const sectionFields = getFieldsBySection(sectionId);
    try {
      await api.post('/field-library/create-field', {
        libraryFieldId,
        sectionId,
        order: sectionFields.length + 1
      });
      toast.success('Field added from library!');
      setShowFieldLibraryModal(false);
      fetchVisaForm(selectedVisa._id);
    } catch (error) {
      toast.error('Failed to add field from library');
    }
  };

  const deleteLibraryField = async (fieldId) => {
    if (confirm('Are you sure you want to delete this library field?')) {
      try {
        await api.delete(`/field-library/${fieldId}`);
        toast.success('Library field deleted!');
        fetchLibraryFields();
      } catch (error) {
        toast.error('Failed to delete library field');
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
                onClick={() => setActiveTab('sections')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'sections'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Section Library
              </button>
              <button
                onClick={() => setActiveTab('fields')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'fields'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Field Library
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
                className="w-full p-4 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {selectedVisa ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedVisa.country?.placeImage ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${selectedVisa.country.placeImage}`} 
                          alt={selectedVisa.country?.name}
                          className="w-6 h-6 object-cover rounded"
                        />
                      ) : (
                        <span className="text-xl">🌍</span>
                      )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                          {visa.country?.placeImage ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${visa.country.placeImage}`} 
                              alt={visa.country?.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                          ) : (
                            <span className="text-lg">🌍</span>
                          )}
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
              <div className="flex space-x-2">
                <Button onClick={() => setShowSectionLibraryModal(true)} variant="outline" icon="📚">
                  From Library
                </Button>
                <Button onClick={() => openSectionModal()} icon="➕">
                  Add Section
                </Button>
              </div>
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
                                onClick={() => { setSelectedSectionForSave(section); setShowSaveSectionModal(true); }}
                                size="sm"
                                variant="outline"
                                icon="💾"
                                title="Save to Library"
                              >
                                <span className="hidden sm:inline">Save</span>
                              </Button>
                              <Button
                                onClick={() => openFieldModal(null, section._id)}
                                size="sm"
                                variant="outline"
                                icon="➕"
                              >
                                <span className="hidden sm:inline">Add Field</span>
                              </Button>
                              <Button
                                onClick={() => { setSelectedSectionId(section._id); setShowFieldLibraryModal(true); }}
                                size="sm"
                                variant="outline"
                                icon="📚"
                              >
                                <span className="hidden sm:inline">From Library</span>
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
                                        onClick={() => { setSelectedFieldForSave(field); setShowSaveFieldModal(true); }}
                                        size="sm"
                                        variant="outline"
                                        icon="💾"
                                        title="Save to Library"
                                      />
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
        ) : activeTab === 'sections' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Section Library</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <input
                type="text"
                placeholder="Search sections..."
                value={sectionLibrarySearchTerm}
                onChange={(e) => setSectionLibrarySearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {(() => {
              const filteredSections = librarySections.filter(section => 
                section.name.toLowerCase().includes(sectionLibrarySearchTerm.toLowerCase()) ||
                section.description?.toLowerCase().includes(sectionLibrarySearchTerm.toLowerCase()) ||
                section.category?.toLowerCase().includes(sectionLibrarySearchTerm.toLowerCase())
              );
              
              return filteredSections.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {sectionLibrarySearchTerm ? 'No sections found' : 'No Library Sections'}
                  </h3>
                  <p className="text-gray-600">
                    {sectionLibrarySearchTerm ? 'No sections match your search' : 'Save commonly used sections to reuse across different forms'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    {Object.entries(
                      filteredSections.reduce((acc, section) => {
                        const category = section.category || 'General';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(section);
                        return acc;
                      }, {})
                    ).map(([category, sections]) => (
                      <div key={category} className="mb-8 last:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="text-2xl mr-2">📚</span>
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sections.map((section) => (
                            <div key={section._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900">{section.name}</h4>
                                  {section.description && (
                                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                  )}
                                </div>
                                <Button
                                  onClick={() => deleteLibrarySection(section._id)}
                                  size="sm"
                                  variant="danger"
                                  icon="🗑️"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Fields:</span>
                                  <span className="font-medium">{section.fields.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Used:</span>
                                  <span className="font-medium">{section.usageCount} times</span>
                                </div>
                                {section.fields.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Field Names:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {section.fields.map((field, index) => (
                                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                          {field.label}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : activeTab === 'fields' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Field Library</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <input
                type="text"
                placeholder="Search fields..."
                value={fieldLibrarySearchTerm}
                onChange={(e) => setFieldLibrarySearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {(() => {
              const filteredFields = libraryFields.filter(field => 
                field.label.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.name.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.description?.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.category?.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.type.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase())
              );
              
              return filteredFields.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {fieldLibrarySearchTerm ? 'No fields found' : 'No Library Fields'}
                  </h3>
                  <p className="text-gray-600">
                    {fieldLibrarySearchTerm ? 'No fields match your search' : 'Save commonly used fields to reuse across different forms'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    {Object.entries(
                      filteredFields.reduce((acc, field) => {
                        const category = field.category || 'General';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(field);
                        return acc;
                      }, {})
                    ).map(([category, fields]) => (
                      <div key={category} className="mb-8 last:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="text-2xl mr-2">📚</span>
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fields.map((field) => (
                            <div key={field._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{field.label}</span>
                                  {field.required && <span className="text-red-500">*</span>}
                                </div>
                                <Button
                                  onClick={() => deleteLibraryField(field._id)}
                                  size="sm"
                                  variant="danger"
                                  icon="🗑️"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    field.type === 'file' ? 'bg-purple-100 text-purple-800' : 
                                    field.type === 'select' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {field.type}
                                  </span>
                                  <span className="text-xs text-gray-500">Used: {field.usageCount}</span>
                                </div>
                                {field.description && (
                                  <p className="text-xs text-gray-600">{field.description}</p>
                                )}
                                {field.placeholder && (
                                  <p className="text-xs text-gray-500">Placeholder: {field.placeholder}</p>
                                )}
                                {field.required && (
                                  <p className="text-xs text-orange-600">Required field</p>
                                )}
                                {field.options && field.options.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Options:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {field.options.map((option, index) => (
                                        <span key={index} className="px-1 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                                          {option}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
                                      name={field.name}
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      rows={3}
                                    />
                                  ) : field.type === 'select' ? (
                                    <select name={field.name} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                                      <option disabled value="">Select {field.label}</option>
                                      {field.options && field.options.map((option, index) => (
                                        <option key={index} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  ) : field.type === 'file' ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                                      <input type="file" name={field.name} className="hidden" />
                                      <div className="text-2xl mb-2">📎</div>
                                      <div className="text-sm text-gray-600">Click to upload {field.label}</div>
                                    </div>
                                  ) : field.type === 'checkbox' ? (
                                    <div className="space-y-3">
                                      {field.options && field.options.map((option, index) => (
                                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            name={`${field.name}_${index}`}
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
                                      name={field.name}
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option disabled value="">Select Status</option>
                  {/* {statuses.map((status) => (
                    <option key={status._id} value={status._id}>
                      {status.name}
                    </option>
                  ))} */}
                  {Array.isArray(statuses) && statuses.filter(status => status.category === "System").map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option disabled value="">Select Field Type</option>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter display order"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Form Section</label>
                <select
                  name="formSection"
                  value={fieldForm.formSection}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option disabled value="">Select Form Section</option>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option disabled value="">Select Status</option>
                  {/* {statuses.map((status) => (
                    <option key={status._id} value={status._id}>
                      {status.name}
                    </option>
                  ))} */}
                  {Array.isArray(statuses) && statuses.filter(status => status.category === "System").map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Length</label>
                        <input
                          type="number"
                          value={fieldForm.validationRules.maxLength || ''}
                          onChange={(e) => handleValidationChange('maxLength', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Value</label>
                        <input
                          type="number"
                          value={fieldForm.validationRules.max || ''}
                          onChange={(e) => handleValidationChange('max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., ^[a-zA-Z]+$"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Error Message</label>
                    <input
                      type="text"
                      value={fieldForm.validationRules.customMessage || ''}
                      onChange={(e) => handleValidationChange('customMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

      {/* Section Library Modal */}
      {showSectionLibraryModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Section from Library</h3>
              <button
                onClick={() => setShowSectionLibraryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search sections..."
                value={sectionLibrarySearchTerm}
                onChange={(e) => setSectionLibrarySearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {(() => {
              const filteredSections = librarySections.filter(section => 
                section.name.toLowerCase().includes(sectionLibrarySearchTerm.toLowerCase()) ||
                section.description?.toLowerCase().includes(sectionLibrarySearchTerm.toLowerCase()) ||
                section.category?.toLowerCase().includes(sectionLibrarySearchTerm.toLowerCase())
              );
              
              return filteredSections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-gray-600">
                    {sectionLibrarySearchTerm ? 'No sections found matching your search' : 'No sections in library'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    filteredSections.reduce((acc, section) => {
                      const category = section.category || 'General';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(section);
                      return acc;
                    }, {})
                  ).map(([category, sections]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sections.map((section) => (
                        <div key={section._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{section.name}</h5>
                              {section.description && (
                                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>{section.fields.length} fields</span>
                                <span>Used: {section.usageCount}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => addSectionFromLibrary(section._id)}
                              size="sm"
                              icon="➕"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
            })()}
            
            <div className="flex justify-end pt-6">
              <Button 
                onClick={() => setShowSectionLibraryModal(false)} 
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Save Section to Library Modal */}
      {showSaveSectionModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Section to Library</h3>
              <button
                onClick={() => setShowSaveSectionModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {selectedSectionForSave && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Saving section: <strong>{selectedSectionForSave.name}</strong>
                  </p>
                  <p className="text-xs text-blue-600">
                    {getFieldsBySection(selectedSectionForSave._id).length} fields included
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={sectionSaveForm.category}
                    onChange={(e) => setSectionSaveForm({ ...sectionSaveForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Personal Info">Personal Info</option>
                    <option value="Contact Details">Contact Details</option>
                    <option value="Travel Info">Travel Info</option>
                    <option value="Documents">Documents</option>
                    <option value="Employment">Employment</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={sectionSaveForm.description}
                    onChange={(e) => setSectionSaveForm({ ...sectionSaveForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Optional description for this section"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-6">
              <Button onClick={saveSectionToLibrary} className="flex-1" icon="💾">
                Save to Library
              </Button>
              <Button 
                onClick={() => setShowSaveSectionModal(false)} 
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

      {/* Field Library Modal */}
      {showFieldLibraryModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Field from Library</h3>
              <button
                onClick={() => setShowFieldLibraryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search fields..."
                value={fieldLibrarySearchTerm}
                onChange={(e) => setFieldLibrarySearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {(() => {
              const filteredFields = libraryFields.filter(field => 
                field.label.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.name.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.description?.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.category?.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase()) ||
                field.type.toLowerCase().includes(fieldLibrarySearchTerm.toLowerCase())
              );
              
              return filteredFields.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-gray-600">
                    {fieldLibrarySearchTerm ? 'No fields found matching your search' : 'No fields in library'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    filteredFields.reduce((acc, field) => {
                      const category = field.category || 'General';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(field);
                      return acc;
                    }, {})
                  ).map(([category, fields]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fields.map((field) => (
                        <div key={field._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{field.label}</span>
                                {field.required && <span className="text-red-500">*</span>}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  field.type === 'file' ? 'bg-purple-100 text-purple-800' : 
                                  field.type === 'select' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {field.type}
                                </span>
                                <span className="text-xs text-gray-500">Used: {field.usageCount}</span>
                              </div>
                              {field.description && (
                                <p className="text-xs text-gray-600 mt-1">{field.description}</p>
                              )}
                            </div>
                            <Button
                              onClick={() => addFieldFromLibrary(field._id, selectedSectionId)}
                              size="sm"
                              icon="➕"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
            })()}
            
            <div className="flex justify-end pt-6">
              <Button 
                onClick={() => setShowFieldLibraryModal(false)} 
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Save Field to Library Modal */}
      {showSaveFieldModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Field to Library</h3>
              <button
                onClick={() => setShowSaveFieldModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {selectedFieldForSave && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Saving field: <strong>{selectedFieldForSave.label}</strong>
                  </p>
                  <p className="text-xs text-blue-600">
                    Type: {selectedFieldForSave.type}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={fieldSaveForm.category}
                    onChange={(e) => setFieldSaveForm({ ...fieldSaveForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Personal Info">Personal Info</option>
                    <option value="Contact Details">Contact Details</option>
                    <option value="Travel Info">Travel Info</option>
                    <option value="Documents">Documents</option>
                    <option value="Employment">Employment</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={fieldSaveForm.description}
                    onChange={(e) => setFieldSaveForm({ ...fieldSaveForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Optional description for this field"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-6">
              <Button onClick={saveFieldToLibrary} className="flex-1" icon="💾">
                Save to Library
              </Button>
              <Button 
                onClick={() => setShowSaveFieldModal(false)} 
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