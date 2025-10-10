import { useState, useEffect } from 'react';
import Button from './Button';

export default function StatusModal({ isOpen, onClose, onSubmit, statuses, currentStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus?._id || '');
  const [remarks, setRemarks] = useState('');
  const [embassyVisitDateTime, setEmbassyVisitDateTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus?._id || '');
      setRemarks('');
      setEmbassyVisitDateTime('');
    }
  }, [isOpen, currentStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    
    const statusName = statuses.find(s => s._id === selectedStatus)?.name || 'Unknown';
    onSubmit(selectedStatus, remarks || `Status changed to ${statusName}`, embassyVisitDateTime);
    setRemarks('');
    setEmbassyVisitDateTime('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Update Application Status</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Status</option>
              {statuses.map(status => (
                <option key={status._id} value={status._id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('interview') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Embassy Visit Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={embassyVisitDateTime}
                onChange={(e) => setEmbassyVisitDateTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Add any remarks about this status change..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}