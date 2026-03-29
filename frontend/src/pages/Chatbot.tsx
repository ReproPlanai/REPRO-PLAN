import React from 'react';
import PageContainer from '../components/Layout/PageContainer';
import ChatInterface from '../components/Chatbot/ChatInterface';

const Chatbot: React.FC = () => {
  return (
    <PageContainer noPadding>
      <ChatInterface />
    </PageContainer>
  );
};

export default Chatbot;
