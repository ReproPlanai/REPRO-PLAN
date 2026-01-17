import React, { useEffect, useState } from 'react';
import { Bell, Database, ShieldCheck, User, Save } from 'lucide-react';

interface RoleSettingsPanelProps {
  role: string;
  title: string;
  subtitle: string;
}

type RoleSettings = {
  incidentAlerts: boolean;
  dailyDigest: boolean;
  weeklyReports: boolean;
  auditLogging: boolean;
  dataExport: boolean;
  autoLockMinutes: string;
  dataRetentionDays: string;
};

const RoleSettingsPanel: React.FC<RoleSettingsPanelProps> = ({ role, title, subtitle }) => {
  const storageKey = `repro-plan_role_settings_${role}`;
  const [settings, setSettings] = useState<RoleSettings>({
    incidentAlerts: true,
    dailyDigest: true,
    weeklyReports: false,
    auditLogging: true,
    dataExport: false,
    autoLockMinutes: '15',
    dataRetentionDays: '90'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as RoleSettings;
      setSettings({ ...settings, ...parsed });
    } catch {
      // Ignore invalid stored settings
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
            <div className="mt-3 text-xs sm:text-sm text-gray-700">
              <p><span className="font-medium">Role:</span> {role}</p>
              <p><span className="font-medium">Access scope:</span> Restricted to authorized {role.toLowerCase()} data only.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            {
              key: 'incidentAlerts',
              label: 'Real-time incident alerts',
              description: 'Instant notifications for urgent events'
            },
            {
              key: 'dailyDigest',
              label: 'Daily activity digest',
              description: 'Summary of key updates every day'
            },
            {
              key: 'weeklyReports',
              label: 'Weekly performance report',
              description: 'Weekly metrics and impact summary'
            }
          ].map((item) => (
            <label key={item.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
              <input
                type="checkbox"
                checked={settings[item.key as keyof RoleSettings] as boolean}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    [item.key]: e.target.checked
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Data & Compliance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-xs sm:text-sm text-gray-700">Auto-lock after</span>
            <select
              value={settings.autoLockMinutes}
              onChange={(e) => setSettings((prev) => ({ ...prev, autoLockMinutes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs sm:text-sm text-gray-700">Data retention</span>
            <select
              value={settings.dataRetentionDays}
              onChange={(e) => setSettings((prev) => ({ ...prev, dataRetentionDays: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
          </label>
          <label className="flex items-center justify-between sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable audit logging</p>
              <p className="text-xs text-gray-600">Track data access for compliance.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.auditLogging}
              onChange={(e) => setSettings((prev) => ({ ...prev, auditLogging: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Allow data export</p>
              <p className="text-xs text-gray-600">Exported data remains encrypted.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.dataExport}
              onChange={(e) => setSettings((prev) => ({ ...prev, dataExport: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Access Controls</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          Configure session timeouts, device restrictions, and NDA confirmations for this role in the security
          section below.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2"
        >
          <Save size={16} />
          <span>{saved ? 'Saved' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default RoleSettingsPanel;
