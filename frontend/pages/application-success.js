import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircle, Download, Home } from 'lucide-react';
import Button from '../components/Button';
import PublicLayout from '../components/PublicLayout';

export default function ApplicationSuccess() {
  const router = useRouter();
  const { applicationNumber } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationNumber) {
      setLoading(false);
    }
  }, [applicationNumber]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600">
              Your visa application has been submitted and payment has been processed.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Application Number</p>
            <p className="text-lg font-mono font-bold text-blue-600">
              {applicationNumber}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">Submitted</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment:</span>
              <span className="text-green-600 font-semibold">Completed</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p>
              You will receive an email confirmation shortly. 
              Please save your application number for future reference.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}