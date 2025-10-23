import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function ViewCountryTermsConditions() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchTerms();
    }
  }, [id]);

  const fetchTerms = async () => {
    try {
      const response = await api.get(`/country-terms-conditions`);
      const item = response.data.find(t => t._id === id);
      setTerms(item);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terms...</p>
        </div>
      
    );
  }

  if (!terms) {
    return (
      
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Terms not found</h3>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/country-terms-conditions')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Country Terms
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">👁️ View Country Terms</h1>
            <p className="text-sm sm:text-base text-gray-600">Country terms and conditions details</p>
          </div>
          <Button 
            onClick={() => router.push(`/country-terms-conditions/${id}`)}
            icon="✏️"
            className="w-full sm:w-auto"
          >
            Edit Terms
          </Button>
        </div>

        <Card title="Country Terms & Conditions" icon="📜">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {terms.title}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 flex items-center gap-2">
                  {terms.country?.placeImage ? (
                    <img 
                      src={`${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/countries/${terms.country.placeImage}`} 
                      alt={terms.country?.name}
                      className="w-6 h-6 object-cover rounded"
                    />
                  ) : (
                    <span>🏞️</span>
                  )}
                  {terms.country?.name}
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[80px]">
                  {terms.description || 'No description provided'}
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[200px] whitespace-pre-wrap">
                  {terms.content}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(terms.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(terms.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    
  );
}