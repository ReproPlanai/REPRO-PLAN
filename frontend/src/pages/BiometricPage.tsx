import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fingerprint,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  Lock,
  AlertTriangle,
  Settings,
  History,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { apiService } from '../services/api';
import PageContainer from '../components/Layout/PageContainer';

interface BiometricData {
  id: string;
  entity_id: string;
  entity_type: 'user' | 'stakeholder';
  type: 'fingerprint' | 'face' | 'iris';
  is_enabled: boolean;
  device_info: {
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  last_used?: string;
  created_at: string;
  updated_at: string;
}

const BiometricPage: React.FC = () => {
  const navigate = useNavigate();
  const [biometrics, setBiometrics] = useState<BiometricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'history' | 'settings'>('status');

  const userId = localStorage.getItem('userId');
  const stakeholderId = localStorage.getItem('stakeholderId');

  useEffect(() => {
    fetchBiometrics();
  }, []);

  const fetchBiometrics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBiometrics?.();

      if (response?.success) {
        setBiometrics(response.biometric);
      }
    } catch (err) {
      setError('Failed to load biometric data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!biometrics) return;

    try {
      setLoading(true);
      const response = await apiService.updateBiometric?.(biometrics.id, {
        is_enabled: !biometrics.is_enabled
      });

      if (response?.success) {
        setBiometrics(response.biometric);
        setSuccess(`Biometric authentication ${!biometrics.is_enabled ? 'enabled' : 'disabled'}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update biometric settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (type: 'fingerprint' | 'face') => {
    try {
      setEnrolling(true);
      // Simulate biometric enrollment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await apiService.registerBiometric?.({
        userId: userId || undefined,
        stakeholderId: stakeholderId || undefined,
        type,
        biometricHash: `simulated-${type}-${Date.now()}`,
        deviceInfo: {
          deviceType: 'mobile',
          browser: navigator.userAgent,
          os: navigator.platform
        }
      });

      if (response?.success) {
        setBiometrics(response.biometric);
        setSuccess(`${type === 'fingerprint' ? 'Fingerprint' : 'Face'} enrolled successfully`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to enroll biometric');
    } finally {
      setEnrolling(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fingerprint':
        return <Fingerprint className="w-5 h-5" />;
      case 'face':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Lock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Actions */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <Fingerprint className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Biometric Authentication</h1>
            <p className="text-sm text-gray-500">Manage your biometric security settings</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'status', label: 'Status', icon: Shield },
            { id: 'history', label: 'History', icon: History },
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

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h3>
              
              {biometrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(biometrics.type)}
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{biometrics.type} Authentication</p>
                        <p className="text-sm text-gray-500">Registered on {new Date(biometrics.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {biometrics.is_enabled ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>

                  {biometrics.last_used && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <History className="w-4 h-4" />
                      Last used: {new Date(biometrics.last_used).toLocaleString()}
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                    <span className="text-gray-700">Enable biometric authentication</span>
                    <button
                      onClick={handleToggle}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{ backgroundColor: biometrics.is_enabled ? '#4f46e5' : '#d1d5db' }}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          biometrics.is_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Fingerprint className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">No biometric authentication set up yet</p>
                  <p className="text-sm text-gray-400 mb-6">Add an extra layer of security to your account</p>
                </div>
              )}
            </div>

            {/* Enrollment Options */}
            {!biometrics && (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enroll Biometric</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleEnroll('fingerprint')}
                    disabled={enrolling}
                    className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  >
                    <Fingerprint className="w-8 h-8 text-indigo-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Fingerprint</p>
                      <p className="text-sm text-gray-500">Use your device fingerprint sensor</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleEnroll('face')}
                    disabled={enrolling}
                    className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  >
                    <Smartphone className="w-8 h-8 text-indigo-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Face Recognition</p>
                      <p className="text-sm text-gray-500">Use your device face unlock</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication History</h3>
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Authentication history will be displayed here</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Biometric Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Require biometric for sensitive actions</p>
                  <p className="text-sm text-gray-500">Prompt for biometric when accessing sensitive data</p>
                </div>
                <ToggleRight className="w-10 h-6 text-indigo-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Auto-lock after inactivity</p>
                  <p className="text-sm text-gray-500">Require biometric after 5 minutes of inactivity</p>
                </div>
                <ToggleLeft className="w-10 h-6 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Backup access method</p>
                  <p className="text-sm text-gray-500">Allow secret code as backup</p>
                </div>
                <ToggleRight className="w-10 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        )}
      </main>
    </PageContainer>
  );
};

export default BiometricPage;
