import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FileText, Edit, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/Button';
import CustomerLayout from '../../components/CustomerLayout';
import SearchFilters from '../../components/SearchFilters';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CustomerDrafts() {
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'customer' && parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDrafts();
  }, [router]);

  const fetchDrafts = async (page = 1, search = '', filterParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status: 'draft',
        ...filterParams
      });
      
      const response = await api.get(`/customer/applications?${params}`);
      setDrafts(response.data.applications || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchDrafts(1, search, filters);
  };
  
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchDrafts(1, searchTerm, newFilters);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
    fetchDrafts(1, '', {});
  };
  
  const handlePageChange = (page) => {
    fetchDrafts(page, searchTerm, filters);
  };

  const filterOptions = {
    dateRange: true
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Draft Applications</h1>
        
        <SearchFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          filters={filterOptions}
          searchPlaceholder="Search draft applications..."
          initialSearch={searchTerm}
          initialFilters={filters}
        />
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {drafts.map((draft) => (
                <div key={draft._id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {draft.countryVisaType?.country?.name || 'Draft Application'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Application Number: {draft.applicationNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(draft.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const visaTypeId = typeof draft.countryVisaType === 'object' ? draft.countryVisaType._id : draft.countryVisaType;
                          router.push(`/visa-application/form/${visaTypeId}?draftId=${draft._id}`);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Continue
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {drafts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No draft applications found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or start a new application</p>
                <Link href="/">
                  <Button>Start New Application</Button>
                </Link>
              </div>
            )}
            
            {pagination.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}