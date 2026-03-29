import React, { useState, useEffect, useCallback } from 'react';
import { Zap, ArrowRight, Timer, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

interface KnowledgeRaceProps {
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

const KnowledgeRace: React.FC<KnowledgeRaceProps> = ({ onComplete, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const generateQuestions = useCallback(async () => {
    try {
      const response = await apiService.getQuizQuestions?.('all') as {
        success?: boolean;
        questions?: Question[];
      };
      
      if (response?.success && response.questions) {
        setQuestions(response.questions.slice(0, 10));
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
      setQuestions([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  useEffect(() => {
    if (!isLoading && !gameOver && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleTimeUp();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading, gameOver, timeLeft]);

  const handleTimeUp = () => {
    setGameOver(true);
    onComplete(score, totalTime + 30);
  };

  const handleAnswer = (optionIndex: number) => {
    if (gameOver) return;
    
    const isCorrect = optionIndex === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    setTotalTime(t => t + (30 - timeLeft));
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setTimeLeft(30);
    } else {
      setGameOver(true);
      onComplete(score + (isCorrect ? 1 : 0), totalTime + (30 - timeLeft));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">AI is preparing race questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">No questions available.</p>
          <button 
            onClick={generateQuestions}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 hover:bg-white/50 rounded-lg">
              <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>
            <div className="p-3 bg-purple-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Knowledge Race</h1>
              <p className="text-sm text-gray-600">Beat the clock!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-purple-600'}`}>
              <Timer className="w-5 h-5 inline mr-1" />
              {timeLeft}s
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-xl font-bold text-purple-600">{score}/{questions.length}</p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {currentQuestion.category}
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={gameOver}
                className="p-4 text-left bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all font-medium"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-8">
          <div className="w-full bg-white rounded-full h-3">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeRace;
