import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function ViewFormField() {
  const [formField, setFormField] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchFormField();
    }
  }, [id]);

  const fetchFormField = async () => {
    try {
      const response = await api.get(`/form-fields/${id}`);
      setFormField(response.data);
    } catch (error) {
      console.error('Error fetching form field:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form field...</p>
        </div>
    );
  }

  if (!formField) {
    return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Form field not found</h3>
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">👁️ View Form Field</h1>
            <p className="text-sm sm:text-base text-gray-600">Form field details and configuration</p>
          </div>
          <Button 
            onClick={() => router.push(`/form-fields/${id}`)}
            icon="✏️"
            className="w-full sm:w-auto"
          >
            Edit Form Field
          </Button>
        </div>

        <Card title="Form Field Information" icon="📝">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formField.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formField.label}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    {formField.type}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formField.order}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    {formField.formSection?.countryVisaType?.country?.name || 'No country'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country Visa Type</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    {formField.formSection?.countryVisaType?.name || 'No visa type'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Form Section</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formField.formSection?.name || 'No section assigned'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    formField.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {formField.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    formField.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formField.required ? 'REQUIRED' : 'OPTIONAL'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Placeholder</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formField.placeholder || 'No placeholder set'}
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Value</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formField.defaultValue || 'No default value set'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(formField.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(formField.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    
  );
}