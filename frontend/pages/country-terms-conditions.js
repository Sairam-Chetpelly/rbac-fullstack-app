import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function CountryTermsConditions() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await api.get('/country-terms-conditions');
      setTerms(response.data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this terms and conditions?')) {
      try {
        await api.delete(`/country-terms-conditions/${id}`);
        fetchTerms();
      } catch (error) {
        console.error('Error deleting terms:', error);
      }
    }
  };

  const filteredTerms = terms.filter(term => 
    term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.country?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="space-y-6 lg:space-y-8 p-4 sm:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">📜 Country Terms & Conditions</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage country-specific terms and conditions</p>
          </div>
          <Button 
            onClick={() => router.push('/country-terms-conditions/add')} 
            icon="➕"
            className="shadow-lg w-full sm:w-auto"
            size="lg"
          >
            Add New Terms
          </Button>
        </div>

        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by title or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                Total: {terms.length}
              </span>
            </div>
          </div>
        </Card>

        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading terms...</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredTerms.map((term) => (
              <Card key={term._id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-lg lg:text-2xl font-bold shadow-lg">
                      📜
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">{term.title}</h3>
                      <p className="text-sm lg:text-base text-gray-600 truncate">{term.country?.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="line-clamp-3">{term.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => router.push(`/country-terms-conditions/view/${term._id}`)}
                      className="flex-1"
                      icon="👁️"
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/country-terms-conditions/${term._id}`)}
                      className="flex-1"
                      icon="✏️"
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(term._id)}
                      icon="🗑️"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && filteredTerms.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No terms found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          </Card>
        )}
      </div>
  );
}