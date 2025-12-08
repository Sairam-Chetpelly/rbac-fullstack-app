import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User, FileText, CreditCard, Bell, HelpCircle, List } from 'lucide-react';
import api from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
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
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/customer/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/customer/profile">
            <div className="bg-blue-50 p-6 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
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
          </Link>

          <Link href="/customer/applications">
            <div className="bg-pink-50 p-6 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Applications</h3>
                  <p className="text-gray-600 text-sm">Track your applications</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/customer/payments">
            <div className="bg-purple-50 p-6 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Payment History</h3>
                  <p className="text-gray-600 text-sm">View payment history</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/customer/help">
            <div className="bg-green-50 p-6 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Help Center</h3>
                  <p className="text-gray-600 text-sm">Get help and support</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/customer/drafts">
            <div className="bg-yellow-50 p-6 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <List className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Draft Applications</h3>
                  <p className="text-gray-600 text-sm">Continue draft applications</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/customer/change-password">
            <div className="bg-red-50 p-6 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">🔐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Change Password</h3>
                  <p className="text-gray-600 text-sm">Update your password</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalApplications || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Draft Applications</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.draftApplications || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Submitted</p>
            <p className="text-2xl font-bold text-green-600">{stats.submittedApplications || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold text-purple-600">₹{stats.totalPayments || 0}</p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}