import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { canAccess } from '../../../lib/roles';
import api from '../../../lib/api';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';

export default function EditUser() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isAgent, setIsAgent] = useState(false);
  const [files, setFiles] = useState({ panCardPhoto: null, gstFile: null });
  const [fieldErrors, setFieldErrors] = useState({});
  const [fileViewer, setFileViewer] = useState({ show: false, url: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    nationality: '',
    role: '',
    status: '',
    companyName: '',
    companyAddress: {
      line1: '',
      line2: '',
      city: '',
      pin: '',
      state: '',
      country: ''
    },
    panCardNumber: '',
    gstNumber: ''
  });

  useEffect(() => {
    if (!user || !canAccess(user.role, 'users')) {
      router.push('/users');
      return;
    }
    if (id) {
      fetchUser();
    }
  }, [user, id]);

  const fetchUser = async () => {
    try {
      const [userRes, rolesRes, statusesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/status')
      ]);
      
      setRoles(rolesRes.data);
      setStatuses(statusesRes.data);
      
      const users = userRes.data.data || userRes.data;
      const foundUser = users.find(u => u._id === id);
      if (foundUser) {
        setIsAgent(foundUser.isAgent || false);
        setFormData({
          name: foundUser.name,
          email: foundUser.email,
          mobile: foundUser.mobile || '',
          nationality: foundUser.nationality || '',
          role: foundUser.role?._id || foundUser.role,
          status: foundUser.status?._id || foundUser.status,
          companyName: foundUser.companyName || '',
          companyAddress: foundUser.companyAddress || {
            line1: '',
            line2: '',
            city: '',
            pin: '',
            state: '',
            country: ''
          },
          panCardNumber: foundUser.panCardNumber || '',
          gstNumber: foundUser.gstNumber || ''
        });
      }
    } catch (error) {
      toast.error('Failed to fetch user');
    } finally {
      setFetchLoading(false);
    }
  };

  const getRoleOptions = () => {
    const allowedRoles = {
      admin: ['admin', 'manager', 'employee', 'customer'],
      manager: ['employee', 'customer'],
      employee: ['customer']
    };
    const allowed = allowedRoles[user?.role] || [];
    return roles.filter(role => allowed.includes(role.name));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    if (!mobile) return true; // Optional field
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errors.email = 'Invalid email format';
        } else {
          delete errors.email;
        }
        break;
      case 'mobile':
        if (value && !validateMobile(value)) {
          errors.mobile = 'Please enter a valid 10-digit mobile number';
        } else {
          delete errors.mobile;
        }
        break;
      case 'panCardNumber':
        if (isAgent && value) {
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!panRegex.test(value)) {
            errors.panCardNumber = 'Invalid PAN format (ABCDE1234F)';
          } else {
            delete errors.panCardNumber;
          }
        } else {
          delete errors.panCardNumber;
        }
        break;
      case 'gstNumber':
        if (isAgent && value) {
          const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          if (!gstRegex.test(value)) {
            errors.gstNumber = 'Invalid GST format';
          } else {
            delete errors.gstNumber;
          }
        } else {
          delete errors.gstNumber;
        }
        break;
      case 'companyAddress.pin':
        if (isAgent && value) {
          const pinRegex = /^\d{6}$/;
          if (!pinRegex.test(value)) {
            errors['companyAddress.pin'] = 'PIN must be 6 digits';
          } else {
            delete errors['companyAddress.pin'];
          }
        } else {
          delete errors['companyAddress.pin'];
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  const viewFile = (filename, type) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/agents/${filename}`;
    setFileViewer({ show: true, url, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validateMobile(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'companyAddress') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (files.panCardPhoto) {
        formDataToSend.append('panCardPhoto', files.panCardPhoto);
      }
      if (files.gstFile) {
        formDataToSend.append('gstFile', files.gstFile);
      }

      await api.put(`/users/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('User updated successfully!');
      setTimeout(() => router.push(`/users/${id}`), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'panCardNumber') {
      processedValue = value.toUpperCase().slice(0, 10);
    } else if (name === 'gstNumber') {
      processedValue = value.toUpperCase().slice(0, 15);
    } else if (name === 'companyAddress.pin') {
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    }
    
    if (name.startsWith('companyAddress.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        companyAddress: {
          ...formData.companyAddress,
          [field]: processedValue
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: processedValue
      });
    }
    
    validateField(name, processedValue);
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles({
      ...files,
      [name]: fileList[0]
    });
  };

  if (fetchLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/users/${id}`)}
          icon="←"
        >
          Back to User
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">✏️ Edit User</h1>
          <p className="text-gray-600">Update user information</p>
        </div>
      </div>

      <Card title="Edit User Information" icon="✏️">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📱 Phone Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                  fieldErrors.mobile ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter 10-digit phone number"
                pattern="\d{10}"
                maxLength="10"
              />
              {fieldErrors.mobile && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.mobile}</p>
              )}
            </div>

            {!isAgent && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🌍 Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Enter nationality"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🛡️ Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                required
              >
                <option disabled value="">Select Role</option>
                {getRoleOptions().map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚡ Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                required
              >
                <option disabled value="">Select Status</option>
                {/* {statuses.map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                  </option>
                ))} */}
                {statuses.filter(status => status.category === "System").map(status => (
                  <option key={status._id} value={status._id}>
                    {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAgent && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">🏢 Agent Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏢 Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    placeholder="Enter company name"
                    required={isAgent}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🆔 PAN Card Number *
                  </label>
                  <input
                    type="text"
                    name="panCardNumber"
                    value={formData.panCardNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                      fieldErrors.panCardNumber ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="ABCDE1234F"
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    maxLength="10"
                    required={isAgent}
                  />
                  {fieldErrors.panCardNumber && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.panCardNumber}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📍 Company Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="companyAddress.line1"
                      value={formData.companyAddress.line1}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      placeholder="Address Line 1"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="companyAddress.line2"
                      value={formData.companyAddress.line2}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      placeholder="Address Line 2"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="companyAddress.city"
                      value={formData.companyAddress.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="companyAddress.pin"
                      value={formData.companyAddress.pin}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                        fieldErrors['companyAddress.pin'] ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="PIN Code"
                      pattern="\d{6}"
                      maxLength="6"
                    />
                    {fieldErrors['companyAddress.pin'] && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors['companyAddress.pin']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="companyAddress.state"
                      value={formData.companyAddress.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="companyAddress.country"
                      value={formData.companyAddress.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📄 PAN Card Photo
                  </label>
                  <input
                    type="file"
                    name="panCardPhoto"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📋 GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                      fieldErrors.gstNumber ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength="15"
                  />
                  {fieldErrors.gstNumber && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.gstNumber}</p>
                  )}
                </div>
              </div>

              {formData.gstNumber && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📄 GST Certificate
                  </label>
                  <input
                    type="file"
                    name="gstFile"
                    onChange={handleFileChange}
                    accept=".pdf,image/*"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {fileViewer.show && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Document Viewer</h3>
                  <button 
                    onClick={() => setFileViewer({ show: false, url: '', type: '' })}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
                  {fileViewer.type === 'pdf' || fileViewer.url.toLowerCase().includes('.pdf') ? (
                    <iframe 
                      src={`${fileViewer.url}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-[70vh] border-0"
                      title="Document Viewer"
                      allow="fullscreen"
                    />
                  ) : (
                    <img 
                      src={fileViewer.url} 
                      alt="Document"
                      className="w-full h-auto max-h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="submit" 
              disabled={loading}
              icon="💾"
              className="flex-1"
            >
              {loading ? 'Updating User...' : 'Update User'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/users/${id}`)}
              className="flex-1"
              icon="❌"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}