import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function ViewContinent() {
  const [continent, setContinent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchContinent();
    }
  }, [id]);

  const fetchContinent = async () => {
    try {
      const response = await api.get(`/continents`);
      const item = response.data.find(c => c._id === id);
      setContinent(item);
    } catch (error) {
      console.error('Error fetching continent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading continent...</p>
        </div>
    );
  }

  if (!continent) {
    return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Continent not found</h3>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/continents')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Continents
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">👁️ View Continent</h1>
            <p className="text-sm sm:text-base text-gray-600">Continent details and information</p>
          </div>
          <Button 
            onClick={() => router.push(`/continents/${id}`)}
            icon="✏️"
            className="w-full sm:w-auto"
          >
            Edit Continent
          </Button>
        </div>

        <Card title="Continent Information" icon="🌍">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {continent.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {continent.slug}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    continent.status?.name === 'active' ? 'bg-green-100 text-green-800' :
                    continent.status?.name === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {continent.status?.name?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[100px]">
                  {continent.description}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(continent.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Updated At</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {new Date(continent.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
  );
}