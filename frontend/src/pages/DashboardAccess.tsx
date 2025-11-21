import React, { useState } from 'react';
import SecretCodeEntry from './SecretCodeEntry';
import PortalLogin from './PortalLogin';

interface DashboardAccessProps {
  onDashboardAccess: (role: string, userData: any) => void;
}

const DashboardAccess: React.FC<DashboardAccessProps> = ({ onDashboardAccess }) => {
  const [currentStep, setCurrentStep] = useState<'secret-code' | 'portal-login'>('secret-code');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleCodeVerified = (role: string) => {
    setSelectedRole(role);
    setCurrentStep('portal-login');
  };

  const handleBackToSecretCode = () => {
    setCurrentStep('secret-code');
    setSelectedRole('');
  };

  const handleLoginSuccess = (role: string, userData: any) => {
    onDashboardAccess(role, userData);
  };

  return (
    <div className="min-h-screen">
      {currentStep === 'secret-code' && (
        <SecretCodeEntry onCodeVerified={handleCodeVerified} />
      )}
      
      {currentStep === 'portal-login' && (
        <PortalLogin
          role={selectedRole}
          onLoginSuccess={handleLoginSuccess}
          onBack={handleBackToSecretCode}
        />
      )}
    </div>
  );
};

export default DashboardAccess;
