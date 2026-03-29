import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Zap,
  Trophy,
  Timer,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Myth {
  id: string;
  myth: string;
  isActuallyTrue: boolean;
  explanation: string;
  category: string;
  aiSource: string;
}

interface SRHRMythBusterProps {
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

const SRHRMythBuster: React.FC<SRHRMythBusterProps> = ({ onComplete, onExit }) => {
  const [myths, setMyths] = useState<Myth[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userGuess, setUserGuess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [streak, setStreak] = useState(0);
  const [showFunFact, setShowFunFact] = useState(false);

  const generateMyths = useCallback(async () => {
    try {
      const response = await apiService.generateSRHRMyths?.() as {
        success?: boolean;
        myths?: Myth[];
      };
      
      if (response?.success && response.myths) {
        setMyths(response.myths);
      } else {
        setMyths([]);
      }
    } catch (error) {
      console.error('Failed to generate myths:', error);
      setMyths([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    generateMyths();
  }, [generateMyths]);

  const handleAnswer = (guess: boolean) => {
    if (answered) return;
    
    setUserGuess(guess);
    setAnswered(true);
    setShowFunFact(true);
    
    if (guess === myths[currentIndex].isActuallyTrue) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < myths.length - 1) {
      setCurrentIndex(c => c + 1);
      setAnswered(false);
      setUserGuess(null);
      setShowFunFact(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete(Math.round((score / myths.length) * 100), timeSpent);
    }
  };

  const handleRegenerate = () => {
    setIsLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setUserGuess(null);
    setShowFunFact(false);
    generateMyths();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">AI is fact-checking myths...</p>
        </div>
      </div>
    );
  }

  if (myths.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No myths available. Try regenerating.</p>
          <button 
            onClick={handleRegenerate}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  const currentMyth = myths[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <div className="p-3 bg-yellow-500 rounded-xl">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Myth Buster</h1>
              <p className="text-sm text-gray-600">AI-Generated Fact Checking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-xl font-bold text-orange-600">{streak} 🔥</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-xl font-bold text-yellow-600">{score}/{myths.length}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Myth {currentIndex + 1} of {myths.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentIndex + 1) / myths.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / myths.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Myth Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">AI-Generated Myth</span>
            </div>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm">
              {currentMyth.category}
            </span>
          </div>

          <div className="p-6">
            {/* Myth Statement */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2">True or False?</p>
              <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                "{currentMyth.myth}"
              </p>
            </div>

            {/* Answer Buttons */}
            {!answered ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className="p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">TRUE</p>
                  <p className="text-sm text-green-600">This is correct</p>
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="p-6 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all"
                >
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold text-red-800">FALSE</p>
                  <p className="text-sm text-red-600">This is a myth</p>
                </button>
              </div>
            ) : (
              <div className={`p-6 rounded-xl ${
                userGuess === currentMyth.isActuallyTrue 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {userGuess === currentMyth.isActuallyTrue ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-xl font-bold text-green-800">Correct!</p>
                        <p className="text-green-700">
                          This is {currentMyth.isActuallyTrue ? 'TRUE' : 'FALSE'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-xl font-bold text-red-800">Not quite!</p>
                        <p className="text-red-700">
                          This is actually {currentMyth.isActuallyTrue ? 'TRUE' : 'FALSE'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700">{currentMyth.explanation}</p>
                  {currentMyth.aiSource && (
                    <p className="text-xs text-gray-500 mt-2">
                      Source: {currentMyth.aiSource}
                    </p>
                  )}
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
            New Myths
          </button>
          
          {answered && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium"
            >
              {currentIndex < myths.length - 1 ? 'Next Myth' : 'Complete'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SRHRMythBuster;
