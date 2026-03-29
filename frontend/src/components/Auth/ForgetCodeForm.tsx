import React, { useState, useRef } from 'react';
// import { useTranslation } from 'react-i18next'; // Reserved for future use
import { Shield, ArrowLeft, RefreshCw, Check, Copy, AlertCircle, Upload, FileText } from 'lucide-react';

interface ForgetCodeFormProps {
  onBack: () => void;
  onCodeRecovered: (code: string) => void;
}

/** Extract recovery link from downloaded .txt file content */
function parseRecoveryLinkFromFile(content: string): string | null {
  const match = content.match(/Recovery Link:\s*(https?:\/\/[^\s\n]+)/i);
  return match ? match[1].trim() : null;
}

const ForgetCodeForm: React.FC<ForgetCodeFormProps> = ({ onBack, onCodeRecovered }) => {
  // Translation hook available for future use
  // const { t } = useTranslation();
  const [recoveryLink, setRecoveryLink] = useState('');
  const [newSecretCode, setNewSecretCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recoveryValue = recoveryLink.trim();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const link = parseRecoveryLinkFromFile(text);
      if (link) {
        setRecoveryLink(link);
      } else {
        setError('No recovery link found in this file. Please use the file you downloaded when creating your account.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryValue) return;
    setError('');
    setIsLoading(true);

    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.forgetCode(recoveryValue) as { success: boolean; message?: string; secretCode?: string };

      if (response.success && response.secretCode) {
        setNewSecretCode(response.secretCode);
      } else {
        throw new Error(response.message || 'Failed to recover code');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (newSecretCode) {
      try {
        await navigator.clipboard.writeText(newSecretCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy code:', error);
      }
    }
  };

  const handleContinue = () => {
    if (newSecretCode) {
      onCodeRecovered(newSecretCode);
    }
  };

  if (newSecretCode) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
        <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              New Code Generated
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Your new secret code has been created
            </p>
          </div>

          <div className="card">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Your New Secret Code
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-2xl font-mono font-bold text-primary-600 tracking-wider">
                  {newSecretCode.match(/.{1,4}/g)?.join(' ') || newSecretCode}
                </div>
              </div>
              
              <button
                onClick={handleCopyCode}
                className="btn-outline flex items-center space-x-2 mx-auto mb-4"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Important Security Notice</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• This code can only be used once</li>
                    <li>• Never share your code with anyone</li>
                    <li>• Store it in a safe place</li>
                    <li>• If you lose it again, use your recovery link to generate a new one</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                onClick={handleContinue}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <span>Continue to App</span>
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full mb-4">
            <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Recover Your Code
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Use the recovery link you saved when creating your account
          </p>
        </div>

        <div className="card">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Forgot Your Secret Code?
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Use the recovery link that was generated when you created your account. 
              You can upload the file you downloaded or paste the link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => { setActiveTab('file'); setError(''); }}
                className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'file' ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload size={18} />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('paste'); setError(''); }}
                className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'paste' ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText size={18} />
                Paste Link
              </button>
            </div>

            {activeTab === 'file' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50/50 transition-colors flex flex-col items-center gap-2 text-gray-600"
                >
                  <Upload size={32} className="text-primary-500" />
                  <span className="font-medium">Upload your recovery file</span>
                  <span className="text-xs">repro-plan-recovery-link.txt or repro-plan-secret-codes.txt</span>
                </button>
                {recoveryValue && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <Check size={16} />
                    Recovery link loaded from file
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="recoveryLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your recovery link
                </label>
                <input
                  type="url"
                  id="recoveryLink"
                  value={recoveryLink}
                  onChange={(e) => {
                    setRecoveryLink(e.target.value);
                    setError('');
                  }}
                  placeholder="https://reproplanai.com/survey/..."
                  className="input-field"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle size={16} />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !recoveryValue}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Generate New Code</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">How It Works</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• When you created your account, the app generated a recovery link linked to your secret code</li>
                  <li>• Upload the file you downloaded, or paste the recovery link you saved</li>
                  <li>• We'll generate a new unique secret code for you</li>
                  <li>• Your old code will no longer work (for security)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetCodeForm;

