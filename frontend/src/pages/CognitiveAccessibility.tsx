import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Brain,
  BookOpen,
  Clock,
  CheckCircle,
  Info,
  Settings,
  MessageCircle,
  MapPin,
  Heart,
  Shield,
  Play,
  Pause,
  Target,
  Users,
  Image,
  Lightbulb,
  HelpCircle,
  Eye
} from 'lucide-react';

const CognitiveAccessibility: React.FC = () => {
  const navigate = useNavigate();
  const [simpleLanguage, setSimpleLanguage] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [confirmActions, setConfirmActions] = useState(true);
  const [reduceDistractions, setReduceDistractions] = useState(false);
  const [stepByStep, setStepByStep] = useState(true);
  const [visualAids, setVisualAids] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-to-speech functionality
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.6; // Slower for cognitive accessibility
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (simpleLanguage) {
      root.classList.add('simple-language');
    } else {
      root.classList.remove('simple-language');
    }
    
    if (reduceDistractions) {
      root.classList.add('reduce-distractions');
    } else {
      root.classList.remove('reduce-distractions');
    }
    
    if (visualAids) {
      root.classList.add('visual-aids');
    } else {
      root.classList.remove('visual-aids');
    }
  }, [simpleLanguage, reduceDistractions, visualAids]);

  const accessibilityFeatures = [
    {
      id: 'simple-language',
      title: 'Simple Language',
      description: 'Use easy words and short sentences',
      icon: BookOpen,
      isEnabled: simpleLanguage,
      onToggle: () => setSimpleLanguage(!simpleLanguage)
    },
    {
      id: 'show-progress',
      title: 'Show Progress',
      description: 'Always show what step you are on',
      icon: Target,
      isEnabled: showProgress,
      onToggle: () => setShowProgress(!showProgress)
    },
    {
      id: 'confirm-actions',
      title: 'Confirm Actions',
      description: 'Ask before doing important things',
      icon: CheckCircle,
      isEnabled: confirmActions,
      onToggle: () => setConfirmActions(!confirmActions)
    },
    {
      id: 'reduce-distractions',
      title: 'Reduce Distractions',
      description: 'Hide things that might confuse you',
      icon: Eye,
      isEnabled: reduceDistractions,
      onToggle: () => setReduceDistractions(!reduceDistractions)
    },
    {
      id: 'step-by-step',
      title: 'Step by Step',
      description: 'Show one thing at a time',
      icon: Clock,
      isEnabled: stepByStep,
      onToggle: () => setStepByStep(!stepByStep)
    },
    {
      id: 'visual-aids',
      title: 'Visual Aids',
      description: 'Show pictures and icons to help',
      icon: Image,
      isEnabled: visualAids,
      onToggle: () => setVisualAids(!visualAids)
    }
  ];

  const quickActions = [
    {
      title: 'Easy Chat',
      description: 'Talk to our helpful assistant',
      icon: MessageCircle,
      action: () => navigate('/chatbot'),
      speakText: 'Opening easy chat with our helpful assistant'
    },
    {
      title: 'Find Help',
      description: 'Find doctors and health workers',
      icon: MapPin,
      action: () => navigate('/clinics'),
      speakText: 'Finding doctors and health workers near you'
    },
    {
      title: 'Read Stories',
      description: 'Read easy health stories',
      icon: BookOpen,
      action: () => navigate('/articles'),
      speakText: 'Opening easy health stories to read'
    },
    {
      title: 'Emergency Help',
      description: 'Get help right now if you need it',
      icon: Shield,
      action: () => navigate('/emergency'),
      speakText: 'Getting emergency help right now'
    }
  ];

  const healthTopics = [
    {
      title: 'How to Stay Safe',
      description: 'Easy ways to protect yourself',
      content: 'You can stay safe by using condoms, talking to your partner, and getting regular health checks. It is okay to say no to things you do not want to do. Always ask for help if you need it.',
      steps: [
        'Use condoms when you have sex',
        'Talk to your partner about what you want',
        'Go to the doctor for regular checks',
        'Say no if you do not want to do something',
        'Ask for help when you need it'
      ],
      visualAid: '🛡️ Safety Checklist: Condoms, Communication, Doctor Visits, Saying No, Getting Help'
    },
    {
      title: 'Birth Control',
      description: 'Ways to prevent pregnancy',
      content: 'Birth control helps prevent pregnancy. There are many types. Some you use every time, like condoms. Some you take every day, like pills. Some last for years, like IUDs. Talk to a doctor to find what works best for you.',
      steps: [
        'Condoms - use every time you have sex',
        'Pills - take one every day',
        'IUD - lasts for years',
        'Talk to a doctor about what is best for you',
        'Ask questions if you do not understand'
      ],
      visualAid: '💊 Birth Control Options: Condoms (every time), Pills (daily), IUD (years)'
    },
    {
      title: 'Your Body',
      description: 'Learn about your body safely',
      content: 'Your body is yours. You decide what happens to it. It is normal to have questions about your body. It is okay to ask questions. You can talk to a doctor or trusted adult about your body.',
      steps: [
        'Your body belongs to you',
        'You decide what happens to your body',
        'It is normal to have questions',
        'It is okay to ask questions',
        'Talk to a doctor or trusted adult'
      ],
      visualAid: '👤 Your Body: Yours to Control, Questions are Normal, Ask for Help'
    },
    {
      title: 'Getting Help',
      description: 'Where to go when you need help',
      content: 'It is okay to need help. There are many people who want to help you. You can talk to doctors, counselors, family, or friends. You can also call hotlines or use apps to get help. You are not alone.',
      steps: [
        'It is okay to need help',
        'Many people want to help you',
        'Talk to doctors or counselors',
        'Talk to family or friends',
        'Call hotlines or use apps',
        'You are not alone'
      ],
      visualAid: '🤝 Help is Available: Doctors, Counselors, Family, Friends, Hotlines, Apps'
    }
  ];

  const copingStrategies = [
    {
      title: 'When You Feel Overwhelmed',
      icon: Brain,
      strategies: [
        'Take deep breaths',
        'Count to 10 slowly',
        'Take a break',
        'Ask for help',
        'Use simple words'
      ]
    },
    {
      title: 'When You Need to Remember',
      icon: Lightbulb,
      strategies: [
        'Write things down',
        'Use pictures',
        'Set reminders',
        'Ask someone to help',
        'Repeat important things'
      ]
    },
    {
      title: 'When You Feel Confused',
      icon: HelpCircle,
      strategies: [
        'Ask questions',
        'Ask for simple explanations',
        'Take your time',
        'Use visual aids',
        'Ask for help'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
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
              <Settings className="w-5 h-5 text-yellow-600" />
              <span>Make It Easy</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accessibilityFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      feature.isEnabled
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${feature.isEnabled ? 'text-yellow-600' : 'text-gray-500'}`} />
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      </div>
                      <button
                        onClick={feature.onToggle}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          feature.isEnabled ? 'bg-yellow-600' : 'bg-gray-300'
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

          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span>Quick Help</span>
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
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 border border-yellow-200"
                  >
                    <div className="p-3 bg-yellow-600 rounded-xl">
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
                      onClick={() => speakText(topic.content)}
                      className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                      aria-label={`Read about ${topic.title}`}
                    >
                      {isSpeaking ? <Pause className="w-4 h-4 text-yellow-600" /> : <Play className="w-4 h-4 text-yellow-600" />}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{topic.content}</p>
                  
                  {/* Steps */}
                  {stepByStep && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {topic.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {/* Visual Aid */}
                  {visualAids && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Image className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Visual Help:</span>
                      </div>
                      <p className="text-sm text-blue-800">{topic.visualAid}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Coping Strategies */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>When You Need Help</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {copingStrategies.map((strategy, index) => {
                const Icon = strategy.icon;
                return (
                  <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-900">{strategy.title}</h3>
                    </div>
                    <ul className="space-y-1">
                      {strategy.strategies.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-purple-800 flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-purple-600 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help and Support */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Need Help?</h3>
                <p className="text-yellow-800 text-sm mb-3">
                  If you need help or have questions, we are here for you. You can ask for help anytime.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      speakText('Opening easy chat for help');
                      navigate('/chatbot');
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Easy Chat
                  </button>
                  <button
                    onClick={() => {
                      speakText('Getting emergency help');
                      navigate('/emergency');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Emergency Help
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

export default CognitiveAccessibility;
