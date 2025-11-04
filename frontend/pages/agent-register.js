import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Link from 'next/link';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function AgentRegister() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    nationality: '',
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
  const [files, setFiles] = useState({
    panCardPhoto: null,
    gstFile: null
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const validateMobile = (mobile) => {
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
      case 'password':
        if (value && value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      case 'panCardNumber':
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (value && !panRegex.test(value)) {
          errors.panCardNumber = 'Invalid PAN format (ABCDE1234F)';
        } else {
          delete errors.panCardNumber;
        }
        break;
      case 'gstNumber':
        if (value) {
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
        const pinRegex = /^\d{6}$/;
        if (value && !pinRegex.test(value)) {
          errors['companyAddress.pin'] = 'PIN must be 6 digits';
        } else {
          delete errors['companyAddress.pin'];
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (!validateMobile(formData.mobile)) {
      return 'Please enter a valid 10-digit mobile number';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.panCardNumber)) {
      return 'PAN card number must be in format: ABCDE1234F';
    }

    if (formData.gstNumber) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gstNumber)) {
        return 'GST number format is invalid';
      }
    }

    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(formData.companyAddress.pin)) {
      return 'PIN code must be exactly 6 digits';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('nationality', formData.nationality);
      formDataToSend.append('isAgent', 'true');
      
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('companyAddress', JSON.stringify(formData.companyAddress));
      formDataToSend.append('panCardNumber', formData.panCardNumber);
      formDataToSend.append('gstNumber', formData.gstNumber);
      
      if (files.panCardPhoto) {
        formDataToSend.append('panCardPhoto', files.panCardPhoto);
      }
      if (files.gstFile) {
        formDataToSend.append('gstFile', files.gstFile);
      }

      await api.post('/agents/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Agent registration successful! Please wait for admin approval.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'mobile') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'panCardNumber') {
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

  if (user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="text-center">
              <img src="/optionslogo.png" alt="One World Visa" className="h-16 w-auto mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white">Agent Registration</h1>
              <p className="text-blue-100 mt-2">Join our network of trusted visa agents</p>
            </div>
          </div>
          <div className="p-8">
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">📋</span> Registration Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div className="space-y-2">
                  <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>Valid PAN card (mandatory)</div>
                  <div className="flex items-center"><span className="text-green-500 mr-2">✓</span>Company registration details</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center"><span className="text-blue-500 mr-2">•</span>GST certificate (if applicable)</div>
                  <div className="flex items-center"><span className="text-orange-500 mr-2">⏳</span>Admin approval required</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">1</div>
                  <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        fieldErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      required
                    />
                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        fieldErrors.mobile ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="10-digit Mobile Number"
                      maxLength="10"
                      required
                    />
                    {fieldErrors.mobile && <p className="text-red-500 text-xs mt-1">{fieldErrors.mobile}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality *</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        fieldErrors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                        fieldErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      required
                    />
                    {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-3">2</div>
                  <h3 className="text-xl font-bold text-gray-800">Company Information</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        name="companyAddress.line1"
                        value={formData.companyAddress.line1}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
                      <input
                        type="text"
                        name="companyAddress.line2"
                        value={formData.companyAddress.line2}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="companyAddress.city"
                        value={formData.companyAddress.city}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code *</label>
                      <input
                        type="text"
                        name="companyAddress.pin"
                        value={formData.companyAddress.pin}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                          fieldErrors['companyAddress.pin'] ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="6-digit PIN code"
                        required
                      />
                      {fieldErrors['companyAddress.pin'] && <p className="text-red-500 text-xs mt-1">{fieldErrors['companyAddress.pin']}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        name="companyAddress.state"
                        value={formData.companyAddress.state}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                      <input
                        type="text"
                        name="companyAddress.country"
                        value={formData.companyAddress.country}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">3</div>
                  <h3 className="text-xl font-bold text-gray-800">Documents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">📄</span>
                      </div>
                      <h4 className="font-semibold text-gray-800">PAN Card Details</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Card Number *</label>
                        <input
                          type="text"
                          name="panCardNumber"
                          value={formData.panCardNumber}
                          onChange={handleChange}
                          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono ${
                            fieldErrors.panCardNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          placeholder="ABCDE1234F"
                          required
                        />
                        {fieldErrors.panCardNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.panCardNumber}</p>}
                        <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload PAN Card *</label>
                        <input
                          type="file"
                          name="panCardPhoto"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Clear photo/scan (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-all">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">🏢</span>
                      </div>
                      <h4 className="font-semibold text-gray-800">GST Certificate</h4>
                      <p className="text-xs text-gray-500">(Optional)</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber}
                          onChange={handleChange}
                          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono ${
                            fieldErrors.gstNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          placeholder="22AAAAA0000A1Z5"
                        />
                        {fieldErrors.gstNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.gstNumber}</p>}
                        <p className="text-xs text-gray-500 mt-1">Format: 22AAAAA0000A1Z5</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload GST Certificate</label>
                        <input
                          type="file"
                          name="gstFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">PDF or image (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  disabled={loading || Object.keys(fieldErrors).length > 0}
                  className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Application...
                    </span>
                  ) : (
                    "🚀 Register as Agent"
                  )}
                </Button>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">✓</div>
                  <h4 className="font-bold text-green-800">What happens next?</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center text-green-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Admin team reviews your application
                    </div>
                    <div className="flex items-center text-blue-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Email/SMS notifications sent
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-purple-700">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Access granted upon approval
                    </div>
                    <div className="flex items-center text-orange-700">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Support: +91 99201 98788
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-orange-600 hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}