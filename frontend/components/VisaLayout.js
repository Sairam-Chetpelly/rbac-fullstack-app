import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Mail, Phone, MapPin, Plane, Clock, Globe } from 'lucide-react';
import Button from './Button';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const VisaLayout = ({ children, showBackButton = true, showHero = false }) => {
  const router = useRouter();
  const { user } = useAuth();
  const isHomePage = router.pathname === '/' || router.pathname === '/home';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      switch (user.role) {
        case "customer":
          router.push("/customer/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md sticky top-0 z-50" style={{ boxShadow: "0 2px 2px 2px rgba(255, 255, 255, 0.3)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-2">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {isHomePage && (
                  <img src="/optionslogo.png" alt="One World Visa Logo" className={`transition-all duration-300 ${scrolled ? 'h-12' : 'h-20'}`} />
              )}
            </div>

            {/* Center spacer/logo */}
            <div className="flex-1 flex justify-center">
              {!isHomePage && (
                <Link href="/" className="flex items-center">
                  <img src="/optionslogo.png" alt="One World Visa Logo" className={`transition-all duration-300 ${scrolled ? 'h-12' : 'h-20'}`} />
                </Link>    
                          )}
            </div>

            {/* Right section */}
            <div className="flex items-center">
              <Button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                {user ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {showHero && (
        <section className="relative pt-20 -mt-28 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Badge */}
              {/* <div className="inline-block">
                <span className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                  🌍 Trusted by 10,000+ Travelers
                </span>
              </div> */}
              
              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
                Your Journey to the{' '}
                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  World Starts Here
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Expert visa assistance, seamless processing, and 24/7 support for your global adventures.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  {user ? 'Go to Dashboard' : 'Start Your Journey'}
                </button>
                <button
                  onClick={() => window.open('https://wa.me/919167447700', '_blank')}
                  className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Phone className="h-5 w-5" />
                  Contact Us
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">More Countries</h3>
                  <p className="text-sm text-gray-600">Visa-free countries</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">24/7 Support MSG</h3>
                  <p className="text-sm text-gray-600">Always available</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Phone   className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Embassy</h3>
                  <p className="text-sm text-gray-600">contact info</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Plane className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Fast Processing</h3>
                  <p className="text-sm text-gray-600">Travel insurance recommendations</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Expert Guidance</h3>
                  <p className="text-sm text-gray-600">End-to-end visa services available</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}



      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white text-black py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/optionslogo.png" alt="One World Visa Logo" className="h-20" />
              </div>
              <p className="text-black-400 mb-4 text-sm sm:text-base">
                Travel helps companies manage payments easily.
              </p>
              <p className="text-black-400 text-xs sm:text-sm">
                Visa Application
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-black-400 text-sm">
                <li><a href="#" className="hover:text-blue-600">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600">Travel</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                <li><a href="#" className="hover:text-blue-600">Apply</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Services</h4>
              <ul className="space-y-1 sm:space-y-2 text-black-400 text-sm">
                <li>Tourist Visa</li>
                <li>Business Visa</li>
                <li>Student Visa</li>
                <li>Work Visa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-black-400 text-sm">
                <li className="flex items-center">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  visas@oneworldvisa.in
                </li>
                <li className="flex items-center">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  +91 9167447700
                </li>
                <li>
                  Mon-Sat 10:00 AM - 7:00 PM IST
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-black-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-black-400 text-sm">
            <p>&copy; 2025 One World Visa. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/919167447700"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg hover:bg-green-600/80 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default VisaLayout;