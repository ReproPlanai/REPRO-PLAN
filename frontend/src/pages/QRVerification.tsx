import React, { useState } from 'react';
import { 
  QrCode, 
  Shield, 
  Sparkles,
  CheckCircle,
  Clock,
  Lock,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import { secretCodeManager } from '../utils/secretCode';
import QRCodeGenerator from '../components/QRCode/QRCodeGenerator';

const QRVerification: React.FC = () => {
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQR = () => {
    setIsGenerating(true);
    setShowQRGenerator(true);
    setTimeout(() => setIsGenerating(false), 800);
  };

  const getSecretCode = () => {
    const secretCode = secretCodeManager.getSecretCode();
    return secretCode ? secretCode.code : '';
  };

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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Secure</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Stakeholder Verification</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Generate a secure QR code for police, medical, or NGO staff to verify your REPRO PLAN account. Your identity stays anonymous.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleGenerateQR}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white border-2 border-gray-200/80 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 group"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold text-gray-700">Generating...</span>
            </>
          ) : (
            <>
              <div className="p-2 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                <QrCode className="w-6 h-6 text-primary-600" />
              </div>
              <span className="font-semibold text-gray-900">Generate QR Code</span>
            </>
          )}
        </button>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Lock, title: 'Anonymous', desc: 'Identity protected', color: 'from-emerald-500 to-teal-500' },
            { icon: Clock, title: '24hr validity', desc: 'Time-limited codes', color: 'from-amber-500 to-orange-500' },
            { icon: CheckCircle, title: 'Instant', desc: 'Quick verification', color: 'from-blue-500 to-indigo-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary-600" />
            How it works
          </h3>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Generate', text: 'Tap the button above to create your secure QR code.' },
              { step: 2, title: 'Show', text: 'Present it to authorized stakeholders when needed.' },
              { step: 3, title: 'Verify', text: 'They scan to confirm your account—your identity stays private.' }
            ].map(({ step, title, text }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center">
                  {step}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 text-sm">Security notice</p>
            <p className="text-xs text-amber-800 mt-1">
              QR codes expire after 24 hours. Only share with authorized stakeholders (police, medical, NGO).
            </p>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:animate-none">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Your QR Code</h3>
              <button
                onClick={() => setShowQRGenerator(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <QRCodeGenerator
                userCode={getSecretCode()}
                onCodeGenerated={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default QRVerification;
