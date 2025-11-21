import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Keyboard,
  Mic,
  Target,
  Clock,
  Info,
  Settings,
  MessageCircle,
  MapPin,
  Heart,
  BookOpen,
  Gamepad2
} from 'lucide-react';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

const MotorAccessibility: React.FC = () => {
  const navigate = useNavigate();
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [largeTouchTargets, setLargeTouchTargets] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [voiceControl, setVoiceControl] = useState(false);
  const [slowClick, setSlowClick] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-to-speech functionality
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking]);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        // Voice recognition started
      };

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        const matchedCommand = voiceCommands.find(cmd => 
          command.includes(cmd.command.toLowerCase())
        );
        
        if (matchedCommand) {
          matchedCommand.action();
          speakText(`Executing ${matchedCommand.description}`);
        }
      };

      recognition.onend = () => {
        // Voice recognition ended
      };

      if (voiceControl) {
        recognition.start();
      }
    }
  }, [voiceControl, voiceCommands, speakText]);

  // Initialize voice commands
  useEffect(() => {
    const commands: VoiceCommand[] = [
      {
        command: 'home',
        action: () => navigate('/'),
        description: 'Go to home page'
      },
      {
        command: 'chat',
        action: () => navigate('/chatbot'),
        description: 'Open chatbot'
      },
      {
        command: 'clinics',
        action: () => navigate('/clinics'),
        description: 'Find clinics'
      },
      {
        command: 'emergency',
        action: () => navigate('/emergency'),
        description: 'Emergency support'
      },
      {
        command: 'articles',
        action: () => navigate('/articles'),
        description: 'Read articles'
      },
      {
        command: 'games',
        action: () => navigate('/games'),
        description: 'Play games'
      },
      {
        command: 'settings',
        action: () => navigate('/settings'),
        description: 'Open settings'
      },
      {
        command: 'help',
        action: () => speakText('You can use voice commands to navigate the app. Say home, chat, clinics, emergency, articles, games, or settings.'),
        description: 'Get help with voice commands'
      }
    ];
    
    setVoiceCommands(commands);
  }, [navigate, speakText]);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (largeTouchTargets) {
      root.classList.add('large-touch-targets');
    } else {
      root.classList.remove('large-touch-targets');
    }
    
    if (slowClick) {
      root.classList.add('slow-click');
    } else {
      root.classList.remove('slow-click');
    }
  }, [largeTouchTargets, slowClick]);

  const accessibilityFeatures = [
    {
      id: 'large-touch',
      title: 'Large Touch Targets',
      description: 'Make buttons and links larger and easier to tap',
      icon: Target,
      isEnabled: largeTouchTargets,
      onToggle: () => setLargeTouchTargets(!largeTouchTargets)
    },
    {
      id: 'keyboard-nav',
      title: 'Keyboard Navigation',
      description: 'Navigate using Tab, Enter, and arrow keys',
      icon: Keyboard,
      isEnabled: keyboardNavigation,
      onToggle: () => setKeyboardNavigation(!keyboardNavigation)
    },
    {
      id: 'voice-control',
      title: 'Voice Control',
      description: 'Control the app using voice commands',
      icon: Mic,
      isEnabled: voiceControl,
      onToggle: () => setVoiceControl(!voiceControl)
    },
    {
      id: 'slow-click',
      title: 'Slow Click Mode',
      description: 'Increase time between clicks to prevent accidental actions',
      icon: Clock,
      isEnabled: slowClick,
      onToggle: () => setSlowClick(!slowClick)
    }
  ];

  const quickActions = [
    {
      title: 'Voice Chat',
      description: 'Chat with AI assistant using voice',
      icon: MessageCircle,
      action: () => navigate('/chatbot'),
      speakText: 'Opening voice-enabled chatbot'
    },
    {
      title: 'Find Clinics',
      description: 'Locate nearby healthcare providers',
      icon: MapPin,
      action: () => navigate('/clinics'),
      speakText: 'Finding nearby healthcare clinics'
    },
    {
      title: 'Health Articles',
      description: 'Read health information with large text',
      icon: BookOpen,
      action: () => navigate('/articles'),
      speakText: 'Opening health articles with accessibility features'
    },
    {
      title: 'Interactive Games',
      description: 'Play accessible educational games',
      icon: Gamepad2,
      action: () => navigate('/games'),
      speakText: 'Opening accessible educational games'
    }
  ];

  const voiceCommandList = [
    { command: 'Say "Home"', description: 'Go to home page' },
    { command: 'Say "Chat"', description: 'Open chatbot' },
    { command: 'Say "Clinics"', description: 'Find healthcare providers' },
    { command: 'Say "Emergency"', description: 'Access emergency support' },
    { command: 'Say "Articles"', description: 'Read health articles' },
    { command: 'Say "Games"', description: 'Play educational games' },
    { command: 'Say "Settings"', description: 'Open app settings' },
    { command: 'Say "Help"', description: 'Get voice command help' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Back Button */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Accessibility Features */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-green-600" />
              <span>Accessibility Features</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accessibilityFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      feature.isEnabled
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${feature.isEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      </div>
                      <button
                        onClick={feature.onToggle}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          feature.isEnabled ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                        aria-label={`Toggle ${feature.title}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          feature.isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice Commands */}
          {voiceControl && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Mic className="w-5 h-5 text-blue-600" />
                <span>Voice Commands</span>
              </h2>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Available Commands:</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Say any of the commands below to navigate the app hands-free.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {voiceCommandList.map((cmd, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900 text-sm">{cmd.command}</div>
                    <div className="text-xs text-gray-600">{cmd.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span>Quick Actions</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      speakText(action.speakText);
                      setTimeout(() => action.action(), 1000);
                    }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 transition-all duration-200 border border-green-200"
                  >
                    <div className="p-3 bg-green-600 rounded-xl">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Keyboard className="w-5 h-5 text-purple-600" />
              <span>Keyboard Shortcuts</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Navigate</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Tab</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Select</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Go Back</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Home</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+H</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Search</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+F</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Help</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">F1</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Help and Support */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Need Help?</h3>
                <p className="text-green-800 text-sm mb-3">
                  If you need assistance with motor accessibility features or have questions about sexual and reproductive health, we're here to help.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      speakText('Opening chatbot for assistance');
                      navigate('/chatbot');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Chat with Assistant
                  </button>
                  <button
                    onClick={() => {
                      speakText('Finding emergency support');
                      navigate('/emergency');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Emergency Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorAccessibility;
