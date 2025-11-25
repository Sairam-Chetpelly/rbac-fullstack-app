import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/Button';
import CustomerLayout from '../../components/CustomerLayout';
import SearchFilters from '../../components/SearchFilters';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CustomerApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
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
    fetchApplications();
  }, [router]);

  const fetchApplications = async (page = 1, search = '', filterParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...filterParams
      });
      
      const response = await api.get(`/customer/applications?${params}`);
      setApplications(response.data.applications || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchApplications(1, search, filters);
  };
  
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchApplications(1, searchTerm, newFilters);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
    fetchApplications(1, '', {});
  };
  
  const handlePageChange = (page) => {
    fetchApplications(page, searchTerm, filters);
  };

  const getStatusIcon = (status) => {
    const statusName = status?.name?.toLowerCase() || '';
    if (statusName.includes('approved')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (statusName.includes('review')) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else if (statusName.includes('rejected')) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status?.color) return 'bg-gray-100 text-gray-800';
    
    const colorMap = {
      '#gray': 'bg-gray-100 text-gray-800',
      '#blue': 'bg-blue-100 text-blue-800',
      '#yellow': 'bg-yellow-100 text-yellow-800',
      '#green': 'bg-green-100 text-green-800',
      '#red': 'bg-red-100 text-red-800',
      '#purple': 'bg-purple-100 text-purple-800',
      '#indigo': 'bg-indigo-100 text-indigo-800',
      '#pink': 'bg-pink-100 text-pink-800'
    };
    
    return colorMap[status.color] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status?.name || 'Unknown';
  };

  const getProgressValue = (status) => {
    const statusName = status?.name?.toLowerCase() || '';
    if (statusName.includes('draft')) {
      return 25;
    } else if (statusName.includes('submitted')) {
      return 50;
    } else if (statusName.includes('review')) {
      return 75;
    } else if (statusName.includes('approved')) {
      return 100;
    } else if (statusName.includes('rejected')) {
      return 50;
    } else {
      return 0;
    }
  };

  const filterOptions = {
    status: [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'under review', label: 'Under Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ],
    dateRange: true
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </Link>
        </div>
        
        <SearchFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          filters={filterOptions}
          searchPlaceholder="Search by application number..."
          initialSearch={searchTerm}
          initialFilters={filters}
        />
        
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(app.status)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{app.applicationNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.countryVisaType?.country?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                            {formatStatus(app.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${getProgressValue(app.status)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{getProgressValue(app.status)}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/customer/applications/view/${app._id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {applications.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
              
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}