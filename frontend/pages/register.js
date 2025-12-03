import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Link from 'next/link';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeTab, setActiveTab] = useState('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    nationality: ''
  });

  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errors = {};
    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!validateMobile(formData.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        nationality: formData.nationality || 'Not Specified'
      });

      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle field-wise errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.field) {
            backendErrors[err.field] = err.message;
          }
        });
        setFieldErrors(backendErrors);
      } else if (error.response?.data?.fieldErrors) {
        setFieldErrors(error.response.data.fieldErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        
        // Map generic error messages to specific fields
        const fieldErrorMap = {
          'User already exists with this email': 'email',
          'Email already exists': 'email',
          'Mobile number already exists': 'mobile',
          'Phone number already exists': 'mobile'
        };
        
        const fieldForError = fieldErrorMap[errorMessage];
        if (fieldForError) {
          setFieldErrors({ [fieldForError]: errorMessage });
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Illustration and Content - Hidden on mobile */}
      <div 
        className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{
          backgroundImage: "url('/registerbackground.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Logo - Centered */}
        <div className="mb-8">
          <img src="/optionslogo.png" alt="One World Visa" className="h-20 w-auto mx-auto" />
        </div>

        {/* Main Image */}
        <div className="mb-8">
          <img src="/register.png" alt="Register" className="max-w-full h-auto" />
        </div>

        {/* Text Content - Centered */}
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Professional & Trustworthy</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            "Trusted Visa Assistance for Global Travel Needs"
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
        {/* Mobile Logo - Only visible on mobile */}
        <div className="md:hidden mb-8 text-center">
          <img src="/optionslogo.png" alt="One World Visa" className="h-20 w-auto mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Trusted Visa Assistance for Global Travel Needs</p>
        </div>
        
        {/* Tab Header */}
        <div className="flex border-b w-full max-w-md mb-8">
          <button
            className={`flex-1 py-4 px-6 text-center ${
              activeTab === 'login' 
                ? 'bg-gray-100 text-gray-700 border-b-2 border-gray-300' 
                : 'text-gray-500'
            }`}
            onClick={() => router.push('/login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center ${
              activeTab === 'signup' 
                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="w-full max-w-md">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full p-4 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  fieldErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="10-digit Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className={`w-full p-4 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  fieldErrors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                pattern="\d{10}"
                maxLength="10"
                required
              />
              {fieldErrors.mobile && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.mobile}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-4 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="nationality"
                placeholder="Nationality (Optional)"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-4 pr-12 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re Enter Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-4 pr-12 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <Link href="/agent-register" className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                Want to become an agent? Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/919167447700" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500/80 backdrop-blur-sm border border-white/20 rounded-full shadow-lg hover:bg-green-600/80 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </a>
      </div>
    </div>
  );
}