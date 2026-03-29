import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Download
} from 'lucide-react';
import { apiService } from '../../services/api';

interface VerificationRecord {
  id: string;
  userCode: string;
  timestamp: number;
  verified: boolean;
  role: string;
  location?: string;
  notes?: string;
}

interface QRVerificationManagerProps {
  userRole: string;
  onVerificationComplete?: (record: VerificationRecord) => void;
}

const QRVerificationManager: React.FC<QRVerificationManagerProps> = ({
  userRole,
  onVerificationComplete
}) => {
  const [verificationHistory, setVerificationHistory] = useState<VerificationRecord[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load verification history from localStorage
    const savedHistory = localStorage.getItem('repro-plan-verification-history');
    if (savedHistory) {
      setVerificationHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleScanResult = (result: any) => {
    const newRecord: VerificationRecord = {
      id: generateId(),
      userCode: result.userCode,
      timestamp: Date.now(),
      verified: result.verified,
      role: userRole,
      location: getCurrentLocation(),
      notes: ''
    };

    setVerificationHistory(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('repro-plan-verification-history', JSON.stringify(updated));
      return updated;
    });

    onVerificationComplete?.(newRecord);
    setShowScanner(false);
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const getCurrentLocation = (): string => {
    // In a real implementation, this would get the actual location
    return 'Ghana';
  };

  const generateUserCode = async () => {
    setIsGenerating(true);
    try {
      // Request code from API instead of generating locally
      const response = await apiService.generateQRCode?.() as {
        success?: boolean;
        code?: string;
      };
      
      if (response?.success && response.code) {
        setUserCode(response.code);
      } else {
        // Fallback to timestamp-based code if API unavailable
        setUserCode('USER' + Date.now().toString(36).substring(0, 6).toUpperCase());
      }
    } catch {
      setUserCode('USER' + Date.now().toString(36).substring(0, 6).toUpperCase());
    }
    setIsGenerating(false);
  };

  const verifyQRCode = async (code: string) => {
    try {
      const response = await apiService.verifyQRCode?.(code) as {
        success?: boolean;
        verified?: boolean;
        userCode?: string;
      };
      
      handleScanResult({
        userCode: response?.userCode || code,
        verified: response?.verified || false
      });
    } catch {
      handleScanResult({
        userCode: code,
        verified: false
      });
    }
  };

  const exportVerificationHistory = () => {
    const dataStr = JSON.stringify(verificationHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repro-plan-verifications-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setVerificationHistory([]);
    localStorage.removeItem('repro-plan-verification-history');
  };

  const getVerificationStats = () => {
    const total = verificationHistory.length;
    const verified = verificationHistory.filter(v => v.verified).length;
    const today = verificationHistory.filter(v => 
      new Date(v.timestamp).toDateString() === new Date().toDateString()
    ).length;
    
    return { total, verified, today };
  };

  const stats = getVerificationStats();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Verifications</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.verified}</div>
          <div className="text-sm text-gray-600">Verified Users</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
          <div className="text-sm text-gray-600">Today</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowScanner(true)}
          className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-3"
        >
          <QrCode className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Scan QR Code</div>
            <div className="text-sm text-green-100">Verify a user's QR code</div>
          </div>
        </button>

        <button
          onClick={() => setShowGenerator(true)}
          className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3"
        >
          <QrCode className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Generate QR Code</div>
            <div className="text-sm text-blue-100">Create your verification code</div>
          </div>
        </button>
      </div>

      {/* Verification History */}
      {verificationHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Verification History</h3>
            <div className="flex space-x-2">
              <button
                onClick={exportVerificationHistory}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={clearHistory}
                className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {verificationHistory.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className={`p-4 rounded-lg border-l-4 ${
                  record.verified 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {record.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        User: {record.userCode}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(record.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {record.role}
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  QR Code Scanner
                </h3>
                <p className="text-gray-600 text-sm">
                  Point your camera at a REPRO PLAN QR code
                </p>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-8 mb-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Camera view would appear here</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowScanner(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In production, this would trigger camera scan
                    // For now, prompt user to enter code manually
                    const code = prompt('Enter QR Code (or scan with camera):');
                    if (code) {
                      verifyQRCode(code);
                    }
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Scan QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generate QR Code
                </h3>
                <p className="text-gray-600 text-sm">
                  Create your verification QR code
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your User Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="Enter or generate code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={generateUserCode}
                      disabled={isGenerating}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>

                {userCode && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Your QR Code</p>
                      <p className="text-xs text-gray-500">Code: {userCode}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle QR code generation
                    setShowGenerator(false);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRVerificationManager;
