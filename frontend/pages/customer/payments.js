import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CreditCard } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/Button';
import CustomerLayout from '../../components/CustomerLayout';

export default function CustomerPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchPayments = async () => {
    try {
      const response = await api.get('/customer/payments');
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {payment.transactionId?.slice(-8) || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.application?.applicationNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
          {payments.length === 0 && (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-600">Your payment receipts will appear here</p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}