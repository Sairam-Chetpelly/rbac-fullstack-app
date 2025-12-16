import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';

export default function EditStatus() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    category: 'General',
    isActive: true
  });

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
      const response = await api.get(`/status/${id}`);
      const foundStatus = response.data;
      if (foundStatus) {
        setFormData({
          name: foundStatus.name,
          description: foundStatus.description || '',
          color: foundStatus.color,
          category: foundStatus.category || 'General',
          isActive: foundStatus.isActive !== undefined ? foundStatus.isActive : true
        });
      }
    } catch (error) {
      toast.error('Failed to fetch status');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/status/${id}`, formData);
      toast.success('Status updated successfully!');
      setTimeout(() => router.push(`/status/${id}`), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
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
      <div className="max-w-7xl mx-auto">
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
    <div className="max-w-7xl mx-auto space-y-8">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📂 Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              required
            >
              <option value="General">General</option>
              <option value="System">System</option>
              <option value="Application">Application</option>
              <option value="Payment">Payment</option>
              <option value="Document">Document</option>
              <option value="Processing">Processing</option>
              <option value="Visa">Visa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⚡ Status
            </label>
            <select
              name="isActive"
              value={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              required
            >
              <option value={true}>✅ Active</option>
              <option value={false}>❌ Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎨 Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-16 h-12 border border-gray-200 rounded-xl cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-mono"
                  placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
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