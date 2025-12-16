import { useState, useEffect } from 'react';
import EnhancedTable from '../components/EnhancedTable';
import PaymentModal from '../components/PaymentModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, applicationId: null, payment: null });
  const [activeFilters, setActiveFilters] = useState({});
  const [filterTimeout, setFilterTimeout] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const header = document.querySelector('header');
    const sidebar = document.querySelector('div[class*="bg-white/10 backdrop-blur-md border-r"]');
    
    if (paymentModal.isOpen) {
      if (header) {
        header.style.zIndex = '-1';
        header.style.visibility = 'hidden';
      }
      if (sidebar) {
        sidebar.style.zIndex = '0';
      }
    } else {
      if (header) {
        header.style.zIndex = '';
        header.style.visibility = '';
      }
      if (sidebar) {
        sidebar.style.zIndex = '';
      }
    }
    
    return () => {
      if (header) {
        header.style.zIndex = '';
        header.style.visibility = '';
      }
      if (sidebar) {
        sidebar.style.zIndex = '';
      }
    };
  }, [paymentModal.isOpen]);

  useEffect(() => {
    return () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }
    };
  }, [filterTimeout]);

  useEffect(() => {
    fetchPayments(pagination.page, activeFilters);
  }, [user]);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchPayments(1, filters);
    }, 500);
    
    setFilterTimeout(timeout);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPayments(1, {});
  };

  const fetchPayments = async (page = 1, filters = {}) => {
    try {
      const endpoint = user?.role === 'employee' ? '/applications/assigned/payments' : '/payments';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`${endpoint}?${params.toString()}`);
      const paymentsData = response.data.data || response.data;
      
      setPayments(paymentsData);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (paymentData) => {
    try {
      await api.put(`/applications/${paymentModal.applicationId}/payment`, paymentData);
      fetchPayments(pagination.page, activeFilters);
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'transactionId',
      label: 'Transaction Details',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-lg">
            💳
          </div>
          <div>
            <div className="font-mono text-sm font-semibold text-gray-900">{value || 'N/A'}</div>
            <div className="text-xs text-gray-500">{item.application?.applicationNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Customer',
      sortable: true,
      render: (value) => (
        <div>
          <div className="font-semibold text-gray-900">{value?.name}</div>
          <div className="text-sm text-gray-600">{value?.email}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <div className="font-semibold text-gray-900">
          {row.currency} {value}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, item) => (
        <button
          onClick={() => setPaymentModal({ isOpen: true, applicationId: item.application?._id, payment: item })}
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)} hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1`}
        >
          <span className="text-xs">✏️</span>
          {(value || 'pending').toUpperCase()}
        </button>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      sortable: true,
      render: (value) => (
        <span className="capitalize text-gray-700 font-medium">{value || 'N/A'}</span>
      )
    },
    {
      key: 'paidAt',
      label: 'Paid At',
      type: 'date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {value ? new Date(value).toLocaleDateString() : 'Not paid'}
          </div>
          <div className="text-xs text-gray-500">
            {value ? new Date(value).toLocaleTimeString() : 'Pending'}
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      sortable: true
    }
  ];

  const filters = [
    {
      key: 'status',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'success', label: 'Success' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ]
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      options: [
        { value: 'cash', label: 'Cash Payment' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'upi', label: 'UPI Payment' },
        { value: 'card', label: 'Card Payment' },
        { value: 'cheque', label: 'Cheque Payment' },
        { value: 'agent_contact', label: 'Agent Contact' }
      ]
    },
    {
      key: 'amountFrom',
      label: 'Amount From',
      type: 'number',
      placeholder: 'Min amount'
    },
    {
      key: 'amountTo',
      label: 'Amount To',
      type: 'number',
      placeholder: 'Max amount'
    },
    {
      key: 'dateFrom',
      label: 'Created From',
      type: 'date',
      placeholder: 'Select start date'
    },
    {
      key: 'dateTo',
      label: 'Created To',
      type: 'date',
      placeholder: 'Select end date'
    },
    {
      key: 'paidFrom',
      label: 'Paid From',
      type: 'date',
      placeholder: 'Select payment start date'
    },
    {
      key: 'paidTo',
      label: 'Paid To',
      type: 'date',
      placeholder: 'Select payment end date'
    },
    {
      key: 'customerEmail',
      label: 'Customer Email',
      type: 'text',
      placeholder: 'Enter customer email'
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      type: 'text',
      placeholder: 'Enter customer name'
    },
    {
      key: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      placeholder: 'Enter transaction ID'
    }
  ];

  const stats = {
    total: pagination.total || 0,
    pending: payments.filter(payment => payment.status === 'pending').length,
    success: payments.filter(payment => payment.status === 'success').length,
    failed: payments.filter(payment => payment.status === 'failed').length,
    refunded: payments.filter(payment => payment.status === 'refunded').length
  };

  return (
    <>
      <EnhancedTable
        title={`💳 ${user?.role === 'employee' ? 'Payment Records' : 'Payments Management'}`}
        data={payments}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by transaction ID, customer name, email, or application..."
        emptyMessage="No payments found"
        emptyIcon="💳"
        showStats={true}
        stats={stats}
        filters={filters}
        activeFilters={activeFilters}
        itemsPerPage={pagination.limit || 10}
        serverSidePagination={true}
        totalItems={pagination.total}
        currentPage={pagination.page}
        onPageChange={(page) => {
          setPagination(prev => ({ ...prev, page }));
          fetchPayments(page, activeFilters);
        }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, applicationId: null, payment: null })}
        onUpdate={handlePaymentUpdate}
        payment={paymentModal.payment}
      />
    </>
  );
}