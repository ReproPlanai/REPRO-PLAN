import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MessageSquare,
  Sparkles,
  ArrowRight,
  List,
  Map
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';
import { apiService } from '../../services/api';
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
  const navigate = useNavigate();
  const [safeSpaces, setSafeSpaces] = useState<SafeSpace[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
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
      name: 'Ghana Police Service',
      phone: '+233-24-555-9111',
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

  // Fetch safe spaces from API (admin-configured) or offline storage
  const loadSafeSpaces = useCallback(async () => {
    try {
      // Try to fetch from backend API first (admin-configured)
      const response = await apiService.getClinics?.() as { success?: boolean; clinics?: any[] };
      
      if (response?.success && response.clinics && response.clinics.length > 0) {
        // Transform clinics to SafeSpace format
        const apiSafeSpaces: SafeSpace[] = response.clinics.map((clinic: any) => ({
          id: clinic.id,
          name: clinic.name,
          type: mapClinicType(clinic.type),
          address: clinic.address,
          phone: clinic.phone || 'N/A',
          hours: clinic.hours || 'Contact for hours',
          services: clinic.services || [],
          rating: clinic.rating || 4.5,
          distance: calculateDistance(clinic.coordinates),
          coordinates: clinic.coordinates || { lat: 5.6037, lng: -0.1870 },
          isOpen: true,
          isAnonymous: clinic.type === 'counseling' || clinic.type === 'crisis',
          is24Hours: clinic.hours?.includes('24/7') || false,
          languages: clinic.languages || ['English'],
          specialFeatures: clinic.specialFeatures || [],
          description: `${clinic.name} - ${clinic.services?.join(', ')}`,
          isVerified: true,
          lastUpdated: new Date().toISOString()
        }));
        
        setSafeSpaces(apiSafeSpaces);
        await offlineStorage.storeData('safe_spaces', apiSafeSpaces);
      } else {
        // Fall back to offline storage
        const storedSpaces = await offlineStorage.getData('safe_spaces');
        if (storedSpaces && storedSpaces.length > 0) {
          setSafeSpaces(storedSpaces);
        }
      }
    } catch (error) {
      console.error('Failed to load safe spaces from API:', error);
      // Fall back to offline storage
      const storedSpaces = await offlineStorage.getData('safe_spaces');
      if (storedSpaces && storedSpaces.length > 0) {
        setSafeSpaces(storedSpaces);
      }
    }
  }, []);

  // Map clinic types to safe space types
  const mapClinicType = (type: string): SafeSpace['type'] => {
    const typeMap: Record<string, SafeSpace['type']> = {
      'clinic': 'medical',
      'hospital': 'medical',
      'counseling': 'counseling',
      'crisis': 'crisis_center',
      'shelter': 'shelter',
      'legal': 'legal_aid',
      'hotline': 'hotline'
    };
    return typeMap[type] || 'crisis_center';
  };

  // Calculate distance from user (simplified)
  const calculateDistance = (coordinates: { lat: number; lng: number } | undefined): number => {
    if (!coordinates || !userLocation) return 0;
    // Simple Euclidean distance for display
    const latDiff = coordinates.lat - userLocation.lat;
    const lngDiff = coordinates.lng - userLocation.lng;
    return Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 10) / 10;
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 sm:pb-8 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white">Safe Spaces</span>
                  <Sparkles className="w-3.5 h-3.5 text-white/80" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Find Safe Spaces</h1>
                <p className="text-sm text-white/90">Crisis centers, counseling, shelters, and support services near you.</p>
              </div>
            </div>
            <button onClick={() => setShowDiscreetMode(!showDiscreetMode)} className={`p-2.5 rounded-xl ${showDiscreetMode ? 'bg-white/25' : 'bg-white/10'} transition-colors`} title={showDiscreetMode ? 'Exit discreet mode' : 'Enter discreet mode'}>
              {showDiscreetMode ? <Unlock size={20} className="text-white" /> : <Lock size={20} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Ask Rehana */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Have questions about safe spaces?</p>
          <button onClick={() => navigate('/chatbot?context=safe-spaces')} className="flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-600 rounded-xl font-medium hover:from-primary-500/20 hover:to-purple-500/20 transition-all min-h-[44px]">
            <Sparkles className="w-4 h-4" />
            <span>Ask Rehana about safe spaces</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stats + Map/List toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/90 border border-gray-200/80 px-4 py-2">
              <span className="text-lg font-bold text-primary-600">{safeSpaces.length}</span>
              <span className="text-xs text-gray-500 ml-1">Spaces</span>
            </div>
            <div className="rounded-xl bg-white/90 border border-gray-200/80 px-4 py-2">
              <span className="text-lg font-bold text-green-600">{safeSpaces.filter(s => s.is24Hours).length}</span>
              <span className="text-xs text-gray-500 ml-1">24/7</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}><List size={18} /></button>
            <button onClick={() => setViewMode('map')} className={`p-2 rounded-xl ${viewMode === 'map' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}><Map size={18} /></button>
          </div>
        </div>

      {/* Emergency Contacts */}
      <div className="rounded-2xl bg-red-50/80 border border-red-200/60 p-4 sm:p-6">
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
            <div key={contact.id} className="rounded-2xl bg-white/90 border border-red-200/60 p-4">
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
      <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search safe spaces, services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 focus:ring-2 focus:ring-primary-500/20 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200/80 text-sm bg-white">
            <option value="all">All Services</option>
            {spaceTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'name')} className="px-3 py-2 rounded-xl border border-gray-200/80 text-sm bg-white">
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Safe Spaces List / Map */}
      <div className="space-y-4">
        {viewMode === 'map' ? (
          <div className="rounded-2xl bg-white/90 border border-gray-200/80 p-8 text-center">
            <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Map view coming soon. Showing list.</p>
            <button onClick={() => setViewMode('list')} className="mt-3 text-primary-600 text-sm font-medium">Switch to list</button>
          </div>
        ) : filteredSpaces.length > 0 ? (
          filteredSpaces.map((space: SafeSpace) => {
            const TypeIcon = getTypeIcon(space.type);
            return (
              <div key={space.id} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${getTypeColor(space.type)} flex-shrink-0`}>
                      <TypeIcon size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{space.name}</h3>
                        {space.isVerified && <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium">Verified</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{space.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
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
                  <div className="flex gap-2 pt-4">
                    <a href={`tel:${space.phone}`} onClick={() => handleCall(space.phone)} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px]">
                      <Phone size={18} />
                      Call
                    </a>
                    <button onClick={() => handleDirections(space.coordinates)} className="flex-1 py-2.5 px-4 border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px] hover:border-primary-300">
                      <Navigation size={18} />
                      Directions
                    </button>
                    <button onClick={() => handleAccessService(space)} className="py-2.5 px-4 border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px] hover:border-primary-300">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl bg-white/90 border border-gray-200/80 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No safe spaces found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
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
      <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-4 sm:p-6">
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

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
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
  );
};

export default SafeSpaceLocator;
