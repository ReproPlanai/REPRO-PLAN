import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  AlertCircle,
  Search,
  Heart,
  Users,
  Home,
  Building
} from 'lucide-react';
import UnifiedVerificationForm from '../components/Auth/UnifiedVerificationForm';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);

  // Sample safe houses database
  const safeHouses: SafeHouse[] = [
    {
      id: 'safe_1',
      name: 'Hope Safe House',
      type: 'safe-house',
      address: 'Ring Road, Accra, Ghana',
      description: 'A secure safe house providing temporary shelter and support for survivors of gender-based violence.',
      coordinates: { lat: 5.6037, lng: -0.1870 },
      distance: 1.2,
      rating: 4.8,
      isOpen: true,
      capacity: 20,
      currentOccupancy: 8,
      securityLevel: 'high',
      features: ['24/7 Security', 'Counseling Services', 'Medical Support', 'Legal Aid'],
      contactPhone: '+233-24-555-0123',
      emergencyContact: '+233-24-555-0124',
      operatingHours: '24/7',
      requiresOTP: true,
      otpExpiry: 30
    },
    {
      id: 'safe_2',
      name: 'Youth Support Center',
      type: 'support-center',
      address: 'East Legon, Accra, Ghana',
      description: 'Youth-focused support center providing counseling, education, and safe spaces for young people.',
      coordinates: { lat: 5.6137, lng: -0.1970 },
      distance: 2.1,
      rating: 4.6,
      isOpen: true,
      capacity: 15,
      currentOccupancy: 12,
      securityLevel: 'medium',
      features: ['Youth Counseling', 'Educational Programs', 'Peer Support', 'Recreation'],
      contactPhone: '+233-24-555-0456',
      emergencyContact: '+233-24-555-0457',
      operatingHours: '8 AM - 8 PM',
      requiresOTP: true,
      otpExpiry: 45
    },
    {
      id: 'safe_3',
      name: 'Emergency Shelter',
      type: 'emergency-shelter',
      address: 'Osu, Accra, Ghana',
      description: 'Emergency shelter for immediate crisis situations with 24/7 availability.',
      coordinates: { lat: 5.6237, lng: -0.2070 },
      distance: 3.5,
      rating: 4.9,
      isOpen: true,
      capacity: 30,
      currentOccupancy: 5,
      securityLevel: 'high',
      features: ['Emergency Response', 'Medical Care', 'Legal Support', 'Family Reunification'],
      contactPhone: '+233-24-555-0789',
      emergencyContact: '+233-24-555-0790',
      operatingHours: '24/7',
      requiresOTP: true,
      otpExpiry: 15
    },
    {
      id: 'safe_4',
      name: 'Women\'s Health Clinic',
      type: 'clinic',
      address: 'Adabraka, Accra, Ghana',
      description: 'Specialized women\'s health clinic providing comprehensive reproductive health services.',
      coordinates: { lat: 5.6337, lng: -0.2170 },
      distance: 4.2,
      rating: 4.7,
      isOpen: true,
      capacity: 25,
      currentOccupancy: 18,
      securityLevel: 'medium',
      features: ['Medical Services', 'Counseling', 'Family Planning', 'STI Testing'],
      contactPhone: '+233-24-555-0321',
      emergencyContact: '+233-24-555-0322',
      operatingHours: '7 AM - 7 PM',
      requiresOTP: false,
      otpExpiry: 0
    }
  ];

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
        coordinates: userLocation || { lat: 6.3008, lng: -10.7970 }
      },
      {
        instruction: 'Turn right onto Main Street',
        distance: 0.5,
        duration: 2,
        type: 'turn',
        coordinates: { lat: 6.3018, lng: -10.7980 }
      },
      {
        instruction: 'Continue straight for 0.7 km',
        distance: 0.7,
        duration: 3,
        type: 'straight',
        coordinates: { lat: 6.3028, lng: -10.7990 }
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
          // Fallback to Monrovia coordinates
          setUserLocation({ lat: 6.3008, lng: -10.7970 });
        }
      );
    } else {
      // Fallback to Monrovia coordinates
      setUserLocation({ lat: 6.3008, lng: -10.7970 });
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Secure Map Navigation</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Find safe spaces with secure OTP verification for your protection
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card mb-3 sm:mb-4 lg:mb-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search safe spaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Type Filters */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {typeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedType(option.value)}
                      className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedType === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{option.label}</span>
                      <span className="sm:hidden">{option.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Safe Houses List */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {filteredSafeHouses.map(safeHouse => {
              const TypeIcon = getTypeIcon(safeHouse.type);
              const capacityStatus = getCapacityStatus(safeHouse.currentOccupancy, safeHouse.capacity);
              
              return (
                <div key={safeHouse.id} className="card group hover:shadow-lg transition-all duration-200">
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
                            onClick={() => {
                              if (safeHouse.requiresOTP) {
                                requestOTP(safeHouse);
                              } else {
                                // For non-OTP locations, still require verification for security
                                requestOTP(safeHouse);
                              }
                            }}
                            className="text-xs sm:text-sm bg-blue-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
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
        </div>
      </main>
    </div>
  );
};

export default SecureMap;
