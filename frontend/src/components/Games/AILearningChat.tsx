import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Sparkles, Brain, ArrowRight, Star } from 'lucide-react';
import { apiService } from '../../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  xpEarned?: number;
  isQuestion?: boolean;
}

interface AILearningChatProps {
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

const AILearningChat: React.FC<AILearningChatProps> = ({ onComplete, onExit }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [startTime] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial AI greeting
    setMessages([{
      id: '1',
      sender: 'ai',
      text: "Hi! I'm Rehana, your AI SRHR learning companion. Ask me anything about sexual health, relationships, consent, or rights - and earn XP for great questions! What would you like to learn today?",
      isQuestion: false
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      isQuestion: input.endsWith('?')
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiService.chatWithAI?.(input) as any;
      
      const xpEarned = input.endsWith('?') ? 10 : 5;
      setTotalXP(prev => prev + xpEarned);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response?.reply || "That's a great question! Let me help you understand this better. In SRHR education, it's important to have accurate information. Would you like to explore this topic through one of our interactive games?",
        xpEarned
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm here to help you learn! Keep asking questions to earn XP and discover new insights about SRHR topics.",
        xpEarned: 5
      }]);
    }
    
    setIsLoading(false);
  };

  const handleEndSession = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(Math.min(totalXP, 100), timeSpent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 hover:bg-white/50 rounded-lg">
              <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <div className="p-3 bg-pink-500 rounded-xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Learn with Rehana</h1>
              <p className="text-sm text-gray-600">Your AI SRHR Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-900">{totalXP} XP</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-pink-500" />
                      <span className="text-xs font-medium text-pink-600">Rehana AI</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                  {msg.xpEarned && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                      <span className="text-yellow-600">+{msg.xpEarned} XP</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="animate-bounce w-2 h-2 bg-pink-500 rounded-full"></div>
                    <div className="animate-bounce w-2 h-2 bg-pink-500 rounded-full delay-100"></div>
                    <div className="animate-bounce w-2 h-2 bg-pink-500 rounded-full delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about SRHR..."
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: Ask questions ending with ? to earn bonus XP!
            </p>
          </div>
        </div>

        {/* End Session */}
        <button
          onClick={handleEndSession}
          className="mt-4 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          End Learning Session
        </button>
      </div>
    </div>
  );
};

export default AILearningChat;
