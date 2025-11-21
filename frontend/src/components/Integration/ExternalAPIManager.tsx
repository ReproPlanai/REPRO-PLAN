import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Settings,
  RefreshCw,
  Shield,
  Database,
  Cloud,
  Smartphone,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  Users
} from 'lucide-react';

interface APIConnection {
  id: string;
  name: string;
  type: 'government' | 'emergency' | 'social' | 'weather' | 'health' | 'transport';
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: string;
  dataCount: number;
  isActive: boolean;
  apiKey: string;
  rateLimit: {
    requests: number;
    limit: number;
    resetTime: string;
  };
}

interface IntegrationData {
  source: string;
  type: string;
  data: any;
  timestamp: string;
  confidence: number;
  isVerified: boolean;
}

interface ExternalAPIManagerProps {
  userRole: string;
  onDataReceived: (data: IntegrationData) => void;
  onConnectionStatusChange: (connection: APIConnection) => void;
}

const ExternalAPIManager: React.FC<ExternalAPIManagerProps> = ({
  userRole,
  onDataReceived,
  onConnectionStatusChange
}) => {
  const [connections, setConnections] = useState<APIConnection[]>([]);
  const [integratedData, setIntegratedData] = useState<IntegrationData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  // Initialize API connections based on user role
  useEffect(() => {
    const roleBasedConnections: APIConnection[] = [
      {
        id: 'gov-1',
        name: 'Liberia Government Database',
        type: 'government',
        endpoint: 'https://api.liberia.gov.lr/v1',
        status: 'connected',
        lastSync: new Date(Date.now() - 300000).toISOString(),
        dataCount: 1247,
        isActive: true,
        apiKey: '***encrypted***',
        rateLimit: {
          requests: 450,
          limit: 500,
          resetTime: new Date(Date.now() + 3600000).toISOString()
        }
      },
      {
        id: 'emergency-1',
        name: 'Emergency Services API',
        type: 'emergency',
        endpoint: 'https://emergency.liberia.gov.lr/api',
        status: 'connected',
        lastSync: new Date(Date.now() - 120000).toISOString(),
        dataCount: 89,
        isActive: true,
        apiKey: '***encrypted***',
        rateLimit: {
          requests: 23,
          limit: 100,
          resetTime: new Date(Date.now() + 3600000).toISOString()
        }
      },
      {
        id: 'weather-1',
        name: 'Weather Service',
        type: 'weather',
        endpoint: 'https://api.weather.com/v1',
        status: 'connected',
        lastSync: new Date(Date.now() - 600000).toISOString(),
        dataCount: 156,
        isActive: true,
        apiKey: '***encrypted***',
        rateLimit: {
          requests: 78,
          limit: 1000,
          resetTime: new Date(Date.now() + 3600000).toISOString()
        }
      },
      {
        id: 'social-1',
        name: 'Social Media Monitor',
        type: 'social',
        endpoint: 'https://social-monitor.api.com',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 3600000).toISOString(),
        dataCount: 0,
        isActive: false,
        apiKey: '***encrypted***',
        rateLimit: {
          requests: 0,
          limit: 100,
          resetTime: new Date(Date.now() + 3600000).toISOString()
        }
      }
    ];

    setConnections(roleBasedConnections);
  }, [userRole]);

  // Simulate data integration
  useEffect(() => {
    const sampleData: IntegrationData[] = [
      {
        source: 'Liberia Government Database',
        type: 'citizen_record',
        data: {
          name: 'Anonymous Citizen',
          id: 'LIB-2024-001',
          status: 'verified',
          lastUpdate: new Date().toISOString()
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        confidence: 95,
        isVerified: true
      },
      {
        source: 'Weather Service',
        type: 'weather_alert',
        data: {
          alert: 'Heavy rainfall expected',
          severity: 'moderate',
          location: 'Monrovia',
          duration: '2-4 hours'
        },
        timestamp: new Date(Date.now() - 600000).toISOString(),
        confidence: 88,
        isVerified: true
      },
      {
        source: 'Emergency Services API',
        type: 'emergency_response',
        data: {
          incident: 'Traffic accident',
          location: 'Broad Street',
          responseTime: '4.2 minutes',
          status: 'resolved'
        },
        timestamp: new Date(Date.now() - 120000).toISOString(),
        confidence: 92,
        isVerified: true
      }
    ];

    setIntegratedData(sampleData);
  }, []);

  const syncConnection = async (connectionId: string) => {
    setIsSyncing(true);
    setSelectedConnection(connectionId);

    // Simulate API sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { 
            ...conn, 
            status: 'connected',
            lastSync: new Date().toISOString(),
            dataCount: conn.dataCount + Math.floor(Math.random() * 10)
          }
        : conn
    ));

    // Simulate receiving new data
    const newData: IntegrationData = {
      source: connections.find(c => c.id === connectionId)?.name || 'Unknown',
      type: 'sync_update',
      data: {
        records: Math.floor(Math.random() * 5),
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      confidence: 90,
      isVerified: true
    };

    setIntegratedData(prev => [newData, ...prev.slice(0, 9)]);
    onDataReceived(newData);

    setIsSyncing(false);
    setSelectedConnection(null);
  };

  const toggleConnection = (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, isActive: !conn.isActive }
        : conn
    ));
  };

  const getConnectionIcon = (type: APIConnection['type']) => {
    switch (type) {
      case 'government': return <Database className="w-5 h-5 text-blue-500" />;
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'social': return <Users className="w-5 h-5 text-purple-500" />;
      case 'weather': return <Cloud className="w-5 h-5 text-cyan-500" />;
      case 'health': return <Activity className="w-5 h-5 text-green-500" />;
      case 'transport': return <MapPin className="w-5 h-5 text-orange-500" />;
      default: return <Globe className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: APIConnection['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: APIConnection['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <X className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <WifiOff className="w-4 h-4" />;
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
      {/* API Connections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span>External API Connections</span>
            </h3>
            <button
              onClick={() => {
                connections.forEach(conn => {
                  if (conn.isActive) {
                    syncConnection(conn.id);
                  }
                });
              }}
              disabled={isSyncing}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync All</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {connections.map((connection) => (
            <div key={connection.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getConnectionIcon(connection.type)}
                  <div>
                    <div className="font-medium text-gray-900">{connection.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{connection.type}</div>
                    <div className="text-xs text-gray-400">{connection.endpoint}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(connection.status)}`}>
                        {getStatusIcon(connection.status)}
                        <span className="ml-1 capitalize">{connection.status}</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last sync: {formatTimeAgo(connection.lastSync)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Data: {connection.dataCount.toLocaleString()} records
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleConnection(connection.id)}
                      className={`px-3 py-1 text-xs rounded ${
                        connection.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {connection.isActive ? 'Active' : 'Inactive'}
                    </button>
                    
                    <button
                      onClick={() => syncConnection(connection.id)}
                      disabled={isSyncing || !connection.isActive}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${selectedConnection === connection.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rate Limit Info */}
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">API Rate Limit</span>
                  <span className="font-medium">
                    {connection.rateLimit.requests} / {connection.rateLimit.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      connection.rateLimit.requests / connection.rateLimit.limit > 0.8 
                        ? 'bg-red-500' 
                        : connection.rateLimit.requests / connection.rateLimit.limit > 0.6 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${(connection.rateLimit.requests / connection.rateLimit.limit) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Resets in {formatTimeAgo(connection.rateLimit.resetTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrated Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-green-500" />
            <span>Integrated Data</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {integratedData.map((data, index) => (
            <div key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Database className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{data.source}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {data.type.replace('_', ' ')}
                      </span>
                      {data.isVerified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Shield className="w-3 h-3" />
                          <span className="text-xs">Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {JSON.stringify(data.data, null, 2).substring(0, 100)}...
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Confidence: {data.confidence}%</span>
                      <span>•</span>
                      <span>{formatTimeAgo(data.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {data.confidence}%
                    </div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                {connections.filter(c => c.status === 'connected').length}
              </div>
              <div className="text-sm text-gray-600">Active Connections</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                {connections.reduce((sum, conn) => sum + conn.dataCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                {integratedData.length}
              </div>
              <div className="text-sm text-gray-600">Data Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalAPIManager;
