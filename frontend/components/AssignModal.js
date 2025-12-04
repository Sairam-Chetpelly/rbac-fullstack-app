import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AssignModal({ isOpen, onClose, onSubmit, employees, currentEmployee }) {
  const [selectedEmployee, setSelectedEmployee] = useState(currentEmployee?._id || '');

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee(currentEmployee?._id || '');
    }
  }, [isOpen, currentEmployee]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedEmployee);
    onClose();
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
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Assignment Management</h3>
                <p className="text-blue-100 text-sm">Assign application to employee</p>
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
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Assign to Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white text-gray-900 font-medium"
            >
              <option value="">🚫 Unassigned</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  👤 {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </div>

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
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Assign Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}