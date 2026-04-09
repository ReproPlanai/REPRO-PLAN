import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  AlertCircle,
  Search,
  Heart,
  Users,
  Home,
  Building,
  MapPin,
  Sparkles,
  ArrowRight,
  Navigation,
  RefreshCw
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import UnifiedVerificationForm from '../components/Auth/UnifiedVerificationForm';

import { apiService } from '../services/api';

interface SafeHouse {
  id: string;
  name: string;
  type: 'safe-house' | 'clinic' | 'support-center' | 'emergency-shelter';
  address: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance: number;
  rating: number;
  isOpen: boolean;
  capacity: number;
  currentOccupancy: number;
  securityLevel: 'high' | 'medium' | 'low';
  features: string[];
  contactPhone: string;
  emergencyContact: string;
  operatingHours: string;
  requiresOTP: boolean;
  otpExpiry: number; // minutes
}

interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  type: 'start' | 'turn' | 'straight' | 'destination';
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface OTPVerification {
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

const SecureMap: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSafeHouse, setSelectedSafeHouse] = useState<SafeHouse | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [secureCode, setSecureCode] = useState('');
  const [otpVerification, setOtpVerification] = useState<OTPVerification | null>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [safeHouses, setSafeHouses] = useState<SafeHouse[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch safe houses from API (admin-configured)
  const fetchSafeHouses = async () => {
    setLoading(true);
    try {
      // Try to get Ghana clinics from backend first
      const ghanaResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/clinics/ghana`);
      if (ghanaResponse.ok) {
        const data = await ghanaResponse.json();
        if (data.success && data.clinics) {
          const transformed: SafeHouse[] = data.clinics.map((clinic: any) => ({
            id: clinic.id,
            name: clinic.name,
            type: mapClinicTypeToSafeHouse(clinic.type),
            address: clinic.address,
            description: `${clinic.name} - ${clinic.services?.join(', ')}`,
            coordinates: clinic.coordinates || { lat: 5.6037, lng: -0.1870 },
            distance: calculateDistanceFromUser(clinic.coordinates),
            rating: 4.5,
            isOpen: true,
            capacity: clinic.type === 'hospital' ? 50 : 20,
            currentOccupancy: Math.floor(Math.random() * 10),
            securityLevel: 'high',
            features: clinic.services || [],
            contactPhone: clinic.phone || '+233-XXX-XXX-XXXX',
            emergencyContact: clinic.phone || '+233-XXX-XXX-XXXX',
            operatingHours: clinic.operatingHours || 'Contact for hours',
            requiresOTP: false,
            otpExpiry: 30,
            organization: clinic.organization,
            region: clinic.region,
            youthFriendly: clinic.youthFriendly
          }));
          setSafeHouses(transformed);
          return;
        }
      }
      
      // Fallback to original API
      const response = await apiService.getClinics?.() as { success?: boolean; clinics?: any[] };
      
      if (response?.success && response.clinics) {
        const transformed: SafeHouse[] = response.clinics.map((clinic: any) => ({
          id: clinic.id,
          name: clinic.name,
          type: mapClinicTypeToSafeHouse(clinic.type),
          address: clinic.address,
          description: `${clinic.name} - ${clinic.services?.join(', ')}`,
          coordinates: clinic.coordinates || { lat: 5.6037, lng: -0.1870 },
          distance: calculateDistanceFromUser(clinic.coordinates),
          rating: clinic.rating || 4.5,
          isOpen: true,
          capacity: clinic.capacity || 20,
          currentOccupancy: clinic.currentOccupancy || Math.floor(Math.random() * 10),
          securityLevel: clinic.securityLevel || 'high',
          features: clinic.services || [],
          contactPhone: clinic.phone || '+233-XXX-XXX-XXXX',
          emergencyContact: clinic.emergencyPhone || '+233-XXX-XXX-XXXX',
          operatingHours: clinic.hours || 'Contact for hours',
          requiresOTP: true,
          otpExpiry: 30
        }));
        setSafeHouses(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch safe houses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map clinic types to safe house types
  const mapClinicTypeToSafeHouse = (type: string): SafeHouse['type'] => {
    const typeMap: Record<string, SafeHouse['type']> = {
      'clinic': 'clinic',
      'hospital': 'clinic',
      'counseling': 'support-center',
      'crisis': 'emergency-shelter',
      'shelter': 'safe-house'
    };
    return typeMap[type] || 'support-center';
  };

  // Calculate distance from user
  const calculateDistanceFromUser = (coordinates: { lat: number; lng: number } | undefined): number => {
    if (!coordinates || !userLocation) return 0;
    const latDiff = coordinates.lat - (userLocation?.lat || 5.6037);
    const lngDiff = coordinates.lng - (userLocation?.lng || -0.1870);
    return Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 10) / 10;
  };

  useEffect(() => {
    fetchSafeHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Set Mapbox access token from environment variable only
    // Never hardcode API keys - security risk
    if (!process.env.REACT_APP_MAPBOX_ACCESS_KEY) {
      console.error('Mapbox access token not configured. Set REACT_APP_MAPBOX_ACCESS_KEY in environment.');
      return;
    }
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_KEY;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.1870, 5.6037], // Accra, Ghana
      zoom: 12,
    });

    mapRef.current = map;

    // Add markers for clinics when they're loaded
    if (safeHouses.length > 0) {
      safeHouses.forEach(clinic => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%236366f1\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\'/%3E%3C/svg%3E")';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';

        new mapboxgl.Marker(el)
          .setLngLat([clinic.coordinates.lng, clinic.coordinates.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3 style="margin:0 0 5px 0;font-size:14px;">${clinic.name}</h3><p style="margin:0;font-size:12px;">${clinic.address}</p>`))
          .addTo(map);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [safeHouses]);

  const typeOptions = [
    { value: 'all', label: 'All Types', icon: Building },
    { value: 'safe-house', label: 'Safe Houses', icon: Home },
    { value: 'clinic', label: 'Clinics', icon: Heart },
    { value: 'support-center', label: 'Support Centers', icon: Users },
    { value: 'emergency-shelter', label: 'Emergency Shelters', icon: AlertCircle }
  ];

  const filteredSafeHouses = safeHouses.filter(safeHouse => {
    const matchesSearch = safeHouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         safeHouse.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         safeHouse.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || safeHouse.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safe-house':
        return Home;
      case 'clinic':
        return Heart;
      case 'support-center':
        return Users;
      case 'emergency-shelter':
        return AlertCircle;
      default:
        return Building;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'safe-house':
        return 'bg-green-100 text-green-700';
      case 'clinic':
        return 'bg-blue-100 text-blue-700';
      case 'support-center':
        return 'bg-purple-100 text-purple-700';
      case 'emergency-shelter':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCapacityStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { status: 'Full', color: 'text-red-600 bg-red-100' };
    if (percentage >= 70) return { status: 'Almost Full', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'Available', color: 'text-green-600 bg-green-100' };
  };

  const requestOTP = async (safeHouse: SafeHouse) => {
    // Store the selected safe house for navigation after OTP verification
    setSelectedSafeHouse(safeHouse);
    
    // Show verification form first
    setShowVerificationForm(true);
  };


  const verifyOTP = (enteredCode: string, enteredSecureCode: string) => {
    if (!otpVerification) return false;
    
    // Check both OTP and secure code
    if (enteredCode === otpVerification.code && enteredSecureCode === 'SAFE2024') {
      setShowOTPModal(false);
      setOtpCode('');
      setSecureCode('');
      setOtpVerification(null);
      
      // Start navigation after successful verification
      if (selectedSafeHouse) {
        startNavigation(selectedSafeHouse);
      }
      return true;
    } else {
      setOtpVerification({
        ...otpVerification,
        attempts: otpVerification.attempts + 1
      });
      return false;
    }
  };

  const startNavigation = (safeHouse: SafeHouse) => {
    setSelectedSafeHouse(safeHouse);
    setIsNavigating(true);
    setCurrentStep(0);
    
    // Simulate navigation steps
    const steps: NavigationStep[] = [
      {
        instruction: 'Start navigation to ' + safeHouse.name,
        distance: 0,
        duration: 0,
        type: 'start',
        coordinates: userLocation || { lat: 5.6037, lng: -0.1870 }
      },
      {
        instruction: 'Turn right onto Main Street',
        distance: 0.5,
        duration: 2,
        type: 'turn',
        coordinates: { lat: 5.6040, lng: -0.1865 }
      },
      {
        instruction: 'Continue straight for 0.7 km',
        distance: 0.7,
        duration: 3,
        type: 'straight',
        coordinates: { lat: 5.6045, lng: -0.1860 }
      },
      {
        instruction: 'You have arrived at ' + safeHouse.name,
        distance: 0,
        duration: 0,
        type: 'destination',
        coordinates: safeHouse.coordinates
      }
    ];
    
    setNavigationSteps(steps);
    
    // Calculate estimated arrival
    const totalDuration = steps.reduce((total, step) => total + step.duration, 0);
    setEstimatedArrival(new Date(Date.now() + totalDuration * 60 * 1000));
  };

  const getCurrentLocation = () => {
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
          // Fallback to Accra coordinates
          setUserLocation({ lat: 5.6037, lng: -0.1870 });
        }
      );
    } else {
      // Fallback to Accra coordinates
      setUserLocation({ lat: 5.6037, lng: -0.1870 });
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-primary-50/30 overflow-x-hidden">
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-xl mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white">Secure</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Secure Map</h1>
              <p className="text-sm text-white/90">Find verified safe houses and support centers. Verification required for directions.</p>
            </div>
          </div>
        </div>

        {/* AI CTA */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 mb-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Need help with directions or choosing a location?</p>
          <button onClick={() => navigate('/chatbot?context=secure-map')} className="flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-600 rounded-xl font-medium hover:from-primary-500/20 hover:to-purple-500/20 transition-all min-h-[44px]">
            <Sparkles className="w-4 h-4" />
            <span>ReproBot can help with directions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mapbox Map */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden mb-6 shadow-sm">
          <div ref={mapContainerRef} className="h-64 sm:h-80 w-full" />
          <div className="absolute bottom-4 right-4 z-10">
            <button onClick={getCurrentLocation} className="flex items-center gap-2 py-2 px-4 bg-white shadow-lg rounded-xl font-medium text-sm border border-gray-200 min-h-[44px] hover:bg-gray-50 transition-colors">
              <Navigation size={18} />
              <span>Use my location</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 mb-6 shadow-sm">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search safe spaces..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 focus:ring-2 focus:ring-primary-500/20 text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map(option => {
              const Icon = option.icon;
              return (
                <button key={option.value} onClick={() => setSelectedType(option.value)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedType === option.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:border-primary-200'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safe Houses List */}
          <div className="space-y-4">
            {loading && (
              <div className="p-8 flex justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            )}
            {!loading && filteredSafeHouses.map(safeHouse => {
              const TypeIcon = getTypeIcon(safeHouse.type);
              const capacityStatus = getCapacityStatus(safeHouse.currentOccupancy, safeHouse.capacity);
              
              return (
                <div key={safeHouse.id} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4">
                    {/* Icon */}
                    <div className={`p-2 sm:p-3 rounded-xl shadow-sm ${getTypeColor(safeHouse.type)} flex-shrink-0`}>
                      <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                            {safeHouse.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1">{safeHouse.address}</p>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                            <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getTypeColor(safeHouse.type)}`}>
                              {safeHouse.type.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getSecurityColor(safeHouse.securityLevel)}`}>
                              {safeHouse.securityLevel.toUpperCase()} SECURITY
                            </span>
                            <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${capacityStatus.color}`}>
                              {capacityStatus.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">{safeHouse.distance} km</p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                        {safeHouse.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{safeHouse.currentOccupancy}/{safeHouse.capacity}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">{safeHouse.operatingHours}</span>
                            <span className="sm:hidden">{safeHouse.operatingHours.split(' ')[0]}</span>
                          </span>
                          <span className={`${safeHouse.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {safeHouse.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => requestOTP(safeHouse)}
                            className="py-2.5 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all min-h-[44px] text-sm"
                          >
                            Get Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Modal */}
          {isNavigating && selectedSafeHouse && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">Navigation to {selectedSafeHouse.name}</h3>
                  <button
                    onClick={() => {
                      setIsNavigating(false);
                      setSelectedSafeHouse(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {navigationSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-2 sm:p-3 rounded-lg border-2 ${
                        index === currentStep
                          ? 'border-blue-500 bg-blue-50'
                          : index < currentStep
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          index === currentStep
                            ? 'bg-blue-500 text-white'
                            : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">{step.instruction}</p>
                          {step.distance > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {step.distance} km • {step.duration} min
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {estimatedArrival && (
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-700">
                      <strong>Estimated Arrival:</strong> {estimatedArrival.toLocaleTimeString()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 sm:py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(Math.min(navigationSteps.length - 1, currentStep + 1))}
                    disabled={currentStep === navigationSteps.length - 1}
                    className="flex-1 bg-blue-500 text-white py-2 sm:py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unified Verification Form Modal */}
          {showVerificationForm && selectedSafeHouse && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
              <div className="max-w-md w-full max-h-[95vh] overflow-y-auto">
                <UnifiedVerificationForm
                  onVerificationComplete={(verified) => {
                    if (verified) {
                      setShowVerificationForm(false);
                      // Proceed to OTP generation
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      const expiresAt = new Date(Date.now() + (selectedSafeHouse?.otpExpiry || 30) * 60 * 1000);
                      setOtpVerification({
                        code,
                        expiresAt,
                        attempts: 0,
                        maxAttempts: 3
                      });
                      setShowOTPModal(true);
                      console.log(`OTP for ${selectedSafeHouse?.name}: ${code}`);
                    } else {
                      setShowVerificationForm(false);
                      setSelectedSafeHouse(null);
                    }
                  }}
                  serviceName={selectedSafeHouse.name}
                  isEmergency={selectedSafeHouse.type === 'emergency-shelter'}
                  showOTP={false}
                />
              </div>
            </div>
          )}

          {/* OTP Verification Modal */}
          {showOTPModal && otpVerification && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[95vh] overflow-y-auto">
                <div className="text-center mb-4 sm:mb-6">
                  <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">OTP Verification Required</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Enter the OTP sent to your phone to get directions to:
                  </p>
                  {selectedSafeHouse && (
                    <p className="text-xs sm:text-sm font-medium text-blue-600 line-clamp-1">
                      {selectedSafeHouse.name}
                    </p>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-center text-base sm:text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      maxLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Secure Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={secureCode}
                      onChange={(e) => setSecureCode(e.target.value)}
                      placeholder="Enter your secure access code"
                      className="w-full px-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-center text-base sm:text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contact your support team if you don't have a secure code
                    </p>
                  </div>

                  {otpVerification.attempts > 0 && (
                    <div className="p-2 sm:p-3 bg-red-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-red-600">
                        Invalid OTP. {otpVerification.maxAttempts - otpVerification.attempts} attempts remaining.
                      </p>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      OTP expires in {Math.ceil((otpVerification.expiresAt.getTime() - Date.now()) / 60000)} minutes
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => {
                      setShowOTPModal(false);
                      setOtpCode('');
                      setSecureCode('');
                      setOtpVerification(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (verifyOTP(otpCode, secureCode)) {
                        // Both OTP and secure code verified successfully - navigation will start automatically
                        console.log('OTP and secure code verified successfully - starting navigation');
                      }
                    }}
                    disabled={otpCode.length !== 6 || !secureCode.trim() || otpVerification.attempts >= otpVerification.maxAttempts}
                    className="flex-1 bg-blue-500 text-white py-2.5 sm:py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                  >
                    Verify & Get Directions
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  );
};

export default SecureMap;
