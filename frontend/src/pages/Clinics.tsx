import React from 'react';
import ClinicFinder from '../components/Clinics/ClinicFinder';

const Clinics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-6">
        <ClinicFinder />
      </main>
    </div>
  );
};

export default Clinics;
