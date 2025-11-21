import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Settings,
  User,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { smsService, SMSMessage, SMSUser } from '../../services/smsService';

const AccessibleSMSInterface: React.FC = () => {
  const { settings } = useAccessibility();
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<SMSUser | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bassa' | 'kpelle' | 'kru' | 'vai'>('en');

  useEffect(() => {
    // Simulate connection status
    setIsConnected(navigator.onLine);
    
    // Load existing messages
    const savedMessages = localStorage.getItem('sms-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !phoneNumber.trim()) return;

    const message: SMSMessage = {
      id: Date.now().toString(),
      phoneNumber,
      message: currentMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    // Add to local messages
    const newMessages = [...messages, message];
    setMessages(newMessages);
    localStorage.setItem('sms-messages', JSON.stringify(newMessages));

    // Process through SMS service
    const response = smsService.processIncomingSMS(phoneNumber, currentMessage);
    
    // Add response message
    const responseMessage: SMSMessage = {
      id: (Date.now() + 1).toString(),
      phoneNumber: 'REPRO PLAN',
      message: response,
      timestamp: new Date(),
      status: 'delivered'
    };

    const updatedMessages = [...newMessages, responseMessage];
    setMessages(updatedMessages);
    localStorage.setItem('sms-messages', JSON.stringify(updatedMessages));

    setCurrentMessage('');
  };

  const handleRegisterUser = () => {
    if (!phoneNumber.trim()) return;
    
    const newUser = smsService.registerUser(phoneNumber, language);
    setUser(newUser);
    
    // Add welcome message
    const welcomeMessage: SMSMessage = {
      id: Date.now().toString(),
      phoneNumber: 'REPRO PLAN',
      message: smsService.processIncomingSMS(phoneNumber, 'START'),
      timestamp: new Date(),
      status: 'delivered'
    };

    const newMessages = [...messages, welcomeMessage];
    setMessages(newMessages);
    localStorage.setItem('sms-messages', JSON.stringify(newMessages));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'failed': return '✗';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">SMS Interface</h1>
              <p className="text-sm text-gray-500">REPRO PLAN SRHR via SMS</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">SMS Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+231-XXX-XXXX"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="bassa">Bassa</option>
                <option value="kpelle">Kpelle</option>
                <option value="kru">Kru</option>
                <option value="vai">Vai</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleRegisterUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Register User</span>
            </button>
            
            <button
              onClick={() => setMessages([])}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Messages
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-500">
              Register your phone number and start chatting with REPRO PLAN SRHR
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.phoneNumber === 'REPRO PLAN' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.phoneNumber === 'REPRO PLAN'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-green-100 text-green-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {message.phoneNumber === 'REPRO PLAN' ? 'REPRO PLAN' : 'You'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <div className="flex items-center justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {getMessageStatusIcon(message.status)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!phoneNumber.trim()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || !phoneNumber.trim()}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send message</span>
          </button>
        </div>
        
        {/* Quick Commands */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Quick Commands:</p>
          <div className="flex flex-wrap gap-2">
            {['QUIZ', 'HELP', 'STATS', 'CLINIC'].map((command) => (
              <button
                key={command}
                onClick={() => setCurrentMessage(command)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SMS Mode Indicator */}
      {settings.smsMode && (
        <div className="fixed bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">SMS Mode Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibleSMSInterface;
