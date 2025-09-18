import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function EditStatus() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  const colorOptions = [
    { name: 'Green', value: 'green' },
    { name: 'Red', value: 'red' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Blue', value: 'blue' },
    { name: 'Purple', value: 'purple' }
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/status');
      return;
    }
    if (id) {
      fetchStatus();
    }
  }, [user, id]);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/status');
      const foundStatus = response.data.find(s => s._id === id);
      if (foundStatus) {
        setFormData({
          name: foundStatus.name,
          description: foundStatus.description || '',
          color: foundStatus.color
        });
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/status/${id}`, formData);
      router.push(`/status/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading status details...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/status/${id}`)}
          icon="←"
        >
          Back to Status
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">✏️ Edit Status</h1>
          <p className="text-gray-600">Update status information</p>
        </div>
      </div>

      <Card title="Edit Status Information" icon="✏️">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Status Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Enter status name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Enter status description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              🎨 Color
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colorOptions.map(color => (
                <label key={color.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color.value}
                    checked={formData.color === color.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className={`w-4 h-4 rounded-full bg-${color.value}-500`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {color.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="submit" 
              disabled={loading}
              icon="💾"
              className="flex-1"
            >
              {loading ? 'Updating Status...' : 'Update Status'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/status/${id}`)}
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