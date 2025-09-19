import React from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Home, FileText, Mail } from 'lucide-react';
import Button from '../components/Button';
import PublicLayout from '../components/PublicLayout';

const ApplicationSuccess = () => {
  const router = useRouter();

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
              <p className="text-gray-600">
                Your visa application has been successfully submitted and is now being processed.
              </p>
            </div>

            {/* Application Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Application ID:</span>
                <span className="font-semibold text-gray-900">#VA{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                  Under Review
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Submitted:</span>
                <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-left mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Document Review:</strong> Our team will review your submitted documents within 24-48 hours.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Processing:</strong> Your application will be forwarded to the relevant consulate for processing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Updates:</strong> You'll receive email notifications about your application status.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Need Help?</span>
              </div>
              <p className="text-sm text-blue-700">
                Contact our support team at <strong>support@visaflow.com</strong> or call <strong>+91 92261 66606</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() => router.push('/track-application')}
                variant="outline"
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Track Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ApplicationSuccess;