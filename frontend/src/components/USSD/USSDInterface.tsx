import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  ArrowLeft, 
  ArrowRight, 
  Home,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { ussdService, USSDMenu, USSDUser } from '../../services/ussdService';

const USSDInterface: React.FC = () => {
  const { settings } = useAccessibility();
  const [currentMenu, setCurrentMenu] = useState<USSDMenu | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [user, setUser] = useState<USSDUser | null>(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [language, setLanguage] = useState<'en' | 'bassa' | 'kpelle' | 'kru' | 'vai'>('en');

  useEffect(() => {
    setIsConnected(navigator.onLine);
    
    // Start with main menu
    const sessionId = `demo_${Date.now()}`;
    const response = ussdService.startSession(phoneNumber || 'demo', language);
    setSessionId(sessionId);
    const mainMenu = ussdService.getMenu('main');
    setCurrentMenu(mainMenu || null);
  }, [phoneNumber, language]);

  const handleInput = (value: string) => {
    if (!currentMenu) return;

    setInput(value);
    setHistory(prev => [...prev, value]);
    
    // Process input
    const response = ussdService.processInput(sessionId, value);
    
    // Find the option that was selected
    const option = currentMenu.options.find(opt => opt.key === value);
    if (option) {
      if (option.action === 'menu' && option.targetId) {
        const newMenu = ussdService.getMenu(option.targetId);
        setCurrentMenu(newMenu || null);
      } else if (option.action === 'action' && option.handler) {
        // Show action result
        const result = option.handler();
        // For demo purposes, we'll show the result and then go back to main menu
        setTimeout(() => {
          const mainMenu = ussdService.getMenu('main');
          setCurrentMenu(mainMenu || null);
        }, 3000);
      }
    }
    
    setInput('');
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Enter' && input.trim()) {
      handleInput(input.trim());
    }
  };

  const goBack = () => {
    if (currentMenu?.parentId) {
      const parentMenu = ussdService.getMenu(currentMenu.parentId);
      setCurrentMenu(parentMenu || null);
    } else {
      const mainMenu = ussdService.getMenu('main');
      setCurrentMenu(mainMenu || null);
    }
  };

  const formatMenuDisplay = (menu: USSDMenu) => {
    let display = `${menu.title}\n\n`;
    menu.options.forEach(option => {
      display += `${option.key}. ${option.label}\n`;
    });
    display += '\nEnter your choice:';
    return display;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-full">
              <Phone className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-green-400">USSD Interface</h1>
              <p className="text-sm text-green-300">REPRO PLAN SRHR Menu System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* USSD Display */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-center space-x-2 text-green-300 text-sm">
              <span>USSD</span>
              <span>•</span>
              <span>REPRO PLAN SRHR</span>
              <span>•</span>
              <span>{phoneNumber || 'Demo'}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 pr-2">
            <div className="space-y-2">
              {currentMenu && (
                <div className="text-green-400 whitespace-pre-line">
                  {formatMenuDisplay(currentMenu)}
                </div>
              )}
              
              {/* Input History */}
              {history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-green-300 text-sm mb-2">History:</div>
                  {history.slice(-10).map((item, index) => (
                    <div key={index} className="text-green-400 text-sm">
                      &gt; {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter choice..."
            className="flex-1 p-3 bg-black border border-gray-600 text-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
            onKeyPress={(e) => handleKeyPress(e.key)}
            maxLength={1}
          />
          <button
            onClick={() => handleInput(input)}
            disabled={!input.trim()}
            className="px-4 py-3 bg-green-600 text-black rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick Keys */}
        <div className="mt-3">
          <div className="grid grid-cols-5 gap-2">
            {['1', '2', '3', '4', '5'].map((key) => (
              <button
                key={key}
                onClick={() => handleInput(key)}
                className="p-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 font-mono"
              >
                {key}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={goBack}
              className="p-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                const mainMenu = ussdService.getMenu('main');
                setCurrentMenu(mainMenu || null);
              }}
              className="p-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700 flex items-center justify-center space-x-1"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setHistory([])}
              className="p-2 bg-gray-800 text-green-400 rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+231-XXX-XXXX"
              className="w-full p-2 bg-black border border-gray-600 text-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-400 mb-1">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full p-2 bg-black border border-gray-600 text-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
            >
              <option value="en">English</option>
              <option value="bassa">Bassa</option>
              <option value="kpelle">Kpelle</option>
              <option value="kru">Kru</option>
              <option value="vai">Vai</option>
            </select>
          </div>
        </div>
      </div>

      {/* USSD Mode Indicator */}
      {settings.ussdMode && (
        <div className="fixed bottom-4 left-4 bg-green-600 text-black px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">USSD Mode Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default USSDInterface;
