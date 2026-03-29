import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import ClinicFinder from '../components/Clinics/ClinicFinder';

const Clinics: React.FC = () => {
  return (
    <PageContainer gradient>
      <ClinicFinder />
    </PageContainer>
  );
};

export default Clinics;
