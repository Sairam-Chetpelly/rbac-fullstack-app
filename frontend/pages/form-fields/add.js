import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function AddFormField() {
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: '',
    placeholder: '',
    defaultValue: '',
    required: false,
    order: '',
    formSection: '',
    status: ''
  });
  const [statuses, setStatuses] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fieldTypes = [
    'text', 'email', 'password', 'number', 'tel', 'url',
    'textarea', 'select', 'checkbox', 'radio', 'file', 'date'
  ];

  useEffect(() => {
    fetchStatuses();
    fetchFormSections();
  }, []);

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
      await api.post('/form-fields', formData);
      router.push('/form-fields');
    } catch (error) {
      console.error('Error creating form field:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">➕ Add Form Field</h1>
            <p className="text-sm sm:text-base text-gray-600">Create a new form field</p>
          </div>
        </div>

        <Card title="Form Field Information" icon="📝">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter field name (e.g., firstName)"
                />
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter field label (e.g., First Name)"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Field Type</option>
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Form Section</option>
                  {formSections.map((section) => (
                    <option key={section._id} value={section._id}>
                      {section.name}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Placeholder
                </label>
                <input
                  type="text"
                  name="placeholder"
                  value={formData.placeholder}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                icon="💾"
                className="flex-1 sm:flex-none"
              >
                {loading ? 'Creating...' : 'Create Form Field'}
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