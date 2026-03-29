import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import EmergencyPanel from '../components/Emergency/EmergencyPanel';

const Emergency: React.FC = () => {
  return (
    <PageContainer gradient>
      <EmergencyPanel />
    </PageContainer>
  );
};

export default Emergency;
