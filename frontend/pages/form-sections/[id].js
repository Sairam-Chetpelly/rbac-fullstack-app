import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function EditFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: '',
    country: '',
    countryVisaType: '',
    isActive: true
  });

  const [countries, setCountries] = useState([]);
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCountries();
      fetchFormSection();
    }
  }, [id]);

  useEffect(() => {
    if (formData.country) {
      fetchCountryVisaTypes(formData.country);
    }
  }, [formData.country]);

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries/dropdown');
      setCountries(response.data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchCountryVisaTypes = async (countryId) => {
    try {
      const response = await api.get(`/form-fields/country-visa-types/${countryId}`);
      setCountryVisaTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching country visa types:', error);
    }
  };

  const fetchFormSection = async () => {
    try {
      const response = await api.get(`/form-sections/${id}`);
      const formSection = response.data;
      
      const country = formSection.countryVisaType?.country?._id;
      
      setFormData({
        name: formSection.name,
        description: formSection.description || '',
        order: formSection.order,
        country: country || '',
        countryVisaType: formSection.countryVisaType?._id || '',
        isActive: formSection.isActive !== undefined ? formSection.isActive : true
      });
    } catch (error) {
      console.error('Error fetching form section:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/form-sections/${id}`, formData);
      router.push('/form-sections');
    } catch (error) {
      console.error('Error updating form section:', error);
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

  if (initialLoading) {
    return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form section...</p>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/form-sections')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Form Sections
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">✏️ Edit Form Section</h1>
            <p className="text-sm sm:text-base text-gray-600">Update form section information</p>
          </div>
        </div>

        <Card title="Form Section Information" icon="📑">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter form section name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order *
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter display order"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option disabled value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country._id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country Visa Type *
                </label>
                <select
                  name="countryVisaType"
                  value={formData.countryVisaType}
                  onChange={handleChange}
                  required
                  disabled={!formData.country}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option disabled value="">Select Country Visa Type</option>
                  {countryVisaTypes.map((cvt) => (
                    <option key={cvt._id} value={cvt._id}>
                      {cvt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter form section description"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                icon="💾"
                className="flex-1 sm:flex-none"
              >
                {loading ? 'Updating...' : 'Update Form Section'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/form-sections')}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
  );
}