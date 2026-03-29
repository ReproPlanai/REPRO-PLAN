import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import HealthTracker from '../components/Tracker/HealthTracker';

const Tracker: React.FC = () => {
  return (
    <PageContainer>
      <HealthTracker />
    </PageContainer>
  );
};

export default Tracker;
