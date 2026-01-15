import React, { useState } from 'react';
import { Shield, CheckCircle, Users } from 'lucide-react';

interface SecretCodeEntryProps {
  onCodeVerified: (role: string) => void;
}

const SecretCodeEntry: React.FC<SecretCodeEntryProps> = ({ onCodeVerified }) => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    { id: 'ADMIN', label: 'Administrator', description: 'System management and oversight' },
    { id: 'POLICE', label: 'Police', description: 'Emergency response coordination' },
    { id: 'SAFEHOUSE', label: 'Safe House', description: 'Resident support and protection' },
    { id: 'MEDICAL', label: 'Medical', description: 'Healthcare services and records' },
    { id: 'NGO', label: 'NGO', description: 'Community programs and outreach' }
  ];

  const handleContinue = () => {
    if (selectedRole) {
      onCodeVerified(selectedRole);
    }
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
            Select your stakeholder role to continue
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center text-xs sm:text-sm text-gray-600">
            Select your stakeholder role to continue.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`text-left p-3 border rounded-lg transition-colors ${
                  selectedRole === role.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">{role.label}</span>
                </div>
                <p className="text-xs text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <CheckCircle size={16} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Continue</span>
          </button>
        </div>

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
