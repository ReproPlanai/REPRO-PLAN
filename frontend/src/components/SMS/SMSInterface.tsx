import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Hash, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Info,
  Wifi,
  WifiOff,
  Shield,
  Heart,
  Users,
  Globe,
  ArrowLeft,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { smsIntegration, SMSMessage } from '../../utils/smsIntegration';

interface SMSInterfaceProps {
  onBack?: () => void;
}

const SMSInterface: React.FC<SMSInterfaceProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'sms' | 'ussd' | 'dialpad'>('sms');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [smsHistory, setSmsHistory] = useState<SMSMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [dialpadNumber, setDialpadNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'mtn' | 'orange' | 'all'>('all');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSMSHistory();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [smsHistory]);

  const loadSMSHistory = () => {
    const history = smsIntegration.getSMSHistory();
    setSmsHistory(history);
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim() || !message.trim() || isSending) return;

    setIsSending(true);
    try {
      const success = await smsIntegration.sendSMS(phoneNumber.trim(), message.trim());
      if (success) {
        setMessage('');
        loadSMSHistory();
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUSSDCode = async (code: string) => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number first');
      return;
    }

    try {
      const response = await smsIntegration.processUSSDCode(code, phoneNumber.trim());
      // In a real app, this would show the USSD response
      console.log('USSD Response:', response);
      alert(`USSD Response:\n${response}`);
    } catch (error) {
      console.error('Failed to process USSD code:', error);
    }
  };

  const handleDialpadInput = (digit: string) => {
    if (digit === 'clear') {
      setDialpadNumber('');
    } else if (digit === 'backspace') {
      setDialpadNumber(prev => prev.slice(0, -1));
    } else {
      setDialpadNumber(prev => prev + digit);
    }
  };

  const handleDialpadCall = () => {
    if (dialpadNumber.trim()) {
      // In a real app, this would initiate a call
      alert(`Calling ${dialpadNumber}...`);
    }
  };

  const getProviderServices = () => {
    const mtnServices = [
      { code: '*123#', name: 'MTN Health Info', description: 'Access SRHR information via MTN' },
      { code: '*456#', name: 'MTN Emergency', description: 'Emergency SRHR support' },
      { code: '*789#', name: 'MTN Counseling', description: 'Mental health and counseling' }
    ];

    const orangeServices = [
      { code: '*111#', name: 'Orange Health', description: 'Health information services' },
      { code: '*222#', name: 'Orange Support', description: 'Support and guidance' },
      { code: '*333#', name: 'Orange Emergency', description: 'Emergency assistance' }
    ];

    if (selectedProvider === 'mtn') return mtnServices;
    if (selectedProvider === 'orange') return orangeServices;
    return [...mtnServices, ...orangeServices];
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="flex flex-col h-screen-safe bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">

      {/* Back Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2">
        <div className="flex items-center justify-between">
          <Link
            to="/offline"
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Offline Mode"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Back to Offline Mode</span>
          </Link>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-orange-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>

      {/* Tab Navigation */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'sms'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">SMS</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ussd')}
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'ussd'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <Hash className="w-4 h-4" />
              <span className="text-sm">USSD</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('dialpad')}
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'dialpad'
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <Phone className="w-4 h-4" />
              <span className="text-sm">Dialpad</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'sms' ? (
          <div className="flex flex-col h-full">
            {/* SMS History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {smsHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No SMS Messages</h3>
                  <p className="text-gray-500">Send your first SMS to get started</p>
                </div>
              ) : (
                smsHistory.map((sms) => (
                  <div
                    key={sms.id}
                    className={`flex ${sms.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                      sms.type === 'outgoing'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium opacity-75">
                          {sms.phoneNumber}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(sms.status)}
                          <span className={`text-xs font-medium ${getStatusColor(sms.status)}`}>
                            {sms.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{sms.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-75">
                          {formatTime(sms.timestamp)}
                        </span>
                        <span className="text-xs opacity-75">
                          {sms.type === 'outgoing' ? 'Sent' : 'Received'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* SMS Input */}
            <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number (e.g., +231-555-0123)"
                  className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                />
              </div>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendSMS()}
                />
                <button
                  onClick={handleSendSMS}
                  disabled={!phoneNumber.trim() || !message.trim() || isSending}
                  className="p-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg transition-all duration-200 active:scale-95"
                >
                  <Send size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'ussd' ? (
          <div className="p-4 space-y-4">
            <div className="text-center py-4">
              <Hash className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">USSD Services</h3>
              <p className="text-gray-600 text-sm">Access SRHR services via mobile networks</p>
            </div>

            {/* Provider Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Network Provider
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProvider('all')}
                  className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedProvider === 'all'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Networks
                </button>
                <button
                  onClick={() => setSelectedProvider('mtn')}
                  className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedProvider === 'mtn'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  MTN
                </button>
                <button
                  onClick={() => setSelectedProvider('orange')}
                  className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedProvider === 'orange'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Orange
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2">
              {getProviderServices().map((service, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-xl ${
                          service.code.includes('123') || service.code.includes('111') 
                            ? 'bg-gradient-to-r from-green-500 to-blue-500'
                            : service.code.includes('456') || service.code.includes('222')
                            ? 'bg-gradient-to-r from-red-500 to-pink-500'
                            : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        }`}>
                          <Hash className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.code}</h4>
                          <p className="text-sm text-gray-600">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.description}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUSSDCode(service.code)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 active:scale-95"
                    >
                      Dial
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Provider-specific guidance */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {selectedProvider === 'mtn' ? 'MTN Services' : 
                     selectedProvider === 'orange' ? 'Orange Services' : 
                     'Network Services'}
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Dial the code on your phone</li>
                    <li>• Follow the menu prompts</li>
                    <li>• Access SRHR information offline</li>
                    <li>• No internet connection required</li>
                    {selectedProvider === 'mtn' && (
                      <li>• MTN: Available on all MTN numbers</li>
                    )}
                    {selectedProvider === 'orange' && (
                      <li>• Orange: Available on all Orange numbers</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Back to Offline Mode */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Offline Mode</h4>
                    <p className="text-sm text-gray-600">Access your downloaded content and offline features</p>
                  </div>
                </div>
                <Link
                  to="/offline"
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-blue-500 text-white rounded-xl hover:from-gray-600 hover:to-blue-600 transition-all duration-200"
                >
                  Go to Offline Mode
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Dialpad Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="text-center py-4">
                <Phone className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dialpad</h3>
                <p className="text-gray-600 text-sm">Make calls and access services</p>
              </div>

            {/* Phone Number Display */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200/50">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-mono text-gray-900 mb-1 sm:mb-2 break-all">
                  {dialpadNumber || 'Enter number'}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {dialpadNumber.length > 0 ? `${dialpadNumber.length} digits` : 'Ready to dial'}
                </div>
              </div>
            </div>

            {/* Dialpad */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200/50">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-sm mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDialpadInput(digit)}
                    className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 hover:from-green-100 hover:to-blue-100 rounded-xl sm:rounded-2xl font-semibold text-gray-900 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md text-lg sm:text-xl min-h-[60px] sm:min-h-[70px] lg:min-h-[80px]"
                  >
                    {digit}
                  </button>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 max-w-sm mx-auto">
                <button
                  onClick={() => handleDialpadInput('clear')}
                  className="flex-1 py-2 sm:py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-all duration-200 text-sm sm:text-base"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleDialpadInput('backspace')}
                  className="flex-1 py-2 sm:py-3 bg-orange-100 text-orange-600 rounded-xl font-medium hover:bg-orange-200 transition-all duration-200 text-sm sm:text-base"
                >
                  Backspace
                </button>
                <button
                  onClick={handleDialpadCall}
                  disabled={!dialpadNumber.trim()}
                  className="flex-1 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                >
                  Call
                </button>
              </div>
            </div>

            {/* Offline Mode Notice */}
            {!isOnline && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <WifiOff className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-orange-900">Offline Mode Active</h4>
                    <p className="text-sm text-orange-800">
                      You're offline. SMS and USSD services work without internet connection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick access numbers */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-3 sm:p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-2 text-sm sm:text-base">
                <Heart className="w-4 h-4" />
                <span>Quick Access Numbers</span>
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setDialpadNumber('911')}
                  className="w-full text-left p-2 sm:p-3 bg-white/80 rounded-xl hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm sm:text-base">Emergency</div>
                      <div className="text-xs sm:text-sm text-gray-600">911</div>
                    </div>
                    <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
                  </div>
                </button>
                <button
                  onClick={() => setDialpadNumber('*123#')}
                  className="w-full text-left p-2 sm:p-3 bg-white/80 rounded-xl hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm sm:text-base">Health Info</div>
                      <div className="text-xs sm:text-sm text-gray-600">*123#</div>
                    </div>
                    <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                </button>
                <button
                  onClick={() => setDialpadNumber('*456#')}
                  className="w-full text-left p-2 sm:p-3 bg-white/80 rounded-xl hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm sm:text-base">Support</div>
                      <div className="text-xs sm:text-sm text-gray-600">*456#</div>
                    </div>
                    <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </div>
                </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSInterface;
