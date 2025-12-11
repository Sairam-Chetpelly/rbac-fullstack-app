import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Clock, DollarSign, FileText, ArrowLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

import api from '../../lib/api';

const CountryVisaTypes = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id: countryId } = router.query;
  const [country, setCountry] = useState(null);
  const [visaTypes, setVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (countryId) {
      fetchVisaTypes();
    }
  }, [countryId]);

  const fetchVisaTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch country details and visa types
      const [countryResponse, visaTypesResponse] = await Promise.all([
        api.get(`/public/countries/${countryId}`),
        api.get(`/public/countries/${countryId}/visa-types`)
      ]);

      setCountry(countryResponse.data);
      
      // Process visa types to show user-specific pricing
      const processedVisaTypes = visaTypesResponse.data.map(visaType => {
        const isAgent = user?.isAgent || false;
        console.log('User is agent:', isAgent);
        const displayAmount = isAgent ? visaType.agentDiscount : visaType.totalAmount;
        
        return {
          ...visaType,
          displayAmount,
          isAgentPrice: isAgent && visaType.agentDiscount
        };
      });
      
      setVisaTypes(processedVisaTypes);
    } catch (err) {
      console.error('Error fetching visa types:', err);
      setError('Failed to load visa types');
    } finally {
      setLoading(false);
    }
  };

  const handleVisaTypeSelect = (visaTypeId) => {
    router.push(`/visa-application/terms/${visaTypeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visa types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Visa Types</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              {/* <Button
                onClick={() => router.back()}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> */}
              <div className="flex items-center gap-3">
                {country?.placeImage ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' }/uploads/countries/${country.placeImage}`} 
                    alt={country?.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-4xl">🌍</span>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{country?.name} Visa Types</h1>
                  <p className="text-gray-600">Choose the visa type that best fits your travel purpose</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visa Types Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {visaTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Visa Types Available</h3>
              <p className="text-gray-600">No visa types are currently available for {country?.name}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visaTypes.map((visaType) => (
                <div
                  key={visaType._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200"
                  onClick={() => handleVisaTypeSelect(visaType._id)}
                >
                  <div className="p-6">
                    {/* Visa Type Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{visaType.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{visaType.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                    </div>

                    {/* Processing Time */}
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Processing: {visaType.processingTimeMin}-{visaType.processingTimeMax} days
                      </span>
                    </div>

                    {/* Pricing Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">
                          {visaType.isAgentPrice ? 'Agent Price:' : 'Total Amount:'}
                        </span>
                        <span className="font-bold text-lg text-green-600">₹{visaType.displayAmount}</span>
                      </div>
                      {visaType.isAgentPrice && (
                        <div className="text-xs text-orange-600 font-medium text-right">
                          🏢 Special Agent Pricing
                        </div>
                      )}
                    </div>

                    {/* Apply Button */}
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700">
                      Select This Visa Type
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default CountryVisaTypes;