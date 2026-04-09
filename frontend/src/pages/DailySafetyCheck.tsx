import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MapPin,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';
import { offlineStorage } from '../utils/offlineStorage';
import PageContainer from '../components/Layout/PageContainer';

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

const DailySafetyCheck: React.FC = () => {
  const navigate = useNavigate();
  const [checkHistory, setCheckHistory] = useState<SafetyCheck[]>([]);
  const [streak, setStreak] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [needsHelp, setNeedsHelp] = useState(false);
  const [helpType, setHelpType] = useState<'app_chat' | 'phone_call' | 'external' | 'none'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine current period based on time
  const getCurrentPeriod = useCallback((): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  }, []);

  // Load check history and auto-open modal if check-in is due
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
      
      // Auto-open modal if check-in is due for current period
      const period = getCurrentPeriod();
      const todayStr = new Date().toDateString();
      const lastCheckForPeriod = history.find(
        (check: SafetyCheck) => check.period === period && new Date(check.timestamp).toDateString() === todayStr
      );
      
      if (!lastCheckForPeriod) {
        // Small delay to let the page render first
        setTimeout(() => {
          handleStartCheck(period);
        }, 500);
      }
    };
    
    loadHistory();
  }, [getCurrentPeriod]);

  const todayChecks = checkHistory.filter(
    check => new Date(check.timestamp).toDateString() === new Date().toDateString()
  );

  const handleStartCheck = (period: 'morning' | 'afternoon' | 'evening') => {
    setCurrentPeriod(period);
    setShowModal(true);
    setCurrentStep(0);
    setResponses({});
    setSelectedConcerns([]);
    setNotes('');
    setNeedsHelp(false);
    setHelpType('none');
  };

  const handleResponse = (value: number) => {
    const currentQuestion = SAFETY_CHECK_QUESTIONS[currentStep];
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    setTimeout(() => {
      if (currentStep < SAFETY_CHECK_QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(SAFETY_CHECK_QUESTIONS.length);
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

  // Fetch AI recommendations based on safety check responses
  const fetchAIRecommendations = useCallback(async (responses: Record<string, number>, concerns: string[]) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl) {
        const prompt = `Based on these safety check responses: Physical: ${responses.physicalHealth || 3}/5, Mental: ${responses.mentalHealth || 3}/5, Family: ${responses.familySafety || 3}/5, Overall: ${responses.overallSafety || 3}/5. Concerns: ${concerns.join(', ') || 'none'}. Provide 3-5 personalized safety recommendations for Ghana context. Return as numbered list.`;
        
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/reprobot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, history: [] })
        });
        
        if (res.ok) {
          const data = await res.json();
          // Recommendations could be stored or displayed if needed
          data.response
            .split('\n')
            .filter((r: string) => r.trim().length > 0)
            .map((r: string) => r.replace(/^\d+\.\s*/, '').trim());
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const safetyCheck: SafetyCheck = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      period: currentPeriod,
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

    // Fetch AI recommendations after submitting
    await fetchAIRecommendations(responses, selectedConcerns);

    try {
      await apiService.submitSafetyCheck?.(safetyCheck);
      
      const existing = await offlineStorage.getData('safety_checks') || [];
      await offlineStorage.storeData('safety_checks', [safetyCheck, ...existing]);
      
      setCheckHistory(prev => [safetyCheck, ...prev]);
      setShowModal(false);
      
      if (needsHelp && helpType && helpType !== 'none') {
        handleHelpRequest(helpType);
      }
    } catch (error) {
      console.error('Failed to submit safety check:', error);
    }
    
    setIsSubmitting(false);
  };

  const handleHelpRequest = (type: 'app_chat' | 'phone_call' | 'external') => {
    switch (type) {
      case 'app_chat':
        navigate('/chat');
        break;
      case 'phone_call':
        window.location.href = 'tel:+233-999-999-999';
        break;
      case 'external':
        navigate('/resources');
        break;
    }
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Sun className="w-6 h-6 text-orange-500" />;
      case 'afternoon': return <Sunset className="w-6 h-6 text-yellow-500" />;
      case 'evening': return <Moon className="w-6 h-6 text-indigo-500" />;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'morning': return 'Morning Check-in';
      case 'afternoon': return 'Afternoon Check-in';
      case 'evening': return 'Evening Check-in';
    }
  };

  const getPeriodTime = (period: string) => {
    switch (period) {
      case 'morning': return '5:00 AM - 12:00 PM';
      case 'afternoon': return '12:00 PM - 5:00 PM';
      case 'evening': return '5:00 PM - 10:00 PM';
    }
  };

  const currentQuestion = SAFETY_CHECK_QUESTIONS[currentStep];
  const totalSteps = SAFETY_CHECK_QUESTIONS.length + 2;

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-2xl shadow-primary-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Daily Check</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Daily Safety Check</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Track your well-being throughout the day with morning, afternoon, and evening check-ins.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{todayChecks.length}/3</p>
              <p className="text-xs text-gray-500">Completed Today</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{streak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
          <div className="flex gap-2">
            {(['morning', 'afternoon', 'evening'] as const).map((period) => {
              const check = todayChecks.find(c => c.period === period);
              const isActive = getCurrentPeriod() === period;
              
              return (
                <div 
                  key={period}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    check 
                      ? 'border-green-200 bg-green-50' 
                      : isActive
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {check ? (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-primary-100' : 'bg-gray-200'
                      }`}>
                        {getPeriodIcon(period)}
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm font-medium capitalize">{period}</p>
                  {check && (
                    <p className="text-center text-xs text-green-600 mt-1">Done</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Period Cards */}
        <div className="space-y-3">
          {(['morning', 'afternoon', 'evening'] as const).map((period) => {
            const check = todayChecks.find(c => c.period === period);
            const isActive = getCurrentPeriod() === period;
            
            return (
              <div 
                key={period}
                className={`bg-white rounded-2xl shadow-sm border-2 p-4 transition-all ${
                  check 
                    ? 'border-green-200' 
                    : isActive 
                      ? 'border-primary-300 shadow-md'
                      : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      check ? 'bg-green-100' : isActive ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {getPeriodIcon(period)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{period}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{getPeriodTime(period)}</span>
                      </div>
                    </div>
                  </div>
                  {check ? (
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Completed
                    </div>
                  ) : isActive ? (
                    <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      Now
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      Upcoming
                    </div>
                  )}
                </div>

                {check ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {check.concerns.length > 0 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                          {check.concerns.length} concern{check.concerns.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {check.needsHelp && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                          Help requested
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span>Physical: {check.responses.physicalHealth}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4" />
                        <span>Mental: {check.responses.mentalHealth}/5</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartCheck(period)}
                    disabled={!isActive}
                    className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      isActive 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isActive ? (
                      <>
                        Start Check-in
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      'Not yet available'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Why check in 3 times daily?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Regular check-ins help us identify patterns and provide better support. 
                Your safety is our priority.
              </p>
            </div>
          </div>
        </div>

        {/* History Link */}
        <button 
          onClick={() => navigate('/safety-checks/history')}
          className="w-full py-4 bg-white rounded-2xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          View Check-in History
        </button>
      </div>

      {/* Check-in Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {getPeriodIcon(currentPeriod)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{getPeriodLabel(currentPeriod)}</h2>
                    <p className="text-white/80 text-sm">Are you safe today?</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
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

            {/* Modal Content */}
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
      )}
      </main>
    </PageContainer>
  );
};

export default DailySafetyCheck;
