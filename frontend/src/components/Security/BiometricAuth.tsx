import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Eye, 
  Shield, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Lock,
  Unlock,
  User,
  Smartphone,
  Camera,
  Scan
} from 'lucide-react';

interface BiometricData {
  id: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris';
  name: string;
  isRegistered: boolean;
  lastUsed: string;
  confidence: number;
  isActive: boolean;
}

interface BiometricAuthProps {
  userRole: string;
  onAuthSuccess: (method: string) => void;
  onAuthFailure: (reason: string) => void;
  onEnrollmentComplete: (biometric: BiometricData) => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({
  userRole,
  onAuthSuccess,
  onAuthFailure,
  onEnrollmentComplete
}) => {
  const [biometrics, setBiometrics] = useState<BiometricData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<'success' | 'failure' | 'pending' | null>(null);
  const [enrollmentMode, setEnrollmentMode] = useState(false);
  const [selectedBiometric, setSelectedBiometric] = useState<BiometricData['type'] | null>(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);

  // Initialize biometric data
  useEffect(() => {
    const initialBiometrics: BiometricData[] = [
      {
        id: '1',
        type: 'fingerprint',
        name: 'Right Index Finger',
        isRegistered: true,
        lastUsed: new Date(Date.now() - 3600000).toISOString(),
        confidence: 95,
        isActive: true
      },
      {
        id: '2',
        type: 'face',
        name: 'Face Recognition',
        isRegistered: false,
        lastUsed: '',
        confidence: 0,
        isActive: false
      },
      {
        id: '3',
        type: 'voice',
        name: 'Voice Recognition',
        isRegistered: false,
        lastUsed: '',
        confidence: 0,
        isActive: false
      },
      {
        id: '4',
        type: 'iris',
        name: 'Iris Scan',
        isRegistered: false,
        lastUsed: '',
        confidence: 0,
        isActive: false
      }
    ];

    setBiometrics(initialBiometrics);
  }, []);

  const startBiometricScan = async (type: BiometricData['type']) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult('pending');

    // Simulate biometric scanning process
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setIsScanning(false);
          
          // Simulate scan result (90% success rate for demo)
          const isSuccess = Math.random() > 0.1;
          setScanResult(isSuccess ? 'success' : 'failure');
          
          if (isSuccess) {
            onAuthSuccess(type);
            // Update last used timestamp
            setBiometrics(prev => prev.map(bio => 
              bio.type === type 
                ? { ...bio, lastUsed: new Date().toISOString() }
                : bio
            ));
          } else {
            onAuthFailure('Biometric scan failed. Please try again.');
          }
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Clear result after 3 seconds
    setTimeout(() => {
      setScanResult(null);
    }, 3000);
  };

  const startEnrollment = (type: BiometricData['type']) => {
    setEnrollmentMode(true);
    setSelectedBiometric(type);
    setEnrollmentProgress(0);

    // Simulate enrollment process
    const enrollmentInterval = setInterval(() => {
      setEnrollmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(enrollmentInterval);
          setEnrollmentMode(false);
          
          // Complete enrollment
          const newBiometric: BiometricData = {
            id: Date.now().toString(),
            type,
            name: getBiometricName(type),
            isRegistered: true,
            lastUsed: new Date().toISOString(),
            confidence: 95,
            isActive: true
          };

          setBiometrics(prev => [...prev, newBiometric]);
          onEnrollmentComplete(newBiometric);
          
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const getBiometricName = (type: BiometricData['type']) => {
    switch (type) {
      case 'fingerprint': return 'Fingerprint';
      case 'face': return 'Face Recognition';
      case 'voice': return 'Voice Recognition';
      case 'iris': return 'Iris Scan';
      default: return 'Biometric';
    }
  };

  const getBiometricIcon = (type: BiometricData['type']) => {
    switch (type) {
      case 'fingerprint': return <Fingerprint className="w-6 h-6" />;
      case 'face': return <Eye className="w-6 h-6" />;
      case 'voice': return <User className="w-6 h-6" />;
      case 'iris': return <Scan className="w-6 h-6" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  const getBiometricColor = (type: BiometricData['type']) => {
    switch (type) {
      case 'fingerprint': return 'text-blue-600 bg-blue-100';
      case 'face': return 'text-green-600 bg-green-100';
      case 'voice': return 'text-purple-600 bg-purple-100';
      case 'iris': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatLastUsed = (timestamp: string) => {
    if (!timestamp) return 'Never used';
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

  return (
    <div className="space-y-6">
      {/* Biometric Scanner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Biometric Authentication</h3>
          
          {/* Scanner Display */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full flex items-center justify-center">
              {isScanning ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-sm text-gray-600">Scanning...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : scanResult === 'success' ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                  <div className="text-sm text-green-600 font-medium">Authentication Successful</div>
                </div>
              ) : scanResult === 'failure' ? (
                <div className="text-center">
                  <X className="w-16 h-16 text-red-500 mx-auto mb-2" />
                  <div className="text-sm text-red-600 font-medium">Authentication Failed</div>
                </div>
              ) : (
                <div className="text-center">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Ready to Scan</div>
                </div>
              )}
            </div>
          </div>

          {/* Biometric Options */}
          <div className="grid grid-cols-2 gap-3">
            {biometrics.map((biometric) => (
              <button
                key={biometric.id}
                onClick={() => {
                  if (biometric.isRegistered) {
                    startBiometricScan(biometric.type);
                  } else {
                    startEnrollment(biometric.type);
                  }
                }}
                disabled={isScanning || enrollmentMode}
                className={`p-4 rounded-lg border-2 transition-all ${
                  biometric.isRegistered
                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                } ${isScanning || enrollmentMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getBiometricColor(biometric.type)}`}>
                    {getBiometricIcon(biometric.type)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{biometric.name}</div>
                    <div className="text-xs text-gray-500">
                      {biometric.isRegistered ? 'Registered' : 'Not Registered'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Biometric Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Biometric Management</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {biometrics.map((biometric) => (
            <div key={biometric.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getBiometricColor(biometric.type)}`}>
                    {getBiometricIcon(biometric.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{biometric.name}</div>
                    <div className="text-sm text-gray-500">
                      {biometric.isRegistered ? (
                        <>
                          Last used: {formatLastUsed(biometric.lastUsed)}
                          <span className="mx-2">•</span>
                          Confidence: {biometric.confidence}%
                        </>
                      ) : (
                        'Not registered'
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {biometric.isRegistered ? (
                    <>
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm">Active</span>
                      </div>
                      <button
                        onClick={() => {
                          setBiometrics(prev => prev.map(bio => 
                            bio.id === biometric.id 
                              ? { ...bio, isActive: !bio.isActive }
                              : bio
                          ));
                        }}
                        className={`px-3 py-1 text-xs rounded ${
                          biometric.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {biometric.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEnrollment(biometric.type)}
                      disabled={enrollmentMode}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollment Progress */}
      {enrollmentMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-900">
                Enrolling {getBiometricName(selectedBiometric!)}...
              </div>
              <div className="text-sm text-blue-700">
                Please follow the on-screen instructions
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${enrollmentProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Biometric Security</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All biometric data is encrypted and stored locally</li>
              <li>• Biometric templates cannot be reverse-engineered</li>
              <li>• Data is never transmitted to external servers</li>
              <li>• Multiple biometric methods provide enhanced security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricAuth;
