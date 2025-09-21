import { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
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
      label: 'Transaction ID',
      render: (value) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'application',
      label: 'Application',
      render: (value) => (
        <div className="font-mono text-sm">{value?.applicationNumber}</div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (value) => (
        <div>
          <div className="font-semibold">{value?.name}</div>
          <div className="text-sm text-gray-600">{value?.email}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, row) => (
        <div className="font-semibold">
          {row.currency} {value}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (value) => (
        <span className="capitalize">{value}</span>
      )
    },
    {
      key: 'paidAt',
      label: 'Paid At',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Not paid'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">💳 Payments Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Track and manage payment transactions</p>
        </div>
      </div>

      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table
            data={payments}
            columns={columns}
            emptyMessage="No payments found"
          />
        </Card>
      )}
    </div>
  );
}