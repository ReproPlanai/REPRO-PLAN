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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await apiService.getAdminStats?.();
      if (statsRes?.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
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
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
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

            {/* Messages & Response Metrics */}
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
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
            <p className="text-gray-600">Analytics data visualization would be implemented here with charts and graphs showing trends over time.</p>
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
    </div>
  );
};

export default AdminPanel;
