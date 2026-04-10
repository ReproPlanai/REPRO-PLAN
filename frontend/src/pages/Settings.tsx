import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Info, 
  HelpCircle, 
  LogOut,
  Trash2,
  Download,
  Eye,
  EyeOff,
  QrCode,
  X,
  Sparkles,
  Globe,
  Bell,
  Lock
} from 'lucide-react';
import { offlineStorage } from '../utils/offlineStorage';
import { secretCodeManager } from '../utils/secretCode';
import QRCodeGenerator from '../components/QRCode/QRCodeGenerator';
import SecurityPreferences from '../components/Settings/SecurityPreferences';
import PageContainer from '../components/Layout/PageContainer';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0 });
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await offlineStorage.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleDeleteAllData = async () => {
    try {
      await offlineStorage.clearAll();
      alert('All data has been deleted successfully.');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('Failed to delete data. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const allData = await offlineStorage.getAllData();
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: allData
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repro-plan-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSecretCode = () => {
    const code = secretCodeManager.getSecretCode();
    return code ? code.code : 'No code found';
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-2xl shadow-primary-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Preferences</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Settings</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Manage your account preferences, privacy settings, and data options.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Globe, title: i18n.language.toUpperCase(), desc: 'Language', color: 'from-blue-500 to-cyan-500' },
            { icon: Lock, title: 'Secure', desc: 'Privacy', color: 'from-green-500 to-emerald-500' },
            { icon: Database, title: formatBytes(storageInfo.used), desc: 'Storage Used', color: 'from-purple-500 to-indigo-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={desc} className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-1 mb-6">
          <div className="flex flex-wrap gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700'
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
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary-600" />
                  Language & Region
                </h3>
                <select
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English</option>
                  <option value="fr">French (Français)</option>
                  <option value="tw">Twi</option>
                  <option value="ga">Ga</option>
                  <option value="ewe">Ewe</option>
                  <option value="dag">Dagbani</option>
                  <option value="fante">Fante</option>
                  <option value="kpelle">Kpelle</option>
                  <option value="bassa">Bassa</option>
                  <option value="kru">Kru</option>
                  <option value="vai">Vai</option>
                </select>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary-600" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  {['Health Reminders', 'Emergency Alerts', 'Mentorship Updates'].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item}</p>
                        <p className="text-xs text-gray-500">Get notified about {item.toLowerCase()}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Secret Code */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Secret Code</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Your Secret Code</p>
                      <p className="text-xs text-gray-500">Keep this code safe and private</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono text-sm">
                        {showSecretCode ? getSecretCode() : '••••••••'}
                      </code>
                      <button
                        onClick={() => setShowSecretCode(!showSecretCode)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                      >
                        {showSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Privacy */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/60 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Your Data is Protected</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• All data is stored locally on your device</li>
                      <li>• No personal information is collected</li>
                      <li>• Anonymous usage analytics only</li>
                      <li>• No tracking or profiling</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <QrCode className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">QR Code Verification</h4>
                    <p className="text-blue-800 text-sm mb-4">
                      Generate a QR code that stakeholders can scan to verify your account while keeping your identity anonymous.
                    </p>
                    <button
                      onClick={() => setShowQRGenerator(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Generate QR Code
                    </button>
                  </div>
                </div>
              </div>

              <SecurityPreferences role="USER" />
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Storage */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Storage Information</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Storage Used</span>
                    <span className="text-sm text-gray-500">{formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(storageInfo.used / storageInfo.available) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6 space-y-3">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Data Management</h3>
                <button
                  onClick={handleExportData}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export All Data
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-medium text-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border border-primary-200/60 p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">REPRO PLAN</h3>
                <p className="text-primary-700 font-medium mb-4">Version 1.0.0</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  An anonymous, inclusive, and scalable SRHR platform for youth. 
                  Built with privacy-first principles and designed to work offline.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Anonymous SRHR chatbot',
                    'Clinic and service finder', 
                    'Health and cycle tracker',
                    'Interactive educational games',
                    'Emergency support',
                    'Peer mentorship system'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6 space-y-3">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Support</h3>
                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help & FAQ
                </button>
                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" />
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={onLogout}
            className="px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-medium text-red-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete All Data</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              This will permanently delete all your data including chat history, health tracking, and settings. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">QR Code Generator</h3>
              <button
                onClick={() => setShowQRGenerator(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <QRCodeGenerator
              userCode={getSecretCode()}
              onCodeGenerated={(qrData) => {
                console.log('QR Code generated:', qrData);
              }}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Settings;
