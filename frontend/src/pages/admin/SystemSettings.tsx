import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Database, Globe, Mail } from 'lucide-react';

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

  useEffect(() => {
    const load = async () => {
      try {
        const { apiService } = await import('../../services/api');
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
      const { apiService } = await import('../../services/api');
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

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {loadError}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          <Save size={16} />
          <span>{saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="space-y-4">
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700">Email Alerts</span>
            <input
              type="checkbox"
              checked={settings.notifications.emailAlerts}
              onChange={(e) => updateSetting('notifications', 'emailAlerts', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700">Push Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700">Emergency Alerts</span>
            <input
              type="checkbox"
              checked={settings.notifications.emergencyAlerts}
              onChange={(e) => updateSetting('notifications', 'emergencyAlerts', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>
        <div className="space-y-4">
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700">Two-Factor Authentication</span>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Password Policy</label>
            <select
              value={settings.security.passwordPolicy}
              onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="weak">Weak</option>
              <option value="medium">Medium</option>
              <option value="strong">Strong</option>
            </select>
          </div>
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700">IP Whitelist</span>
            <input
              type="checkbox"
              checked={settings.security.ipWhitelist}
              onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Database */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="text-green-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Database</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Backup Frequency</label>
            <select
              value={settings.database.backupFrequency}
              onChange={(e) => updateSetting('database', 'backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Retention Period (days)</label>
            <input
              type="number"
              value={settings.database.retentionDays}
              onChange={(e) => updateSetting('database', 'retentionDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700">Auto Backup</span>
            <input
              type="checkbox"
              checked={settings.database.autoBackup}
              onChange={(e) => updateSetting('database', 'autoBackup', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="text-purple-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">API Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Rate Limit (requests per minute)</label>
            <input
              type="number"
              value={settings.api.rateLimit}
              onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Timeout (seconds)</label>
            <input
              type="number"
              value={settings.api.timeout}
              onChange={(e) => updateSetting('api', 'timeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-700">CORS Enabled</span>
            <input
              type="checkbox"
              checked={settings.api.corsEnabled}
              onChange={(e) => updateSetting('api', 'corsEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="text-orange-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">SMTP Host</label>
            <input
              type="text"
              value={settings.email.smtpHost}
              onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">SMTP Port</label>
            <input
              type="number"
              value={settings.email.smtpPort}
              onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">From Email</label>
            <input
              type="email"
              value={settings.email.fromEmail}
              onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">From Name</label>
            <input
              type="text"
              value={settings.email.fromName}
              onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

