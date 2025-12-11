import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    if (!selectedStatus) return;
    
    const statusName = statuses.find(s => s._id === selectedStatus)?.name || 'Unknown';
    const isVisaIssued = statusName.toLowerCase().includes('visa-approved') || statusName.toLowerCase().includes('approved');
    const isVisaInTransit = statusName.toLowerCase().includes('visa-in-transit') || statusName.toLowerCase().includes('transit');
    
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 !m-0">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl px-6 py-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Status Management</h3>
                <p className="text-orange-100 text-sm">Update application status</p>
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
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all bg-white text-gray-900 font-medium"
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
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Embassy Visit Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={embassyVisitDateTime}
                  onChange={(e) => setEmbassyVisitDateTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                />
              </div>
            )}

            {(statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('visa-approved') || 
              statuses.find(s => s._id === selectedStatus)?.name?.toLowerCase().includes('approved')) && (
              <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800">📋 Visa Issuance Details</h4>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Visa Number
                  </label>
                  <input
                    type="text"
                    value={visaDetails.visaNumber}
                    onChange={(e) => setVisaDetails({...visaDetails, visaNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                    placeholder="Enter visa number"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Date of Issuance
                    </label>
                    <input
                      type="date"
                      value={visaDetails.dateOfIssuance}
                      onChange={(e) => setVisaDetails({...visaDetails, dateOfIssuance: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Date of Expiry
                    </label>
                    <input
                      type="date"
                      value={visaDetails.dateOfExpiry}
                      onChange={(e) => setVisaDetails({...visaDetails, dateOfExpiry: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={visaDetails.additionalDetails}
                    onChange={(e) => setVisaDetails({...visaDetails, additionalDetails: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all resize-none"
                    rows="2"
                    placeholder="Any additional visa details..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Visa Files (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setVisaFiles(Array.from(e.target.files))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
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
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800">🚚 Courier Details (Optional)</h4>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Visa Number
                  </label>
                  <input
                    type="text"
                    value={courierDetails.visaNumber}
                    onChange={(e) => setCourierDetails({...courierDetails, visaNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                    placeholder="Enter visa number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Courier Name
                  </label>
                  <input
                    type="text"
                    value={courierDetails.courierName}
                    onChange={(e) => setCourierDetails({...courierDetails, courierName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                    placeholder="Enter courier company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Shipment Reference Number
                  </label>
                  <input
                    type="text"
                    value={courierDetails.shipmentRefNumber}
                    onChange={(e) => setCourierDetails({...courierDetails, shipmentRefNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                    placeholder="Enter tracking/reference number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Shipment Date
                  </label>
                  <input
                    type="date"
                    value={courierDetails.shipmentDate}
                    onChange={(e) => setCourierDetails({...courierDetails, shipmentDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Courier Documents (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setCourierFiles(Array.from(e.target.files))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
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
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Additional Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all resize-none"
                rows="3"
                placeholder="Add any remarks about this status change..."
              />
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}