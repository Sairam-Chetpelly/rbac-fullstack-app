import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { User, Edit } from 'lucide-react';
import api from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    nationality: ''
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
    mobile: '',
    nationality: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserProfile();
  }, [user, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const userData = response.data.user || response.data;
      const profileData = {
        name: userData.name || user.name || '',
        email: userData.email || user.email || '',
        mobile: userData.mobile || '',
        nationality: userData.nationality || ''
      };
      setFormData(profileData);
      setOriginalData(profileData);
    } catch (error) {
      const profileData = {
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        nationality: user.nationality || ''
      };
      setFormData(profileData);
      setOriginalData(profileData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', formData);
      
      if (response.status === 200) {
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          nationality: formData.nationality
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update original data to reflect changes
        setOriginalData(formData);
        
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
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

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const getRedirectPath = () => {
    if (user?.role === 'customer') return '/customer/dashboard';
    return '/dashboard';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push(getRedirectPath())}
          icon="←"
        >
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user.role === 'admin' ? '🛡️ Admin Profile' : '👤 My Profile'}
          </h1>
          <p className="text-gray-600">
            {user.role === 'admin' ? 'Manage your administrator account' : 'Manage your account information'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card title="Profile Information" icon="👤">
          <div className="flex items-center gap-6 mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${
              user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
              user.role === 'manager' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
              user.role === 'employee' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              'bg-gradient-to-r from-purple-500 to-violet-600'
            }`}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600 text-lg">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  user.role === 'employee' ? 'bg-green-100 text-green-800 border-green-200' :
                  'bg-purple-100 text-purple-800 border-purple-200'
                }`}>
                  {user.role === 'admin' ? '🛡️ ADMINISTRATOR' :
                   user.role === 'manager' ? '👔 MANAGER' :
                   user.role === 'employee' ? '👨💼 EMPLOYEE' :
                   '👤 CUSTOMER'}
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ACTIVE
                </span>
              </div>
            </div>
            <Button 
              variant={isEditing ? "danger" : "primary"}
              onClick={() => {
                if (isEditing) {
                  handleCancel();
                } else {
                  setIsEditing(true);
                }
              }}
              icon={isEditing ? "❌" : "✏️"}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>

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
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    user.role === 'admin' ? 'focus:ring-red-500/20 focus:border-red-400' : 'focus:ring-blue-500/20 focus:border-blue-400'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  placeholder="Enter your full name"
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
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    user.role === 'admin' ? 'focus:ring-red-500/20 focus:border-red-400' : 'focus:ring-blue-500/20 focus:border-blue-400'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  placeholder="Enter your email address"
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
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    user.role === 'admin' ? 'focus:ring-red-500/20 focus:border-red-400' : 'focus:ring-blue-500/20 focus:border-blue-400'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🌍 Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    user.role === 'admin' ? 'focus:ring-red-500/20 focus:border-red-400' : 'focus:ring-blue-500/20 focus:border-blue-400'
                  } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  placeholder="Enter your nationality"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <Button 
                  type="submit" 
                  disabled={loading}
                  icon="💾"
                  className="flex-1"
                >
                  {loading ? 'Updating Profile...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1"
                  icon="❌"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}