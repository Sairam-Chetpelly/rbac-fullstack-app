import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Edit } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/Button';
import CustomerLayout from '../../components/CustomerLayout';

export default function CustomerProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'customer' && parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    setEditForm({ 
      firstName: parsedUser.name?.split(' ')[0] || '', 
      lastName: parsedUser.name?.split(' ')[1] || '', 
      email: parsedUser.email || '' 
    });
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/customer/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      await api.put('/customer/profile', {
        name: `${editForm.firstName} ${editForm.lastName}`
      });
      
      // Update localStorage
      const updatedUser = { ...user, name: `${editForm.firstName} ${editForm.lastName}` };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Profile update failed');
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                {user?.isAgent && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    🏢 Agent
                  </span>
                )}
              </div>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Role: {user?.role}</p>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input 
                type="text" 
                value={isEditing ? editForm.firstName : user?.name?.split(' ')[0] || ''}
                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input 
                type="text" 
                value={isEditing ? editForm.lastName : user?.name?.split(' ')[1] || ''}
                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input 
                type="text" 
                value={user?.role || ''} 
                disabled 
                className="w-full p-3 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
          
          {isEditing && (
            <div className="mt-4 flex gap-2">
              <Button className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600" onClick={handleEditProfile}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4">Account Statistics</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_applications || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.under_review || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}