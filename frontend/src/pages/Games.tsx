import React from 'react';
import AccessibleQuizGame from '../components/Games/AccessibleQuizGame';

const Games: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-6">
        <AccessibleQuizGame />
      </main>
    </div>
  );
};

export default Games;
