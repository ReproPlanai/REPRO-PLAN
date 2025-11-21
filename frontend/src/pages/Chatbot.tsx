import React from 'react';
import ChatInterface from '../components/Chatbot/ChatInterface';

const Chatbot: React.FC = () => {

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Chatbot;
