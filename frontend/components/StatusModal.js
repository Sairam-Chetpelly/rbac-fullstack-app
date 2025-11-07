import { useState, useEffect } from 'react';
import Button from './Button';

export default function StatusModal({ isOpen, onClose, onSubmit, statuses, currentStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus?._id || '');
  const [remarks, setRemarks] = useState('');
  const [embassyVisitDateTime, setEmbassyVisitDateTime] = useState('');
  const [visaDetails, setVisaDetails] = useState({
    visaNumber: '',
    dateOfIssuance: '',
    dateOfExpiry: '',
    additionalDetails: ''
  });
  const [visaFiles, setVisaFiles] = useState([]);
  const [courierDetails, setCourierDetails] = useState({
    visaNumber: '',
    courierName: '',
    shipmentRefNumber: '',
    shipmentDate: ''
  });
  const [courierFiles, setCourierFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus?._id || '');
      setRemarks('');
      setEmbassyVisitDateTime('');
      setVisaDetails({
        visaNumber: '',
        dateOfIssuance: '',
        dateOfExpiry: '',
        additionalDetails: ''
      });
      setVisaFiles([]);
      setCourierDetails({
        visaNumber: '',
        courierName: '',
        shipmentRefNumber: '',
        shipmentDate: ''
      });
      setCourierFiles([]);
    }
  }, [isOpen, currentStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    
    const statusName = statuses.find(s => s._id === selectedStatus)?.name || 'Unknown';
    const isVisaIssued = statusName.toLowerCase().includes('visa-approved') || statusName.toLowerCase().includes('approved');
    const isVisaInTransit = statusName.toLowerCase().includes('visa-in-transit') || statusName.toLowerCase().includes('transit');
    
    // Visa details are now optional
    
    onSubmit(selectedStatus, remarks || `Status changed to ${statusName}`, embassyVisitDateTime, isVisaIssued ? visaDetails : null, visaFiles, isVisaInTransit ? courierDetails : null, courierFiles);
    setRemarks('');
    setEmbassyVisitDateTime('');
    setVisaDetails({
      visaNumber: '',
      dateOfIssuance: '',
      dateOfExpiry: '',
      additionalDetails: ''
    });
    setCourierDetails({
      visaNumber: '',
      courierName: '',
      shipmentRefNumber: '',
      shipmentDate: ''
    });
    setCourierFiles([]);
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

          {statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('scheduled') && (
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

          {(statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('visa-approved') || 
            statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('approved')) && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800">📋 Visa Issuance Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Number
                </label>
                <input
                  type="text"
                  value={visaDetails.visaNumber}
                  onChange={(e) => setVisaDetails({...visaDetails, visaNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter visa number"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Issuance
                  </label>
                  <input
                    type="date"
                    value={visaDetails.dateOfIssuance}
                    onChange={(e) => setVisaDetails({...visaDetails, dateOfIssuance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Expiry
                  </label>
                  <input
                    type="date"
                    value={visaDetails.dateOfExpiry}
                    onChange={(e) => setVisaDetails({...visaDetails, dateOfExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={visaDetails.additionalDetails}
                  onChange={(e) => setVisaDetails({...visaDetails, additionalDetails: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Any additional visa details..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Files (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setVisaFiles(Array.from(e.target.files))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload visa documents (PDF, Images, Word files)</p>
                {visaFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="text-xs text-gray-500">
                      {visaFiles.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {(statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('visa-in-transit') || 
            statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('in-transit')) && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800">🚚 Courier Details (Optional)</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visa Number
                </label>
                <input
                  type="text"
                  value={courierDetails.visaNumber}
                  onChange={(e) => setCourierDetails({...courierDetails, visaNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter visa number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courier Name
                </label>
                <input
                  type="text"
                  value={courierDetails.courierName}
                  onChange={(e) => setCourierDetails({...courierDetails, courierName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter courier company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Reference Number
                </label>
                <input
                  type="text"
                  value={courierDetails.shipmentRefNumber}
                  onChange={(e) => setCourierDetails({...courierDetails, shipmentRefNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tracking/reference number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Date
                </label>
                <input
                  type="date"
                  value={courierDetails.shipmentDate}
                  onChange={(e) => setCourierDetails({...courierDetails, shipmentDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courier Documents (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setCourierFiles(Array.from(e.target.files))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload courier receipts, tracking documents</p>
                {courierFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="text-xs text-gray-500">
                      {courierFiles.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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