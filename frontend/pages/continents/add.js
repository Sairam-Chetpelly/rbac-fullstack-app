import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function AddContinent() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: ''
  });
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/status');
      setStatuses(response.data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/continents', formData);
      router.push('/continents');
    } catch (error) {
      console.error('Error creating continent:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">🌍 Add New Continent</h1>
            <p className="text-sm sm:text-base text-gray-600">Create a new geographical continent</p>
          </div>
        </div>

        <Card title="Continent Information" icon="🌍">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🌍 Continent Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter continent name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🔗 URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter URL slug"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  📝 Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter continent description"
                  rows="4"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-3">
                  ⚡ Status
                </label>
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                  {statuses.map(status => (
                    <label key={status._id} className="flex items-center gap-3 p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="status"
                        value={status._id}
                        checked={formData.status === status._id}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm lg:text-base font-medium text-gray-700 capitalize">
                        {status.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button 
                type="submit" 
                disabled={loading}
                icon="💾"
                className="flex-1"
              >
                {loading ? 'Creating Continent...' : 'Create Continent'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/continents')}
                className="flex-1"
                icon="❌"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
  );
}