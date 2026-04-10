import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronRight,
  Lightbulb,
  Languages,
  Mic,
  Wand2
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
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [adaptedContent, setAdaptedContent] = useState<string | null>(null);

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

  // Generate AI-powered accessibility tips
  const generateAITips = useCallback(async () => {
    try {
      if (!process.env.REACT_APP_API_URL) {
        console.warn('API URL not configured, using fallback tips');
        setAiTips([
          'Use high contrast mode for better text readability',
          'Enable large text if you have difficulty reading small fonts',
          'Turn on captions for video and audio content'
        ]);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Based on these current accessibility settings: 
              Visual - High Contrast: ${settings.visual.highContrast}, Large Text: ${settings.visual.largeText}, Screen Reader: ${settings.visual.screenReader}
              Cognitive - Simple Language: ${settings.cognitive.simpleLanguage}, Show Progress: ${settings.cognitive.showProgress}
              Hearing - Captions: ${settings.hearing.captionsEnabled}, Visual Alerts: ${settings.hearing.visualAlerts}
              Motor - Keyboard Navigation: ${settings.motor.keyboardNavigation}, Large Buttons: ${settings.motor.largeButtons}
              
              Generate 3 personalized accessibility tips to improve the user experience. Return only JSON array:
              ["tip 1", "tip 2", "tip 3"]`
            }]
          }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const tips = JSON.parse(data.candidates[0].content.parts[0].text);
        setAiTips(tips);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn('Failed to generate AI tips:', error);
      // Fallback to default tips
      setAiTips([
        'Use high contrast mode for better text readability',
        'Enable large text if you have difficulty reading small fonts',
        'Turn on captions for video and audio content'
      ]);
    }
  }, [settings]);

  // AI-powered content adaptation
  const adaptContentWithAI = async () => {
    try {
      if (!process.env.REACT_APP_API_URL) {
        console.warn('API URL not configured, using fallback content');
        setAdaptedContent('Customize your app to work better for you. Change text size, colors, and other settings to match your needs.');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Simplify this accessibility hub description for users with cognitive disabilities: 
              "Personalize your experience with accessibility features designed for everyone. Features include visual adjustments like high contrast and large text, cognitive support like simple language mode, hearing assistance with captions and visual alerts, and motor accessibility with keyboard navigation and voice control."
              
              Return only the simplified text, no markdown.`
            }]
          }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdaptedContent(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn('Failed to adapt content:', error);
      setAdaptedContent('Customize your app to work better for you. Change text size, colors, and other settings to match your needs.');
    }
  };

  // AI-powered voice command processing
  const processVoiceCommand = async (command: string) => {
    try {
      if (!process.env.REACT_APP_API_URL) {
        console.warn('API URL not configured, using fallback voice processing');
        // Fallback to simple keyword matching
        const lowerCommand = command.toLowerCase();
        if (lowerCommand.includes('high contrast') || lowerCommand.includes('contrast')) {
          updateSetting('visual', 'highContrast', !settings.visual.highContrast);
          speakText('High contrast toggled');
        } else if (lowerCommand.includes('large text') || lowerCommand.includes('text')) {
          updateSetting('visual', 'largeText', !settings.visual.largeText);
          speakText('Large text toggled');
        } else if (lowerCommand.includes('caption')) {
          updateSetting('hearing', 'captionsEnabled', !settings.hearing.captionsEnabled);
          speakText('Captions toggled');
        } else if (lowerCommand.includes('keyboard')) {
          updateSetting('motor', 'keyboardNavigation', !settings.motor.keyboardNavigation);
          speakText('Keyboard navigation toggled');
        } else if (lowerCommand.includes('reset')) {
          resetSettings();
          speakText('Settings reset to default');
        } else {
          speakText('I did not understand that command');
        }
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Process this accessibility voice command: "${command}". 
              Available actions: enable high contrast, enable large text, enable captions, enable keyboard navigation, reset settings.
              Return only the action name as a simple string.`
            }]
          }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const action = data.candidates[0].content.parts[0].text.toLowerCase().trim();
        
        // Execute the action
        if (action.includes('high contrast')) {
          updateSetting('visual', 'highContrast', !settings.visual.highContrast);
          speakText('High contrast toggled');
        } else if (action.includes('large text')) {
          updateSetting('visual', 'largeText', !settings.visual.largeText);
          speakText('Large text toggled');
        } else if (action.includes('captions')) {
          updateSetting('hearing', 'captionsEnabled', !settings.hearing.captionsEnabled);
          speakText('Captions toggled');
        } else if (action.includes('keyboard')) {
          updateSetting('motor', 'keyboardNavigation', !settings.motor.keyboardNavigation);
          speakText('Keyboard navigation toggled');
        } else if (action.includes('reset')) {
          resetSettings();
          speakText('Settings reset to default');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn('Failed to process voice command:', error);
      speakText('Sorry, I could not process that command');
    }
  };

  // Initialize AI tips on mount (removed dependency to prevent infinite loops)
  useEffect(() => {
    generateAITips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voice recognition (Web Speech API)
  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        speakText('Listening for your command');
      };
      
      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        setIsListening(false);
        processVoiceCommand(command);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        speakText('Sorry, I did not catch that');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      speakText('Voice recognition is not supported in your browser');
    }
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
    <PageContainer gradient gradientFrom="from-slate-50" gradientVia="via-white" gradientTo="to-primary-50/20">
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

        {/* AI-Powered Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* AI Tips */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">AI Accessibility Tips</h3>
              </div>
              <button
                onClick={generateAITips}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
              </button>
            </div>
            {aiTips.length > 0 ? (
              <ul className="space-y-2">
                {aiTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-purple-800">
                    <span className="text-purple-600 font-bold">{index + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-purple-600">Loading AI tips...</p>
            )}
          </div>

          {/* Voice Commands */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Voice Commands</h3>
              </div>
              <button
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-blue-100'}`}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'text-red-600' : 'text-blue-600'}`} />
              </button>
            </div>
            {isListening ? (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>Listening...</span>
              </div>
            ) : (
              <p className="text-sm text-blue-600">Try saying "enable high contrast" or "enable captions"</p>
            )}
          </div>
        </div>

        {/* AI Content Adaptation */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">AI Content Adaptation</h3>
            </div>
            <button
              onClick={adaptContentWithAI}
              className="px-3 py-1.5 bg-primary-100 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Simplify Text
            </button>
          </div>
          {adaptedContent ? (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">{adaptedContent}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Click "Simplify Text" to get AI-powered simplified content for easier reading</p>
          )}
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
                    if (!categorySettings) return;
                    const currentValue = categorySettings[feature.key as keyof typeof categorySettings] as boolean;
                    updateSetting(feature.category as keyof AccessibilitySettings, feature.key, !currentValue);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    (() => {
                      const categorySettings = settings[feature.category as keyof AccessibilitySettings];
                      if (!categorySettings) return 'bg-gray-300';
                      const currentValue = categorySettings[feature.key as keyof typeof categorySettings] as boolean;
                      return currentValue ? 'bg-purple-600' : 'bg-gray-300';
                    })()
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    (() => {
                      const categorySettings = settings[feature.category as keyof AccessibilitySettings];
                      if (!categorySettings) return 'translate-x-0.5';
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
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/60 p-5 sm:p-6 pb-20 sm:pb-8">
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
      </main>
    </PageContainer>
  );
};

export default AccessibilityHub;
