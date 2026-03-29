import React, { useState } from 'react';
import SecretCodeEntry from './SecretCodeEntry';
import PortalLogin from './PortalLogin';

interface DashboardAccessProps {
  onDashboardAccess: (role: string, userData: any) => void;
}

const DashboardAccess: React.FC<DashboardAccessProps> = ({ onDashboardAccess }) => {
  const [currentStep, setCurrentStep] = useState<'role-select' | 'portal-login'>('role-select');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleCodeVerified = (role: string) => {
    setSelectedRole(role);
    setCurrentStep('portal-login');
  };

  const handleBackToSecretCode = () => {
    setCurrentStep('role-select');
    setSelectedRole('');
  };

  const handleLoginSuccess = (role: string, userData: any) => {
    onDashboardAccess(role, userData);
  };

  return (
    <div className="w-full h-full">
      {currentStep === 'role-select' && (
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
