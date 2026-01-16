import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  ArrowLeft, 
  Shield, 
  Eye, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { secretCodeManager } from '../utils/secretCode';
import QRCodeGenerator from '../components/QRCode/QRCodeGenerator';

const QRVerification: React.FC = () => {
  const navigate = useNavigate();
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQR = () => {
    setIsGenerating(true);
    setShowQRGenerator(true);
    // Reset generating state after a short delay
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const getSecretCode = () => {
    const secretCode = secretCodeManager.getSecretCode();
    return secretCode ? secretCode.code : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between h-auto sm:h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Stakeholder Verification</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Stakeholder Verification</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Generate a QR code that stakeholders (police, medical, NGO) can scan to verify your REPRO PLAN account 
                while keeping your identity completely anonymous. This ensures secure verification without compromising your privacy.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerateQR}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Generate QR Code</span>
                    </>
                  )}
                </button>
                <button className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Learn More</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Anonymous Verification</h3>
            <p className="text-gray-600 text-sm">
              Your identity remains completely hidden while allowing stakeholders to verify your REPRO PLAN account.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure QR Codes</h3>
            <p className="text-gray-600 text-sm">
              Time-limited, encrypted QR codes that can only be verified by authorized stakeholders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Verification</h3>
            <p className="text-gray-600 text-sm">
              Stakeholders can instantly verify your account status and access level with a simple scan.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">How It Works</h3>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Generate Your QR Code</h4>
                <p className="text-gray-600 text-sm">
                  Click "Generate QR Code" to create a secure, time-limited QR code linked to your REPRO PLAN account.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Show to Stakeholders</h4>
                <p className="text-gray-600 text-sm">
                  Present your QR code to police, medical personnel, or NGO staff when they need to verify your REPRO PLAN account.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Secure Verification</h4>
                <p className="text-gray-600 text-sm">
                  Stakeholders scan your QR code to instantly verify your account status while keeping your identity anonymous.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Security Notice</h4>
              <p className="text-yellow-700 text-sm">
                QR codes are time-limited and expire after 24 hours for security. Only share your QR code with authorized 
                stakeholders (police, medical personnel, NGO staff) who need to verify your REPRO PLAN account.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 flex-shrink-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code Generator</h3>
                <button
                  onClick={() => setShowQRGenerator(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0">
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

export default QRVerification;
