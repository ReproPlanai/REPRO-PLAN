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
  X
} from 'lucide-react';
import { offlineStorage } from '../utils/offlineStorage';
import { secretCodeManager } from '../utils/secretCode';
import QRCodeGenerator from '../components/QRCode/QRCodeGenerator';
import SecurityPreferences from '../components/Settings/SecurityPreferences';

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
    <div className="w-full h-full bg-gray-50">
      <main className="p-3 sm:p-4">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tabs - Mobile Responsive */}
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto scrollbar-hide px-3 sm:px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1.5 sm:space-x-2 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content - Mobile Responsive */}
            <div className="p-3 sm:p-4 lg:p-6">
              {activeTab === 'general' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Language & Region</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Language
                        </label>
                        <select
                          value={i18n.language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Notifications</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Health Reminders</p>
                          <p className="text-xs sm:text-sm text-gray-600">Get reminders for health tracking</p>
                        </div>
                        <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5 rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Emergency Alerts</p>
                          <p className="text-xs sm:text-sm text-gray-600">Receive emergency notifications</p>
                        </div>
                        <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5 rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Mentorship Updates</p>
                          <p className="text-xs sm:text-sm text-gray-600">Get notified about mentorship messages</p>
                        </div>
                        <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5 rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Secret Code</h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Your Secret Code</p>
                          <p className="text-xs sm:text-sm text-gray-600">Keep this code safe and private</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white border rounded font-mono text-xs sm:text-sm">
                            {showSecretCode ? getSecretCode() : '••••••••'}
                          </code>
                          <button
                            onClick={() => setShowSecretCode(!showSecretCode)}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            {showSecretCode ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Data Privacy</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-green-900 text-sm sm:text-base">Your Data is Protected</h4>
                            <ul className="text-green-800 text-xs sm:text-sm mt-1 space-y-1">
                              <li>• All data is stored locally on your device</li>
                              <li>• No personal information is collected</li>
                              <li>• Anonymous usage analytics only</li>
                              <li>• No tracking or profiling</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">QR Code Verification</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-blue-900 text-sm sm:text-base">Stakeholder Verification</h4>
                            <p className="text-blue-800 text-xs sm:text-sm mt-1 mb-3">
                              Generate a QR code that stakeholders (police, medical, NGO) can scan to verify your REPRO PLAN account while keeping your identity anonymous.
                            </p>
                            <button
                              onClick={() => setShowQRGenerator(true)}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center space-x-2"
                            >
                              <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Generate QR Code</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Security Preferences</h3>
                    <SecurityPreferences role="USER" />
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Storage Information</h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Storage Used</span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-primary-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(storageInfo.used / storageInfo.available) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Data Management</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <button
                        onClick={handleExportData}
                        className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download size={14} className="sm:w-4 sm:h-4" />
                        <span>Export All Data</span>
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full px-4 py-3 sm:py-4 border border-red-300 rounded-lg text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        <span>Delete All Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">About REPRO PLAN</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Version 1.0.0</h4>
                        <p className="text-blue-800 text-xs sm:text-sm">
                          REPRO PLAN is an anonymous, inclusive, and scalable SRHR platform for youth. 
                          Built with privacy-first principles and designed to work offline.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Features</h4>
                        <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                          <li>• Anonymous SRHR chatbot</li>
                          <li>• Clinic and service finder</li>
                          <li>• Health and cycle tracker</li>
                          <li>• Interactive educational games</li>
                          <li>• Emergency support and panic button</li>
                          <li>• Peer mentorship system</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Support</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <button className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2">
                        <HelpCircle size={14} className="sm:w-4 sm:h-4" />
                        <span>Help & FAQ</span>
                      </button>
                      
                      <button className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2">
                        <Info size={14} className="sm:w-4 sm:h-4" />
                        <span>Contact Support</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button - Mobile Responsive */}
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={onLogout}
              className="px-4 py-3 sm:py-4 border border-red-300 rounded-lg text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors flex items-center space-x-2 mx-auto"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal - Mobile Responsive */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delete All Data</h3>
              </div>
              
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                This will permanently delete all your data including chat history, 
                health tracking, and settings. This action cannot be undone.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium"
                >
                  Delete All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code Generator</h3>
                <button
                  onClick={() => setShowQRGenerator(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
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
        </div>
      )}
    </div>
  );
};

export default Settings;
