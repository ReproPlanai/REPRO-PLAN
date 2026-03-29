import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Sparkles,
  MessageCircle,
  ChevronRight,
  Heart,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';

interface ConsentScenario {
  id: string;
  title: string;
  scenario: string;
  context: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  learningPoint: string;
}

interface ConsentScenarioGameProps {
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

const ConsentScenarioGame: React.FC<ConsentScenarioGameProps> = ({ onComplete, onExit }) => {
  const [scenarios, setScenarios] = useState<ConsentScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [streak, setStreak] = useState(0);

  const generateScenarios = useCallback(async () => {
    try {
      const response = await apiService.generateConsentScenarios?.() as {
        success?: boolean;
        scenarios?: ConsentScenario[];
      };
      
      if (response?.success && response.scenarios) {
        setScenarios(response.scenarios);
      } else {
        // Fallback to loading from API or using empty array
        setScenarios([]);
      }
    } catch (error) {
      console.error('Failed to generate scenarios:', error);
      setScenarios([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    generateScenarios();
  }, [generateScenarios]);

  const handleOptionSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
    setShowResult(true);
    
    const option = scenarios[currentIndex].options.find(o => o.id === optionId);
    if (option?.isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete(Math.round((score / scenarios.length) * 100), timeSpent);
    }
  };

  const handleRegenerate = () => {
    setIsLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    generateScenarios();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">AI is generating consent scenarios...</p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No scenarios available. Try regenerating.</p>
          <button 
            onClick={handleRegenerate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentIndex];
  const selectedOptionData = currentScenario.options.find(o => o.id === selectedOption);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <div className="p-3 bg-blue-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Consent Challenge</h1>
              <p className="text-sm text-gray-600">AI-Generated Scenarios</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-xl font-bold text-orange-600">{streak} 🔥</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-xl font-bold text-blue-600">{score}/{scenarios.length}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Scenario {currentIndex + 1} of {scenarios.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentIndex + 1) / scenarios.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Scenario Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">AI-Generated Scenario</span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentScenario.title}</h2>
          </div>

          <div className="p-6">
            {/* Context Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {currentScenario.context}
              </span>
            </div>

            {/* Scenario Text */}
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {currentScenario.scenario}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentScenario.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    showResult
                      ? option.id === selectedOption
                        ? option.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : option.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                      : selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {showResult && (
                      <div className="flex-shrink-0">
                        {option.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : option.id === selectedOption ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : null}
                      </div>
                    )}
                    <span className={`font-medium ${
                      showResult && !option.isCorrect && option.id === selectedOption
                        ? 'text-red-700'
                        : showResult && option.isCorrect
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}>
                      {option.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Result Explanation */}
            {showResult && selectedOptionData && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Why this matters:</p>
                    <p className="text-blue-800">{selectedOptionData.explanation}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">Learning Point: </span>
                    <span className="text-gray-700">{currentScenario.learningPoint}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New Scenarios
          </button>
          
          {showResult && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              {currentIndex < scenarios.length - 1 ? 'Next Scenario' : 'Complete'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentScenarioGame;
