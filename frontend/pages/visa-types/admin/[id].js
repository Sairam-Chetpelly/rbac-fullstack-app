import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import api from '../../../lib/api';

export default function EditVisaType() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: ''
  });
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchVisaType();
      fetchStatuses();
    }
  }, [id]);

  const fetchVisaType = async () => {
    try {
      const response = await api.get(`/visa-types`);
      const visaType = response.data.find(v => v._id === id);
      if (visaType) {
        setFormData({
          name: visaType.name,
          description: visaType.description || '',
          status: visaType.status._id
        });
      }
    } catch (error) {
      console.error('Error fetching visa type:', error);
    }
  };

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
      await api.put(`/visa-types/${id}`, formData);
      router.push('/visa-types');
    } catch (error) {
      console.error('Error updating visa type:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">✏️ Edit Visa Type</h1>
            <p className="text-sm sm:text-base text-gray-600">Update visa type information</p>
          </div>
        </div>

        <Card title="Visa Type Information" icon="📋">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  📋 Visa Type Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter visa type name"
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
                  placeholder="Enter visa type description"
                  rows="4"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  ⚡ Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  required
                >
                  {/* <option value="">Select Status</option>
                  {statuses.map(status => (
                    <option key={status._id} value={status._id}>
                      {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                    </option>
                  ))} */}
                <option disabled value="">Select Status</option>
                {statuses.filter(status => status.category === "System").map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                  </option>
                ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button 
                type="submit" 
                disabled={loading}
                icon="💾"
                className="flex-1"
              >
                {loading ? 'Updating Visa Type...' : 'Update Visa Type'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/visa-types')}
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