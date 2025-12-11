import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function EditFormField() {
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: '',
    placeholder: '',
    defaultValue: '',
    required: false,
    order: '',
    formSection: '',
    status: '',
    options: [],
    validationRules: {}
  });
  const [newOption, setNewOption] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

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

  useEffect(() => {
    if (id) {
      fetchFormField();
      fetchStatuses();
      fetchFormSections();
    }
  }, [id]);

  const fetchFormField = async () => {
    try {
      const response = await api.get(`/form-fields/${id}`);
      const formField = response.data;
      setFormData({
        name: formField.name,
        label: formField.label,
        type: formField.type,
        placeholder: formField.placeholder || '',
        defaultValue: formField.defaultValue || '',
        required: formField.required || false,
        order: formField.order,
        formSection: formField.formSection?._id || '',
        status: formField.status?._id || '',
        options: formField.options || [],
        validationRules: formField.validationRules || {}
      });
    } catch (error) {
      console.error('Error fetching form field:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/status');
      setStatuses(response.data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const fetchFormSections = async () => {
    try {
      const response = await api.get('/form-sections');
      setFormSections(response.data);
    } catch (error) {
      console.error('Error fetching form sections:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/form-fields/${id}`, formData);
      router.push('/form-fields');
    } catch (error) {
      console.error('Error updating form field:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Auto-generate name from label
    if (name === 'label' && newValue) {
      const autoName = newValue.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      setFormData({
        ...formData,
        [name]: newValue,
        name: autoName
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue
      });
    }
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const handleValidationChange = (field, value) => {
    setFormData({
      ...formData,
      validationRules: {
        ...formData.validationRules,
        [field]: value || undefined
      }
    });
  };

  if (initialLoading) {
    return (
      
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form field...</p>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/form-fields')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Form Fields
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">✏️ Edit Form Field</h1>
            <p className="text-sm sm:text-base text-gray-600">Update form field information</p>
          </div>
        </div>

        <Card title="Form Field Information" icon="📝">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter field label (e.g., First Name)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                  placeholder="Auto-generated from label"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order *
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter display order"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Form Section
                </label>
                <select
                  name="formSection"
                  value={formData.formSection}
                  onChange={handleChange}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option disabled value="">Select Status</option>
                  {/* {statuses.map((status) => (
                    <option key={status._id} value={status._id}>
                      {status.name}
                    </option>
                  ))} */}
                  {statuses.filter(status => status.category === "System").map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                  </option>
                ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Placeholder
                </label>
                <input
                  type="text"
                  name="placeholder"
                  value={formData.placeholder}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter placeholder text"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Value
                </label>
                <input
                  type="text"
                  name="defaultValue"
                  value={formData.defaultValue}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter default value"
                />
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="required"
                    checked={formData.required}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-semibold text-gray-700">
                    Required Field
                  </label>
                </div>
              </div>

              {/* Options for select, radio, checkbox */}
              {(formData.type === 'select' || formData.type === 'radio' || formData.type === 'checkbox') && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[index] = e.target.value;
                            setFormData({ ...formData, options: newOptions });
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
                  {(formData.type === 'text' || formData.type === 'textarea' || formData.type === 'email') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Length
                        </label>
                        <input
                          type="number"
                          value={formData.validationRules.minLength || ''}
                          onChange={(e) => handleValidationChange('minLength', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Length
                        </label>
                        <input
                          type="number"
                          value={formData.validationRules.maxLength || ''}
                          onChange={(e) => handleValidationChange('maxLength', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                    </>
                  )}
                  {formData.type === 'number' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Value
                        </label>
                        <input
                          type="number"
                          value={formData.validationRules.min || ''}
                          onChange={(e) => handleValidationChange('min', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Value
                        </label>
                        <input
                          type="number"
                          value={formData.validationRules.max || ''}
                          onChange={(e) => handleValidationChange('max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pattern (Regex)
                    </label>
                    <input
                      type="text"
                      value={formData.validationRules.pattern || ''}
                      onChange={(e) => handleValidationChange('pattern', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., ^[a-zA-Z]+$"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Error Message
                    </label>
                    <input
                      type="text"
                      value={formData.validationRules.customMessage || ''}
                      onChange={(e) => handleValidationChange('customMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Custom validation error message"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                icon="💾"
                className="flex-1 sm:flex-none"
              >
                {loading ? 'Updating...' : 'Update Form Field'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/form-fields')}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    
  );
}