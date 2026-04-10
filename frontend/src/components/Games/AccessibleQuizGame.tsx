import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Star, 
  RotateCcw,
  BookOpen,
  Target,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useOffline } from '../../hooks/useOffline';
import { voiceCommandService } from '../../services/voiceCommandService';
import { keyboardNavigationService } from '../../services/keyboardNavigationService';
import PageContainer from '../Layout/PageContainer';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  date: string;
  category: string;
}

const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, '');

interface AccessibleQuizGameProps {
  onBack?: () => void;
}

const AccessibleQuizGame: React.FC<AccessibleQuizGameProps> = ({ onBack }) => {
  const { settings } = useAccessibility();
  const { isOnline } = useOffline();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSpeaking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userStats, setUserStats] = useState<QuizResult[]>([]);
  
  const questionRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Remove sample questions - questions must come from API
  // Empty questions array until API provides data

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'HIV Prevention', label: 'HIV Prevention' },
    { value: 'Reproductive Health', label: 'Reproductive Health' },
    { value: 'Vaccination', label: 'Vaccination' }
  ];

  const readCurrentQuestion = useCallback(() => {
    if (questions[currentQuestionIndex]) {
      const question = questions[currentQuestionIndex];
      let text = `Question ${currentQuestionIndex + 1}: ${question.question}`;
      question.options.forEach((option, index) => {
        text += ` Option ${String.fromCharCode(65 + index)}: ${option}`;
      });
      voiceCommandService.speak(text);
    }
  }, [questions, currentQuestionIndex]);

  const readExplanation = useCallback(() => {
    if (questions[currentQuestionIndex] && showResult) {
      const text = aiExplanation || questions[currentQuestionIndex].explanation;
      voiceCommandService.speak(text);
    }
  }, [questions, currentQuestionIndex, showResult, aiExplanation]);

  // Fetch questions from API only - no sample data fallback
  const startQuiz = useCallback(async () => {
    setQuestionsLoading(true);
    setAiExplanation(null);
    try {
      if (isOnline && API_URL) {
        const topic = selectedCategory === 'all' ? 'SRHR' : selectedCategory;
        const res = await fetch(`${API_URL}/ai/quiz-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, difficulty: 'medium', count: 5 }),
        });
        if (res.ok) {
          const data = await res.json();
          const qs = Array.isArray(data?.questions) ? data.questions : [];
          if (qs.length > 0) {
            const mapped: Question[] = qs.map((q: Record<string, unknown>, i: number) => ({
              id: String(q.id ?? i + 1),
              question: String(q.question ?? ''),
              options: Array.isArray(q.options) ? q.options.map(String) : [],
              correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
              explanation: String(q.explanation ?? ''),
              category: String(q.category ?? topic),
              difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
            })).filter((q: Question) => q.question && q.options.length >= 2);
            if (mapped.length > 0) {
              setQuestions(mapped);
              setQuizStarted(true);
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
              setScore(0);
              setSelectedAnswer(null);
              setShowResult(false);
              setTimeSpent(0);
              setQuestionsLoading(false);
              return;
            }
          }
        }
      }
      // No fallback - just set empty questions and show error state
      setQuestions([]);
    } catch {
      setQuestions([]);
    }
    setQuizStarted(true);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeSpent(0);
    setQuestionsLoading(false);
  }, [isOnline, selectedCategory]);

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowResult(true);
    setAiExplanation(null);

    if (isOnline && API_URL && currentQuestion) {
      try {
        const res = await fetch(`${API_URL}/ai/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: currentQuestion.question,
            userAnswer: currentQuestion.options[selectedAnswer],
            correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
            context: currentQuestion.category,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.explanation) setAiExplanation(data.explanation);
        }
      } catch {
        // Use built-in explanation
      }
    }
  }, [selectedAnswer, questions, currentQuestionIndex, isOnline]);

  const saveUserStats = useCallback(async (result: QuizResult) => {
    try {
      const updatedStats = [...userStats, result];
      setUserStats(updatedStats);
      localStorage.setItem('quiz-stats', JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Failed to save quiz stats:', error);
    }
  }, [userStats]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAiExplanation(null);
    } else {
      setQuizCompleted(true);
      const result: QuizResult = {
        id: Date.now().toString(),
        score,
        totalQuestions: questions.length,
        timeSpent,
        date: new Date().toISOString(),
        category: selectedCategory
      };
      saveUserStats(result);
    }
  }, [currentQuestionIndex, questions.length, score, timeSpent, selectedCategory, saveUserStats]);

  const handleVoiceCommand = useCallback((command: any) => {
    switch (command.action) {
      case 'quiz':
        if (!quizStarted) {
          startQuiz();
        }
        break;
      case 'select-option-a':
        setSelectedAnswer(0);
        break;
      case 'select-option-b':
        setSelectedAnswer(1);
        break;
      case 'select-option-c':
        setSelectedAnswer(2);
        break;
      case 'select-option-d':
        setSelectedAnswer(3);
        break;
      case 'submit-answer':
        if (selectedAnswer !== null) {
          handleSubmitAnswer();
        }
        break;
      case 'next-question':
        if (showResult) {
          handleNextQuestion();
        }
        break;
      case 'read-question':
        readCurrentQuestion();
        break;
      case 'read-explanation':
        if (showResult) {
          readExplanation();
        }
        break;
    }
  }, [quizStarted, selectedAnswer, showResult, startQuiz, handleNextQuestion, handleSubmitAnswer, readCurrentQuestion, readExplanation]);

  const handleKeyboardAction = useCallback((action: string) => {
    switch (action) {
      case 'select-option-a':
        setSelectedAnswer(0);
        break;
      case 'select-option-b':
        setSelectedAnswer(1);
        break;
      case 'select-option-c':
        setSelectedAnswer(2);
        break;
      case 'select-option-d':
        setSelectedAnswer(3);
        break;
      case 'submit-answer':
        if (selectedAnswer !== null) {
          handleSubmitAnswer();
        }
        break;
      case 'next-question':
        if (showResult) {
          handleNextQuestion();
        }
        break;
    }
  }, [selectedAnswer, showResult, handleNextQuestion, handleSubmitAnswer]);

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizStarted, quizCompleted]);

  // Voice command integration
  useEffect(() => {
    if (settings.voiceCommands) {
      voiceCommandService.onCommand((command) => {
        handleVoiceCommand(command);
      });
      
      voiceCommandService.onError((error) => {
        console.error('Voice command error:', error);
      });
    }
  }, [settings.voiceCommands, handleVoiceCommand]);

  // Keyboard navigation integration
  useEffect(() => {
    if (settings.keyboardNavigation) {
      keyboardNavigationService.enable();
      keyboardNavigationService.onAction((action) => {
        handleKeyboardAction(action);
      });
    } else {
      keyboardNavigationService.disable();
    }
  }, [settings.keyboardNavigation, handleKeyboardAction]);

  const loadUserStats = async () => {
    try {
      const stats = localStorage.getItem('quiz-stats');
      if (stats) {
        setUserStats(JSON.parse(stats));
      }
    } catch (error) {
      console.error('Failed to load quiz stats:', error);
    }
  };


  const handleAnswerSelect = (index: number) => {
    if (!showResult) {
      setSelectedAnswer(index);
      
      // Announce selection for screen readers
      if (settings.voiceCommands) {
        voiceCommandService.speak(`Selected option ${String.fromCharCode(65 + index)}`);
      }
    }
  };


  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeSpent(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Skip links for accessibility
  const skipLinks = (
    <div className="sr-only">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <a href="#quiz-options" className="skip-link">Skip to quiz options</a>
    </div>
  );

  if (!quizStarted) {
    return (
      <PageContainer gradient gradientFrom="from-slate-50" gradientVia="via-white" gradientTo="to-primary-50/20">
        {skipLinks}
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium">
              ← Back to Learn & Play
            </button>
          )}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 mb-4 shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">SRHR Knowledge Quiz</h1>
            <p className="text-sm sm:text-base text-gray-600">
              AI-generated questions. Test your knowledge and earn scores.
            </p>
          </div>

          <div className="space-y-6">
            {/* Quiz Setup */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Start New Quiz</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Topic</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full input-field"
                    aria-describedby="category-help"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <p id="category-help" className="text-xs text-gray-500 mt-1">
                    Choose a topic to focus your quiz on
                  </p>
                </div>

                <div className="rounded-xl bg-primary-50/80 border border-primary-200/50 p-4">
                  <h3 className="font-medium text-primary-900 mb-2">Quiz Info</h3>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• Questions loaded from API</li>
                    <li>• AI-generated with personalized explanations</li>
                    <li>• Multiple choice • No time limit</li>
                    {settings.voiceCommands && <li>• Voice commands available</li>}
                    {settings.keyboardNavigation && <li>• Keyboard navigation enabled</li>}
                  </ul>
                </div>

                <button
                  onClick={startQuiz}
                  disabled={questionsLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-all"
                  aria-describedby="start-help"
                >
                  {questionsLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Target size={16} />
                  )}
                  <span>{questionsLoading ? 'Loading...' : 'Start Quiz'}</span>
                </button>
                <p id="start-help" className="text-xs text-gray-500">
                  {settings.voiceCommands && "Say 'start quiz' to begin"}
                  {settings.keyboardNavigation && "Press Ctrl+Q to start quiz"}
                </p>
              </div>
            </div>

            {/* User Stats */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
              
              {userStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900 text-sm">Quizzes</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{userStats.length}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-200/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-primary-600" />
                        <span className="font-medium text-primary-900 text-sm">Avg Score</span>
                      </div>
                      <p className="text-2xl font-bold text-primary-600">
                        {Math.round(userStats.reduce((acc, stat) => acc + (stat.score / stat.totalQuestions * 100), 0) / userStats.length)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Recent Results</h3>
                    <div className="space-y-2">
                      {userStats.slice(-3).reverse().map((stat, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{stat.category}</p>
                            <p className="text-xs text-gray-500">
                              {formatTime(stat.timeSpent)} • {new Date(stat.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(stat.score / stat.totalQuestions * 100)}`}>
                            {Math.round(stat.score / stat.totalQuestions * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No quizzes yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start your first quiz to track progress</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </PageContainer>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <PageContainer gradient gradientFrom="from-slate-50" gradientVia="via-white" gradientTo="to-primary-50/20">
        {skipLinks}
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 sm:p-8 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600 mb-6">Great job! Here's how you did:</p>
            
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 p-4">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-xs text-green-700">Score</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-200/50 p-4">
                <div className="text-xl sm:text-2xl font-bold text-primary-600">{score}</div>
                <div className="text-xs text-primary-700">Correct</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/50 p-4">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{timeSpent}s</div>
                <div className="text-xs text-purple-700">Time</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={resetQuiz}
                className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <RotateCcw size={18} />
                <span>Take Another Quiz</span>
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all min-h-[44px]"
                >
                  Back to Learn & Play
                </button>
              )}
            </div>
          </div>
        </main>
      </PageContainer>
    );
  }

  // Active quiz state
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <PageContainer gradient gradientFrom="from-slate-50" gradientVia="via-white" gradientTo="to-primary-50/20">
      {skipLinks}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress Bar */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">{formatTime(timeSpent)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress: ${Math.round(progress)}%`}
            />
          </div>
        </div>

        {/* Question */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty}
            </span>
            <span className="text-sm text-gray-500">{currentQuestion.category}</span>
          </div>
          
          <h2 
            ref={questionRef}
            className="text-xl font-semibold text-gray-900 mb-6"
            tabIndex={-1}
            aria-live="polite"
          >
            {currentQuestion.question}
          </h2>

          <div ref={optionsRef} className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  showResult
                    ? index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                    : selectedAnswer === index
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-describedby={`option-${index}-description`}
                aria-pressed={selectedAnswer === index}
              >
                <div className="flex items-center space-x-3">
                  {showResult && (
                    <div className="flex-shrink-0">
                      {index === currentQuestion.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-600" aria-label="Correct answer" />
                      ) : selectedAnswer === index ? (
                        <XCircle className="w-5 h-5 text-red-600" aria-label="Incorrect answer" />
                      ) : null}
                    </div>
                  )}
                  <span className="font-medium">
                    <span className="sr-only">Option </span>
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </div>
                <div id={`option-${index}-description`} className="sr-only">
                  {showResult && index === currentQuestion.correctAnswer && "This is the correct answer"}
                  {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && "This is your selected answer, but it's incorrect"}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Explanation:</h3>
              <p className="text-blue-800">{aiExplanation || currentQuestion.explanation}</p>
              {settings.voiceCommands && (
                <button
                  onClick={readExplanation}
                  className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  aria-label="Read explanation aloud"
                >
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isSpeaking ? 'Stop' : 'Read'} Explanation</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
          </div>
          
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="py-2.5 px-5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
              aria-describedby="submit-help"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="py-2.5 px-5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        
        <div id="submit-help" className="sr-only">
          {settings.voiceCommands && "Say 'submit answer' to submit your response"}
          {settings.keyboardNavigation && "Press Enter to submit your answer"}
        </div>
      </main>
    </PageContainer>
  );
};

export default AccessibleQuizGame;
