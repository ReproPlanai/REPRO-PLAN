import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { 
  Eye,
  Volume2,
  Contrast,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Settings,
  BookOpen,
  MessageCircle,
  MapPin,
  Heart,
  Shield,
  Info
} from 'lucide-react';

interface AccessibilityFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
  isEnabled: boolean;
  onToggle: () => void;
  category: 'visual' | 'audio' | 'navigation' | 'content';
}

const fontSizeToSetting = (px: number): 'normal' | 'large' | 'extra-large' | 'huge' =>
  px <= 18 ? 'normal' : px <= 22 ? 'large' : px <= 28 ? 'extra-large' : 'huge';

const settingToFontSize = (s: string): number =>
  s === 'normal' ? 16 : s === 'large' ? 20 : s === 'extra-large' ? 24 : 32;

const VisualAccessibility: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSetting } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const fontSize = settingToFontSize(settings.fontSize);
  const highContrast = settings.highContrast;
  const colorBlindMode = settings.colorBlindMode;

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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const accessibilityFeatures: AccessibilityFeature[] = [
    {
      id: 'screen-reader',
      title: 'Screen Reader Mode',
      description: 'Optimize content for screen readers and assistive technologies',
      icon: Eye,
      isEnabled: screenReader,
      onToggle: () => setScreenReader(!screenReader),
      category: 'visual'
    },
    {
      id: 'high-contrast',
      title: 'High Contrast Mode',
      description: 'Increase contrast between text and background for better visibility',
      icon: Contrast,
      isEnabled: highContrast,
      onToggle: () => updateSetting('highContrast', !highContrast),
      category: 'visual'
    },
    {
      id: 'text-to-speech',
      title: 'Text-to-Speech',
      description: 'Read content aloud using voice synthesis',
      icon: Volume2,
      isEnabled: isSpeaking,
      onToggle: () => isSpeaking ? stopSpeaking() : speakText('Welcome to REPRO PLAN Visual Accessibility features. This page is designed to help users with visual impairments access sexual and reproductive health information safely and effectively.'),
      category: 'audio'
    }
  ];

  const quickActions = [
    {
      title: 'Watch Videos',
      description: 'Access videos with screen reader optimization',
      icon: BookOpen,
      action: () => navigate('/videos'),
      speakText: 'Navigate to health videos with screen reader support'
    },
    {
      title: 'Chat with Assistant',
      description: 'Voice-enabled chatbot for health questions',
      icon: MessageCircle,
      action: () => navigate('/chatbot'),
      speakText: 'Open voice-enabled chatbot for health questions'
    },
    {
      title: 'Find Clinics',
      description: 'Locate nearby healthcare providers',
      icon: MapPin,
      action: () => navigate('/clinics'),
      speakText: 'Find nearby healthcare clinics and providers'
    },
    {
      title: 'Emergency Support',
      description: 'Quick access to emergency resources',
      icon: Shield,
      action: () => navigate('/emergency'),
      speakText: 'Access emergency support and resources'
    }
  ];

  const healthTopics = [
    {
      title: 'Contraception Methods',
      description: 'Learn about different birth control options',
      content: 'There are many types of contraception available, including condoms, birth control pills, IUDs, and implants. Each method has different effectiveness rates and side effects. It\'s important to discuss options with a healthcare provider to find what works best for you.',
      speakText: 'Contraception methods include condoms, birth control pills, IUDs, and implants. Each has different effectiveness and side effects. Consult a healthcare provider.'
    },
    {
      title: 'STI Prevention',
      description: 'How to protect yourself from sexually transmitted infections',
      content: 'STI prevention includes using condoms consistently and correctly, getting regular STI testing, limiting sexual partners, and being vaccinated against HPV and hepatitis B. Early detection and treatment are crucial for your health.',
      speakText: 'STI prevention includes using condoms, regular testing, limiting partners, and HPV vaccination. Early detection is important.'
    },
    {
      title: 'Consent and Boundaries',
      description: 'Understanding consent in relationships',
      content: 'Consent is a clear, enthusiastic, and ongoing agreement to engage in sexual activity. It must be given freely, without pressure or coercion. You have the right to say no at any time, and your partner must respect your boundaries.',
      speakText: 'Consent is clear, enthusiastic, ongoing agreement to sexual activity. It must be given freely without pressure. You can say no anytime.'
    },
    {
      title: 'Mental Health Support',
      description: 'Resources for emotional and mental wellbeing',
      content: 'Mental health is an important part of overall health. If you\'re feeling anxious, depressed, or overwhelmed, it\'s okay to seek help. There are counselors, support groups, and mental health professionals who can provide support.',
      speakText: 'Mental health is important. If you feel anxious, depressed, or overwhelmed, seek help from counselors or mental health professionals.'
    }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden">
      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          
          {/* Accessibility Features */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
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
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${feature.isEnabled ? 'text-blue-600' : 'text-gray-500'}`} />
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      </div>
                      <button
                        onClick={feature.onToggle}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          feature.isEnabled ? 'bg-blue-600' : 'bg-gray-300'
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

            {/* Font Size Control */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size: {fontSize}px
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    const next = Math.max(12, fontSize - 4);
                    updateSetting('fontSize', fontSizeToSetting(next));
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Decrease font size"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${((fontSize - 12) / 20) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => {
                    const next = Math.min(32, fontSize + 4);
                    updateSetting('fontSize', fontSizeToSetting(next));
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Increase font size"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Color Blind Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Blind Support
              </label>
              <select
                value={colorBlindMode}
                onChange={(e) => updateSetting('colorBlindMode', e.target.value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="tritanopia">Tritanopia (Blue-blind)</option>
              </select>
            </div>

            <button
              onClick={() => {
                updateSetting('fontSize', 'normal');
                updateSetting('highContrast', false);
                updateSetting('colorBlindMode', 'none');
                updateSetting('reducedMotion', false);
                stopSpeaking();
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
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
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200"
                  >
                    <div className="p-3 bg-blue-600 rounded-xl">
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

          {/* Health Topics */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span>Health Information</span>
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
                      onClick={() => speakText(topic.speakText)}
                      className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      aria-label={`Read about ${topic.title}`}
                    >
                      {isSpeaking ? <Pause className="w-4 h-4 text-blue-600" /> : <Play className="w-4 h-4 text-blue-600" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{topic.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Help and Support */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-blue-800 text-sm mb-3">
                  If you need assistance with accessibility features or have questions about sexual and reproductive health, we're here to help.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      speakText('Opening chatbot for assistance');
                      navigate('/chatbot');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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

export default VisualAccessibility;
