import React, { useState } from 'react';
import { CheckCircle, Users } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';

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
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-4 sm:p-6 lg:p-8">
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
      </main>
    </PageContainer>
  );
};

export default SecretCodeEntry;
