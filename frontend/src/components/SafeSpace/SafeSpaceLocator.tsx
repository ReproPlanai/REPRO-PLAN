import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Navigation,
  Shield,
  Heart,
  Users,
  Calendar,
  AlertTriangle,
  Eye,
  Lock,
  Unlock,
  MessageSquare
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';
import UnifiedVerificationForm from '../Auth/UnifiedVerificationForm';

interface SafeSpace {
  id: string;
  name: string;
  type: 'crisis_center' | 'counseling' | 'shelter' | 'legal_aid' | 'medical' | 'hotline';
  address: string;
  phone: string;
  hours: string;
  services: string[];
  rating: number;
  distance: number;
  coordinates: { lat: number; lng: number };
  isOpen: boolean;
  isAnonymous: boolean;
  is24Hours: boolean;
  languages: string[];
  specialFeatures: string[];
  description: string;
  isVerified: boolean;
  lastUpdated: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'police' | 'medical' | 'crisis' | 'legal';
  is24Hours: boolean;
  description: string;
}

const SafeSpaceLocator: React.FC = () => {
  const [safeSpaces, setSafeSpaces] = useState<SafeSpace[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<SafeSpace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showDiscreetMode, setShowDiscreetMode] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SafeSpace | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationService, setVerificationService] = useState<string>('');

  const spaceTypes = [
    { value: 'crisis_center', label: 'Crisis Centers', icon: Shield, color: 'bg-red-100 text-red-600' },
    { value: 'counseling', label: 'Counseling Services', icon: Heart, color: 'bg-blue-100 text-blue-600' },
    { value: 'shelter', label: 'Safe Shelters', icon: Users, color: 'bg-green-100 text-green-600' },
    { value: 'legal_aid', label: 'Legal Aid', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { value: 'medical', label: 'Medical Services', icon: Heart, color: 'bg-orange-100 text-orange-600' },
    { value: 'hotline', label: 'Hotlines', icon: Phone, color: 'bg-yellow-100 text-yellow-600' }
  ];

  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'Liberia National Police',
      phone: '+231-555-9111',
      type: 'police',
      is24Hours: true,
      description: 'Emergency police response'
    },
    {
      id: '2',
      name: 'GBV Hotline',
      phone: '+233-800-800-800',
      type: 'crisis',
      is24Hours: true,
      description: '24/7 Gender-Based Violence support'
    },
    {
      id: '3',
      name: 'Emergency Medical',
      phone: '+233-193',
      type: 'medical',
      is24Hours: true,
      description: 'Emergency medical services'
    },
    {
      id: '4',
      name: 'Legal Aid Hotline',
      phone: '+233-24-555-7777',
      type: 'legal',
      is24Hours: false,
      description: 'Free legal assistance (Mon-Fri 8AM-5PM)'
    }
  ];

  // Sample safe spaces data (Ghana - starting country)
  const sampleSafeSpaces: SafeSpace[] = useMemo(() => [
    {
      id: '1',
      name: 'Ghana Women\'s Crisis Center',
      type: 'crisis_center',
      address: 'Ring Road, Accra',
      phone: '+233-24-555-0101',
      hours: '24/7 Emergency Services',
      services: ['Crisis Counseling', 'Emergency Shelter', 'Medical Care', 'Legal Support'],
      rating: 4.8,
      distance: 1.2,
      coordinates: { lat: 5.6037, lng: -0.1870 },
      isOpen: true,
      isAnonymous: true,
      is24Hours: true,
      languages: ['English', 'Twi', 'Ga'],
      specialFeatures: ['Anonymous Entry', 'Childcare', 'Transportation Assistance'],
      description: 'Comprehensive crisis support for survivors of gender-based violence',
      isVerified: true,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      name: 'Youth Safe Space',
      type: 'counseling',
      address: 'East Legon, Accra',
      phone: '+233-24-555-0102',
      hours: 'Mon-Sat: 9AM-6PM',
      services: ['Youth Counseling', 'Peer Support', 'SRHR Education', 'Mental Health'],
      rating: 4.6,
      distance: 2.1,
      coordinates: { lat: 5.6137, lng: -0.1970 },
      isOpen: true,
      isAnonymous: true,
      is24Hours: false,
      languages: ['English', 'Twi', 'Ga'],
      specialFeatures: ['Youth-Friendly', 'Peer Counselors', 'Online Support'],
      description: 'Safe, confidential space for young people to access support and information',
      isVerified: true,
      lastUpdated: '2024-01-10'
    },
    {
      id: '3',
      name: 'Hope Shelter',
      type: 'shelter',
      address: 'Osu, Accra',
      phone: '+233-24-555-0103',
      hours: '24/7 Shelter Services',
      services: ['Emergency Shelter', 'Food & Clothing', 'Counseling', 'Job Training'],
      rating: 4.7,
      distance: 3.5,
      coordinates: { lat: 5.6237, lng: -0.2070 },
      isOpen: true,
      isAnonymous: true,
      is24Hours: true,
      languages: ['English', 'Twi', 'Ewe'],
      specialFeatures: ['Long-term Stay', 'Family Units', 'Skills Training'],
      description: 'Safe haven providing comprehensive support for survivors and their families',
      isVerified: true,
      lastUpdated: '2024-01-12'
    },
    {
      id: '4',
      name: 'Legal Aid Society',
      type: 'legal_aid',
      address: 'Adabraka, Accra',
      phone: '+233-24-555-0104',
      hours: 'Mon-Fri: 8AM-5PM',
      services: ['Legal Counseling', 'Court Representation', 'Documentation', 'Restraining Orders'],
      rating: 4.5,
      distance: 4.2,
      coordinates: { lat: 5.6337, lng: -0.2170 },
      isOpen: false,
      isAnonymous: false,
      is24Hours: false,
      languages: ['English', 'Twi'],
      specialFeatures: ['Free Services', 'Court Support', 'Documentation Help'],
      description: 'Free legal assistance for survivors of violence and abuse',
      isVerified: true,
      lastUpdated: '2024-01-08'
    },
    {
      id: '5',
      name: 'Korle Bu Teaching Hospital - GBV Unit',
      type: 'medical',
      address: 'Korle Bu, Accra',
      phone: '+233-24-555-0105',
      hours: '24/7 Medical Services',
      services: ['Medical Examination', 'Forensic Evidence', 'STI Testing', 'Emergency Care'],
      rating: 4.4,
      distance: 5.1,
      coordinates: { lat: 5.6437, lng: -0.2270 },
      isOpen: true,
      isAnonymous: true,
      is24Hours: true,
      languages: ['English', 'Twi', 'Ga'],
      specialFeatures: ['Forensic Services', 'Confidential Care', 'Evidence Collection'],
      description: 'Specialized medical care for survivors with trained GBV specialists',
      isVerified: true,
      lastUpdated: '2024-01-14'
    }
  ], []);

  const loadSafeSpaces = useCallback(async () => {
    try {
      const storedSpaces = await offlineStorage.getData('safe_spaces');
      if (storedSpaces && storedSpaces.length > 0) {
        setSafeSpaces(storedSpaces);
      } else {
        setSafeSpaces(sampleSafeSpaces);
        await offlineStorage.storeData('safe_spaces', sampleSafeSpaces);
      }
    } catch (error) {
      console.error('Failed to load safe spaces:', error);
      setSafeSpaces(sampleSafeSpaces);
    }
  }, [sampleSafeSpaces]);

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
          setUserLocation({ lat: 5.6037, lng: -0.1870 }); // Default to Accra, Ghana
        }
      );
    } else {
      setUserLocation({ lat: 5.6037, lng: -0.1870 }); // Default to Accra, Ghana
    }
  };

  const filterAndSortSpaces = useCallback(() => {
    let filtered = safeSpaces;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((space: SafeSpace) =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.services.some((service: string) => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((space: SafeSpace) => space.type === selectedType);
    }

    // Sort
    filtered.sort((a: SafeSpace, b: SafeSpace) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredSpaces(filtered);
  }, [safeSpaces, searchTerm, selectedType, sortBy]);

  const getTypeIcon = (type: string) => {
    const typeInfo = spaceTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : Shield;
  };

  const getTypeColor = (type: string) => {
    const typeInfo = spaceTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.color : 'bg-gray-100 text-gray-600';
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = (coordinates: { lat: number; lng: number }) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    window.open(`tel:${contact.phone}`, '_self');
  };

  // Check if a service requires verification
  const requiresVerification = (space: SafeSpace): boolean => {
    const sensitiveTypes = ['crisis_center', 'shelter', 'legal_aid'];
    return sensitiveTypes.includes(space.type);
  };

  // Handle access to sensitive services
  const handleAccessService = (space: SafeSpace) => {
    if (requiresVerification(space) && !isVerified) {
      setVerificationService(space.name);
      setShowVerification(true);
    } else {
      setSelectedSpace(space);
    }
  };

  // Handle verification completion
  const handleVerificationComplete = (verified: boolean) => {
    setIsVerified(verified);
    setShowVerification(false);
    
    if (verified && selectedSpace) {
      // User is verified, they can now access directions
      handleDirections(selectedSpace.coordinates);
      setSelectedSpace(null);
    }
  };

  useEffect(() => {
    loadSafeSpaces();
    getUserLocation();
  }, [loadSafeSpaces]);

  useEffect(() => {
    filterAndSortSpaces();
  }, [filterAndSortSpaces]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Discreet Mode Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowDiscreetMode(!showDiscreetMode)}
              className={`p-3 rounded-xl transition-colors ${
                showDiscreetMode 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              title={showDiscreetMode ? 'Exit discreet mode' : 'Enter discreet mode'}
            >
              {showDiscreetMode ? <Unlock size={20} /> : <Lock size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <span className="font-medium text-red-900 text-sm sm:text-base">Safe Spaces</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{safeSpaces.length}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="font-medium text-green-900 text-sm sm:text-base">24/7 Services</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {safeSpaces.filter(s => s.is24Hours).length}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm sm:text-base">Anonymous Access</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {safeSpaces.filter(s => s.isAnonymous).length}
              </p>
            </div>
          </div>
      </div>

      {/* Emergency Contacts - Always Visible */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Contacts</h3>
            <p className="text-red-800 text-sm">
              If you're in immediate danger, call these numbers right away. All services are confidential.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{contact.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{contact.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-600">{contact.phone}</span>
                    {contact.is24Hours && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        24/7
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEmergencyCall(contact)}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  <Phone size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Services
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search safe spaces, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
              >
                <option value="all">All Services</option>
                {spaceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'name')}
                className="input-field"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Safe Spaces List */}
      <div className="space-y-6">
        {filteredSpaces.length > 0 ? (
          filteredSpaces.map((space: SafeSpace) => {
            const TypeIcon = getTypeIcon(space.type);
            return (
              <div key={space.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {/* Space Header */}
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${getTypeColor(space.type)} flex-shrink-0`}>
                      <TypeIcon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{space.name}</h3>
                      <p className="text-gray-600 mb-3">{space.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{space.distance} km away</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${space.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                          <Clock size={14} />
                          <span>{space.isOpen ? 'Open' : 'Closed'}</span>
                        </div>
                        {space.is24Hours && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            24/7
                          </span>
                        )}
                        {space.isAnonymous && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Anonymous
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Space Details */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 text-gray-600">
                      <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{space.address}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone size={16} className="flex-shrink-0" />
                      <span className="text-sm">{space.phone}</span>
                    </div>
                    <div className="flex items-start space-x-3 text-gray-600">
                      <Clock size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{space.hours}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Services Offered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {space.services.map((service: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-200"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Special Features */}
                  {space.specialFeatures.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Special Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {space.specialFeatures.map((feature: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Languages:</h4>
                    <div className="flex flex-wrap gap-2">
                      {space.languages.map((language: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => handleCall(space.phone)}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <Phone size={16} />
                      <span>Call Now</span>
                    </button>
                    <button
                      onClick={() => handleDirections(space.coordinates)}
                      className="flex-1 btn-outline flex items-center justify-center space-x-2"
                    >
                      <Navigation size={16} />
                      <span>Directions</span>
                    </button>
                    <button
                      onClick={() => handleAccessService(space)}
                      className="flex-1 btn-outline flex items-center justify-center space-x-2"
                    >
                      <MessageSquare size={16} />
                      <span>More Info</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No safe spaces found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Space Details Modal */}
      {selectedSpace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedSpace.name}</h3>
                <button
                  onClick={() => setSelectedSpace(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">{selectedSpace.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} />
                        <span>{selectedSpace.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} />
                        <span>{selectedSpace.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{selectedSpace.hours}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Features</h4>
                    <div className="space-y-2 text-sm">
                      {selectedSpace.is24Hours && (
                        <div className="flex items-center space-x-2">
                          <Clock size={14} />
                          <span>24/7 Services</span>
                        </div>
                      )}
                      {selectedSpace.isAnonymous && (
                        <div className="flex items-center space-x-2">
                          <Eye size={14} />
                          <span>Anonymous Access</span>
                        </div>
                      )}
                      {selectedSpace.isVerified && (
                        <div className="flex items-center space-x-2">
                          <Shield size={14} />
                          <span>Verified Service</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      handleCall(selectedSpace.phone);
                      setSelectedSpace(null);
                    }}
                    className="flex-1 btn-primary"
                  >
                    Call Now
                  </button>
                  <button
                    onClick={() => {
                      setVerificationService(selectedSpace.name);
                      setShowVerification(true);
                    }}
                    className="flex-1 btn-outline"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Safety Tips</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Trust your instincts - if something doesn't feel right, leave</li>
              <li>• All services are confidential and free</li>
              <li>• You can access services anonymously</li>
              <li>• Bring a trusted friend or family member if possible</li>
              <li>• Keep emergency numbers saved in your phone</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unified Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <UnifiedVerificationForm
              onVerificationComplete={handleVerificationComplete}
              serviceName={verificationService}
              isEmergency={false}
              showOTP={false}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SafeSpaceLocator;
