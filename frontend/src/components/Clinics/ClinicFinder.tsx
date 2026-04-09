import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Navigation,
  Heart,
  Shield,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { offlineStorage } from '../../utils/offlineStorage';
import UnifiedVerificationForm from '../Auth/UnifiedVerificationForm';
import { apiService } from '../../services/api';
import { MAPBOX_ACCESS_KEY } from '../../config/api';

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
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const loadClinics = useCallback(async () => {
    try {
      // Try to get fresh data from API first
      const response = await apiService.getClinics() as { success: boolean; clinics?: any[] };
      if (response.success && response.clinics) {
        // Transform API data to match component interface
        const apiClinics = response.clinics.map((clinic: any) => ({
          id: clinic.id.toString(),
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone || '',
          hours: clinic.hours || 'Hours not specified',
          services: clinic.services || [],
          rating: 4.0, // Default rating since API doesn't provide it
          distance: 0, // Will be calculated based on user location
          coordinates: clinic.coordinates,
          type: clinic.type,
          isOpen: true // Default to open
        }));
        setClinics(apiClinics);
        // Store for offline use
        await offlineStorage.storeData('clinics', apiClinics);
        return;
      }
    } catch (apiError) {
      console.warn('API unavailable, trying offline storage:', apiError);
    }

    // Fallback to offline storage
    try {
      const storedClinics = await offlineStorage.getData('clinics');
      if (storedClinics && storedClinics.length > 0) {
        setClinics(storedClinics);
        return;
      }
    } catch (storageError) {
      console.warn('Offline storage unavailable:', storageError);
    }

    // Final fallback - empty array (no sample data)
    setClinics([]);
  }, []);

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
          // Use default location (Accra)
          setUserLocation({ lat: 5.6037, lng: -0.1870 });
          setIsLoadingLocation(false);
        }
      );
    } else {
      // Use default location (Accra)
      setUserLocation({ lat: 5.6037, lng: -0.1870 });
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

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_KEY;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.1870, 5.6037], // Accra, Ghana
      zoom: 12,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers for clinics when they're loaded
  useEffect(() => {
    if (!mapRef.current || clinics.length === 0) return;

    const map = mapRef.current;

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers for filtered clinics
    filteredClinics.forEach((clinic) => {
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

    // Fit map to show all clinics
    if (filteredClinics.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredClinics.forEach(clinic => {
        bounds.extend([clinic.coordinates.lng, clinic.coordinates.lat]);
      });
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [filteredClinics, clinics.length]);

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
    <div className="space-y-6">
        {/* Hero with search */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Find Clinics</h1>
              <p className="text-sm text-white/90 mb-4">Search for SRHR clinics, hospitals, and counseling services near you.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                <input
                  type="text"
                  placeholder="Search clinics, services, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI suggestion */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Not sure which clinic to choose?</p>
          <button
            onClick={() => navigate('/chatbot?context=clinics')}
            className="flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-600 rounded-xl font-medium hover:from-primary-500/20 hover:to-purple-500/20 transition-all min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask ReproBot for recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mapbox Map */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm">
          <div ref={mapContainerRef} className="h-64 sm:h-80 w-full" />
        </div>

        {/* Filters - pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'clinic', label: 'Clinics' },
            { value: 'hospital', label: 'Hospitals' },
            { value: 'counseling', label: 'Counseling' },
            { value: 'emergency', label: 'Emergency' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedType === value ? 'bg-primary-500 text-white' : 'bg-white/80 border border-gray-200/80 text-gray-600 hover:border-primary-200'}`}
            >
              {label}
            </button>
          ))}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'name')} className="px-3 py-2 rounded-xl border border-gray-200/80 text-sm bg-white">
            <option value="distance">Nearest</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name</option>
          </select>
          <button onClick={getUserLocation} disabled={isLoadingLocation} className="px-3 py-2 rounded-xl border border-gray-200/80 text-sm font-medium flex items-center gap-2">
            <Navigation size={16} />
            {isLoadingLocation ? 'Getting...' : 'My Location'}
          </button>
        </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic: Clinic) => {
            const TypeIcon = getTypeIcon(clinic.type);
            return (
              <div key={clinic.id} className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="h-24 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <TypeIcon className="w-10 h-10 text-primary-600" />
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{clinic.name}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{clinic.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={12} />{clinic.distance} km</span>
                    <span className={`flex items-center gap-1 ${clinic.isOpen ? 'text-green-600' : 'text-red-600'}`}><Clock size={12} />{clinic.isOpen ? 'Open' : 'Closed'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{clinic.address}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clinic.services.slice(0, 3).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-medium">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${clinic.phone}`} onClick={() => handleCall(clinic.phone)} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px]">
                      <Phone size={18} />
                      Call
                    </a>
                    <button onClick={() => { setSelectedClinic(clinic); setShowVerification(true); }} className="flex-1 py-2.5 px-4 border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px] hover:border-primary-300">
                      <Navigation size={18} />
                      Directions
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

      {/* Emergency Notice */}
      <div className="rounded-2xl bg-red-50/80 border border-red-200/60 p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-1 flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Emergency Services</h4>
            <p className="text-red-800 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
              If you're experiencing a medical emergency or need immediate help, call the emergency hotline or visit the nearest hospital.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <a href="tel:+233-24-555-9999" className="py-2.5 px-4 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px]">
                <Phone size={18} />
                <span>Emergency Hotline</span>
              </a>
              <a href="tel:+233-24-555-0104" className="py-2.5 px-4 border-2 border-red-600 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px] hover:bg-red-600 hover:text-white"
              >
                <Shield size={18} />
                <span>GBV Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
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
