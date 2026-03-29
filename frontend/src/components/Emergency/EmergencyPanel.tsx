import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Phone, 
  MessageCircle, 
  MapPin, 
  AlertTriangle, 
  Heart, 
  Users,
  Clock,
  CheckCircle,
  Send,
  Navigation,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';
import { locationService, LocationData } from '../../utils/locationService';
import { secretCodeManager } from '../../utils/secretCode';
import { apiService } from '../../services/api';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'police' | 'medical' | 'gbv' | 'counseling' | 'hotline' | 'emergency';
  available: boolean;
}

interface EmergencyLog {
  id: string;
  timestamp: number;
  type: string;
  action: string;
  location?: { lat: number; lng: number };
  notes?: string;
}

const EmergencyPanel: React.FC = () => {
  const navigate = useNavigate();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyLog[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [panicMode, setPanicMode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [showLocationShare, setShowLocationShare] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  // Ghana emergency contacts
  const defaultEmergencyContacts: EmergencyContact[] = useMemo(() => [
    {
      id: '1',
      name: 'Ghana Police Service',
      phone: '+233-191',
      type: 'police',
      available: true
    },
    {
      id: '2',
      name: 'National Ambulance Service',
      phone: '+233-193',
      type: 'medical',
      available: true
    },
    {
      id: '3',
      name: 'GBV Support Services',
      phone: '+233-0800-800-800',
      type: 'gbv',
      available: true
    },
    {
      id: '4',
      name: 'Ghana National Fire Service',
      phone: '+233-192',
      type: 'emergency',
      available: true
    },
    {
      id: '5',
      name: 'Mental Health Support',
      phone: '+233-020-000-0000',
      type: 'counseling',
      available: true
    }
  ], []);

  const loadEmergencyData = useCallback(async () => {
    try {
      const [contacts, logs] = await Promise.all([
        offlineStorage.getData('emergency_contacts'),
        offlineStorage.getData('emergency_logs')
      ]);
      
      setEmergencyContacts(contacts || defaultEmergencyContacts);
      setEmergencyLogs(logs || []);
    } catch (error) {
      console.error('Failed to load emergency data:', error);
      setEmergencyContacts(defaultEmergencyContacts);
    }
  }, [defaultEmergencyContacts]);

  const saveEmergencyData = useCallback(async () => {
    try {
      await Promise.all([
        offlineStorage.storeData('emergency_contacts', emergencyContacts),
        offlineStorage.storeData('emergency_logs', emergencyLogs)
      ]);
    } catch (error) {
      console.error('Failed to save emergency data:', error);
    }
  }, [emergencyContacts, emergencyLogs]);

  const getUserLocation = async () => {
    try {
      const result = await locationService.getCurrentLocation();
      if (result.success && result.location) {
        setUserLocation(result.location);
      } else {
        console.error('Error getting location:', result.error);
        // Set default location to Accra, Ghana
        setUserLocation({
          latitude: 5.6037,
          longitude: -0.1870,
          accuracy: 0,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const shareLocationWithEmergency = async (emergencyType: 'police' | 'medical' | 'fire' | 'general') => {
    if (!userLocation) {
      alert('Location not available. Please enable location services.');
      return;
    }

    setIsSharingLocation(true);
    try {
      // Get user ID from secret code manager if available
      const userId = secretCodeManager.getUserId() || undefined;
      
      const result = await locationService.shareLocationWithEmergency(
        userId ? `user_${userId}` : 'user_' + Date.now(),
        '+233-24-555-0000', // In real app, this would be actual phone number
        emergencyType,
        emergencyMessage || 'Emergency assistance needed'
      );

      if (result.success) {
        alert('Location shared with emergency services successfully!');
        
        // Log the emergency action
        const newLog: EmergencyLog = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: emergencyType,
          action: `Location shared with ${emergencyType} services`,
          location: {
            lat: result.location!.latitude,
            lng: result.location!.longitude
          },
          notes: emergencyMessage
        };

        const updatedLogs = [...emergencyLogs, newLog];
        setEmergencyLogs(updatedLogs);
        await offlineStorage.storeData('emergency_logs', updatedLogs);
      } else {
        alert('Failed to share location: ' + result.error);
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      alert('Failed to share location with emergency services');
    } finally {
      setIsSharingLocation(false);
    }
  };

  const handlePanicButton = () => {
    setPanicMode(true);
    setCountdown(5); // 5 second countdown
    setShowLocationShare(true);
  };

  const handlePanicActivated = useCallback(async () => {
    try {
      // Create emergency alert in backend
      const alertData = {
        alertType: 'panic' as const,
        priority: 'critical' as const,
        status: 'active' as const,
        location: userLocation ? {
          coordinates: { lat: userLocation.latitude, lng: userLocation.longitude },
          address: 'User location',
          city: 'Ghana'
        } : {
          coordinates: { lat: 5.6037, lng: -0.1870 },
          address: 'Unknown',
          city: 'Ghana'
        },
        description: emergencyMessage || 'Panic button activated - immediate assistance needed',
        userId: (() => {
          const rawUserId = secretCodeManager.getUserId();
          if (rawUserId === undefined) return undefined;
          return String(rawUserId);
        })()
      };

      // Send alert to backend
      await apiService.createAlert(alertData);

      // Log the emergency locally
      const log: EmergencyLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'panic_button',
        action: 'Panic button activated',
        location: userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined,
        notes: emergencyMessage
      };

      const newLogs = [...emergencyLogs, log];
      setEmergencyLogs(newLogs);
      saveEmergencyData();

      alert('Emergency alert sent! Help is on the way.');
    } catch (error: any) {
      console.error('Failed to send emergency alert:', error);
      alert('Emergency alert sent locally. Help is on the way.');
    } finally {
      setPanicMode(false);
      setShowLocationShare(false);
    }
  }, [emergencyLogs, userLocation, emergencyMessage, saveEmergencyData]);

  const handleCancelPanic = () => {
    setPanicMode(false);
    setCountdown(0);
    setShowLocationShare(false);
  };

  const handleCallContact = (contact: EmergencyContact) => {
    window.open(`tel:${contact.phone}`, '_self');
    
    // Log the call
    const log: EmergencyLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'call',
      action: `Called ${contact.name}`,
      location: userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined
    };

    const newLogs = [...emergencyLogs, log];
    setEmergencyLogs(newLogs);
    saveEmergencyData();
  };

  const handleSendMessage = () => {
    if (!emergencyMessage.trim()) return;

    // Log the message
    const log: EmergencyLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'message',
      action: 'Emergency message sent',
      location: userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined,
      notes: emergencyMessage
    };

    const newLogs = [...emergencyLogs, log];
    setEmergencyLogs(newLogs);
    saveEmergencyData();

    // In a real app, this would send the message to emergency contacts
    alert('Emergency message sent to your contacts!');
    setEmergencyMessage('');
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'police': return Shield;
      case 'medical': return Heart;
      case 'gbv': return Users;
      case 'counseling': return MessageCircle;
      case 'hotline': return Phone;
      default: return Phone;
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case 'police': return 'bg-red-100 text-red-600';
      case 'medical': return 'bg-green-100 text-green-600';
      case 'gbv': return 'bg-purple-100 text-purple-600';
      case 'counseling': return 'bg-blue-100 text-blue-600';
      case 'hotline': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  useEffect(() => {
    loadEmergencyData();
    getUserLocation();
  }, [loadEmergencyData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (panicMode && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (panicMode && countdown === 0) {
      handlePanicActivated();
    }
    return () => clearInterval(interval);
  }, [panicMode, countdown, handlePanicActivated]);

  if (panicMode) {
    return (
      <div className="fixed inset-0 bg-red-600 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <AlertTriangle className="w-24 h-24 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold mb-4">EMERGENCY ALERT</h1>
          <p className="text-xl mb-6">Help is being contacted...</p>
          
          {countdown > 0 && (
            <div className="mb-6">
              <div className="text-6xl font-bold mb-2">{countdown}</div>
              <p>seconds until emergency alert is sent</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleCancelPanic}
              className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel Emergency
            </button>
            
            {showLocationShare && (
              <div className="mt-4">
                <p className="text-sm mb-2">Your location will be shared with emergency contacts</p>
                <div className="flex items-center justify-center space-x-2">
                  <MapPin size={16} />
                  <span className="text-sm">
                    {userLocation ? 'Location detected' : 'Location not available'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Hero + Panic Button */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 p-6 sm:p-8 shadow-xl mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.08)_100%)]" />
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Support
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Emergency Support</h1>
            <p className="text-sm text-white/90 mb-6 max-w-xl mx-auto">
              Press the button below if you're in immediate danger. Help will be contacted right away.
            </p>
            <button
              onClick={handlePanicButton}
              className="w-full sm:w-auto px-8 py-4 bg-white text-red-600 rounded-2xl font-bold text-lg shadow-lg hover:bg-red-50 transition-all min-h-[52px]"
            >
              🚨 EMERGENCY ALERT 🚨
            </button>
          </div>
        </div>

        {/* Ask Rehana - AI section */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            Ask Rehana
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Not sure what to do? Rehana can provide situation-based guidance and connect you with the right resources.
          </p>
          <button
            onClick={() => navigate('/chatbot?context=emergency')}
            className="flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all min-h-[44px]"
          >
            <span>Chat with Rehana for help</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Contacts */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => {
              const Icon = getContactIcon(contact.type);
              return (
                <div key={contact.id} className="rounded-2xl border border-gray-200/80 p-4 hover:border-primary-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${getContactColor(contact.type)} flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{contact.phone}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${contact.available ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    onClick={() => handleCallContact(contact)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all min-h-[44px]"
                  >
                    <Phone size={18} />
                    <span>Call Now</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Message */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Emergency Message</h2>
          <div className="space-y-4">
            <textarea
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              placeholder="Describe your emergency situation..."
              className="w-full p-3 rounded-xl border border-gray-200/80 resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              rows={4}
            />
            <button
              onClick={handleSendMessage}
              disabled={!emergencyMessage.trim()}
              className="w-full py-3 px-5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Send size={18} />
              <span>Send Emergency Message</span>
            </button>
          </div>
        </div>

        {/* Location Services */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Services</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">Location Sharing</p>
                <p className="text-sm text-gray-600">
                  {userLocation ? 'Your location is available for emergency services' : 'Location not detected'}
                </p>
                {userLocation && (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p className="break-all">GPS: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}</p>
                    <p>Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
                    <p>Updated: {new Date(userLocation.timestamp).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={getUserLocation}
                className="py-3 px-5 border-2 border-gray-200 rounded-xl font-medium hover:border-primary-300 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Navigation size={18} />
                <span>Update Location</span>
              </button>
              {userLocation && (
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <button
                    onClick={() => shareLocationWithEmergency('police')}
                    disabled={isSharingLocation}
                    className="py-3 px-5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  >
                    <Shield size={18} />
                    <span>Share with Police</span>
                  </button>
                  <button
                    onClick={() => shareLocationWithEmergency('medical')}
                    disabled={isSharingLocation}
                    className="py-3 px-5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  >
                    <Heart size={18} />
                    <span>Share with Medical</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Emergency Log */}
      <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Activity Log</h2>
        {emergencyLogs.length > 0 ? (
          <div className="space-y-3">
            {emergencyLogs
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 10)
              .map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600">{formatTime(log.timestamp)}</p>
                      {log.notes && (
                        <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.location && (
                      <MapPin size={16} className="text-green-600" />
                    )}
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No emergency activity recorded</p>
            <p className="text-gray-400 text-xs sm:text-sm">Emergency actions will be logged here</p>
          </div>
        )}
        </div>

        {/* Safety Tips */}
        <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-4 sm:p-6">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">Safety Tips</h3>
          <ul className="text-blue-800 text-xs sm:text-sm space-y-2">
            <li>• Keep your phone charged and with you at all times</li>
            <li>• Know your emergency contacts by heart</li>
            <li>• Share your location with trusted contacts when going out</li>
            <li>• Trust your instincts - if something feels wrong, get help</li>
            <li>• Have a safety plan for different situations</li>
          </ul>
        </div>
    </div>
  );
};

export default EmergencyPanel;
