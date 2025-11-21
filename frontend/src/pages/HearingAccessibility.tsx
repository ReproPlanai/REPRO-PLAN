import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Volume2,
  Eye,
  Vibrate,
  Subtitles,
  Flashlight,
  Play,
  Pause,
  Info,
  Settings,
  MessageCircle,
  MapPin,
  Heart,
  Shield,
  BookOpen,
  Zap
} from 'lucide-react';

const HearingAccessibility: React.FC = () => {
  const navigate = useNavigate();
  const [visualAlerts, setVisualAlerts] = useState(false);
  const [vibration, setVibration] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [flashAlerts, setFlashAlerts] = useState(false);
  const [signLanguage, setSignLanguage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-to-speech functionality
  const speakText = (text: string) => {
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
  };

  // Vibration API
  const triggerVibration = (pattern: number[] = [200, 100, 200]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Flash notification
  const triggerFlash = () => {
    if (flashAlerts) {
      // Simulate flash by changing background color briefly
      document.body.style.backgroundColor = '#ffff00';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 200);
    }
  };

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (visualAlerts) {
      root.classList.add('visual-alerts');
    } else {
      root.classList.remove('visual-alerts');
    }
    
    if (captions) {
      root.classList.add('captions-enabled');
    } else {
      root.classList.remove('captions-enabled');
    }
  }, [visualAlerts, captions]);

  const accessibilityFeatures = [
    {
      id: 'visual-alerts',
      title: 'Visual Alerts',
      description: 'Show visual notifications instead of sound alerts',
      icon: Eye,
      isEnabled: visualAlerts,
      onToggle: () => setVisualAlerts(!visualAlerts)
    },
    {
      id: 'vibration',
      title: 'Vibration Alerts',
      description: 'Use device vibration for notifications',
      icon: Vibrate,
      isEnabled: vibration,
      onToggle: () => setVibration(!vibration)
    },
    {
      id: 'captions',
      title: 'Auto Captions',
      description: 'Show captions for all video content',
      icon: Subtitles,
      isEnabled: captions,
      onToggle: () => setCaptions(!captions)
    },
    {
      id: 'flash-alerts',
      title: 'Flash Notifications',
      description: 'Use screen flash for important alerts',
      icon: Flashlight,
      isEnabled: flashAlerts,
      onToggle: () => setFlashAlerts(!flashAlerts)
    },
    {
      id: 'sign-language',
      title: 'Sign Language Support',
      description: 'Show sign language videos for content',
      icon: Volume2,
      isEnabled: signLanguage,
      onToggle: () => setSignLanguage(!signLanguage)
    }
  ];

  const quickActions = [
    {
      title: 'Text Chat',
      description: 'Chat with AI assistant using text',
      icon: MessageCircle,
      action: () => navigate('/chatbot'),
      speakText: 'Opening text-based chatbot'
    },
    {
      title: 'Find Clinics',
      description: 'Locate healthcare providers with visual maps',
      icon: MapPin,
      action: () => navigate('/clinics'),
      speakText: 'Finding healthcare clinics with visual maps'
    },
    {
      title: 'Health Articles',
      description: 'Read health information with visual aids',
      icon: BookOpen,
      action: () => navigate('/articles'),
      speakText: 'Opening health articles with visual aids'
    },
    {
      title: 'Emergency Support',
      description: 'Access emergency resources with visual alerts',
      icon: Shield,
      action: () => navigate('/emergency'),
      speakText: 'Accessing emergency support with visual alerts'
    }
  ];

  const healthTopics = [
    {
      title: 'Contraception Methods',
      description: 'Visual guide to birth control options',
      content: 'There are many types of contraception available. Condoms are barrier methods that prevent pregnancy and STIs. Birth control pills are hormonal methods taken daily. IUDs are long-acting reversible contraceptives. Each method has different effectiveness rates and side effects.',
      visualAid: '📊 Effectiveness Chart: Condoms 85%, Pills 91%, IUDs 99%',
      signLanguage: 'Available in Liberian Sign Language'
    },
    {
      title: 'STI Prevention',
      description: 'Visual guide to protecting yourself',
      content: 'STI prevention includes using condoms consistently, getting regular testing, limiting sexual partners, and vaccination. Early detection through testing is crucial for treatment and preventing transmission to others.',
      visualAid: '🛡️ Protection Methods: Condoms, Testing, Vaccination, Communication',
      signLanguage: 'Available in Liberian Sign Language'
    },
    {
      title: 'Consent and Boundaries',
      description: 'Understanding consent through visual examples',
      content: 'Consent is clear, enthusiastic, and ongoing agreement. It must be given freely without pressure. You have the right to say no at any time. Visual cues include enthusiastic body language, clear communication, and respect for boundaries.',
      visualAid: '✅ Consent Checklist: Clear, Enthusiastic, Ongoing, Freely Given',
      signLanguage: 'Available in Liberian Sign Language'
    },
    {
      title: 'Mental Health Support',
      description: 'Visual resources for emotional wellbeing',
      content: 'Mental health is important for overall wellbeing. Signs to watch for include changes in mood, sleep, appetite, or energy. Support is available through counselors, support groups, and mental health professionals.',
      visualAid: '💚 Support Resources: Counselors, Support Groups, Hotlines, Apps',
      signLanguage: 'Available in Liberian Sign Language'
    }
  ];

  const testAlert = () => {
    if (visualAlerts) {
      // Show visual alert
      alert('🔔 Visual Alert: This is a test notification!');
    }
    
    if (vibration) {
      triggerVibration();
    }
    
    if (flashAlerts) {
      triggerFlash();
    }
    
    speakText('Test alert triggered with your selected accessibility features');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Accessibility Features</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {accessibilityFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      feature.isEnabled
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${feature.isEnabled ? 'text-purple-600' : 'text-gray-500'}`} />
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      </div>
                      <button
                        onClick={feature.onToggle}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          feature.isEnabled ? 'bg-purple-600' : 'bg-gray-300'
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

            {/* Test Alert Button */}
            <div className="text-center">
              <button
                onClick={testAlert}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Zap className="w-5 h-5" />
                <span>Test Alert</span>
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Test your selected accessibility features
              </p>
            </div>
          </div>

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
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-200"
                  >
                    <div className="p-3 bg-purple-600 rounded-xl">
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

          {/* Health Topics with Visual Aids */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span>Health Information with Visual Aids</span>
            </h2>
            
            <div className="space-y-4">
              {healthTopics.map((topic, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                    </div>
                    <button
                      onClick={() => speakText(topic.content)}
                      className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                      aria-label={`Read about ${topic.title}`}
                    >
                      {isSpeaking ? <Pause className="w-4 h-4 text-purple-600" /> : <Play className="w-4 h-4 text-purple-600" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{topic.content}</p>
                  
                  {/* Visual Aid */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Visual Aid:</span>
                    </div>
                    <p className="text-sm text-blue-800">{topic.visualAid}</p>
                  </div>
                  
                  {/* Sign Language Support */}
                  {signLanguage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Sign Language:</span>
                        <span className="text-sm text-green-800">{topic.signLanguage}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Communication Tips */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span>Communication Tips</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-1">For Healthcare Providers</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Use written communication</li>
                    <li>• Provide visual aids and diagrams</li>
                    <li>• Speak clearly and face the person</li>
                    <li>• Use gestures and body language</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-1">Emergency Situations</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Use visual emergency signals</li>
                    <li>• Have written emergency contacts</li>
                    <li>• Use vibration alerts</li>
                    <li>• Flash lights for attention</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-1">Technology Tips</h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Use text messaging for communication</li>
                    <li>• Enable visual notifications</li>
                    <li>• Use video calls with captions</li>
                    <li>• Download sign language apps</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-1">Support Resources</h4>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• Liberian National Association of the Deaf</li>
                    <li>• Sign language interpreters</li>
                    <li>• Visual communication apps</li>
                    <li>• Hearing aid support groups</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Help and Support */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Need Help?</h3>
                <p className="text-purple-800 text-sm mb-3">
                  If you need assistance with hearing accessibility features or have questions about sexual and reproductive health, we're here to help.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      speakText('Opening text-based chatbot for assistance');
                      navigate('/chatbot');
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Text Chat
                  </button>
                  <button
                    onClick={() => {
                      speakText('Finding emergency support with visual alerts');
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

export default HearingAccessibility;
