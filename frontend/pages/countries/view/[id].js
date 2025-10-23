import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function ViewCountry() {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCountry();
    }
  }, [id]);

  const fetchCountry = async () => {
    try {
      const response = await api.get(`/countries`);
      const item = response.data.find(c => c._id === id);
      setCountry(item);
    } catch (error) {
      console.error('Error fetching country:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading country...</p>
        </div>
      
    );
  }

  if (!country) {
    return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Country not found</h3>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/countries')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Countries
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">👁️ View Country</h1>
            <p className="text-sm sm:text-base text-gray-600">Country details and information</p>
          </div>
          <Button 
            onClick={() => router.push(`/countries/${id}`)}
            icon="✏️"
            className="w-full sm:w-auto"
          >
            Edit Country
          </Button>
        </div>

        <Card title="Country Information" icon="🏳️">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center gap-2">
                  {country.placeImage ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'https://api.oneworldvisa.inisa.in'}/uploads/countries/${country.placeImage}`} 
                      alt={country.name}
                      className="w-8 h-8 object-cover rounded-lg"
                    />
                  ) : (
                    <span>🏞️</span>
                  )}
                  {country.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country Code</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {country.code}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {country.slug}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Continent</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {country.continent?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Processing Time</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {country.processingTimeMin} - {country.processingTimeMax} days
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    country.status?.name === 'active' ? 'bg-green-100 text-green-800' :
                    country.status?.name === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {country.status?.name?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[100px]">
                  {country.description}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(country.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(country.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
  );
}