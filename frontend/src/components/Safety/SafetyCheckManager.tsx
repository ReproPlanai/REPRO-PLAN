import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Phone,
  MessageCircle,
  Sun,
  Sunset,
  Moon,
  Brain,
  Users,
  Activity,
  ArrowRight,
  X,
  MapPin
} from 'lucide-react';
import { apiService } from '../../services/api';
import { offlineStorage } from '../../utils/offlineStorage';

interface SafetyCheck {
  id: string;
  timestamp: number;
  period: 'morning' | 'afternoon' | 'evening';
  responses: {
    physicalHealth: number;
    mentalHealth: number;
    familySafety: number;
    overallSafety: number;
  };
  concerns: string[];
  notes: string;
  needsHelp: boolean;
  helpType?: 'app_chat' | 'phone_call' | 'external' | 'none';
}

interface SafetyCheckQuestion {
  id: string;
  category: 'physical' | 'mental' | 'family' | 'safety';
  question: string;
  icon: React.ElementType;
  options: {
    value: number;
    label: string;
    color: string;
  }[];
}

const SAFETY_CHECK_QUESTIONS: SafetyCheckQuestion[] = [
  {
    id: 'physicalHealth',
    category: 'physical',
    question: 'How are you feeling physically today?',
    icon: Activity,
    options: [
      { value: 5, label: 'Excellent', color: 'bg-green-500' },
      { value: 4, label: 'Good', color: 'bg-green-400' },
      { value: 3, label: 'Okay', color: 'bg-yellow-400' },
      { value: 2, label: 'Not Great', color: 'bg-orange-400' },
      { value: 1, label: 'Need Help', color: 'bg-red-500' }
    ]
  },
  {
    id: 'mentalHealth',
    category: 'mental',
    question: 'How is your mental and emotional state?',
    icon: Brain,
    options: [
      { value: 5, label: 'Very Positive', color: 'bg-green-500' },
      { value: 4, label: 'Positive', color: 'bg-green-400' },
      { value: 3, label: 'Neutral', color: 'bg-yellow-400' },
      { value: 2, label: 'Struggling', color: 'bg-orange-400' },
      { value: 1, label: 'Need Support', color: 'bg-red-500' }
    ]
  },
  {
    id: 'familySafety',
    category: 'family',
    question: 'Do you feel safe with your family and at home?',
    icon: Users,
    options: [
      { value: 5, label: 'Very Safe', color: 'bg-green-500' },
      { value: 4, label: 'Safe', color: 'bg-green-400' },
      { value: 3, label: 'Unsure', color: 'bg-yellow-400' },
      { value: 2, label: 'Concerned', color: 'bg-orange-400' },
      { value: 1, label: 'Not Safe', color: 'bg-red-500' }
    ]
  },
  {
    id: 'overallSafety',
    category: 'safety',
    question: 'How safe do you feel overall right now?',
    icon: Shield,
    options: [
      { value: 5, label: 'Very Safe', color: 'bg-green-500' },
      { value: 4, label: 'Safe', color: 'bg-green-400' },
      { value: 3, label: 'Neutral', color: 'bg-yellow-400' },
      { value: 2, label: 'Unsafe', color: 'bg-orange-400' },
      { value: 1, label: 'In Danger', color: 'bg-red-500' }
    ]
  }
];

const CONCERN_OPTIONS = [
  { id: 'physical_pain', label: 'Physical pain or discomfort', category: 'physical' },
  { id: 'menstrual_issues', label: 'Menstrual health concerns', category: 'physical' },
  { id: 'sleep_issues', label: 'Sleep problems', category: 'physical' },
  { id: 'stress', label: 'High stress or anxiety', category: 'mental' },
  { id: 'depression', label: 'Feeling depressed or hopeless', category: 'mental' },
  { id: 'isolation', label: 'Feeling isolated or lonely', category: 'mental' },
  { id: 'family_conflict', label: 'Family conflict or tension', category: 'family' },
  { id: 'domestic_concerns', label: 'Concerns about domestic situation', category: 'family' },
  { id: 'unsafe_home', label: 'Not feeling safe at home', category: 'safety' },
  { id: 'harassment', label: 'Experiencing harassment', category: 'safety' },
  { id: 'other', label: 'Something else', category: 'other' }
];

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: 'morning' | 'afternoon' | 'evening';
  onComplete: (check: SafetyCheck) => void;
}

