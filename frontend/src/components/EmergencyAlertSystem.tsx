import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Phone, 
  Clock,
  User,
  Shield,
  X,
  CheckCircle,
  Navigation
} from 'lucide-react';

interface EmergencyAlert {
  id: string;
  type: 'panic' | 'emergency' | 'sos' | 'distress';
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
  description: string;
  phoneNumber: string;
}

interface EmergencyAlertSystemProps {
  onAlertReceived: (alert: EmergencyAlert) => void;
  onLocationUpdate: (location: { lat: number; lng: number; address: string }) => void;
}

const EmergencyAlertSystem: React.FC<EmergencyAlertSystemProps> = ({
  onAlertReceived,
  onLocationUpdate
}) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<EmergencyAlert | null>(null);
  const [soundPlaying, setSoundPlaying] = useState(false);

  // Emergency alert sound
  const playEmergencySound = useCallback(() => {
    if (!isSoundEnabled || soundPlaying) return;
    
    setSoundPlaying(true);
    
    // Create emergency sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create siren-like sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
    
    setTimeout(() => setSoundPlaying(false), 1000);
  }, [isSoundEnabled, soundPlaying]);

  // Simulate receiving emergency alerts
  useEffect(() => {
    const simulateAlerts = () => {
      const alertTypes: EmergencyAlert['type'][] = ['panic', 'emergency', 'sos', 'distress'];
      const priorities: EmergencyAlert['priority'][] = ['medium', 'high', 'critical'];
      
      const newAlert: EmergencyAlert = {
        id: `alert_${Date.now()}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userName: `Anonymous User ${Math.floor(Math.random() * 100)}`,
        location: {
          lat: 6.3000 + (Math.random() - 0.5) * 0.1, // Liberia coordinates
          lng: -10.8000 + (Math.random() - 0.5) * 0.1,
          address: `Location ${Math.floor(Math.random() * 100)}`
        },
        timestamp: new Date().toISOString(),
        status: 'active',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        description: 'Emergency assistance requested',
        phoneNumber: `+231${Math.floor(Math.random() * 90000000) + 10000000}`
      };

      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      setCurrentAlert(newAlert);
      setIsAlertVisible(true);
      
      // Play emergency sound
      playEmergencySound();
      
      // Notify parent component
      onAlertReceived(newAlert);
      onLocationUpdate(newAlert.location);
    };

    // Simulate alerts every 30-60 seconds for demo
    const interval = setInterval(simulateAlerts, 30000 + Math.random() * 30000);
    
    return () => clearInterval(interval);
  }, [onAlertReceived, onLocationUpdate, playEmergencySound]);

  const handleAlertResponse = (alertId: string, action: 'accept' | 'resolve') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'accept' ? 'responding' : 'resolved' }
        : alert
    ));
    
    if (action === 'resolve') {
      setIsAlertVisible(false);
      setCurrentAlert(null);
    }
  };

  const getAlertIcon = (type: EmergencyAlert['type']) => {
    switch (type) {
      case 'panic': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'emergency': return <Shield className="w-6 h-6 text-orange-500" />;
      case 'sos': return <Navigation className="w-6 h-6 text-blue-500" />;
      case 'distress': return <User className="w-6 h-6 text-purple-500" />;
      default: return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
  };

  const getPriorityColor = (priority: EmergencyAlert['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: EmergencyAlert['status']) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'responding': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Emergency Alert Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Emergency Alert System</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isSoundEnabled 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <span className="text-sm text-gray-600">
              {isSoundEnabled ? 'Sound On' : 'Sound Off'}
            </span>
          </div>
        </div>

        {/* Active Alerts Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-800">
                Active Alerts: {alerts.filter(a => a.status === 'active').length}
              </span>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-800">
                Responding: {alerts.filter(a => a.status === 'responding').length}
              </span>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Resolved: {alerts.filter(a => a.status === 'resolved').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Emergency Alert Modal */}
      {isAlertVisible && currentAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-pulse">
            <div className="bg-red-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(currentAlert.type)}
                  <div>
                    <h3 className="text-lg font-semibold">EMERGENCY ALERT</h3>
                    <p className="text-sm opacity-90">
                      {currentAlert.type.toUpperCase()} - {currentAlert.priority.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAlertVisible(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{currentAlert.userName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{currentAlert.location.address}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{currentAlert.phoneNumber}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(currentAlert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{currentAlert.description}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAlertResponse(currentAlert.id, 'accept')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Accept Alert</span>
                </button>
                <button
                  onClick={() => handleAlertResponse(currentAlert.id, 'resolve')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Resolve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Emergency Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(alert.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getAlertIcon(alert.type)}
                      <span className="font-medium text-gray-900">{alert.userName}</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin size={12} />
                        <span>{alert.location.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAlertResponse(alert.id, 'accept')}
                    disabled={alert.status !== 'active'}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleAlertResponse(alert.id, 'resolve')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlertSystem;
