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
    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/80 p-6 shadow-sm">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 text-base">Verification QR Code</h3>
        <p className="text-xs text-gray-500 mt-0.5">Show to stakeholders for instant verification</p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 mb-4">
        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-emerald-800">Your identity stays anonymous. Only verification status is shared.</p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200/80 p-6 mb-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-10 h-10 text-primary-500 animate-spin mb-3" />
            <span className="text-sm text-gray-600">Generating secure code...</span>
          </div>
        ) : qrData ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/80 p-4">
              <QrCode className="w-24 h-24 text-primary-400" />
            </div>
            {lastGenerated && (
              <p className="text-xs text-gray-400 mt-3">Generated {lastGenerated.toLocaleTimeString()}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">Ready to generate</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {!isVisible ? (
          <button
            onClick={() => setIsVisible(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Generate QR Code
          </button>
        ) : (
          <>
            <button
              onClick={refreshQRCode}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh Code
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyToClipboard}
                className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={downloadQRCode}
                className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
