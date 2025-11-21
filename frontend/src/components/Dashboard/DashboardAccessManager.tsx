import React, { useState, useEffect } from 'react';
import DashboardAccess from '../../pages/DashboardAccess';
import DashboardRouter from './DashboardRouter';
import PortalLogin from '../../pages/PortalLogin';

const DashboardAccessManager: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [showPortalLogin, setShowPortalLogin] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>('');

  useEffect(() => {
    // Check if role is provided in URL parameters
    console.log('🔍 DashboardAccessManager - useEffect triggered');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Search params:', window.location.search);
    
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    
    console.log('🔍 Extracted role from URL:', role);
    
    if (role) {
      console.log('✅ Role detected! Setting up stakeholder login for role:', role);
      // Stakeholders go DIRECTLY to their role-specific login page
      setCurrentRole(role);
      setShowPortalLogin(true);
    } else {
      console.log('❌ No role found in URL parameters');
    }
  }, []);

  const handleDashboardAccess = (role: string, data: any) => {
    setUserRole(role);
    setUserData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('');
    setUserData(null);
  };

  if (isAuthenticated) {
    return (
      <DashboardRouter 
        role={userRole} 
        userData={userData} 
        onLogout={handleLogout} 
      />
    );
  }

  // Stakeholders go DIRECTLY to their role-specific login page
  if (showPortalLogin && currentRole) {
    return (
      <PortalLogin
        role={currentRole}
        onLoginSuccess={handleDashboardAccess}
        onBack={() => {
          setShowPortalLogin(false);
          setCurrentRole('');
          // Clear URL parameters and go back to main login
          window.history.replaceState({}, document.title, '/');
        }}
      />
    );
  }

  // Only show DashboardAccess for direct /dashboard access (not for stakeholders)
  return (
    <DashboardAccess onDashboardAccess={handleDashboardAccess} />
  );
};

export default DashboardAccessManager;
