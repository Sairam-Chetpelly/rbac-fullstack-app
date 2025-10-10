import { useState, useEffect } from 'react';
import Button from './Button';

export default function AssignModal({ isOpen, onClose, onSubmit, employees, currentEmployee }) {
  const [selectedEmployee, setSelectedEmployee] = useState(currentEmployee?._id || '');

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee(currentEmployee?._id || '');
    }
  }, [isOpen, currentEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedEmployee);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Assign Application</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Assign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}