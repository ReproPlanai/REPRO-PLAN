import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Phone, 
  Video, 
  MapPin, 
  Users, 
  Bell, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Send,
  CheckCircle,
  X,
  Clock,
  Heart,
  Zap,
  Navigation,
  MessageCircle,
  FileText,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isOnline: boolean;
  lastSeen: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface SilentAlert {
  id: string;
  type: 'silent' | 'discreet' | 'covert';
  message: string;
  isActive: boolean;
  recipients: string[];
  timestamp: string;
}

interface GroupAlert {
  id: string;
  name: string;
  members: EmergencyContact[];
  message: string;
  isActive: boolean;
  timestamp: string;
}

interface AdvancedEmergencyFeaturesProps {
  userRole: string;
  onEmergencyTriggered: (type: string, data: any) => void;
  onSilentAlertSent: (alert: SilentAlert) => void;
  onGroupAlertSent: (alert: GroupAlert) => void;
}

const AdvancedEmergencyFeatures: React.FC<AdvancedEmergencyFeaturesProps> = ({
  userRole,
  onEmergencyTriggered,
  onSilentAlertSent,
  onGroupAlertSent
}) => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [silentAlerts, setSilentAlerts] = useState<SilentAlert[]>([]);
  const [groupAlerts, setGroupAlerts] = useState<GroupAlert[]>([]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Initialize emergency contacts
  useEffect(() => {
    const contacts: EmergencyContact[] = [
      {
        id: '1',
        name: 'Emergency Response Team',
        role: 'POLICE',
        phone: '+231-XXX-XXXX',
        email: 'emergency@liberia.gov.lr',
        isOnline: true,
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        priority: 'critical'
      },
      {
        id: '2',
        name: 'Medical Emergency',
        role: 'MEDICAL',
        phone: '+231-XXX-XXXX',
        email: 'medical@liberia.gov.lr',
        isOnline: true,
        lastSeen: new Date(Date.now() - 600000).toISOString(),
        priority: 'high'
      },
      {
        id: '3',
        name: 'Safe House Manager',
        role: 'SAFEHOUSE',
        phone: '+231-XXX-XXXX',
        email: 'safehouse@liberia.gov.lr',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000).toISOString(),
        priority: 'high'
      },
      {
        id: '4',
        name: 'NGO Coordinator',
        role: 'NGO',
        phone: '+231-XXX-XXXX',
        email: 'ngo@liberia.gov.lr',
        isOnline: true,
        lastSeen: new Date(Date.now() - 900000).toISOString(),
        priority: 'medium'
      }
    ];

    setEmergencyContacts(contacts);
  }, []);

  const triggerEmergency = (type: string) => {
    setIsEmergencyMode(true);
    onEmergencyTriggered(type, {
      timestamp: new Date().toISOString(),
      location: 'Current Location',
      userRole,
      type
    });

    // Auto-send to all critical contacts
    const criticalContacts = emergencyContacts.filter(contact => contact.priority === 'critical');
    criticalContacts.forEach(contact => {
      // Simulate sending emergency alert
      console.log(`Emergency alert sent to ${contact.name}`);
    });

    // Reset after 5 seconds
    setTimeout(() => setIsEmergencyMode(false), 5000);
  };

  const sendSilentAlert = () => {
    const silentAlert: SilentAlert = {
      id: Date.now().toString(),
      type: 'silent',
      message: emergencyMessage || 'Silent emergency assistance needed',
      isActive: true,
      recipients: selectedContacts,
      timestamp: new Date().toISOString()
    };

    setSilentAlerts(prev => [silentAlert, ...prev]);
    onSilentAlertSent(silentAlert);
    setEmergencyMessage('');
    setSelectedContacts([]);
  };

  const sendGroupAlert = () => {
    const selectedMembers = emergencyContacts.filter(contact => 
      selectedContacts.includes(contact.id)
    );

    const groupAlert: GroupAlert = {
      id: Date.now().toString(),
      name: `Emergency Group ${Date.now()}`,
      members: selectedMembers,
      message: emergencyMessage || 'Group emergency alert',
      isActive: true,
      timestamp: new Date().toISOString()
    };

    setGroupAlerts(prev => [groupAlert, ...prev]);
    onGroupAlertSent(groupAlert);
    setEmergencyMessage('');
    setSelectedContacts([]);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getPriorityColor = (priority: EmergencyContact['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'POLICE': return '👮';
      case 'MEDICAL': return '🏥';
      case 'SAFEHOUSE': return '🏠';
      case 'NGO': return '🤝';
      default: return '👤';
    }
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
    <div className="space-y-6">
      {/* Emergency Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Controls</h3>
          <p className="text-sm text-gray-600">Quick access to emergency features</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Panic Button */}
          <button
            onClick={() => triggerEmergency('panic')}
            disabled={isEmergencyMode}
            className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex flex-col items-center space-y-2"
          >
            <AlertTriangle className="w-8 h-8" />
            <span className="font-medium">Panic Button</span>
            <span className="text-xs">Immediate emergency</span>
          </button>

          {/* Silent Alert */}
          <button
            onClick={() => setIsSilentMode(!isSilentMode)}
            className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
              isSilentMode 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            <EyeOff className="w-8 h-8" />
            <span className="font-medium">Silent Alert</span>
            <span className="text-xs">Discreet emergency</span>
          </button>

          {/* Video Call */}
          <button
            onClick={() => triggerEmergency('video')}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex flex-col items-center space-y-2"
          >
            <Video className="w-8 h-8" />
            <span className="font-medium">Video Call</span>
            <span className="text-xs">Emergency video</span>
          </button>

          {/* Location Share */}
          <button
            onClick={() => setIsLocationSharing(!isLocationSharing)}
            className={`p-4 rounded-lg flex flex-col items-center space-y-2 ${
              isLocationSharing 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <MapPin className="w-8 h-8" />
            <span className="font-medium">Share Location</span>
            <span className="text-xs">Live location</span>
          </button>
        </div>

        {/* Emergency Status */}
        {isEmergencyMode && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Emergency Mode Active</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Emergency alerts have been sent to all critical contacts. Help is on the way.
            </p>
          </div>
        )}
      </div>

      {/* Silent Alert Interface */}
      {isSilentMode && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Silent Alert</h3>
            <button
              onClick={() => setIsSilentMode(false)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Message
              </label>
              <textarea
                value={emergencyMessage}
                onChange={(e) => setEmergencyMessage(e.target.value)}
                placeholder="Describe your emergency situation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Contacts
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {emergencyContacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getRoleIcon(contact.role)}</span>
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(contact.priority)}`}>
                          {contact.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${contact.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={sendSilentAlert}
                disabled={selectedContacts.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Silent Alert</span>
              </button>
              <button
                onClick={sendGroupAlert}
                disabled={selectedContacts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Send Group Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-500" />
            <span>Emergency Contacts</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getRoleIcon(contact.role)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{contact.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(contact.priority)}`}>
                        {contact.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{contact.phone}</div>
                    <div className="text-xs text-gray-500">
                      Last seen: {formatTimeAgo(contact.lastSeen)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${contact.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {contact.isOnline ? 'Online' : 'Offline'}
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            <span>Recent Alerts</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {silentAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <EyeOff className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Silent Alert</div>
                  <div className="text-sm text-gray-600 mb-1">{alert.message}</div>
                  <div className="text-xs text-gray-500">
                    Sent to {alert.recipients.length} contacts • {formatTimeAgo(alert.timestamp)}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Sent</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Network</div>
              <div className="text-xs text-gray-600">Connected</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Battery className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Battery</div>
              <div className="text-xs text-gray-600">85%</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Signal className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Signal</div>
              <div className="text-xs text-gray-600">Strong</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Location</div>
              <div className="text-xs text-gray-600">Enabled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedEmergencyFeatures;
