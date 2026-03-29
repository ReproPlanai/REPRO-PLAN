import React, { useState, useEffect } from 'react';
import { 
  Eye,
  Brain,
  Hand,
  Volume2,
  Settings as SettingsIcon,
  Sparkles,
  Shield,
  BookOpen,
  MessageCircle,
  MapPin,
  Users,
  Play,
  Pause,
  RefreshCw,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import { apiService } from '../services/api';

interface AccessibilitySettings {
  visual: {
    highContrast: boolean;
    largeText: boolean;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    screenReader: boolean;
    reducedMotion: boolean;
  };
  cognitive: {
    simpleLanguage: boolean;
    showProgress: boolean;
    confirmActions: boolean;
    reduceDistractions: boolean;
    stepByStepGuides: boolean;
  };
  hearing: {
    captionsEnabled: boolean;
    visualAlerts: boolean;
    volumeBoost: boolean;
    monoAudio: boolean;
  };
  motor: {
    keyboardNavigation: boolean;
    voiceControl: boolean;
    largeButtons: boolean;
    reducedClicks: boolean;
  };
}

interface AccessibilityProfile {
  id: string;
  name: string;
  description: string;
  icon: any;
  settings: Partial<AccessibilitySettings>;
  isRecommended?: boolean;
}

const AccessibilityHub: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    visual: {
      highContrast: false,
      largeText: false,
      colorBlindMode: 'none',
      screenReader: false,
      reducedMotion: false
    },
    cognitive: {
      simpleLanguage: false,
      showProgress: false,
      confirmActions: false,
      reduceDistractions: false,
      stepByStepGuides: false
    },
    hearing: {
      captionsEnabled: false,
      visualAlerts: false,
      volumeBoost: false,
      monoAudio: false
    },
    motor: {
      keyboardNavigation: false,
      voiceControl: false,
      largeButtons: false,
      reducedClicks: false
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'visual' | 'cognitive' | 'hearing' | 'motor'>('all');

  useEffect(() => {
    loadAccessibilitySettings();
    loadSavedProfiles();
  }, []);

  const loadAccessibilitySettings = async () => {
    try {
      const response = await apiService.getAccessibilitySettings?.() as { success: boolean; settings?: AccessibilitySettings };
      if (response?.success && response.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }
  };

  const loadSavedProfiles = async () => {
    try {
      const response = await apiService.getAccessibilityProfiles?.() as { success: boolean; profiles?: AccessibilityProfile[] };
      if (response?.success && response.profiles) {
        // Profiles are loaded but not stored in state since they're not used yet
      }
    } catch (error) {
      console.error('Failed to load accessibility profiles:', error);
    }
  };

  const updateSetting = (category: keyof AccessibilitySettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    setSettings(newSettings);
    
    // Save to API
    apiService.updateAccessibilitySettings?.(newSettings).catch(error => {
      console.error('Failed to save accessibility settings:', error);
    });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
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

  const applyProfile = (profile: AccessibilityProfile) => {
    const newSettings = {
      ...settings,
      ...profile.settings
    };
    setSettings(newSettings);
    
    apiService.updateAccessibilitySettings?.(newSettings).catch(error => {
      console.error('Failed to apply accessibility profile:', error);
    });
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      visual: {
        highContrast: false,
        largeText: false,
        colorBlindMode: 'none',
        screenReader: false,
        reducedMotion: false
      },
      cognitive: {
        simpleLanguage: false,
        showProgress: false,
        confirmActions: false,
        reduceDistractions: false,
        stepByStepGuides: false
      },
      hearing: {
        captionsEnabled: false,
        visualAlerts: false,
        volumeBoost: false,
        monoAudio: false
      },
      motor: {
        keyboardNavigation: false,
        voiceControl: false,
        largeButtons: false,
        reducedClicks: false
      }
    };
    
    setSettings(defaultSettings);
    apiService.updateAccessibilitySettings?.(defaultSettings).catch(error => {
      console.error('Failed to reset accessibility settings:', error);
    });
  };

  const categories = [
    { id: 'visual', label: 'Visual', icon: Eye, color: 'from-blue-500 to-cyan-500' },
    { id: 'cognitive', label: 'Cognitive', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'hearing', label: 'Hearing', icon: Volume2, color: 'from-green-500 to-emerald-500' },
    { id: 'motor', label: 'Motor', icon: Hand, color: 'from-orange-500 to-red-500' }
  ];

  const quickActions = [
    {
      title: 'Emergency Support',
      description: 'Quick access to emergency resources',
      icon: Shield,
      color: 'from-red-500 to-rose-500',
      action: () => speakText('Opening emergency support resources'),
      href: '/emergency'
    },
    {
      title: 'Health Chat',
      description: 'Voice-enabled health assistant',
      icon: MessageCircle,
      color: 'from-blue-500 to-indigo-500',
      action: () => speakText('Opening voice-enabled health chat'),
      href: '/chatbot'
    },
    {
      title: 'Find Clinics',
      description: 'Locate nearby healthcare providers',
      icon: MapPin,
      color: 'from-green-500 to-teal-500',
      action: () => speakText('Finding nearby healthcare clinics'),
      href: '/clinics'
    },
    {
      title: 'Support Groups',
      description: 'Connect with peer support networks',
      icon: Users,
      color: 'from-purple-500 to-violet-500',
      action: () => speakText('Opening peer support groups'),
      href: '/support-groups'
    }
  ];

  const accessibilityFeatures = [
    {
      category: 'visual',
      features: [
        { key: 'highContrast', label: 'High Contrast', desc: 'Increase text and background contrast' },
        { key: 'largeText', label: 'Large Text', desc: 'Increase font size for better readability' },
        { key: 'screenReader', label: 'Screen Reader', desc: 'Optimize content for screen readers' },
        { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Minimize animations and transitions' }
      ]
    },
    {
      category: 'cognitive',
      features: [
        { key: 'simpleLanguage', label: 'Simple Language', desc: 'Use easy words and short sentences' },
        { key: 'showProgress', label: 'Show Progress', desc: 'Always display current step indicators' },
        { key: 'confirmActions', label: 'Confirm Actions', desc: 'Ask before performing important actions' },
        { key: 'reduceDistractions', label: 'Reduce Distractions', desc: 'Minimize non-essential content' }
      ]
    },
    {
      category: 'hearing',
      features: [
        { key: 'captionsEnabled', label: 'Captions', desc: 'Show text captions for audio content' },
        { key: 'visualAlerts', label: 'Visual Alerts', desc: 'Display visual notifications for sounds' },
        { key: 'volumeBoost', label: 'Volume Boost', desc: 'Enhance audio volume for hearing assistance' },
        { key: 'monoAudio', label: 'Mono Audio', desc: 'Combine audio channels for clarity' }
      ]
    },
    {
      category: 'motor',
      features: [
        { key: 'keyboardNavigation', label: 'Keyboard Navigation', desc: 'Enable full keyboard control' },
        { key: 'voiceControl', label: 'Voice Control', desc: 'Navigate using voice commands' },
        { key: 'largeButtons', label: 'Large Buttons', desc: 'Increase button sizes for easier clicking' },
        { key: 'reducedClicks', label: 'Reduced Clicks', desc: 'Minimize required interactions' }
      ]
    }
  ];

  const filteredFeatures = activeCategory === 'all' 
    ? accessibilityFeatures.flatMap(cat => cat.features.map(f => ({ ...f, category: cat.category })))
    : accessibilityFeatures.find(cat => cat.category === activeCategory)?.features.map(f => ({ ...f, category: activeCategory })) || [];

  return (
    <PageContainer gradient>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-6 sm:p-8 shadow-2xl shadow-purple-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Accessibility</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Accessibility Hub</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Personalize your experience with accessibility features designed for everyone.
              </p>
            </div>
            <button
              onClick={() => speakText('Welcome to the Accessibility Hub. Here you can customize your experience with visual, cognitive, hearing, and motor accessibility features.')}
              className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                isSpeaking ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {isSpeaking ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-1 mb-6">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All Features', icon: SettingsIcon },
              ...categories
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id as any)}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickActions.map(({ title, description, icon: Icon, color, action, href }) => (
            <button
              key={title}
              onClick={action}
              className="group p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-lg transition-all hover:scale-105"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${color} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500">{description}</p>
            </button>
          ))}
        </div>

        {/* Accessibility Features */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Accessibility Features</h2>
            <div className="flex gap-2">
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={() => speakText('Accessibility features updated')}
                className={`p-2 rounded-lg transition-colors ${
                  isSpeaking ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {isSpeaking ? <Pause className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFeatures.map((feature, index) => (
              <div
                key={`${feature.category}-${feature.key}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{feature.label}</h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
                <button
                  onClick={() => {
                    const categorySettings = settings[feature.category as keyof AccessibilitySettings];
                    const currentValue = categorySettings[feature.key as keyof typeof categorySettings] as boolean;
                    updateSetting(feature.category as keyof AccessibilitySettings, feature.key, !currentValue);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    (() => {
                      const categorySettings = settings[feature.category as keyof AccessibilitySettings];
                      const currentValue = categorySettings[feature.key as keyof typeof categorySettings] as boolean;
                      return currentValue ? 'bg-purple-600' : 'bg-gray-300';
                    })()
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    (() => {
                      const categorySettings = settings[feature.category as keyof AccessibilitySettings];
                      const currentValue = categorySettings[feature.key as keyof typeof categorySettings] as boolean;
                      return currentValue ? 'translate-x-6' : 'translate-x-0.5';
                    })()
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Profiles */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Profiles</h2>
            <span className="text-sm text-gray-500">Pre-configured accessibility settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'low-vision',
                name: 'Low Vision',
                description: 'Enhanced visual accessibility',
                icon: Eye,
                settings: {
                  visual: {
                    highContrast: true,
                    largeText: true,
                    screenReader: true,
                    reducedMotion: false
                  }
                }
              },
              {
                id: 'cognitive',
                name: 'Cognitive Support',
                description: 'Simplified interface',
                icon: Brain,
                settings: {
                  cognitive: {
                    simpleLanguage: true,
                    showProgress: true,
                    confirmActions: true,
                    reduceDistractions: true
                  }
                }
              },
              {
                id: 'hearing',
                name: 'Hearing Support',
                description: 'Enhanced audio features',
                icon: Volume2,
                settings: {
                  hearing: {
                    captionsEnabled: true,
                    visualAlerts: true,
                    volumeBoost: true,
                    monoAudio: false
                  }
                }
              }
            ].map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  applyProfile(profile as AccessibilityProfile);
                  speakText(`Applied ${profile.name} profile`);
                }}
                className="group p-4 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <profile.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{profile.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">{profile.description}</p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <ChevronRight className="w-3 h-3" />
                  <span>Apply Profile</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/60 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">Need Help?</h3>
              <p className="text-purple-800 text-sm mb-3">
                Our accessibility features are designed to make REPRO PLAN usable for everyone. 
                If you need assistance or have suggestions for improvements, we're here to help.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    speakText('Opening accessibility help chat');
                    // Navigate to help chat
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Get Help
                </button>
                <button
                  onClick={() => speakText('Opening accessibility support resources')}
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AccessibilityHub;
