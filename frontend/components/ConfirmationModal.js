import { useEffect } from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'default' }) => {
  useEffect(() => {
    const header = document.querySelector('header');
    const sidebar = document.querySelector('div[class*="bg-white/10 backdrop-blur-md border-r"]');
    
    if (isOpen) {
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
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '🗑️',
          gradient: 'from-red-500 to-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          gradient: 'from-yellow-500 to-orange-600',
          confirmButton: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'success':
        return {
          icon: '✅',
          gradient: 'from-green-500 to-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          icon: '❓',
          gradient: 'from-blue-500 to-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 !m-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md transform transition-all">
        {/* Header */}
        <div className={`bg-gradient-to-r ${styles.gradient} rounded-t-2xl px-6 py-4 shadow-lg`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{styles.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
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

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 ${styles.confirmButton} text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;