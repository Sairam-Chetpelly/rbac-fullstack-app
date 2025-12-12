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
  const destinationsRef = React.useRef(null)
  
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

  // Scroll to destinations section when region changes
  useEffect(() => {
    if (selectedRegion !== 'All' && destinationsRef.current) {
      destinationsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedRegion])

  const handleNewsletterSubmit = () => {
    if (!email) return
    console.log('Newsletter signup:', email)
    setEmail('')
    alert('Thank you for subscribing to our newsletter!')
  }



  return (
    <VisaLayout showBackButton={false} showHero={true}>

      {/* Destinations Section */}
      <section ref={destinationsRef} className="py-16 bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Visa Destinations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose from our wide range of visa services for countries worldwide</p>
          </div>
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
              <div className="max-w-sm mx-auto sticky top-24">
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
                                  : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000' || process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/countries/${destination.placeImage}`
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
                            <Button variant="primary" className="w-full text-sm font-semibold">
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

      {/* Passport Application Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-orange-500/5"></div>
            <div className="relative px-8 py-16 sm:px-16">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-orange-100 rounded-full text-sm font-medium text-blue-800 mb-6">
                    🛂 Passport Services
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Need a New
                    <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent block">
                      Passport?
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Start your passport application journey with us. Fill out our simple form and we'll guide you through every step of the process.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdCPVPGV-uO209XWRyjYkJ36kLX08pN9POhba_PEnhcqDQVMw/viewform?usp=sf_link', '_blank')}
                      className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                    >
                      Apply for Passport
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => window.open('https://wa.me/919167447700', '_blank')}
                      className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Phone className="w-5 h-5" />
                      Get Help
                    </button>
                  </div>
                </div>
                
                {/* Right Visual */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-80 h-80 bg-gradient-to-br from-blue-500 to-orange-500 rounded-3xl flex items-center justify-center transform rotate-3 shadow-2xl">
                      <div className="w-72 h-72 bg-white rounded-2xl flex flex-col items-center justify-center p-8 transform -rotate-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick & Easy</h3>
                        <p className="text-gray-600 text-center text-sm leading-relaxed">
                          Simple online form
                          <br />Professional guidance
                          <br />Fast processing
                        </p>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30 animate-pulse delay-1000"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </VisaLayout>
  )
}

export default VisaFlowHomepage