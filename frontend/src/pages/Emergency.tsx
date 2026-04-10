import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import EmergencyPanel from '../components/Emergency/EmergencyPanel';

const Emergency: React.FC = () => {
  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        <EmergencyPanel />
      </main>
    </PageContainer>
  );
};

export default Emergency;
