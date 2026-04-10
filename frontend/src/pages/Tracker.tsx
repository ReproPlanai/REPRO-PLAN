import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import HealthTracker from '../components/Tracker/HealthTracker';

const Tracker: React.FC = () => {
  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        <HealthTracker />
      </main>
    </PageContainer>
  );
};

export default Tracker;
