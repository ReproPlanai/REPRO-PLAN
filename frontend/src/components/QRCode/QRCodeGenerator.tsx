import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Copy, 
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';

interface QRCodeGeneratorProps {
  userCode: string;
  onCodeGenerated?: (qrData: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  userCode,
  onCodeGenerated
}) => {
  const [qrData, setQrData] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Generate QR code data
  useEffect(() => {
    if (userCode && isVisible) {
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCode, isVisible]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    // Create a secure QR payload
    const qrPayload = {
      type: 'repro-plan_verification',
      userCode: userCode,
      timestamp: Date.now(),
      version: '1.0',
      security: {
        hash: await generateSecurityHash(userCode),
        nonce: generateNonce()
      }
    };

    const qrDataString = JSON.stringify(qrPayload);
    setQrData(qrDataString);
    setLastGenerated(new Date());
    onCodeGenerated?.(qrDataString);
    setIsGenerating(false);
  };

  const generateSecurityHash = async (code: string): Promise<string> => {
    // Simple hash generation for demo (in production, use proper crypto)
    const encoder = new TextEncoder();
    const data = encoder.encode(code + Date.now());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  };

  const generateNonce = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadQRCode = () => {
    // In a real implementation, you would generate an actual QR code image
    const element = document.createElement('a');
    const file = new Blob([qrData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `repro-plan-verification-${userCode}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const refreshQRCode = () => {
    generateQRCode();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          REPRO PLAN Verification QR Code
        </h3>
        <p className="text-sm text-gray-600">
          Generate a QR code for stakeholder verification
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium">Privacy Protected</p>
            <p>Your identity remains anonymous. Only verification status is shared.</p>
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Generating QR Code...</span>
          </div>
        ) : qrData ? (
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 mb-3 inline-block">
              {/* QR Code Placeholder - In production, use a QR code library */}
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              QR Code Generated
            </p>
            {lastGenerated && (
              <p className="text-xs text-gray-400">
                Generated: {lastGenerated.toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click "Generate QR Code" to create</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isVisible ? (
          <button
            onClick={() => setIsVisible(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Generate QR Code</span>
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={refreshQRCode}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Refresh QR Code</span>
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
              <button
                onClick={downloadQRCode}
                className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
              >
                <Download className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to use:</h4>
        <ol className="text-xs text-blue-800 space-y-1">
          <li>1. Generate your QR code</li>
          <li>2. Show it to a stakeholder (police, medical, etc.)</li>
          <li>3. They scan it to verify your REPRO PLAN account</li>
          <li>4. Your identity remains anonymous</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
