import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function EditCountry() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    code: '',
    isActive: true,
    continent: '',
    processingTimeMin: '',
    processingTimeMax: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCountry();
      fetchContinents();
    }
  }, [id]);

  const fetchCountry = async () => {
    try {
      const response = await api.get(`/countries/${id}`);
      const country = response.data;
      setFormData({
        name: country.name,
        slug: country.slug,
        description: country.description,
        code: country.code,
        isActive: country.isActive !== undefined ? country.isActive : true,
        continent: country.continent?._id || '',
        processingTimeMin: country.processingTimeMin,
        processingTimeMax: country.processingTimeMax
      });
      setCurrentImage(country.placeImage);
    } catch (error) {
      console.error('Error fetching country:', error);
      toast.error('Failed to fetch country details');
    }
  };



  const fetchContinents = async () => {
    try {
      const response = await api.get('/continents');
      setContinents(response.data);
    } catch (error) {
      console.error('Error fetching continents:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (selectedImage) {
        formDataToSend.append('placeImage', selectedImage);
      }
      
      await api.put(`/countries/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Country updated successfully!');
      router.push('/countries');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update country';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/countries')}
            icon="←"
            className="w-full sm:w-auto"
          >
            Back to Countries
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">✏️ Edit Country</h1>
            <p className="text-sm sm:text-base text-gray-600">Update country information and details</p>
          </div>
        </div>

        <Card title="Country Information" icon="🏞️">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🏞️ Country Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter country name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🏷️ Country Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  placeholder="Enter country code (e.g., US, IN)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  Slug
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

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🖼️ Place Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                />
                <div className="mt-2 flex gap-2">
                  {imagePreview && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">New Image:</p>
                      <img 
                        src={imagePreview} 
                        alt="New Preview" 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  {currentImage && !imagePreview && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                      <img 
                        src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${currentImage}`} 
                        alt="Current" 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
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
                  placeholder="Enter country description"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm lg:text-base font-semibold text-gray-700 mb-2">
                  🌍 Continent
                </label>
                <select
                  value={formData.continent}
                  onChange={(e) => setFormData({...formData, continent: e.target.value})}
                  className="w-full px-4 py-3 lg:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm lg:text-base"
                  required
                >
                  <option disabled value="">Select Continent</option>
                  {continents.map(continent => (
                    <option key={continent._id} value={continent._id}>{continent.name}</option>
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
                {loading ? 'Updating Country...' : 'Update Country'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/countries')}
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