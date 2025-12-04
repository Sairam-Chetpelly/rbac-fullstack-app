import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, payment, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: 'pending',
    transactionId: '',
    paymentMethod: 'cash',
    remarks: ''
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        status: payment.status || 'pending',
        transactionId: payment.transactionId || '',
        paymentMethod: payment.paymentMethod || 'cash',
        remarks: ''
      });
    }
  }, [payment]);

  useEffect(() => {
    const header = document.querySelector('header');
    const sidebar = document.querySelector('aside, nav');
    
    if (isOpen) {
      if (header) header.style.zIndex = '0';
      if (sidebar) sidebar.style.zIndex = '0';
    } else {
      if (header) header.style.zIndex = '';
      if (sidebar) sidebar.style.zIndex = '';
    }
    
    return () => {
      if (header) header.style.zIndex = '';
      if (sidebar) sidebar.style.zIndex = '';
    };
  }, [isOpen]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Management</h3>
                <p className="text-blue-100 text-sm">Update payment details</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Payment Status
            </label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white text-gray-900 font-medium"
                required
              >
                <option value="pending">🟡 Pending Payment</option>
                <option value="success">✅ Payment Successful</option>
                <option value="failed">❌ Payment Failed</option>
                <option value="refunded">🔄 Payment Refunded</option>
              </select>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Transaction ID
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              placeholder="Enter transaction reference number"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white text-gray-900 font-medium"
            >
              <option value="cash">💵 Cash Payment</option>
              <option value="bank_transfer">🏦 Bank Transfer</option>
              <option value="upi">📱 UPI Payment</option>
              <option value="card">💳 Card Payment</option>
              <option value="cheque">📝 Cheque Payment</option>
              <option value="agent_contact">👤 Agent Contact</option>
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Additional Notes
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
              rows="3"
              placeholder="Add any additional notes or remarks..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                'Update Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;