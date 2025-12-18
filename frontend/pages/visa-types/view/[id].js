import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function ViewVisaType() {
  const [visaType, setVisaType] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchVisaType();
    }
  }, [id]);

  const fetchVisaType = async () => {
    try {
      const response = await api.get(`/visa-types/${id}`);
      setVisaType(response.data);
    } catch (error) {
      console.error('Error fetching visa type:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visa type...</p>
        </div>
      
    );
  }

  if (!visaType) {
    return (
      
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Visa type not found</h3>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/visa-types')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Visa Types
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">👁️ View Visa Type</h1>
            <p className="text-sm sm:text-base text-gray-600">Visa type details and information</p>
          </div>
          <Button 
            onClick={() => router.push(`/visa-types/admin/${id}`)}
            icon="✏️"
            className="w-full sm:w-auto"
          >
            Edit Visa Type
          </Button>
        </div>

        <Card title="Visa Type Information" icon="📋">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {visaType.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    visaType.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {visaType.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[100px]">
                  {visaType.description || 'No description provided'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(visaType.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(visaType.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    
  );
}