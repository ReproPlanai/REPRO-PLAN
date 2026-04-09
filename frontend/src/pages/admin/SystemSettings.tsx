import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Mail, 
  Settings as SettingsIcon,
  Server,
  Lock,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import PageContainer from '../../components/Layout/PageContainer';
import { apiService } from '../../services/api';

const defaultSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    emergencyAlerts: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    ipWhitelist: false
  },
  database: {
    backupFrequency: 'daily',
    retentionDays: 90,
    autoBackup: true
  },
  api: {
    rateLimit: 100,
    timeout: 30,
    corsEnabled: true
  },
  email: {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    fromEmail: 'noreply@reproplan.org',
    fromName: 'REPRO PLAN'
  }
};

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getSystemSettings() as { success: boolean; settings?: typeof defaultSettings };
        if (res.success && res.settings) {
          setSettings({ ...defaultSettings, ...res.settings });
        }
      } catch (err) {
        setLoadError('Failed to load settings');
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setLoadError(null);
    try {
      const res = await apiService.updateSystemSettings(settings) as { success: boolean };
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setLoadError('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setLoadError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api', label: 'API', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail }
  ];

  return (
    <PageContainer gradient>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 shadow-2xl shadow-blue-500/20 mb-6">
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
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">System Settings</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Configure system-wide settings, security policies, and service integrations.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-shrink-0 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-blue-600 hover:bg-white/90'
              } disabled:opacity-50`}
            >
              {saved ? <CheckCircle size={16} /> : <Save size={16} />}
              <span>{saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Server, title: 'API Status', desc: 'Active', color: 'from-green-500 to-emerald-500' },
            { icon: Database, title: 'Database', desc: settings.database.backupFrequency, color: 'from-blue-500 to-cyan-500' },
            { icon: Lock, title: 'Security', desc: settings.security.passwordPolicy, color: 'from-purple-500 to-indigo-500' },
            { icon: Shield, title: '2FA', desc: settings.security.twoFactorAuth ? 'Enabled' : 'Disabled', color: 'from-orange-500 to-red-500' }
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

        {loadError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{loadError}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-1 mb-6">
          <div className="flex flex-wrap gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">Configure alert and notification preferences</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive system alerts via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Send push notifications to users' },
                  { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Critical emergency notifications' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                      onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                  <p className="text-sm text-gray-500">Manage authentication and access controls</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Require 2FA for admin access</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weak">Weak</option>
                      <option value="medium">Medium</option>
                      <option value="strong">Strong</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                  <p className="text-sm text-gray-500">Backup and retention policies</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                    <select
                      value={settings.database.backupFrequency}
                      onChange={(e) => updateSetting('database', 'backupFrequency', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                    <input
                      type="number"
                      value={settings.database.retentionDays}
                      onChange={(e) => updateSetting('database', 'retentionDays', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Auto Backup</p>
                    <p className="text-xs text-gray-500">Automatically backup database</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.database.autoBackup}
                    onChange={(e) => updateSetting('database', 'autoBackup', e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">API Settings</h3>
                  <p className="text-sm text-gray-500">Rate limiting and CORS configuration</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/min)</label>
                    <input
                      type="number"
                      value={settings.api.rateLimit}
                      onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
                    <input
                      type="number"
                      value={settings.api.timeout}
                      onChange={(e) => updateSetting('api', 'timeout', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">CORS Enabled</p>
                    <p className="text-xs text-gray-500">Allow cross-origin requests</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.api.corsEnabled}
                    onChange={(e) => updateSetting('api', 'corsEnabled', e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
                  <p className="text-sm text-gray-500">SMTP server settings for outgoing emails</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default SystemSettings;

