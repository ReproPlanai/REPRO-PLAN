import React, { useState } from 'react';
import { 
  Power,
  Ban,
  FileText,
  AlertTriangle,
  RefreshCw,
  Settings as SettingsIcon,
  Sparkles,
  Users,
  Activity,
  Clock,
  Download,
  Trash2
} from 'lucide-react';
import PageContainer from '../../components/Layout/PageContainer';
import { AdminCard, AdminButton, AdminBadge } from '../../components/Admin';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

interface SystemStatus {
  status: 'online' | 'maintenance' | 'shutdown';
  uptime: number;
  activeUsers: number;
  lastBackup: string;
}

const AdminAdvancedControls: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'online',
    uptime: 99.9,
    activeUsers: 1247,
    lastBackup: new Date().toISOString()
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      action: 'User Login',
      user: 'admin@reproplan.org',
      role: 'admin',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      details: 'Successful login from IP 192.168.1.100',
      severity: 'low'
    },
    {
      id: '2',
      action: 'Settings Updated',
      user: 'admin@reproplan.org',
      role: 'admin',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      details: 'Modified system security settings',
      severity: 'medium'
    },
    {
      id: '3',
      action: 'Role Disabled',
      user: 'admin@reproplan.org',
      role: 'admin',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      details: 'Disabled stakeholder account: stakeholder@example.org',
      severity: 'high'
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [confirmShutdown, setConfirmShutdown] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmClearLogs, setConfirmClearLogs] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const handleShutdown = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSystemStatus(prev => ({ ...prev, status: 'shutdown' }));
      setConfirmShutdown(false);
    } catch (error) {
      console.error('Failed to shutdown system:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenance = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSystemStatus(prev => ({ ...prev, status: 'maintenance' }));
    } catch (error) {
      console.error('Failed to enter maintenance mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableRole = async (role: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfirmDisable(false);
      setSelectedRole('');
      
      // Add audit log
      const newLog: AuditLog = {
        id: Date.now().toString(),
        action: 'Role Disabled',
        user: 'admin@reproplan.org',
        role: 'admin',
        timestamp: new Date().toISOString(),
        details: `Disabled ${role} role temporarily`,
        severity: 'high'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Failed to disable role:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = () => {
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAuditLogs = () => {
    setConfirmClearLogs(true);
  };

  const confirmClearLogsAction = () => {
    setAuditLogs([]);
    setConfirmClearLogs(false);
  };

  const filteredLogs = logFilter === 'all' 
    ? auditLogs 
    : auditLogs.filter(log => log.severity === logFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'from-green-500 to-emerald-500';
      case 'maintenance': return 'from-yellow-500 to-orange-500';
      case 'shutdown': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <PageContainer gradient>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-orange-600 to-pink-600 p-6 sm:p-8 shadow-2xl shadow-red-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Admin</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Advanced Controls</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                System management, role controls, and audit logs for administrators.
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Activity, title: 'System Status', desc: systemStatus.status, color: getStatusColor(systemStatus.status) },
            { icon: Clock, title: 'Uptime', desc: `${systemStatus.uptime}%`, color: 'from-green-500 to-emerald-500' },
            { icon: Users, title: 'Active Users', desc: systemStatus.activeUsers.toString(), color: 'from-blue-500 to-cyan-500' },
            { icon: RefreshCw, title: 'Last Backup', desc: new Date(systemStatus.lastBackup).toLocaleTimeString(), color: 'from-purple-500 to-indigo-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{title}</p>
                <p className="text-xs text-gray-500 capitalize">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Control Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* System Controls */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-xl">
                <Power className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Controls</h3>
                <p className="text-sm text-gray-500">Manage system state and operations</p>
              </div>
            </div>
            <div className="space-y-3">
              <AdminButton
                onClick={handleMaintenance}
                disabled={loading || systemStatus.status !== 'online'}
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
                fullWidth
              >
                Enter Maintenance Mode
              </AdminButton>
              <AdminButton
                onClick={() => setConfirmShutdown(true)}
                disabled={loading || systemStatus.status === 'shutdown'}
                variant="danger"
                icon={<Power className="w-4 h-4" />}
                fullWidth
              >
                Shutdown System
              </AdminButton>
            </div>
          </div>

          {/* Role Controls */}
          <AdminCard padding="md" shadow="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Ban className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Role Controls</h3>
                <p className="text-sm text-gray-500">Temporarily disable user roles</p>
              </div>
            </div>
            <div className="space-y-3">
              {['admin', 'super_admin', 'stakeholder', 'healthcare_provider', 'mentor'].map((role) => (
                <AdminButton
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setConfirmDisable(true);
                  }}
                  disabled={loading}
                  variant="secondary"
                  icon={<Ban className="w-4 h-4" />}
                  fullWidth
                >
                  Disable {role.replace('_', ' ')} Role
                </AdminButton>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Audit Logs */}
        <AdminCard padding="md" shadow="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-500">System activity and security events</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                onClick={exportAuditLogs}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-medium text-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={clearAuditLogs}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-medium text-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <AdminBadge variant={log.severity === 'high' ? 'danger' : log.severity === 'medium' ? 'warning' : 'success'}>
                    {log.severity.toUpperCase()}
                  </AdminBadge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm">{log.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                    <p className="text-xs text-gray-500">
                      By {log.user} ({log.role})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        {/* Shutdown Confirmation Modal */}
        {confirmShutdown && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Shutdown System</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                This will shut down the entire system and make it unavailable to all users. 
                Are you sure you want to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmShutdown(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShutdown}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Shutting down...' : 'Shutdown'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disable Role Confirmation Modal */}
        {confirmDisable && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Ban className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Disable Role</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                This will temporarily disable the <strong>{selectedRole.replace('_', ' ')}</strong> role. 
                Users with this role will lose access until re-enabled. Continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirmDisable(false);
                    setSelectedRole('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDisableRole(selectedRole)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Disabling...' : 'Disable'}
                </button>
              </div>
            </div>
          </div>
        )}
      {/* Clear Logs Confirmation Modal */}
        {confirmClearLogs && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Clear Audit Logs</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                This will permanently delete all audit logs. This action cannot be undone.
                Are you sure you want to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmClearLogs(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearLogsAction}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Clear Logs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default AdminAdvancedControls;
