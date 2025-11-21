import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface SecretCodeEntryProps {
  onCodeVerified: (role: string) => void;
}

const SecretCodeEntry: React.FC<SecretCodeEntryProps> = ({ onCodeVerified }) => {
  const [secretCode, setSecretCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Secret codes for different roles (in production, these would be stored securely)
  const roleCodes: { [key: string]: string } = {
    'ADMIN': 'REPROPLAN_ADMIN_2024',
    'POLICE': 'REPROPLAN_POLICE_2024', 
    'SAFEHOUSE': 'REPROPLAN_SAFE_2024',
    'MEDICAL': 'REPROPLAN_MED_2024',
    'NGO': 'REPROPLAN_NGO_2024'
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      // Check if code matches any hardcoded role codes (for backward compatibility)
      const matchedRole = Object.entries(roleCodes).find(([_, code]) => code === secretCode);
      
      if (matchedRole) {
        // Store secret code for use in PortalLogin
        sessionStorage.setItem('stakeholder_secret_code', secretCode);
        onCodeVerified(matchedRole[0]);
        setIsVerifying(false);
        return;
      }

      // Try to verify with backend (for new stakeholder codes)
      // Note: Backend doesn't have a direct "verify code" endpoint, so we'll try login
      // In production, you might want to add a verify endpoint
      // For now, we'll check if the code format matches stakeholder pattern
      if (secretCode.startsWith('REPROPLAN_')) {
        // This is a stakeholder code format
        // Extract role from code (REPROPLAN_ADMI_XXXXX -> ADMIN)
        const roleMatch = secretCode.match(/REPROPLAN_(\w{4})_/);
        if (roleMatch) {
          const roleCode = roleMatch[1];
          const roleMap: { [key: string]: string } = {
            'ADMI': 'ADMIN',
            'POLI': 'POLICE',
            'SAFE': 'SAFEHOUSE',
            'MEDI': 'MEDICAL',
            'NGO_': 'NGO'
          };
          const role = roleMap[roleCode] || 'ADMIN';
          sessionStorage.setItem('stakeholder_secret_code', secretCode);
          onCodeVerified(role);
          setIsVerifying(false);
          return;
        }
      }

      // If no match, show error
      setError('Invalid secret code. Please check and try again.');
      setIsVerifying(false);
    } catch (error: any) {
      setError(error.message || 'Failed to verify code. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretCode(e.target.value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
            Secure Access Portal
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 px-2">
            Enter your secure access code to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Secret Code Form */}
        <form onSubmit={handleCodeSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="secretCode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Secret Access Code
            </label>
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                id="secretCode"
                value={secretCode}
                onChange={handleCodeChange}
                placeholder="Enter your secret code"
                className="w-full px-3 py-2.5 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                required
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isVerifying}
              >
                {showCode ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!secretCode.trim() || isVerifying}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-xs sm:text-sm">Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Verify Access</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            🔒 This is a secure portal. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecretCodeEntry;
