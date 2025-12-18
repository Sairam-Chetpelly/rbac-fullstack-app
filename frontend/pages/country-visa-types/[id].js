import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function EditCountryVisaType() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    visaType: '',
    country: '',
    processingTimeMin: '',
    processingTimeMax: '',
    totalAmount: '',
    agentDiscount: '0'
  });

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

  const fetchData = async () => {
    try {
      const [visaTypeRes, countryRes] = await Promise.all([
        api.get('/visa-types'),
        api.get('/countries')
      ]);
      setVisaTypes(Array.isArray(visaTypeRes.data) ? visaTypeRes.data : visaTypeRes.data?.data || []);
      setCountries(Array.isArray(countryRes.data) ? countryRes.data : countryRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCountryVisaType = async () => {
    try {
      const response = await api.get(`/country-visa-types/${id}`);
      const item = response.data;
      setFormData({
        name: item.name,
        description: item.description || '',
        isActive: item.isActive !== undefined ? item.isActive : true,
        visaType: item.visaType?._id || '',
        country: item.country?._id || '',
        processingTimeMin: item.processingTimeMin,
        processingTimeMax: item.processingTimeMax,
        totalAmount: item.totalAmount,
        agentDiscount: item.agentDiscount || '0'
      });
    } catch (error) {
      console.error('Error fetching country visa type:', error);
    }
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
                  <option disabled value="">Select Country</option>
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
                  <option disabled value="">Select Visa Type</option>
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
                  💵 Total Amount
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter total amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🎯 Agent Discount
                </label>
                <input
                  type="number"
                  value={formData.agentDiscount}
                  onChange={(e) => setFormData({...formData, agentDiscount: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter agent discount"
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  ⚡ Status
                </label>
                <select
                  value={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  required
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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