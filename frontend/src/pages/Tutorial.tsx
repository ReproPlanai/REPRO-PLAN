import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SkipForward,
  SkipBack,
  CheckCircle,
  Circle,
  BookOpen,
  Users,
  Shield,
  Heart,
  MessageCircle,
  MapPin,
  Gamepad2,
  Settings,
  Smartphone,
  Download,
  Accessibility,
  Globe,
  Lock,
  Hash
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

const Tutorial: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to REPRO PLAN',
      description: 'Your safe space for sexual and reproductive health information',
      icon: Shield,
      content: 'REPRO PLAN is designed to provide anonymous, inclusive, and accessible sexual and reproductive health information for youth in Liberia. This tutorial will help you navigate and use all the features effectively.',
      tips: [
        'All your data is anonymous and secure',
        'You can use the app offline',
        'Available in multiple Liberian languages'
      ]
    },
    {
      id: 'navigation',
      title: 'Navigation & Menu',
      description: 'Learn how to navigate the app',
      icon: BookOpen,
      content: 'The app has two navigation systems: a mobile hamburger menu for phones and tablets, and a desktop header with dropdown menus for computers. Use the menu to access all features.',
      tips: [
        'Mobile: Tap the hamburger menu (☰) in the top-right',
        'Desktop: Use the dropdown menus in the header',
        'All features are organized into logical groups'
      ]
    },
    {
      id: 'health-safety',
      title: 'Health & Safety Features',
      description: 'Core health and safety tools',
      icon: Heart,
      content: 'Access healthcare services, find safe spaces, track your health, order medications, and get emergency support. These features help you take care of your physical and mental health with secure access controls.',
      tips: [
        'Find nearby clinics and healthcare providers',
        'Locate safe spaces with secure OTP verification',
        'Order medications with prescription management',
        'Track your health and appointments',
        'Access emergency support when needed',
        'Use secure map navigation to safe houses'
      ]
    },
    {
      id: 'education-support',
      title: 'Education & Support',
      description: 'Learning resources and community support',
      icon: Users,
      content: 'Access educational content, connect with mentors, read stories from other youth, and get support from the community. Learn about sexual and reproductive health in a safe environment with comprehensive video content.',
      tips: [
        'Chat with our AI assistant for questions',
        'Watch embedded YouTube educational videos',
        'Read articles and stories',
        'Connect with peer mentors',
        'Access comprehensive SRHR video library',
        'Learn through interactive content'
      ]
    },
    {
      id: 'interactive-features',
      title: 'Interactive Features',
      description: 'Games, quizzes, and communication tools',
      icon: Gamepad2,
      content: 'Engage with interactive content including educational games, quizzes, SMS/USSD features, and alerts. Learn while having fun and stay informed about important updates.',
      tips: [
        'Play educational games and quizzes',
        'Use SMS and USSD for basic phones',
        'Receive important health alerts',
        'Test your knowledge with interactive content'
      ]
    },
    {
      id: 'tools-settings',
      title: 'Tools & Settings',
      description: 'Customize your experience',
      icon: Settings,
      content: 'Access notifications, customize accessibility settings, use offline mode, and configure the app to work best for your needs. Make the app work for you.',
      tips: [
        'Check notifications for updates',
        'Customize accessibility features',
        'Use offline mode when internet is limited',
        'Access kiosk mode for shared devices'
      ]
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      description: 'Your data is safe and anonymous',
      icon: Lock,
      content: 'REPRO PLAN is designed with privacy and security in mind. Your data is anonymous, encrypted, and never shared. The app includes advanced security features like dual verification for safe house access.',
      tips: [
        'All data is anonymous and encrypted',
        'No personal information is required',
        'Dual verification (OTP + Secure Code) for navigation',
        'Clear browser history on shared devices',
        'Use incognito mode for extra privacy',
        'Safe house access requires verification'
      ]
    },
    {
      id: 'secure-navigation',
      title: 'Secure Navigation',
      description: 'Safe access to secure locations',
      icon: Shield,
      content: 'When accessing safe houses or secure locations, you\'ll need to verify your identity using both an OTP code and a secure access code. This dual verification system ensures only authorized users can access sensitive locations.',
      tips: [
        'Click "Get Directions" to start the verification process',
        'Enter the 6-digit OTP code sent to your phone',
        'Enter your secure access code (contact support if you don\'t have one)',
        'Navigation will start automatically after verification',
        'Safe house locations are protected for your security'
      ]
    },
    {
      id: 'offline-access',
      title: 'Offline Access',
      description: 'Use the app without internet',
      icon: Download,
      content: 'REPRO PLAN works offline! Download content when you have internet and access it later. This is especially useful in areas with limited internet connectivity. You can download articles, videos, and health information to access later.',
      tips: [
        'Download articles and videos when online',
        'Access downloaded content without internet',
        'Use SMS/USSD features when offline',
        'Sync new content when internet is available',
        'Offline mode works on all devices'
      ]
    },
    {
      id: 'video-education',
      title: 'Video Education',
      description: 'Comprehensive SRHR video content',
      icon: Globe,
      content: 'REPRO PLAN includes a comprehensive library of educational videos about sexual and reproductive health. These videos are embedded directly in the app and cover topics like STI prevention, contraception, reproductive health, and more.',
      tips: [
        'Watch videos directly in the app',
        'Videos cover all SRHR topics',
        'Available in multiple difficulty levels',
        'Download videos for offline viewing',
        'Videos are mobile-optimized',
        'Access YouTube videos without leaving the app'
      ]
    },
    {
      id: 'sms-features',
      title: 'SMS Features',
      description: 'Send and receive health information via text messages',
      icon: Smartphone,
      content: 'REPRO PLAN includes SMS functionality for users with basic phones or limited internet access. You can send health questions via SMS and receive responses, get health alerts, and access information through text messages. This is perfect for areas with poor internet connectivity.',
      tips: [
        'Send health questions via SMS to get answers',
        'Receive health alerts and appointment reminders',
        'Access information on basic phones without internet',
        'Works without internet connection',
        'All SMS communication is anonymous and secure',
        'Use SMS for emergency health information'
      ]
    },
    {
      id: 'ussd-features',
      title: 'USSD Features',
      description: 'Access health information using USSD codes',
      icon: Hash,
      content: 'USSD (Unstructured Supplementary Service Data) allows you to access REPRO PLAN features by dialing special codes on your phone. This works on any mobile phone, even basic phones without internet access. Simply dial the code and follow the menu prompts.',
      tips: [
        'Dial USSD codes like *123# on your phone',
        'Navigate through menu options using numbers',
        'Access health information and resources offline',
        'Works on any mobile phone (smartphone or basic)',
        'No internet connection or app installation required',
        'Get instant access to health information'
      ]
    },
    {
      id: 'accessibility',
      title: 'Accessibility Features',
      description: 'Inclusive design for everyone',
      icon: Accessibility,
      content: 'REPRO PLAN includes comprehensive accessibility features including screen reader support, high contrast mode, large text, voice commands, and support for various disabilities.',
      tips: [
        'Adjust font size and contrast',
        'Use voice commands for navigation',
        'Enable keyboard navigation',
        'Access features for visual/hearing impairments'
      ]
    },
    {
      id: 'languages',
      title: 'Multiple Languages',
      description: 'Available in Liberian languages',
      icon: Globe,
      content: 'REPRO PLAN is available in English, Bassa, Kpelle, Kru, and Vai languages. Choose your preferred language to access content in your native tongue.',
      tips: [
        'Select your preferred language',
        'Content is translated for local context',
        'Cultural sensitivity in all languages',
        'Easy language switching'
      ]
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepIndex);
      return newSet;
    });
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      handleStepComplete(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };


  const currentStepData = tutorialSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Step Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 overflow-x-auto scrollbar-hide">
              {tutorialSteps.map((step, index) => {
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                      isCurrent
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200/50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {currentStepData.description}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed text-center">
                {currentStepData.content}
              </p>
            </div>

            {/* Tips */}
            {currentStepData.tips && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Tips:</h3>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2 text-blue-800">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SkipBack className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {currentStep < tutorialSteps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                  >
                    <span>Next</span>
                    <SkipForward className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleStepComplete(currentStep);
                      navigate('/');
                    }}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Tutorial</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-center space-y-2 p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
            >
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Home</span>
            </button>
            <button
              onClick={() => navigate('/chatbot')}
              className="flex flex-col items-center space-y-2 p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Chatbot</span>
            </button>
            <button
              onClick={() => navigate('/clinics')}
              className="flex flex-col items-center space-y-2 p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
            >
              <MapPin className="w-6 h-6 text-red-600" />
              <span className="text-xs font-medium text-gray-700">Clinics</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex flex-col items-center space-y-2 p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
