import React from 'react';
import HealthTracker from '../components/Tracker/HealthTracker';

const Tracker: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-6">
        <HealthTracker />
      </main>
    </div>
  );
};

export default Tracker;
