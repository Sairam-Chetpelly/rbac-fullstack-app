import React, { useState, useEffect } from 'react'
import { Globe, Shield, Users, Clock, MapPin, Plane, Star, Mail, Phone, ExternalLink, ChevronRight } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/router"
import Button from "../components/Button"
import VisaLayout from "../components/VisaLayout"

import { apiClient } from "../lib/api"
import { useAuth } from "../context/AuthContext"

const VisaFlowHomepage = () => {
  const router = useRouter()
  const { user } = useAuth()
  
  // Allow access to home page without authentication
  const isPublicPage = router.pathname === '/' || router.pathname === '/home'
  const [destinations, setDestinations] = useState([])
  const [continents, setContinents] = useState(['All'])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch both countries and continents in parallel
      const [countriesData, continentsData] = await Promise.all([
        apiClient.getCountries(),
        apiClient.getContinents()
      ])
      
      setDestinations(countriesData || [])
      setContinents(continentsData || ['All'])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
      setDestinations([])
      setContinents(['All'])
    } finally {
      setLoading(false)
    }
  }

  const availableContinents = continents.filter(continent => 
    continent === 'All' || destinations.some(dest => (dest.continent || dest.region) === continent)
  )

  const filteredDestinations = selectedRegion === 'All' 
    ? destinations 
    : destinations.filter(dest => (dest.continent || dest.region) === selectedRegion)

  const handleNewsletterSubmit = () => {
    if (!email) return
    console.log('Newsletter signup:', email)
    setEmail('')
    alert('Thank you for subscribing to our newsletter!')
  }



  return (
    <VisaLayout showBackButton={false} showHero={true}>

      {/* Destinations Section */}
      <section className="py-16 bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Region Filter Sidebar - Mobile Dropdown */}
            <div className="lg:hidden mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Select Continent</h3>
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-100"
              >
                {availableContinents.map((continent) => (
                  <option key={continent} value={continent}>
                    {continent} ({continent === 'All' 
                      ? destinations.length 
                      : destinations.filter(d => (d.continent || d.region) === continent).length})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Region Filter Sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="max-w-sm mx-auto sticky top-24 mt-6">
                <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
                  {availableContinents.map((continent, index) => (
                    <div key={continent}>
                      <div 
                        onClick={() => setSelectedRegion(continent)}
                        className="flex items-center justify-between px-6 py-5 hover:bg-white-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span 
                            className={`text-lg font-medium transition-colors ${
                              selectedRegion === continent 
                                ? 'text-orange-500' 
                                : 'text-gray-600 group-hover:text-orange-500'
                            }`}
                          >
                            {continent}
                          </span>
                          <div className="flex items-center">
                            <span className={`text-white-500 hover:bg-orange-500 font-medium mr-2 ${
                                selectedRegion === continent 
                                  ? 'text-orange-500' 
                                  : 'text-gray-400 group-hover:text-orange-500'
                              }`}>
                              {continent === 'All' 
                                ? destinations.length 
                                : destinations.filter(d => (d.continent || d.region) === continent).length}
                            </span>
                            <ChevronRight 
                              className={`w-5 h-8 transform transition duration-200 ease-out ${
                                selectedRegion === continent 
                                  ? 'text-orange-500' 
                                  : 'text-gray-400 group-hover:text-orange-500 group-hover:-rotate-45'
                              }`} 
                            />
                          </div>
                        </div>
                      </div>
                      {index < availableContinents.length - 1 && (
                        <div className="border-b-2 border-gray-300 mx-6"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Destinations Grid */}
            <div className="flex-1">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchData} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Retry
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDestinations.map((destination) => {
                    const processingTime = destination.processing_time_min && destination.processing_time_max 
                      ? `${destination.processing_time_min}-${destination.processing_time_max} days`
                      : destination.processingTimeMin && destination.processingTimeMax
                      ? `${destination.processingTimeMin}-${destination.processingTimeMax} days`
                      : '15-30 days'
                    
                    const hasVisaTypes = destination.visa_types && destination.visa_types.length > 0
                    // const isPopular = hasVisaTypes && destination.visa_types.some(vt => vt.fee && vt.fee < 100)
                    
                    return (
                      <div key={destination.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="relative">
                          {destination.placeImage ? (
                            <div className="relative w-full h-48 overflow-hidden">
                              <img 
                                src={destination.placeImage.startsWith('http') 
                                  ? destination.placeImage 
                                  : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/uploads/countries/${destination.placeImage}`
                                } 
                                alt={destination.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center text-center text-white" style={{display: 'none'}}>
                                <span className="text-4xl mb-2 block">🌍</span>
                                <h3 className="text-lg font-semibold">{destination.name}</h3>
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <div className="text-center text-white">
                                  {/* <h3 className="text-lg font-semibold">{destination.name}</h3> */}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <div className="text-center text-white">
                                <span className="text-4xl mb-2 block">🌍</span>
                                <h3 className="text-lg font-semibold">{destination.name}</h3>
                              </div>
                            </div>
                          )}
                          {/* {isPopular && (
                            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </div>
                          )} */}
                          {/* <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Visa Available
                          </div> */}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                          <p className="text-gray-600 mb-4 text-sm">
                            {(destination.continent || destination.region) ? `${destination.continent || destination.region} • ` : ''}Apply for various visa types online
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">
                              Processing: {processingTime}
                            </span>
                            {hasVisaTypes && (
                              <span className="text-sm font-semibold text-green-600">
                                From ₹{Math.min(...destination.visa_types.map(vt => vt.fee || 0))}
                              </span>
                            )}
                          </div>
                          {/* {hasVisaTypes && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-2">Available visa types:</p>
                              <div className="flex flex-wrap gap-1">
                                {destination.visa_types.slice(0, 3).map((type) => (
                                  <span key={type.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {type.name}
                                  </span>
                                ))}
                                {destination.visa_types.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    +{destination.visa_types.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )} */}
                          <Link href={`/visatypes/${destination.id}`}>
                            <Button className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600 transition-all text-sm font-semibold">
                              Apply Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {!loading && !error && filteredDestinations.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No destinations found</h3>
                  <p className="text-gray-600">Try selecting a different region to see available destinations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </VisaLayout>
  )
}

export default VisaFlowHomepage