import React from 'react';
import EmergencyPanel from '../components/Emergency/EmergencyPanel';

const Emergency: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-6">
        <EmergencyPanel />
      </main>
    </div>
  );
};

export default Emergency;
