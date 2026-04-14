import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  AlertTriangle,
  Briefcase,
  MessageSquare,
  Settings,
  BarChart3,
  Activity,
  RefreshCw,
  ArrowLeft,
  LogOut,
  Power
} from 'lucide-react';
import { apiService } from '../services/api';
import AdminAdvancedControls from './admin/AdminAdvancedControls';
import UserManagement from './admin/UserManagement';
import StakeholderManagement from './admin/StakeholderManagement';
import SystemSettings from './admin/SystemSettings';
import AdminBottomNavigation from '../components/Layout/AdminBottomNavigation';
import ApiStatusModal from '../components/Admin/ApiStatusModal';

interface SystemStats {
  users: {
    total: number;
    verified: number;
    active: number;
  };
  stakeholders: {
    total: number;
    byRole: Record<string, number>;
  };
  alerts: {
    total: number;
    active: number;
    resolved: number;
    critical: number;
  };
  cases: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  messages: {
    total: number;
    unread: number;
  };
  responseMetrics: {
    averageResponseTime: number;
    totalAlertsToday: number;
  };
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings' | 'users' | 'stakeholders' | 'advanced'>('dashboard');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'degraded' | 'offline'>('online');
  const [lastUpdated, setLastUpdated] = useState<string>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await apiService.getAdminStats?.();
      if (statsRes?.success) {
        setStats(statsRes.stats);
        setApiStatus(statsRes.fromCache ? 'degraded' : 'online');
        setLastUpdated(statsRes.cachedAt);
        if (statsRes.fromCache) {
          setShowApiModal(true);
        }
      }
    } catch (err) {
      setError('Failed to load admin data');
      setApiStatus('offline');
      setShowApiModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setShowApiModal(false);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">System Administration & Management</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'stakeholders', label: 'Stakeholders', icon: Briefcase },
            { id: 'advanced', label: 'Advanced', icon: Power },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {!stats ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 mb-4">Unable to load dashboard statistics. Please check your connection and try again.</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Users</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{stats.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified</span>
                    <span className="font-bold text-green-600">{stats.users.verified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active (7d)</span>
                    <span className="font-bold text-blue-600">{stats.users.active}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Stakeholders</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{stats.stakeholders.total}</span>
                  </div>
                  {Object.entries(stats.stakeholders.byRole).map(([role, count]) => (
                    <div key={role} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{role.toLowerCase()}</span>
                      <span className="font-bold text-purple-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Alerts</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{stats.alerts.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active</span>
                    <span className="font-bold text-orange-600">{stats.alerts.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critical</span>
                    <span className="font-bold text-red-600">{stats.alerts.critical}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Cases</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{stats.cases.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Open</span>
                    <span className="font-bold text-orange-600">{stats.cases.open}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolved</span>
                    <span className="font-bold text-green-600">{stats.cases.resolved}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{stats.messages.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unread</span>
                    <span className="font-bold text-orange-600">{stats.messages.unread}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Response Metrics</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-bold text-gray-900">{stats.responseMetrics.averageResponseTime}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alerts Today</span>
                    <span className="font-bold text-blue-600">{stats.responseMetrics.totalAlertsToday}</span>
                  </div>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">System Analytics</h3>
            
            {/* User Growth Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-4">User Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.users.total}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.users.verified}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active (7d)</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.users.active}</p>
                </div>
              </div>
            </div>

            {/* Stakeholders by Role */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-4">Stakeholders by Role</h4>
              <div className="space-y-3">
                {Object.entries(stats.stakeholders.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{role.toLowerCase()}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${(count / stats.stakeholders.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-4">Alert Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.alerts.total}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.alerts.active}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.alerts.resolved}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.alerts.critical}</p>
                </div>
              </div>
            </div>

            {/* Cases Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-4">Cases Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cases.total}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.cases.open}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.cases.inProgress}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.cases.resolved}</p>
                </div>
              </div>
            </div>

            {/* Response Metrics */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-4">Response Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-teal-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Response Time</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.responseMetrics.averageResponseTime}m</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600">Alerts Today</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.responseMetrics.totalAlertsToday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UserManagement />}

        {/* Stakeholders Tab */}
        {activeTab === 'stakeholders' && <StakeholderManagement />}

        {/* Advanced Controls Tab */}
        {activeTab === 'advanced' && <AdminAdvancedControls />}

        {/* Settings Tab */}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
      
      <AdminBottomNavigation />
      
      <ApiStatusModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        lastUpdated={lastUpdated}
        apiStatus={apiStatus}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default AdminPanel;
