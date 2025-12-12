import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CreditCard, Download } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/Button';
import CustomerLayout from '../../components/CustomerLayout';
import SearchFilters from '../../components/SearchFilters';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CustomerPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
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
    fetchPayments();
  }, [router]);

  const fetchPayments = async (page = 1, search = '', filterParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...filterParams
      });
      
      const response = await api.get(`/customer/payments?${params}`);
      setPayments(response.data.payments || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchPayments(1, search, filters);
  };
  
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchPayments(1, searchTerm, newFilters);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
    fetchPayments(1, '', {});
  };
  
  const handlePageChange = (page) => {
    fetchPayments(page, searchTerm, filters);
  };

  const handleExport = () => {
    const csvData = payments.map(payment => ({
      'Transaction ID': payment.transactionId || 'N/A',
      'Application Number': payment.application?.applicationNumber || 'N/A',
      'Amount': payment.amount,
      'Status': payment.status.toUpperCase(),
      'Payment Method': payment.paymentMethod || 'N/A',
      'Payment Date': new Date(payment.paidAt || payment.createdAt).toLocaleDateString()
    }));
    
    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadInvoice = (payment) => {
    const doc = {
      content: [
        { text: 'One World Visa', style: 'header' },
        { text: 'Payment Invoice', style: 'subheader' },
        { text: '\n' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              ['Invoice Number:', payment.transactionId || 'N/A'],
              ['Application Number:', payment.application?.applicationNumber || 'N/A'],
              ['Amount:', `₹${payment.amount}`],
              ['Status:', payment.status.toUpperCase()],
              ['Payment Date:', new Date(payment.paidAt || payment.createdAt).toLocaleDateString()],
              ['Payment Method:', payment.paymentMethod || 'N/A']
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center' },
        subheader: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 10, 0, 5] }
      }
    };
    
    import('pdfmake/build/pdfmake').then(pdfMake => {
      import('pdfmake/build/vfs_fonts').then(vfs => {
        pdfMake.default.vfs = vfs.default;
        pdfMake.default.createPdf(doc).download(`invoice-${payment.transactionId || payment._id}.pdf`);
      });
    });
  };

  const filterOptions = {
    status: [
      { value: 'success', label: 'Success' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' }
    ],
    dateRange: true,
    paymentMethod: true,
    amountRange: true,
    sortBy: true,
    sortOrder: true,
    customDateRange: true
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          {payments.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
        
        <SearchFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          filters={filterOptions}
          searchPlaceholder="Search by transaction ID or application number..."
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
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {payment.transactionId?.slice(-8) || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                          <span className="truncate block">{payment.application?.applicationNumber || 'N/A'}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">
                          ₹{payment.amount}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'success' ? 'bg-green-100 text-green-800' : 
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                          {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadInvoice(payment)}
                            disabled={payment.status !== 'success'}
                          >
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden">
                {payments.map((payment) => (
                  <div key={payment._id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.transactionId?.slice(-8) || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">{payment.application?.applicationNumber || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'success' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">₹{payment.amount}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice(payment)}
                        disabled={payment.status !== 'success'}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {payments.length === 0 && (
                <div className="p-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
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