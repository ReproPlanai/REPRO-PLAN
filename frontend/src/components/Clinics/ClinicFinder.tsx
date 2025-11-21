import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Navigation,
  Heart,
  Shield,
  Users,
  Calendar
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';
import UnifiedVerificationForm from '../Auth/UnifiedVerificationForm';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  rating: number;
  distance: number;
  coordinates: { lat: number; lng: number };
  type: 'clinic' | 'hospital' | 'counseling' | 'emergency';
  isOpen: boolean;
}

const ClinicFinder: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Sample clinic data (in a real app, this would come from an API)
  const sampleClinics: Clinic[] = useMemo(() => [
    {
      id: '1',
      name: 'Monrovia Health Center',
      address: 'Broad Street, Monrovia',
      phone: '+231-555-0101',
      hours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-1PM',
      services: ['STI Testing', 'Contraception', 'Prenatal Care', 'Counseling'],
      rating: 4.5,
      distance: 2.3,
      coordinates: { lat: 6.3008, lng: -10.7972 },
      type: 'clinic',
      isOpen: true
    },
    {
      id: '2',
      name: 'Youth Friendly Services Center',
      address: 'Capitol Hill, Monrovia',
      phone: '+231-555-0102',
      hours: 'Mon-Sat: 9AM-6PM',
      services: ['Youth Counseling', 'SRHR Education', 'Peer Support', 'Emergency Contraception'],
      rating: 4.8,
      distance: 1.8,
      coordinates: { lat: 6.3108, lng: -10.8072 },
      type: 'counseling',
      isOpen: true
    },
    {
      id: '3',
      name: 'Redemption Hospital',
      address: 'Bushrod Island, Monrovia',
      phone: '+231-555-0103',
      hours: '24/7 Emergency Services',
      services: ['Emergency Care', 'Maternity', 'Surgery', 'Laboratory'],
      rating: 4.2,
      distance: 4.1,
      coordinates: { lat: 6.3208, lng: -10.8172 },
      type: 'hospital',
      isOpen: true
    },
    {
      id: '4',
      name: 'GBV Support Center',
      address: 'Sinkor, Monrovia',
      phone: '+231-555-0104',
      hours: '24/7 Hotline',
      services: ['Crisis Counseling', 'Legal Support', 'Safe Shelter', 'Medical Care'],
      rating: 4.9,
      distance: 3.2,
      coordinates: { lat: 6.3308, lng: -10.8272 },
      type: 'emergency',
      isOpen: true
    },
    {
      id: '5',
      name: 'Family Planning Clinic',
      address: 'Paynesville, Monrovia',
      phone: '+231-555-0105',
      hours: 'Mon-Fri: 8AM-4PM',
      services: ['Contraception', 'Pregnancy Testing', 'STI Prevention', 'Health Education'],
      rating: 4.6,
      distance: 5.7,
      coordinates: { lat: 6.3408, lng: -10.8372 },
      type: 'clinic',
      isOpen: false
    }
  ], []);

  const loadClinics = useCallback(async () => {
    try {
      const storedClinics = await offlineStorage.getData('clinics');
      if (storedClinics && storedClinics.length > 0) {
        setClinics(storedClinics);
      } else {
        setClinics(sampleClinics);
        // Store sample data for offline use
        await offlineStorage.storeData('clinics', sampleClinics);
      }
    } catch (error) {
      console.error('Failed to load clinics:', error);
      setClinics(sampleClinics);
    }
  }, [sampleClinics]);

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (Monrovia)
          setUserLocation({ lat: 6.3008, lng: -10.7972 });
          setIsLoadingLocation(false);
        }
      );
    } else {
      // Use default location
      setUserLocation({ lat: 6.3008, lng: -10.7972 });
      setIsLoadingLocation(false);
    }
  };

  const filterAndSortClinics = useCallback(() => {
    let filtered = clinics;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((clinic: Clinic) =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.services.some((service: string) => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((clinic: Clinic) => clinic.type === selectedType);
    }

    // Sort
    filtered.sort((a: Clinic, b: Clinic) => {
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

    setFilteredClinics(filtered);
  }, [clinics, searchTerm, selectedType, sortBy]);

  useEffect(() => {
    // Load clinics from offline storage or use sample data
    loadClinics();
    getUserLocation();
  }, [loadClinics]);

  useEffect(() => {
    filterAndSortClinics();
  }, [filterAndSortClinics]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clinic':
        return Heart;
      case 'hospital':
        return Shield;
      case 'counseling':
        return Users;
      case 'emergency':
        return Calendar;
      default:
        return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'clinic':
        return 'bg-blue-100 text-blue-600';
      case 'hospital':
        return 'bg-red-100 text-red-600';
      case 'counseling':
        return 'bg-green-100 text-green-600';
      case 'emergency':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
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

  const handleVerificationComplete = (verified: boolean) => {
    setShowVerification(false);
    if (verified && selectedClinic) {
      // User is verified, they can now access directions
      handleDirections(selectedClinic.coordinates);
      setSelectedClinic(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters - Enhanced for mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Search - Full width on mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Location
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search clinics, services, or locations..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

          {/* Filters - Grid layout for mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={selectedType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
                className="input-field text-sm sm:text-base"
              >
                <option value="all">All Types</option>
                <option value="clinic">Clinics</option>
                <option value="hospital">Hospitals</option>
                <option value="counseling">Counseling</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'distance' | 'rating' | 'name')}
                className="input-field text-sm sm:text-base"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Location Button */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <button
                onClick={getUserLocation}
                disabled={isLoadingLocation}
                className="w-full btn-outline text-sm sm:text-base flex items-center justify-center space-x-2"
              >
                <Navigation size={16} />
                <span>{isLoadingLocation ? 'Getting...' : 'My Location'}</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Results - Enhanced mobile layout */}
      <div className="space-y-4 sm:space-y-6">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic: Clinic) => {
            const TypeIcon = getTypeIcon(clinic.type);
            return (
              <div key={clinic.id} className="card">
                <div className="space-y-4 sm:space-y-6">
                  {/* Clinic Header - Enhanced for mobile */}
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`p-3 sm:p-4 rounded-xl ${getTypeColor(clinic.type)} flex-shrink-0`}>
                      <TypeIcon size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">{clinic.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{clinic.distance} km away</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${clinic.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                          <Clock size={14} />
                          <span>{clinic.isOpen ? 'Open' : 'Closed'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Details - Enhanced mobile layout */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-2 sm:space-x-3 text-gray-600">
                      <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base leading-relaxed">{clinic.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
                      <Phone size={16} className="flex-shrink-0" />
                      <span className="text-sm sm:text-base">{clinic.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3 text-gray-600">
                      <Clock size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base leading-relaxed">{clinic.hours}</span>
                    </div>
                  </div>

                  {/* Services - Enhanced mobile layout */}
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">Services Offered:</h4>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {clinic.services.map((service: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 sm:px-4 sm:py-2 bg-primary-50 text-primary-700 text-xs sm:text-sm rounded-full border border-primary-200"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions - Enhanced mobile buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                    <button
                      onClick={() => handleCall(clinic.phone)}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Phone size={16} />
                      <span>Call Now</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClinic(clinic);
                        setShowVerification(true);
                      }}
                      className="flex-1 btn-outline flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Navigation size={16} />
                      <span>Directions</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 sm:py-16">
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No clinics found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Emergency Notice - Enhanced for mobile */}
      <div className="mt-6 sm:mt-8 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-1 flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Emergency Services</h4>
            <p className="text-red-800 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
              If you're experiencing a medical emergency or need immediate help, call the emergency hotline or visit the nearest hospital.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => handleCall('+231-555-9999')}
                className="btn-primary bg-red-600 hover:bg-red-700 active:bg-red-800 text-sm sm:text-base flex items-center justify-center space-x-2"
              >
                <Phone size={16} />
                <span>Emergency Hotline</span>
              </button>
              <button
                onClick={() => handleCall('+231-555-0104')}
                className="btn-outline border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm sm:text-base flex items-center justify-center space-x-2"
              >
                <Shield size={16} />
                <span>GBV Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <UnifiedVerificationForm
              onVerificationComplete={handleVerificationComplete}
              serviceName={selectedClinic?.name || 'Clinic'}
              isEmergency={false}
              showOTP={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicFinder;
