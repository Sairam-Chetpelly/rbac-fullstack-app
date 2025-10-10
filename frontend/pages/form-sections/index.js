import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../lib/api';

export default function FormSections() {
  const [formSections, setFormSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchFormSections();
  }, []);

  const fetchFormSections = async () => {
    try {
      const response = await api.get('/form-sections');
      setFormSections(response.data);
    } catch (error) {
      console.error('Error fetching form sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this form section?')) {
      try {
        await api.delete(`/form-sections/${id}`);
        setFormSections(formSections.filter(item => item._id !== id));
      } catch (error) {
        console.error('Error deleting form section:', error);
      }
    }
  };

  const filteredFormSections = formSections.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form sections...</p>
        </div>
      
    );
  }

  return (
      <div className="max-w-full mx-auto space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">📑 Form Sections</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage form sections and their configurations</p>
          </div>
          <Button onClick={() => router.push('/form-sections/add')} icon="➕" className="w-full sm:w-auto">
            Add Form Section
          </Button>
        </div>

        <Card>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search form sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormSections.map((formSection) => (
              <div key={formSection._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{formSection.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{formSection.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">Order:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {formSection.order}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">Visa Type: </span>
                      <span className="text-sm font-medium text-gray-700">
                        {formSection.countryVisaType?.name || 'No visa type'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      formSection.status?.name === 'active' ? 'bg-green-100 text-green-800' :
                      formSection.status?.name === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formSection.status?.name?.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/form-sections/view/${formSection._id}`)}
                    icon="👁️"
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/form-sections/${formSection._id}`)}
                    icon="✏️"
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(formSection._id)}
                    icon="🗑️"
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredFormSections.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📑</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No form sections found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first form section.</p>
              <Button onClick={() => router.push('/form-sections/add')} icon="➕">
                Add Form Section
              </Button>
            </div>
          )}
        </Card>
      </div>
  );
}