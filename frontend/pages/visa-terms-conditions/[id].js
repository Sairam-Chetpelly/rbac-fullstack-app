import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import RichTextEditor from '../../components/RichTextEditor';
import api from '../../lib/api';

export default function EditVisaTermsConditions() {
  const [formData, setFormData] = useState({
    countryVisaType: '',
    title: '',
    content: '',
    isActive: true
  });
  const [countryVisaTypes, setCountryVisaTypes] = useState([]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchData();
      fetchTerms();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const countryVisaTypesRes = await api.get('/country-visa-types');
      setCountryVisaTypes(countryVisaTypesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTerms = async () => {
    try {
      const response = await api.get(`/visa-terms-conditions/${id}`);
      const terms = response.data;
      if (terms) {
        setFormData({
          countryVisaType: terms.countryVisaType._id,
          title: terms.title,
          content: terms.content,
          isActive: terms.isActive !== undefined ? terms.isActive : true
        });
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/visa-terms-conditions/${id}`, formData);
      router.push('/visa-terms-conditions');
    } catch (error) {
      console.error('Error updating terms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/visa-terms-conditions')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Visa Terms
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">✏️ Edit Visa Terms & Conditions</h1>
            <p className="text-sm sm:text-base text-gray-600">Update visa terms and conditions</p>
          </div>
        </div>

        <Card title="Visa Terms & Conditions Information" icon="📋">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  📋 Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🎫 Country Visa Type
                </label>
                <select
                  value={formData.countryVisaType}
                  onChange={(e) => setFormData({...formData, countryVisaType: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  required
                >
                  <option disabled value="">Select Country Visa Type</option>
                  {countryVisaTypes.map(cvt => (
                    <option key={cvt._id} value={cvt._id}>{cvt.name}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  📝 Content
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({...formData, content})}
                  placeholder="Enter terms and conditions content"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  ⚡ Status
                </label>
                <select
                  value={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
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
                {loading ? 'Updating...' : 'Update Terms & Conditions'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/visa-terms-conditions')}
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