import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, User, FileText, CreditCard, Bell, HelpCircle, List, LogOut, Edit, ChevronRight, Upload, X, Clock, CheckCircle, AlertCircle, Plus, Menu } from 'lucide-react';
import api from '../lib/api';
import Button from '../components/Button';
import Card from '../components/Card';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'account', label: 'My Account', icon: User },
    { id: 'status', label: 'My Application Status', icon: FileText },
    { id: 'payment', label: 'My Payment History', icon: CreditCard },
    { id: 'draft', label: 'My Draft list', icon: List },
    { id: 'notification', label: 'Notification', icon: Bell },
    { id: 'faq', label: "FAQ's", icon: HelpCircle },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'customer') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchData();
    setEditForm({ firstName: parsedUser.name?.split(' ')[0] || '', lastName: parsedUser.name?.split(' ')[1] || '', email: parsedUser.email || '' });
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsResponse, paymentsResponse] = await Promise.all([
        api.get('/customer/applications'),
        api.get('/customer/payments')
      ]);
      setApplications(appsResponse.data || []);
      setPayments(paymentsResponse.data || []);
      setStats({
        total_applications: appsResponse.data?.length || 0,
        approved: appsResponse.data?.filter(app => app.status?.name?.toLowerCase().includes('approved')).length || 0,
        under_review: appsResponse.data?.filter(app => app.status?.name?.toLowerCase().includes('review')).length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleEditProfile = async () => {
    try {
      await api.put('/customer/profile', {
        name: `${editForm.firstName} ${editForm.lastName}`
      });
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Profile update failed');
    }
  };

  const getStatusIcon = (status) => {
    const statusName = status?.name?.toLowerCase() || '';
    if (statusName.includes('approved')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (statusName.includes('review')) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else if (statusName.includes('rejected')) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status?.color) return 'bg-gray-100 text-gray-800';
    
    const colorMap = {
      '#gray': 'bg-gray-100 text-gray-800',
      '#blue': 'bg-blue-100 text-blue-800',
      '#yellow': 'bg-yellow-100 text-yellow-800',
      '#green': 'bg-green-100 text-green-800',
      '#red': 'bg-red-100 text-red-800',
      '#purple': 'bg-purple-100 text-purple-800',
      '#indigo': 'bg-indigo-100 text-indigo-800',
      '#pink': 'bg-pink-100 text-pink-800'
    };
    
    return colorMap[status.color] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status?.name || 'Unknown';
  };

  const getProgressValue = (status) => {
    const statusName = status?.name?.toLowerCase() || '';
    if (statusName.includes('draft')) {
      return 25;
    } else if (statusName.includes('submitted')) {
      return 50;
    } else if (statusName.includes('review')) {
      return 75;
    } else if (statusName.includes('approved')) {
      return 100;
    } else if (statusName.includes('rejected')) {
      return 50;
    } else {
      return 0;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 p-6 rounded-lg text-white relative">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-14 h-14 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                  <p className="text-white text-opacity-90">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('account')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Account</h3>
                    <p className="text-gray-600 text-sm">Manage your Account</p>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('status')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Application Status</h3>
                    <p className="text-gray-600 text-sm">Track your applications</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('notification')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Notification</h3>
                    <p className="text-gray-600 text-sm">View notifications</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('payment')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Payment History</h3>
                    <p className="text-gray-600 text-sm">View payment history</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('faq')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">FAQ's</h3>
                    <p className="text-gray-600 text-sm">Find quick answers</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg cursor-pointer" onClick={() => setActiveSection('draft')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <List className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">My Draft List</h3>
                    <p className="text-gray-600 text-sm">Continue draft applications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Account</h2>
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
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
                  <Button variant="primary" onClick={handleEditProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
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
        );

      case 'status':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Application Status</h2>
              <Link href="/visa-application-demo">
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(app.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{app.applicationNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.countryVisaType?.country?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {formatStatus(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getProgressValue(app.status)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{getProgressValue(app.status)}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {applications.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Start your visa application process today</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {payment.transactionId?.slice(-8) || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.application?.applicationNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline" size="sm">Download</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <div className="p-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-600">Your payment receipts will appear here</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'draft':
        const draftApplications = applications.filter(app => app.status?.name?.toLowerCase().includes('draft'));
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Draft List</h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draft ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Edited</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {draftApplications.map((app, index) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.applicationNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.countryVisaType?.country?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(app.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {formatStatus(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button size="sm" variant="secondary">
                          Continue
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {draftApplications.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No draft applications</h3>
                  <p className="text-gray-600">Start a new application to see drafts here</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'faq':
      case 'help':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{activeSection === 'help' ? 'Help Center' : "FAQ's"}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. How do I apply for a visa?</h3>
                <p className="text-gray-700 mb-2">To apply for a visa:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Go to the "Apply Visa" page.</li>
                  <li>Select your visa type (Tourist, Business, Student, etc.).</li>
                  <li>Fill in your personal and travel details.</li>
                  <li>Upload required documents.</li>
                  <li>Pay the application fee.</li>
                  <li>Track your status on the "Tracking" page.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2. What documents are required?</h3>
                <p className="text-gray-700 mb-2">Commonly required documents:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Valid Passport (minimum 6 months validity)</li>
                  <li>Passport-sized Photo</li>
                  <li>Visa Application Form</li>
                  <li>Proof of Travel (flight tickets, itinerary)</li>
                  <li>Accommodation Details</li>
                  <li>Supporting documents (bank statement, ID proof, etc.)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. How long does it take to process my visa?</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Tourist Visa: 3–7 business days</li>
                  <li>Business Visa: 5–10 business days</li>
                  <li>Express Service (if available): 24–48 hours</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-b' : 'bg-white/60 backdrop-blur-sm shadow-sm border-b'
      }`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <button 
                onClick={() => router.push('/')}
                className="hover:opacity-80 transition-opacity"
              >
                <h1 className="text-xl font-bold text-gray-900">Visa Dashboard</h1>
              </button>
            </div>
            <button 
              onClick={() => setActiveSection('account')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm shadow-md"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          <Menu className="w-4 h-4" />
          Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {showMobileMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
          )}
          
          <div className={`${
            showMobileMenu ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'
          } lg:block lg:relative lg:w-80 bg-white rounded-lg shadow-sm border p-6`}>
            <div className="flex justify-between items-center mb-6 lg:block">
              <h2 className="text-xl font-semibold">My Profile</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}