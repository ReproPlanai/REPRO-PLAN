import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Shield, 
  Lock, 
  Unlock, 
  Archive, 
  Trash2, 
  Eye, 
  EyeOff, 
  Settings, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  Clock, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive as ArchiveIcon,
  RotateCcw,
  Zap,
  Activity,
  TrendingUp
} from 'lucide-react';

interface CloudBackup {
  id: string;
  name: string;
  type: 'automatic' | 'manual' | 'scheduled';
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  size: number;
  timestamp: string;
  duration: number;
  filesCount: number;
  encryption: boolean;
}

interface DataRetention {
  id: string;
  category: string;
  retentionPeriod: number; // in days
  currentAge: number;
  action: 'keep' | 'archive' | 'delete';
  lastAction: string;
  nextAction: string;
}

interface CloudStorage {
  total: number;
  used: number;
  available: number;
  encrypted: number;
  lastSync: string;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
}

interface CloudDataManagerProps {
  userRole: string;
  onBackupComplete: (backup: CloudBackup) => void;
  onDataRestore: (data: any) => void;
  onRetentionPolicyUpdate: (policy: DataRetention) => void;
}

const CloudDataManager: React.FC<CloudDataManagerProps> = ({
  userRole,
  onBackupComplete,
  onDataRestore,
  onRetentionPolicyUpdate
}) => {
  const [cloudStorage, setCloudStorage] = useState<CloudStorage>({
    total: 100, // GB
    used: 45,
    available: 55,
    encrypted: 40,
    lastSync: new Date(Date.now() - 300000).toISOString(),
    syncStatus: 'synced'
  });

  const [backups, setBackups] = useState<CloudBackup[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetention[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [backupProgress, setBackupProgress] = useState(0);

  // Initialize data
  useEffect(() => {
    const sampleBackups: CloudBackup[] = [
      {
        id: '1',
        name: 'Daily Backup - Jan 15',
        type: 'automatic',
        status: 'completed',
        size: 2.5,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        duration: 180,
        filesCount: 1247,
        encryption: true
      },
      {
        id: '2',
        name: 'Emergency Backup - Jan 14',
        type: 'manual',
        status: 'completed',
        size: 1.8,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        duration: 120,
        filesCount: 892,
        encryption: true
      },
      {
        id: '3',
        name: 'Weekly Backup - Jan 13',
        type: 'scheduled',
        status: 'in_progress',
        size: 0,
        timestamp: new Date().toISOString(),
        duration: 0,
        filesCount: 0,
        encryption: true
      }
    ];

    const sampleRetentionPolicies: DataRetention[] = [
      {
        id: '1',
        category: 'Emergency Records',
        retentionPeriod: 2555, // 7 years
        currentAge: 365,
        action: 'keep',
        lastAction: new Date(Date.now() - 86400000).toISOString(),
        nextAction: new Date(Date.now() + 2190000000).toISOString()
      },
      {
        id: '2',
        category: 'Case Files',
        retentionPeriod: 1095, // 3 years
        currentAge: 180,
        action: 'keep',
        lastAction: new Date(Date.now() - 86400000).toISOString(),
        nextAction: new Date(Date.now() + 274000000).toISOString()
      },
      {
        id: '3',
        category: 'System Logs',
        retentionPeriod: 90,
        currentAge: 85,
        action: 'archive',
        lastAction: new Date(Date.now() - 86400000).toISOString(),
        nextAction: new Date(Date.now() + 432000000).toISOString()
      }
    ];

    setBackups(sampleBackups);
    setRetentionPolicies(sampleRetentionPolicies);
  }, []);

  const startBackup = async (type: 'automatic' | 'manual' | 'scheduled') => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          
          const newBackup: CloudBackup = {
            id: Date.now().toString(),
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup - ${new Date().toLocaleDateString()}`,
            type,
            status: 'completed',
            size: Math.random() * 5 + 1,
            timestamp: new Date().toISOString(),
            duration: Math.floor(Math.random() * 300) + 60,
            filesCount: Math.floor(Math.random() * 2000) + 500,
            encryption: true
          };

          setBackups(prev => [newBackup, ...prev]);
          onBackupComplete(newBackup);
          
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const startRestore = async (backupId: string) => {
    setIsRestoring(true);
    
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const backup = backups.find(b => b.id === backupId);
    if (backup) {
      onDataRestore(backup);
    }
    
    setIsRestoring(false);
  };

  const updateRetentionPolicy = (policyId: string, action: DataRetention['action']) => {
    setRetentionPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { 
            ...policy, 
            action,
            lastAction: new Date().toISOString(),
            nextAction: new Date(Date.now() + 86400000).toISOString()
          }
        : policy
    ));

    const updatedPolicy = retentionPolicies.find(p => p.id === policyId);
    if (updatedPolicy) {
      onRetentionPolicyUpdate({ ...updatedPolicy, action });
    }
  };

  const formatFileSize = (sizeInGB: number) => {
    if (sizeInGB < 1) {
      return `${(sizeInGB * 1024).toFixed(1)} MB`;
    }
    return `${sizeInGB.toFixed(1)} GB`;
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

  const getStatusColor = (status: CloudBackup['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: CloudBackup['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cloud Storage Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            <span>Cloud Storage</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              cloudStorage.syncStatus === 'synced' ? 'bg-green-500' :
              cloudStorage.syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
              cloudStorage.syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm text-gray-600 capitalize">{cloudStorage.syncStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Storage Used</div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatFileSize(cloudStorage.used)} / {formatFileSize(cloudStorage.total)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(cloudStorage.used / cloudStorage.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Encrypted Data</div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatFileSize(cloudStorage.encrypted)}
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">End-to-end encrypted</span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Last Sync</div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatTimeAgo(cloudStorage.lastSync)}
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-500" />
              <span>Backup Management</span>
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => startBackup('manual')}
                disabled={isBackingUp}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Backup Now</span>
              </button>
              <button
                onClick={() => startBackup('scheduled')}
                disabled={isBackingUp}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Backup Progress */}
        {isBackingUp && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <div className="flex-1">
                <div className="font-medium text-blue-900">Backup in Progress</div>
                <div className="text-sm text-blue-700">Please don't close this window</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${backupProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-900">{backupProgress}%</div>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {backups.map((backup) => (
            <div key={backup.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Archive className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{backup.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatFileSize(backup.size)} • {backup.filesCount.toLocaleString()} files
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(backup.timestamp)} • {backup.duration}s duration
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                      <span className="ml-1 capitalize">{backup.status.replace('_', ' ')}</span>
                    </span>
                    {backup.encryption && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Lock className="w-3 h-3" />
                        <span className="text-xs">Encrypted</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => startRestore(backup.id)}
                      disabled={isRestoring || backup.status !== 'completed'}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                      title="Restore Backup"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Backup">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Retention Policies */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <ArchiveIcon className="w-5 h-5 text-orange-500" />
            <span>Data Retention Policies</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {retentionPolicies.map((policy) => (
            <div key={policy.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{policy.category}</div>
                  <div className="text-sm text-gray-600">
                    Retention: {policy.retentionPeriod} days • Current age: {policy.currentAge} days
                  </div>
                  <div className="text-xs text-gray-500">
                    Next action: {formatTimeAgo(policy.nextAction)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round(((policy.retentionPeriod - policy.currentAge) / policy.retentionPeriod) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Remaining</div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateRetentionPolicy(policy.id, 'keep')}
                      className={`px-2 py-1 text-xs rounded ${
                        policy.action === 'keep' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      Keep
                    </button>
                    <button
                      onClick={() => updateRetentionPolicy(policy.id, 'archive')}
                      className={`px-2 py-1 text-xs rounded ${
                        policy.action === 'archive' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                      }`}
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => updateRetentionPolicy(policy.id, 'delete')}
                      className={`px-2 py-1 text-xs rounded ${
                        policy.action === 'delete' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                {backups.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Successful Backups</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                {Math.round((cloudStorage.encrypted / cloudStorage.used) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Data Encrypted</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                {retentionPolicies.length}
              </div>
              <div className="text-sm text-gray-600">Retention Policies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudDataManager;
