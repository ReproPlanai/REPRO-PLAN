import React from 'react';
import AIVideoTherapy from '../components/Mentorship/AIVideoTherapy';
import PageContainer from '../components/Layout/PageContainer';

const Mentorship: React.FC = () => {
  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        <AIVideoTherapy />
      </main>
    </PageContainer>
  );
};

export default Mentorship;
