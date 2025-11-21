import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';

interface LocationData {
  id: string;
  userId: string;
  userName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  status: 'active' | 'responding' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'panic' | 'emergency' | 'sos' | 'distress';
  phoneNumber: string;
  lastSeen: string;
}

interface MapTrackingProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
  onNavigateToLocation: (location: LocationData) => void;
}

const MapTracking: React.FC<MapTrackingProps> = ({
  locations,
  onLocationSelect,
  onNavigateToLocation
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 6.3000, lng: -10.8000 }); // Liberia center
  const [zoom, setZoom] = useState(12);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [isTracking, setIsTracking] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate real-time location updates
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      // Simulate location updates for active alerts
      const activeLocations = locations.filter(loc => loc.status === 'active');
      if (activeLocations.length > 0) {
        const randomLocation = activeLocations[Math.floor(Math.random() * activeLocations.length)];
        // Simulate small location changes
        const updatedLocation = {
          ...randomLocation,
          location: {
            ...randomLocation.location,
            lat: randomLocation.location.lat + (Math.random() - 0.5) * 0.001,
            lng: randomLocation.location.lng + (Math.random() - 0.5) * 0.001
          },
          lastSeen: new Date().toISOString()
        };
        
        // Update the location in the parent component
        onLocationSelect(updatedLocation);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isTracking, locations, onLocationSelect]);

  const getMarkerColor = (priority: LocationData['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getMarkerIcon = (type: LocationData['type']) => {
    switch (type) {
      case 'panic': return '🚨';
      case 'emergency': return '🚑';
      case 'sos': return '🆘';
      case 'distress': return '⚠️';
      default: return '📍';
    }
  };

  const handleLocationClick = (location: LocationData) => {
    setSelectedLocation(location);
    setMapCenter(location.location);
    onLocationSelect(location);
  };

  const handleNavigate = (location: LocationData) => {
    onNavigateToLocation(location);
    // In a real app, this would open navigation app
    alert(`Navigating to ${location.userName} at ${location.location.address}`);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Emergency Location Tracking</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isTracking 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Map Type and Zoom Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMapType('standard')}
              className={`px-3 py-1 text-xs rounded ${
                mapType === 'standard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 text-xs rounded ${
                mapType === 'satellite' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-3 py-1 text-xs rounded ${
                mapType === 'hybrid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Hybrid
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 1))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-600">Zoom: {zoom}</span>
            <button
              onClick={() => setZoom(Math.min(20, zoom + 1))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative">
          {/* Simulated Map */}
          <div 
            ref={mapRef}
            className="w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
          >
            {/* Map Center Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            </div>

            {/* Emergency Location Markers */}
            {locations.map((location, index) => (
              <div
                key={location.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${50 + (location.location.lng - mapCenter.lng) * 1000}%`,
                  top: `${50 - (location.location.lat - mapCenter.lat) * 1000}%`,
                }}
                onClick={() => handleLocationClick(location)}
              >
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm ${getMarkerColor(location.priority)}`}>
                    {getMarkerIcon(location.type)}
                  </div>
                  {location.status === 'active' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}

            {/* Map Overlay Info */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
              <div className="text-sm font-medium text-gray-900">Emergency Locations</div>
              <div className="text-xs text-gray-600">
                {locations.filter(loc => loc.status === 'active').length} active alerts
              </div>
            </div>

            {/* Tracking Status */}
            {isTracking && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium animate-pulse">
                LIVE TRACKING
              </div>
            )}
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getMarkerColor(selectedLocation.priority)}`}></div>
                    <span className="font-medium text-gray-900">{selectedLocation.userName}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {selectedLocation.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} />
                      <span>{selectedLocation.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={14} />
                      <span>{selectedLocation.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={14} />
                      <span>Last seen: {formatTimeAgo(selectedLocation.lastSeen)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleNavigate(selectedLocation)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    title="Navigate to location"
                  >
                    <Navigation size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Emergency Locations</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
          {locations.filter(loc => loc.status === 'active').map((location) => (
            <div 
              key={location.id} 
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleLocationClick(location)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getMarkerColor(location.priority)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{location.userName}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {location.priority.toUpperCase()}
                      </span>
                      {location.status === 'active' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{location.location.address}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Phone size={12} />
                        <span>{location.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{formatTimeAgo(location.lastSeen)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(location);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Navigation size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapTracking;
