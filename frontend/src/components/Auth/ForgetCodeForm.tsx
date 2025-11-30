import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next'; // Reserved for future use
import { Shield, ArrowLeft, RefreshCw, Check, Copy, AlertCircle } from 'lucide-react';

interface ForgetCodeFormProps {
  onBack: () => void;
  onCodeRecovered: (code: string) => void;
}

const ForgetCodeForm: React.FC<ForgetCodeFormProps> = ({ onBack, onCodeRecovered }) => {
  // Translation hook available for future use
  // const { t } = useTranslation();
  const [surveyLink, setSurveyLink] = useState('');
  const [newSecretCode, setNewSecretCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.forgetCode(surveyLink) as { success: boolean; message?: string };

      if (response.success) {
        // In mock mode, generate a mock recovery code
        const mockCode = `RECOVERY${Date.now()}`.substring(0, 8);
        setNewSecretCode(mockCode);
      } else {
        throw new Error(response.message || 'Failed to recover code');
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              New Code Generated
            </h1>
            <p className="text-gray-600">
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

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Important Security Notice</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• This code can only be used once</li>
                    <li>• Never share your code with anyone</li>
                    <li>• Store it in a safe place</li>
                    <li>• If you lose it again, use your survey link to generate a new one</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recover Your Code
          </h1>
          <p className="text-gray-600">
            Enter your survey link to generate a new secret code
          </p>
        </div>

        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Forgot Your Secret Code?
            </h2>
            <p className="text-gray-600 text-sm">
              Don't worry! Enter the survey link you used when creating your account, 
              and we'll generate a new secret code for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="surveyLink" className="block text-sm font-medium text-gray-700 mb-2">
                Survey Link
              </label>
              <input
                type="url"
                id="surveyLink"
                value={surveyLink}
                onChange={(e) => {
                  setSurveyLink(e.target.value);
                  setError('');
                }}
                placeholder="https://example.com/survey/..."
                className="input-field"
                required
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !surveyLink}
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

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">How It Works</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Enter the exact survey link you used when creating your account</li>
                  <li>• We'll generate a new unique secret code for you</li>
                  <li>• Your old code will no longer work (for security)</li>
                  <li>• The new code can only be used once</li>
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

