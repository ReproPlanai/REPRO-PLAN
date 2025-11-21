import React from 'react';
import AdminDashboard from '../../pages/AdminDashboard';
import PoliceDashboard from '../../pages/PoliceDashboard';
import SafeHouseDashboard from '../../pages/SafeHouseDashboard';
import MedicalDashboard from '../../pages/MedicalDashboard';
import NGODashboard from '../../pages/NGODashboard';

interface DashboardRouterProps {
  role: string;
  userData: any;
  onLogout: () => void;
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ role, userData, onLogout }) => {
  // Route to appropriate dashboard based on role
  switch (role) {
    case 'ADMIN':
      return <AdminDashboard userData={userData} onLogout={onLogout} />;
    
    case 'POLICE':
      return <PoliceDashboard userData={userData} onLogout={onLogout} />;
    
    case 'SAFEHOUSE':
      return <SafeHouseDashboard userData={userData} onLogout={onLogout} />;
    
    case 'MEDICAL':
      return <MedicalDashboard userData={userData} onLogout={onLogout} />;
    
    case 'NGO':
      return <NGODashboard userData={userData} onLogout={onLogout} />;
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Invalid role or insufficient permissions.</p>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
  }
};

export default DashboardRouter;
