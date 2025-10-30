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
  const [activeTab, setActiveTab] = useState('signup');
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
    setLoading(true);
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validateMobile(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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

      toast.success('Registration successful! Please login to continue.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (user) {
    return <div>Redirecting...</div>;
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
          <img src="/optionslogo.png" alt="One World Visa" className="h-16 w-auto mx-auto" />
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
          <img src="/optionslogo.png" alt="One World Visa" className="h-12 w-auto mx-auto" />
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
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="10-digit Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                pattern="\d{10}"
                maxLength="10"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
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
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re Enter Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-lg"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </div>
      </div>
      
      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/919920198788" 
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