import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function EditCountryVisaType() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    visaType: '',
    country: '',
    processingTimeMin: '',
    processingTimeMax: '',
    vfsAmount: '',
    consulateAmount: '',
    serviceAmount: '',
    totalAmount: ''
  });
  const [statuses, setStatuses] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchData();
      fetchCountryVisaType();
    }
  }, [id]);

  useEffect(() => {
    calculateTotal();
  }, [formData.vfsAmount, formData.consulateAmount, formData.serviceAmount]);

  const fetchData = async () => {
    try {
      const [statusRes, visaTypeRes, countryRes] = await Promise.all([
        api.get('/status'),
        api.get('/visa-types'),
        api.get('/countries')
      ]);
      setStatuses(statusRes.data);
      setVisaTypes(visaTypeRes.data);
      setCountries(countryRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCountryVisaType = async () => {
    try {
      const response = await api.get(`/country-visa-types`);
      const item = response.data.find(c => c._id === id);
      if (item) {
        setFormData({
          name: item.name,
          description: item.description || '',
          status: item.status._id,
          visaType: item.visaType._id,
          country: item.country._id,
          processingTimeMin: item.processingTimeMin,
          processingTimeMax: item.processingTimeMax,
          vfsAmount: item.vfsAmount,
          consulateAmount: item.consulateAmount,
          serviceAmount: item.serviceAmount,
          totalAmount: item.totalAmount
        });
      }
    } catch (error) {
      console.error('Error fetching country visa type:', error);
    }
  };

  const calculateTotal = () => {
    const vfs = parseFloat(formData.vfsAmount) || 0;
    const consulate = parseFloat(formData.consulateAmount) || 0;
    const service = parseFloat(formData.serviceAmount) || 0;
    const total = vfs + consulate + service;
    setFormData(prev => ({ ...prev, totalAmount: total.toString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/country-visa-types/${id}`, formData);
      router.push('/country-visa-types');
    } catch (error) {
      console.error('Error updating country visa type:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">✏️ Edit Country Visa Type</h1>
            <p className="text-sm sm:text-base text-gray-600">Update country-specific visa configuration</p>
          </div>
        </div>

        <Card title="Country Visa Type Information" icon="🎫">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🎫 Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🏳️ Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country._id} value={country._id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  📋 Visa Type
                </label>
                <select
                  value={formData.visaType}
                  onChange={(e) => setFormData({...formData, visaType: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  required
                >
                  <option value="">Select Visa Type</option>
                  {visaTypes.map(visaType => (
                    <option key={visaType._id} value={visaType._id}>{visaType.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  ⏱️ Processing Time (Days)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.processingTimeMin}
                    onChange={(e) => setFormData({...formData, processingTimeMin: e.target.value})}
                    className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                    placeholder="Min days"
                    required
                  />
                  <input
                    type="text"
                    value={formData.processingTimeMax}
                    onChange={(e) => setFormData({...formData, processingTimeMax: e.target.value})}
                    className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                    placeholder="Max days"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  📝 Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  💰 VFS Amount
                </label>
                <input
                  type="number"
                  value={formData.vfsAmount}
                  onChange={(e) => setFormData({...formData, vfsAmount: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter VFS amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🏛️ Consulate Amount
                </label>
                <input
                  type="number"
                  value={formData.consulateAmount}
                  onChange={(e) => setFormData({...formData, consulateAmount: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter consulate amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🔧 Service Amount
                </label>
                <input
                  type="number"
                  value={formData.serviceAmount}
                  onChange={(e) => setFormData({...formData, serviceAmount: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter service amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  💵 Total Amount
                </label>
                <input
                  type="text"
                  value={formData.totalAmount}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl bg-gray-50 text-sm lg:text-base"
                  placeholder="Auto-calculated"
                  readOnly
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
                {loading ? 'Updating...' : 'Update Country Visa Type'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/country-visa-types')}
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