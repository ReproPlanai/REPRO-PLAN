import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Shield,
  MessageCircle,
  MapPin,
  Gamepad2,
  Heart,
  Lock,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  highlights: string[];
  gradient: string;
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to REPRO PLAN',
    subtitle: 'Your safe space for SRHR',
    icon: Shield,
    gradient: 'from-primary-500 to-purple-600',
    content: 'REPRO PLAN provides anonymous, inclusive sexual and reproductive health information for youth. Learn how to navigate and use all features effectively.',
    highlights: ['100% anonymous', 'Offline capable', 'Multi-language']
  },
  {
    id: 'chat',
    title: 'Chat with ReproBot',
    subtitle: 'AI-powered SRHR assistant',
    icon: MessageCircle,
    gradient: 'from-purple-500 to-pink-600',
    content: 'ReproBot is your confidential AI assistant. Ask questions about contraception, relationships, health, and more. All conversations are private and secure.',
    highlights: ['24/7 support', 'Culturally aware', 'Personalized answers']
  },
  {
    id: 'health',
    title: 'Health & Safety',
    subtitle: 'Clinics, tracker, emergency',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-600',
    content: 'Find clinics, track your cycle, order medications, and access emergency support. Safe house navigation uses dual verification for your protection.',
    highlights: ['Clinic finder', 'Cycle tracker', 'Emergency button']
  },
  {
    id: 'learn',
    title: 'Learn & Play',
    subtitle: 'AI-generated quizzes & games',
    icon: Gamepad2,
    gradient: 'from-amber-500 to-orange-600',
    content: 'Test your knowledge with AI-generated quizzes. Play the Consent Game to learn about boundaries and healthy relationships. Earn scores and track progress.',
    highlights: ['AI quizzes', 'Consent scenarios', 'Score tracking']
  },
  {
    id: 'verify',
    title: 'QR Verification',
    subtitle: 'Stakeholder verification',
    icon: Lock,
    gradient: 'from-emerald-500 to-teal-600',
    content: 'Generate secure QR codes for police, medical, or NGO verification. Your identity stays anonymous while they confirm your REPRO PLAN account.',
    highlights: ['Time-limited', 'Encrypted', 'Instant verify']
  },
  {
    id: 'ready',
    title: "You're Ready!",
    subtitle: 'Start exploring',
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-600',
    content: 'You now know the basics. Explore the app, chat with ReproBot, and use the features that matter most to you. Your journey to better SRHR starts here.',
    highlights: ['Explore freely', 'Ask anything', 'Stay safe']
  }
];

const Tutorial: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    setCompleted(prev => new Set(Array.from(prev).concat(currentStep)));
    if (isLast) {
      navigate('/');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-primary-50/30 overflow-x-hidden">
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-xs font-medium text-primary-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step dots - mobile */}
        <div className="flex justify-center gap-1.5 mb-6 sm:hidden overflow-x-auto pb-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all ${
                i === currentStep ? 'bg-primary-500 w-6' : completed.has(i) ? 'bg-green-400' : 'bg-gray-300'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl shadow-gray-200/50 border border-gray-200/60">
          {/* Gradient accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`} />
          
          <div className="p-6 sm:p-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${step.gradient} text-white text-xs font-semibold mb-4`}>
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Guide
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{step.title}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{step.subtitle}</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{step.content}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {step.highlights.map((h, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl">
                  {h}
                </span>
              ))}
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all font-medium shadow-lg shadow-primary-500/25"
              >
                <span>{isLast ? 'Get Started' : 'Next'}</span>
                {isLast ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { path: '/', icon: Shield, label: 'Home' },
            { path: '/chatbot', icon: MessageCircle, label: 'ReproBot' },
            { path: '/clinics', icon: MapPin, label: 'Clinics' },
            { path: '/games', icon: Gamepad2, label: 'Learn & Play' }
          ].map(({ path, icon: Ico, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 border border-gray-200/80 hover:border-primary-200 hover:bg-white transition-all"
            >
              <Ico className="w-5 h-5 text-primary-600" />
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Tutorial;
