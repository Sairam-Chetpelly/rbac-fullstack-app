import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function ViewCountryVisaType() {
  const [countryVisaType, setCountryVisaType] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCountryVisaType();
    }
  }, [id]);

  const fetchCountryVisaType = async () => {
    try {
      const response = await api.get(`/country-visa-types`);
      const item = response.data.find(c => c._id === id);
      setCountryVisaType(item);
    } catch (error) {
      console.error('Error fetching country visa type:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading country visa type...</p>
        </div>
      
    );
  }

  if (!countryVisaType) {
    return (
      
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Country visa type not found</h3>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/country-visa-types')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Country Visa Types
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">👁️ View Country Visa Type</h1>
            <p className="text-sm sm:text-base text-gray-600">Country visa type details and pricing</p>
          </div>
          <Button 
            onClick={() => router.push(`/country-visa-types/${id}`)}
            icon="✏️"
            className="w-full sm:w-auto"
          >
            Edit Country Visa Type
          </Button>
        </div>

        <Card title="Country Visa Type Information" icon="🎫">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {countryVisaType.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {countryVisaType.country?.flagEmoji} {countryVisaType.country?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Visa Type</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {countryVisaType.visaType?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    countryVisaType.status?.name === 'active' ? 'bg-green-100 text-green-800' :
                    countryVisaType.status?.name === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {countryVisaType.status?.name?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Processing Time</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {countryVisaType.processingTimeMin} - {countryVisaType.processingTimeMax} days
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[100px]">
                  {countryVisaType.description || 'No description provided'}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Pricing Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-blue-700 mb-1">VFS Amount</label>
                  <div className="text-2xl font-bold text-blue-900">${countryVisaType.vfsAmount}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-green-700 mb-1">Consulate Amount</label>
                  <div className="text-2xl font-bold text-green-900">${countryVisaType.consulateAmount}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-purple-700 mb-1">Service Amount</label>
                  <div className="text-2xl font-bold text-purple-900">${countryVisaType.serviceAmount}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Amount</label>
                  <div className="text-2xl font-bold text-gray-900">${countryVisaType.totalAmount}</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {new Date(countryVisaType.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {new Date(countryVisaType.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    
  );
}