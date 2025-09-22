import React from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Download, Home } from 'lucide-react';
import Button from '../components/Button';
import VisaLayout from '../components/VisaLayout';

const ApplicationSuccess = () => {
  const router = useRouter();
  const { applicationNumber } = router.query;

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600">
              Your visa application has been submitted and payment processed.
            </p>
          </div>

          {applicationNumber && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Application Number</p>
              <p className="text-lg font-bold text-gray-900">{applicationNumber}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/customer/dashboard')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>You will receive email updates about your application status.</p>
          </div>
        </div>
      </div>
  );
};

export default ApplicationSuccess;