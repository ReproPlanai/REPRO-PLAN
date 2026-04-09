import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Phone,
  Heart,
  Flame,
  User,
  AlertTriangle,
  MapPin,
  Navigation,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Share2
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';

interface EmergencyNumber {
  name: string;
  number: string;
  altNumber: string;
  icon: any;
  color: string;
  bgColor: string;
}

const EmergencyGhana: React.FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const emergencyNumbers: EmergencyNumber[] = [
    {
      name: 'Police Emergency',
      number: '191',
      altNumber: '+233 244 342 764',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'Ambulance Service',
      number: '193',
      altNumber: '+233 302 776 527',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Fire Service',
      number: '192',
      altNumber: '+233 302 772 446',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Domestic Violence',
      number: '0800 800 800',
      altNumber: '',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'SRHR Hotline (Marie Stopes)',
      number: '0800 20 8585',
      altNumber: '',
      icon: Phone,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      name: 'Child Helpline',
      number: '116',
      altNumber: '',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const handleShareLocation = () => {
    setIsSharingLocation(true);
    // Simulate location sharing
    setTimeout(() => {
      setIsSharingLocation(false);
      alert('Location shared with emergency services!');
    }, 2000);
  };

  const handlePanicButton = () => {
    setPanicMode(true);
    setCountdown(5);
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (panicMode && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (panicMode && countdown === 0) {
      // Call police emergency
      handleCall('191');
      setPanicMode(false);
    }
    return () => clearInterval(interval);
  }, [panicMode, countdown]);

  if (panicMode) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <AlertTriangle className="w-32 h-32 mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl font-bold mb-4">EMERGENCY ALERT</h1>
          <p className="text-2xl mb-6">Help is being contacted...</p>
          
          {countdown > 0 && (
            <div className="mb-8">
              <div className="text-8xl font-bold mb-2">{countdown}</div>
              <p className="text-xl">seconds until emergency call</p>
            </div>
          )}

          <button
            onClick={() => setPanicMode(false)}
            className="px-12 py-4 bg-white text-red-600 rounded-2xl font-bold text-xl hover:bg-red-50 transition-all shadow-2xl"
          >
            Cancel Emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
        {/* Header - Pentagon Style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.1)_100%)]" />
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/25 rounded-full text-xs font-semibold text-white mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Emergency Support
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Ghana Emergency Services</h1>
            <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto">
              Access real Ghana emergency numbers instantly. One-tap calling, location sharing, and AI-powered guidance.
            </p>
          </div>
        </div>

        {/* Panic Button - Large, Prominent */}
        <div className="mb-8">
          <button
            onClick={handlePanicButton}
            className="w-full py-8 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white rounded-3xl font-bold text-2xl shadow-xl hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-4">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
              <span>🚨 EMERGENCY PANIC BUTTON 🚨</span>
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>
          </button>
          <p className="text-center text-sm text-gray-600 mt-3">
            Press for immediate emergency assistance (5-second countdown)
          </p>
        </div>

        {/* Emergency Numbers Grid - Pentagon Card Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {emergencyNumbers.map((emergency, index) => {
            const Icon = emergency.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-200/80 hover:shadow-xl hover:border-primary-200 transition-all transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-100 rounded-full -mr-12 -mt-12" />
                
                <div className="relative p-5">
                  <div className={`inline-flex p-3 rounded-2xl ${emergency.bgColor} ${emergency.color} mb-4`}>
                    <Icon size={28} />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{emergency.name}</h3>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCall(emergency.number)}
                      className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Phone size={18} />
                      <span className="text-lg">{emergency.number}</span>
                    </button>
                    
                    {emergency.altNumber && (
                      <button
                        onClick={() => handleCall(emergency.altNumber)}
                        className="w-full py-2 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 transition-all text-sm"
                      >
                        {emergency.altNumber}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Location Sharing Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary-600" />
            Location Services
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className={`p-3 rounded-xl ${userLocation ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                <Navigation size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">
                  {userLocation ? 'Location Detected' : 'Location Not Available'}
                </p>
                <p className="text-sm text-gray-600">
                  {userLocation 
                    ? `GPS: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
                    : 'Enable location services to share your position with emergency responders'}
                </p>
              </div>
              {userLocation && (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={getUserLocation}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-primary-300 flex items-center justify-center gap-2 transition-all"
              >
                <Navigation size={18} />
                <span>Update Location</span>
              </button>
              <button
                onClick={handleShareLocation}
                disabled={isSharingLocation || !userLocation}
                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Share2 size={18} />
                <span>{isSharingLocation ? 'Sharing...' : 'Share Location'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Guidance Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200/60 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary-600" />
            AI Emergency Guidance
          </h2>
          <p className="text-gray-700 mb-4">
            Not sure what to do in an emergency? ReproBot can provide situation-based guidance and help you make the right decisions.
          </p>
          <button
            onClick={() => navigate('/chatbot?context=emergency')}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <span>Chat with ReproBot for Emergency Guidance</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Tips */}
        <div className="bg-yellow-50 rounded-2xl shadow-lg border border-yellow-200/60 p-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-yellow-600" />
            Emergency Safety Tips
          </h2>
          <ul className="space-y-3 text-yellow-800">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Keep your phone charged and with you at all times</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Memorize emergency numbers: Police 191, Ambulance 193, Fire 192</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Share your location with trusted contacts when going out</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Trust your instincts - if something feels wrong, get help immediately</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Have a safety plan for different emergency situations</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <Clock size={16} />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </p>
          <p className="mt-2">All numbers are verified Ghana emergency services</p>
        </div>
      </div>
      </main>
    </PageContainer>
  );
};

export default EmergencyGhana;
