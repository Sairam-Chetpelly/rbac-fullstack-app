import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../../components/Button';
import PublicLayout from '../../../components/PublicLayout';
import api from '../../../lib/api';

const VisaTermsAndConditions = () => {
  const router = useRouter();
  const { visaTypeId } = router.query;
  const [visaType, setVisaType] = useState(null);
  const [country, setCountry] = useState(null);
  const [termsConditions, setTermsConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (visaTypeId) {
      fetchTermsAndConditions();
    }
  }, [visaTypeId]);

  const fetchTermsAndConditions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch visa type details and terms & conditions
      const [visaTypeResponse, termsResponse] = await Promise.all([
        api.get(`/public/visa-types/${visaTypeId}`),
        api.get(`/public/visa-types/${visaTypeId}/terms-conditions`)
      ]);

      setVisaType(visaTypeResponse.data.visaType);
      setCountry(visaTypeResponse.data.country);
      setTermsConditions(termsResponse.data);
    } catch (err) {
      console.error('Error fetching terms and conditions:', err);
      setError('Failed to load terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!agreed) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }
    router.push(`/visa-application/form/${visaTypeId}`);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading terms and conditions...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Terms</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
                  <p className="text-gray-600">
                    {visaType?.name} - {country?.name} {country?.flagEmoji}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Visa Type Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{country?.flagEmoji || '🌍'}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{visaType?.name}</h2>
                <p className="text-gray-600">{country?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">${visaType?.vfsAmount}</div>
                <div className="text-sm text-gray-600">VFS Fee</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">${visaType?.consulateAmount}</div>
                <div className="text-sm text-gray-600">Consulate Fee</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">${visaType?.serviceAmount}</div>
                <div className="text-sm text-gray-600">Service Fee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">${visaType?.totalAmount}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-900">Important Terms & Conditions</h3>
            </div>

            {termsConditions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No specific terms and conditions available for this visa type.</p>
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">General Terms Apply</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• All information provided must be accurate and complete</li>
                    <li>• Processing times may vary based on individual circumstances</li>
                    <li>• Visa approval is subject to consulate discretion</li>
                    <li>• Fees are non-refundable once application is submitted</li>
                    <li>• Additional documents may be requested during processing</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {termsConditions.map((term, index) => (
                  <div key={term._id || index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        term.type === 'visa-specific' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {term.type === 'visa-specific' ? 'Visa Specific' : 'Country General'}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">{term.title}</h4>
                    <div 
                      className="text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: term.content }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agreement Checkbox */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms-agreement" className="text-gray-700 cursor-pointer">
                <span className="font-semibold">I agree to the terms and conditions</span>
                <p className="text-sm text-gray-600 mt-1">
                  By checking this box, I acknowledge that I have read, understood, and agree to comply with all the terms and conditions stated above for the {visaType?.name} application.
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={handleProceed}
              disabled={!agreed}
              className={`flex-1 ${
                agreed 
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Proceed to Application
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default VisaTermsAndConditions;