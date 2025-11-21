import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Smartphone, 
  Wifi, 
  WifiOff,
  Battery,
  BatteryLow,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Video
} from 'lucide-react';

interface NotificationSettings {
  emergencyAlerts: boolean;
  caseUpdates: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  priorityLevels: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
}

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'case' | 'system' | 'reminder';
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  data?: any;
}

interface DeviceStatus {
  isOnline: boolean;
  batteryLevel: number;
  isCharging: boolean;
  networkType: 'wifi' | 'cellular' | 'offline';
  locationEnabled: boolean;
  notificationsEnabled: boolean;
  lastSync: string;
}

interface PushNotificationManagerProps {
  userRole: string;
  onNotificationClick: (notification: PushNotification) => void;
  onEmergencyAction: (action: string, data: any) => void;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  userRole,
  onNotificationClick,
  onEmergencyAction
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emergencyAlerts: true,
    caseUpdates: true,
    systemNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '06:00'
    },
    priorityLevels: {
      critical: true,
      high: true,
      medium: true,
      low: false
    }
  });
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    isOnline: true,
    batteryLevel: 85,
    isCharging: false,
    networkType: 'wifi',
    locationEnabled: true,
    notificationsEnabled: true,
    lastSync: new Date().toISOString()
  });
  const [isQuietMode, setIsQuietMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate push notifications
  useEffect(() => {
    const sampleNotifications: PushNotification[] = [
      {
        id: '1',
        title: '🚨 Emergency Alert',
        message: 'Panic button activated in Monrovia Central. Immediate response required.',
        type: 'emergency',
        priority: 'critical',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isRead: false,
        actionRequired: true,
        data: { location: 'Monrovia Central', userId: 'user_123' }
      },
      {
        id: '2',
        title: '📋 Case Update',
        message: 'Case CASE-2024-001 status changed to "Under Investigation"',
        type: 'case',
        priority: 'medium',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isRead: false,
        actionRequired: false,
        data: { caseId: 'CASE-2024-001' }
      },
      {
        id: '3',
        title: '🔧 System Maintenance',
        message: 'Scheduled maintenance will begin in 30 minutes. System may be temporarily unavailable.',
        type: 'system',
        priority: 'high',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        isRead: true,
        actionRequired: false
      },
      {
        id: '4',
        title: '⏰ Reminder',
        message: 'Daily report due in 2 hours. Please submit your case updates.',
        type: 'reminder',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        isRead: true,
        actionRequired: true,
        data: { reportType: 'daily', dueTime: '17:00' }
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
  }, []);

  // Simulate device status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceStatus(prev => ({
        ...prev,
        batteryLevel: Math.max(0, prev.batteryLevel - Math.random() * 2),
        lastSync: new Date().toISOString()
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (notification: PushNotification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    onNotificationClick(notification);
  };

  const handleEmergencyAction = (action: string, notification: PushNotification) => {
    onEmergencyAction(action, notification.data);
    // Mark as read after action
    handleNotificationClick(notification);
  };

  const toggleQuietMode = () => {
    setIsQuietMode(!isQuietMode);
    if (!isQuietMode) {
      // Disable all non-critical notifications
      setSettings(prev => ({
        ...prev,
        priorityLevels: {
          critical: true,
          high: false,
          medium: false,
          low: false
        }
      }));
    } else {
      // Restore previous settings
      setSettings(prev => ({
        ...prev,
        priorityLevels: {
          critical: true,
          high: true,
          medium: true,
          low: false
        }
      }));
    }
  };

  const getPriorityColor = (priority: PushNotification['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'case': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      case 'reminder': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
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
      {/* Device Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <span>Device Status</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleQuietMode}
              className={`p-2 rounded-lg transition-colors ${
                isQuietMode 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isQuietMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <span className="text-sm text-gray-600">
              {isQuietMode ? 'Quiet Mode' : 'Normal Mode'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            {deviceStatus.isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {deviceStatus.isOnline ? 'Online' : 'Offline'}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {deviceStatus.networkType}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deviceStatus.batteryLevel < 20 ? (
              <BatteryLow className="w-5 h-5 text-red-500" />
            ) : (
              <Battery className="w-5 h-5 text-green-500" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {deviceStatus.batteryLevel}%
              </div>
              <div className="text-xs text-gray-500">
                {deviceStatus.isCharging ? 'Charging' : 'Battery'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deviceStatus.locationEnabled ? (
              <MapPin className="w-5 h-5 text-green-500" />
            ) : (
              <MapPin className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {deviceStatus.locationEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-xs text-gray-500">Location</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deviceStatus.notificationsEnabled ? (
              <Bell className="w-5 h-5 text-green-500" />
            ) : (
              <BellOff className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {deviceStatus.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-xs text-gray-500">Notifications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <span>Push Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  
                  {notification.actionRequired && (
                    <div className="flex items-center space-x-2">
                      {notification.type === 'emergency' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmergencyAction('call', notification);
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center space-x-1"
                          >
                            <Phone size={12} />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmergencyAction('video', notification);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center space-x-1"
                          >
                            <Video size={12} />
                            <span>Video</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmergencyAction('navigate', notification);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center space-x-1"
                          >
                            <MapPin size={12} />
                            <span>Navigate</span>
                          </button>
                        </>
                      )}
                      
                      {notification.type === 'reminder' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmergencyAction('complete', notification);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Emergency Alerts</div>
              <div className="text-sm text-gray-600">Critical emergency notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emergencyAlerts}
                onChange={(e) => setSettings(prev => ({ ...prev, emergencyAlerts: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Sound Notifications</div>
              <div className="text-sm text-gray-600">Play sound for notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Vibration</div>
              <div className="text-sm text-gray-600">Vibrate for notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, vibrationEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationManager;