const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({ 
  isOpen, 
  onClose, 
  period,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [needsHelp, setNeedsHelp] = useState(false);
  const [helpType, setHelpType] = useState<'app_chat' | 'phone_call' | 'external' | 'none'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = SAFETY_CHECK_QUESTIONS[currentStep];
  const totalSteps = SAFETY_CHECK_QUESTIONS.length + 2; // Questions + concerns + help

  const handleResponse = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance after selection
    setTimeout(() => {
      if (currentStep < SAFETY_CHECK_QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(SAFETY_CHECK_QUESTIONS.length); // Move to concerns step
      }
    }, 300);
  };

  const toggleConcern = (concernId: string) => {
    setSelectedConcerns(prev => 
      prev.includes(concernId) 
        ? prev.filter(c => c !== concernId)
        : [...prev, concernId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const safetyCheck: SafetyCheck = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      period,
      responses: {
        physicalHealth: responses.physicalHealth || 3,
        mentalHealth: responses.mentalHealth || 3,
        familySafety: responses.familySafety || 3,
        overallSafety: responses.overallSafety || 3
      },
      concerns: selectedConcerns,
      notes,
      needsHelp,
      helpType: needsHelp ? helpType : 'none'
    };

    try {
      // Save to API
      await apiService.submitSafetyCheck?.(safetyCheck);
      
      // Save locally
      const existing = await offlineStorage.getData('safety_checks') || [];
      await offlineStorage.storeData('safety_checks', [safetyCheck, ...existing]);
      
      onComplete(safetyCheck);
      
      // Reset form
      setCurrentStep(0);
      setResponses({});
      setSelectedConcerns([]);
      setNotes('');
      setNeedsHelp(false);
      setHelpType('none');
    } catch (error) {
      console.error('Failed to submit safety check:', error);
    }
    
    setIsSubmitting(false);
  };

  const getPeriodIcon = () => {
    switch (period) {
      case 'morning': return <Sun className="w-6 h-6 text-orange-500" />;
      case 'afternoon': return <Sunset className="w-6 h-6 text-yellow-500" />;
      case 'evening': return <Moon className="w-6 h-6 text-indigo-500" />;
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'morning': return 'Morning Check-in';
      case 'afternoon': return 'Afternoon Check-in';
      case 'evening': return 'Evening Check-in';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {getPeriodIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{getPeriodLabel()}</h2>
                <p className="text-white/80 text-sm">Are you safe today?</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep < SAFETY_CHECK_QUESTIONS.length && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <currentQuestion.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleResponse(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      responses[currentQuestion.id] === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {responses[currentQuestion.id] === option.value && (
                      <CheckCircle className="w-5 h-5 text-primary-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === SAFETY_CHECK_QUESTIONS.length && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Any concerns today?
                  </h3>
                  <p className="text-sm text-gray-600">Select all that apply (optional)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {CONCERN_OPTIONS.map((concern) => (
                  <button
                    key={concern.id}
                    onClick={() => toggleConcern(concern.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                      selectedConcerns.includes(concern.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedConcerns.includes(concern.id)
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedConcerns.includes(concern.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm">{concern.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us more about how you're feeling..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={() => setCurrentStep(SAFETY_CHECK_QUESTIONS.length + 1)}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {currentStep === SAFETY_CHECK_QUESTIONS.length + 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Would you like help?
                  </h3>
                  <p className="text-sm text-gray-600">We're here to support you</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setNeedsHelp(false);
                    setHelpType('none');
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className="w-full p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">I'm doing okay</p>
                      <p className="text-sm text-gray-600">No help needed right now</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setNeedsHelp(true)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    needsHelp 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">I'd like some support</p>
                      <p className="text-sm text-gray-600">Help is available</p>
                    </div>
                  </div>
                </button>

                {needsHelp && (
                  <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-gray-700">How would you like to receive help?</p>
                    
                    <button
                      onClick={() => setHelpType('app_chat')}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        helpType === 'app_chat' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 text-primary-600" />
                      <div className="text-left">
                        <p className="font-medium text-sm">Chat in app</p>
                        <p className="text-xs text-gray-500">Talk to ReproBot AI or a counselor</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setHelpType('phone_call')}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        helpType === 'phone_call' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <Phone className="w-5 h-5 text-primary-600" />
                      <div className="text-left">
                        <p className="font-medium text-sm">Phone call</p>
                        <p className="text-xs text-gray-500">Speak with a support specialist</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setHelpType('external')}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        helpType === 'external' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <MapPin className="w-5 h-5 text-primary-600" />
                      <div className="text-left">
                        <p className="font-medium text-sm">External resources</p>
                        <p className="text-xs text-gray-500">Find nearby clinics or hotlines</p>
                      </div>
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || helpType === 'none'}
                      className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 mt-4"
                    >
                      {isSubmitting ? 'Submitting...' : 'Get Help'}
                    </button>
                  </div>
                )}
              </div>

              {!needsHelp && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Check-in'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Safety Check Manager Component
const SafetyCheckManager: React.FC = () => {
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [checkHistory, setCheckHistory] = useState<SafetyCheck[]>([]);
  const [streak, setStreak] = useState(0);

  // Determine current period based on time
  const getCurrentPeriod = useCallback((): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  }, []);

  // Check if safety check is due
  const isCheckDue = useCallback((period: 'morning' | 'afternoon' | 'evening') => {
    const today = new Date().toDateString();
    const lastCheckForPeriod = checkHistory.find(
      check => check.period === period && new Date(check.timestamp).toDateString() === today
    );
    return !lastCheckForPeriod;
  }, [checkHistory]);

  // Load check history
  useEffect(() => {
    const loadHistory = async () => {
      const history = await offlineStorage.getData('safety_checks') || [];
      setCheckHistory(history);
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const checksForDay = history.filter(
          (check: SafetyCheck) => new Date(check.timestamp).toDateString() === dateStr
        );
        
        if (checksForDay.length >= 2) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }
      setStreak(currentStreak);
    };
    
    loadHistory();
  }, []);

  // Auto-show check modal when due
  useEffect(() => {
    const period = getCurrentPeriod();
    setCurrentPeriod(period);
    
    // Check if we should show the modal (only on app load, once per period)
    const checkPending = isCheckDue(period);
    if (checkPending) {
      // Delay slightly to let app load first
      const timer = setTimeout(() => {
        setShowCheckModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [getCurrentPeriod, isCheckDue]);

  const handleCheckComplete = (check: SafetyCheck) => {
    setCheckHistory(prev => [check, ...prev]);
    setShowCheckModal(false);
    
    // If user needs help, trigger appropriate action (excluding 'none')
    if (check.needsHelp && check.helpType && check.helpType !== 'none') {
      handleHelpRequest(check.helpType);
    }
  };

  const handleHelpRequest = (type: 'app_chat' | 'phone_call' | 'external') => {
    switch (type) {
      case 'app_chat':
        // Navigate to chat or open ReproBot
        window.location.href = '/chat';
        break;
      case 'phone_call':
        // Show emergency numbers
        window.location.href = 'tel:+233-999-999-999';
        break;
      case 'external':
        // Navigate to resources/clinics
        window.location.href = '/resources';
        break;
    }
  };

  const todayChecks = checkHistory.filter(
    check => new Date(check.timestamp).toDateString() === new Date().toDateString()
  );

  const getOverallScore = () => {
    if (todayChecks.length === 0) return null;
    const total = todayChecks.reduce((sum, check) => {
      return sum + Object.values(check.responses).reduce((a, b) => a + b, 0) / 4;
    }, 0);
    return Math.round(total / todayChecks.length);
  };

  const score = getOverallScore();

  return (
    <>
      {/* Floating Safety Status Widget */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowCheckModal(true)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
            score === null 
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : score >= 4 
                ? 'bg-green-500 text-white hover:bg-green-600'
                : score >= 3
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="font-medium text-sm">
            {score === null ? 'Check In' : `Safety: ${score}/5`}
          </span>
          {todayChecks.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded-full text-xs">
              {todayChecks.length}/3
            </span>
          )}
        </button>
      </div>

      {/* Check-in Modal */}
      <SafetyCheckModal
        isOpen={showCheckModal}
        onClose={() => setShowCheckModal(false)}
        period={currentPeriod}
        onComplete={handleCheckComplete}
      />

      {/* Dashboard Card (can be shown on home/dashboard) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Heart className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Safety Check</h3>
              <p className="text-sm text-gray-600">{todayChecks.length}/3 completed today</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">{streak}</p>
            <p className="text-xs text-gray-500">day streak</p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex gap-2 mb-4">
          {(['morning', 'afternoon', 'evening'] as const).map((period) => {
            const check = todayChecks.find(c => c.period === period);
            return (
              <div 
                key={period}
                className={`flex-1 p-3 rounded-xl border-2 ${
                  check 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {period === 'morning' && <Sun className="w-4 h-4" />}
                  {period === 'afternoon' && <Sunset className="w-4 h-4" />}
                  {period === 'evening' && <Moon className="w-4 h-4" />}
                  <span className="text-xs font-medium capitalize">{period}</span>
                </div>
                {check && (
                  <div className="mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">Done</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowCheckModal(true)}
          className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          {todayChecks.length === 0 
            ? 'Start Morning Check-in'
            : todayChecks.length === 1
              ? 'Start Afternoon Check-in'
              : todayChecks.length === 2
                ? 'Start Evening Check-in'
                : 'View Today\'s Summary'
          }
        </button>
      </div>
    </>
  );
};

export default SafetyCheckManager;
