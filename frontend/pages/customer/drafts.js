import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FileText, Edit, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/Button';
import CustomerLayout from '../../components/CustomerLayout';

export default function CustomerDrafts() {
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchDrafts();
  }, [router]);

  const fetchDrafts = async () => {
    try {
      const response = await api.get('/customer/applications');
      const draftApplications = response.data.filter(app => 
        app.status?.name === 'draft' || app.status === 'draft'
      );
      setDrafts(draftApplications);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      setDrafts([]);
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
        <h1 className="text-2xl font-bold text-gray-900">Draft Applications</h1>
        
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <div key={draft._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {draft.countryVisaType?.country?.name || 'Draft Application'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Application Number: {draft.applicationNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(draft.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const visaTypeId = typeof draft.countryVisaType === 'object' ? draft.countryVisaType._id : draft.countryVisaType;
                      router.push(`/visa-application/form/${visaTypeId}?draftId=${draft._id}`);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Continue
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {drafts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No draft applications</h3>
            <p className="text-gray-600 mb-4">Start a new visa application to see drafts here</p>
            <Link href="/">
              <Button>Start New Application</Button>
            </Link>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}