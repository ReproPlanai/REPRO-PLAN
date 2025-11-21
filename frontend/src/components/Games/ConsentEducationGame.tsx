import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Star, 
  Heart, 
  Users, 
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Award,
  Target,
  BookOpen
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';

interface Scenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
  category: 'consent' | 'communication' | 'boundaries' | 'relationships' | 'safety';
  difficulty: 'easy' | 'medium' | 'hard';
  culturalContext: string;
  ageGroup: '13-17' | '18-24' | '25-35' | '35+';
}

interface GameStats {
  totalGames: number;
  totalScore: number;
  bestScore: number;
  scenariosCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  achievements: string[];
  lastPlayed: string;
}

const ConsentEducationGame: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    totalScore: 0,
    bestScore: 0,
    scenariosCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    achievements: [],
    lastPlayed: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('18-24');

  const scenarios: Scenario[] = [
    {
      id: '1',
      title: 'Market Day Encounter',
      description: 'A scenario at the local market in Monrovia',
      situation: 'You\'re at Waterside Market buying vegetables. A person you\'ve seen around your neighborhood approaches you and starts a conversation. They seem friendly and ask if you\'d like to go for a walk after you finish shopping.',
      question: 'What should you do in this situation?',
      options: [
        {
          id: 'a',
          text: 'Say yes immediately because they seem nice',
          isCorrect: false,
          explanation: 'It\'s important to be cautious with people you don\'t know well, even if they seem friendly.',
          points: 0
        },
        {
          id: 'b',
          text: 'Politely decline and suggest meeting in a public place with friends',
          isCorrect: true,
          explanation: 'This is a safe approach - meeting in public with friends ensures your safety and comfort.',
          points: 10
        },
        {
          id: 'c',
          text: 'Ignore them completely and walk away',
          isCorrect: false,
          explanation: 'While being cautious is good, being rude isn\'t necessary. A polite response is better.',
          points: 5
        },
        {
          id: 'd',
          text: 'Give them your phone number to arrange something later',
          isCorrect: false,
          explanation: 'Don\'t give personal information to people you don\'t know well.',
          points: 0
        }
      ],
      category: 'safety',
      difficulty: 'easy',
      culturalContext: 'Liberian market culture and community interactions',
      ageGroup: '18-24'
    },
    {
      id: '2',
      title: 'University Campus',
      description: 'A scenario at the University of Liberia',
      situation: 'You\'re studying in the library at UL. A classmate you\'ve been working on group projects with sits down next to you and starts touching your arm while talking. You feel uncomfortable but they seem to think it\'s normal.',
      question: 'How should you handle this situation?',
      options: [
        {
          id: 'a',
          text: 'Say nothing and hope they stop',
          isCorrect: false,
          explanation: 'Staying silent doesn\'t communicate your boundaries clearly. It\'s important to speak up.',
          points: 0
        },
        {
          id: 'b',
          text: 'Politely but firmly say "Please don\'t touch me" and move away',
          isCorrect: true,
          explanation: 'This clearly communicates your boundary while being respectful. You have the right to set physical boundaries.',
          points: 15
        },
        {
          id: 'c',
          text: 'Touch them back to show you\'re comfortable with it',
          isCorrect: false,
          explanation: 'This doesn\'t address the issue and may send mixed signals about your comfort level.',
          points: 0
        },
        {
          id: 'd',
          text: 'Get angry and make a scene',
          isCorrect: false,
          explanation: 'While your feelings are valid, staying calm and clear is more effective.',
          points: 5
        }
      ],
      category: 'boundaries',
      difficulty: 'medium',
      culturalContext: 'University environment and academic relationships',
      ageGroup: '18-24'
    },
    {
      id: '3',
      title: 'Church Social Event',
      description: 'A scenario at a church youth event',
      situation: 'You\'re at a church youth social in Paynesville. Someone you\'ve been talking to asks if you want to go outside to talk privately. You\'re not sure what they want to discuss.',
      question: 'What\'s the best response?',
      options: [
        {
          id: 'a',
          text: 'Go outside immediately to be polite',
          isCorrect: false,
          explanation: 'Your safety and comfort are more important than being polite. You can decline politely.',
          points: 0
        },
        {
          id: 'b',
          text: 'Ask what they want to discuss first, and suggest staying in the group area',
          isCorrect: true,
          explanation: 'This allows you to understand their intentions while staying in a safe, public environment.',
          points: 12
        },
        {
          id: 'c',
          text: 'Say you\'re not interested in talking to them',
          isCorrect: false,
          explanation: 'This might be too harsh. You can be polite while still setting boundaries.',
          points: 5
        },
        {
          id: 'd',
          text: 'Ask a friend to come with you',
          isCorrect: true,
          explanation: 'Having a friend present is a good safety measure if you do decide to talk privately.',
          points: 10
        }
      ],
      category: 'communication',
      difficulty: 'medium',
      culturalContext: 'Church community and religious social events',
      ageGroup: '13-17'
    },
    {
      id: '4',
      title: 'Workplace Situation',
      description: 'A scenario at a workplace in Monrovia',
      situation: 'You\'re working at a small business in Monrovia. Your supervisor has been making comments about your appearance and asking personal questions about your relationships. You need this job but feel uncomfortable.',
      question: 'What should you do?',
      options: [
        {
          id: 'a',
          text: 'Ignore it and hope it stops',
          isCorrect: false,
          explanation: 'This type of behavior often escalates if not addressed. It\'s important to take action.',
          points: 0
        },
        {
          id: 'b',
          text: 'Document the incidents and report to HR or a trusted supervisor',
          isCorrect: true,
          explanation: 'Documenting and reporting inappropriate behavior is the right approach. You have rights in the workplace.',
          points: 20
        },
        {
          id: 'c',
          text: 'Quit your job immediately',
          isCorrect: false,
          explanation: 'While you have the right to quit, it\'s better to try to address the issue first.',
          points: 5
        },
        {
          id: 'd',
          text: 'Confront them directly in front of everyone',
          isCorrect: false,
          explanation: 'While standing up for yourself is good, doing it professionally through proper channels is better.',
          points: 8
        }
      ],
      category: 'relationships',
      difficulty: 'hard',
      culturalContext: 'Workplace dynamics and professional relationships',
      ageGroup: '25-35'
    },
    {
      id: '5',
      title: 'Online Dating',
      description: 'A scenario involving online communication',
      situation: 'You\'ve been chatting with someone online for a few weeks. They seem nice and you\'ve shared some personal information. Now they\'re asking to meet in person at a specific location they chose.',
      question: 'How should you respond?',
      options: [
        {
          id: 'a',
          text: 'Meet them at their chosen location',
          isCorrect: false,
          explanation: 'Meeting someone from online at their chosen location can be risky. Always choose public, familiar places.',
          points: 0
        },
        {
          id: 'b',
          text: 'Suggest meeting in a public place you know, and bring a friend',
          isCorrect: true,
          explanation: 'This is the safest approach - public place, your choice of location, and having support.',
          points: 15
        },
        {
          id: 'c',
          text: 'Give them your home address to meet there',
          isCorrect: false,
          explanation: 'Never give your home address to someone you\'ve only met online.',
          points: 0
        },
        {
          id: 'd',
          text: 'Stop talking to them completely',
          isCorrect: false,
          explanation: 'While you can stop talking to anyone, this might be an overreaction if you\'re otherwise interested.',
          points: 5
        }
      ],
      category: 'safety',
      difficulty: 'medium',
      culturalContext: 'Modern technology and online relationships',
      ageGroup: '18-24'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Topics', icon: BookOpen },
    { value: 'consent', label: 'Consent', icon: Heart },
    { value: 'communication', label: 'Communication', icon: Users },
    { value: 'boundaries', label: 'Boundaries', icon: Shield },
    { value: 'relationships', label: 'Relationships', icon: Heart },
    { value: 'safety', label: 'Safety', icon: Shield }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'easy', label: 'Beginner' },
    { value: 'medium', label: 'Intermediate' },
    { value: 'hard', label: 'Advanced' }
  ];

  const ageGroups = [
    { value: '13-17', label: '13-17 years' },
    { value: '18-24', label: '18-24 years' },
    { value: '25-35', label: '25-35 years' },
    { value: '35+', label: '35+ years' }
  ];

  const achievements = [
    { id: 'first_game', name: 'First Steps', description: 'Complete your first scenario', icon: Star },
    { id: 'perfect_score', name: 'Perfect Score', description: 'Get all answers correct in a game', icon: Trophy },
    { id: 'consent_expert', name: 'Consent Expert', description: 'Complete 10 consent scenarios', icon: Award },
    { id: 'safety_champion', name: 'Safety Champion', description: 'Complete 5 safety scenarios correctly', icon: Shield },
    { id: 'communication_master', name: 'Communication Master', description: 'Complete 8 communication scenarios', icon: Users }
  ];

  const loadGameStats = async () => {
    try {
      const stored = await offlineStorage.getData('consent_game_stats');
      if (stored) {
        setGameStats(stored);
      }
    } catch (error) {
      console.error('Failed to load game stats:', error);
    }
  };

  const saveGameStats = async (newStats: GameStats) => {
    try {
      await offlineStorage.storeData('consent_game_stats', newStats);
      setGameStats(newStats);
    } catch (error) {
      console.error('Failed to save game stats:', error);
    }
  };

  const getFilteredScenarios = () => {
    return scenarios.filter(scenario => {
      const categoryMatch = selectedCategory === 'all' || scenario.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
      const ageMatch = scenario.ageGroup === selectedAgeGroup;
      return categoryMatch && difficultyMatch && ageMatch;
    });
  };

  const startGame = () => {
    const filteredScenarios = getFilteredScenarios();
    if (filteredScenarios.length === 0) {
      alert('No scenarios available for your selected filters. Please adjust your selection.');
      return;
    }
    
    setCurrentScenario(filteredScenarios[0]);
    setCurrentScenarioIndex(0);
    setGameStarted(true);
    setGameCompleted(false);
    setCurrentScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (optionId: string) => {
    if (showExplanation) return;
    
    setSelectedOption(optionId);
    const option = currentScenario?.options.find(opt => opt.id === optionId);
    if (option) {
      setCurrentScore(prev => prev + option.points);
    }
    setShowExplanation(true);
  };

  const nextScenario = () => {
    const filteredScenarios = getFilteredScenarios();
    const nextIndex = currentScenarioIndex + 1;
    
    if (nextIndex < filteredScenarios.length) {
      setCurrentScenario(filteredScenarios[nextIndex]);
      setCurrentScenarioIndex(nextIndex);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Game completed
      setGameCompleted(true);
      const newStats: GameStats = {
        totalGames: gameStats.totalGames + 1,
        totalScore: gameStats.totalScore + currentScore,
        bestScore: Math.max(gameStats.bestScore, currentScore),
        scenariosCompleted: gameStats.scenariosCompleted + filteredScenarios.length,
        correctAnswers: gameStats.correctAnswers + filteredScenarios.filter((_, index) => index <= currentScenarioIndex).length,
        totalAnswers: gameStats.totalAnswers + filteredScenarios.length,
        achievements: [...gameStats.achievements],
        lastPlayed: new Date().toISOString()
      };

      // Check for new achievements
      if (gameStats.totalGames === 0) {
        newStats.achievements.push('first_game');
      }
      if (currentScore === filteredScenarios.length * 15) { // Perfect score
        newStats.achievements.push('perfect_score');
      }

      saveGameStats(newStats);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentScenario(null);
    setCurrentScenarioIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentScore(0);
  };


  const getScorePercentage = () => {
    const filteredScenarios = getFilteredScenarios();
    const maxScore = filteredScenarios.length * 15; // Assuming max 15 points per scenario
    return maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;
  };

  useEffect(() => {
    loadGameStats();
  }, []);

  if (!gameStarted && !gameCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Consent Education Game</h1>
              <p className="text-gray-600">Learn about consent, boundaries, and healthy relationships through Liberian scenarios</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Scenarios Available</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{getFilteredScenarios().length}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Best Score</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{gameStats.bestScore}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Achievements</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{gameStats.achievements.length}</p>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Game Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="input-field"
              >
                {ageGroups.map(group => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input-field"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {gameStats.achievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameStats.achievements.map((achievementId) => {
                const achievement = achievements.find(a => a.id === achievementId);
                if (!achievement) return null;
                const Icon = achievement.icon;
                return (
                  <div key={achievementId} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Icon className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-yellow-900">{achievement.name}</h3>
                      <p className="text-sm text-yellow-700">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Game Button */}
        <div className="text-center">
          <button
            onClick={startGame}
            className="btn-primary text-lg px-8 py-3 flex items-center space-x-2 mx-auto"
          >
            <Play size={20} />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const filteredScenarios = getFilteredScenarios();
    const scorePercentage = getScorePercentage();
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Completed!</h1>
            <p className="text-gray-600">Great job learning about consent and healthy relationships</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{currentScore}</div>
              <div className="text-sm text-blue-700">Total Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{scorePercentage}%</div>
              <div className="text-sm text-green-700">Accuracy</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{filteredScenarios.length}</div>
              <div className="text-sm text-purple-700">Scenarios</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={resetGame}
              className="btn-primary w-full"
            >
              Play Again
            </button>
            <button
              onClick={() => {
                resetGame();
                // Could navigate to main menu here
              }}
              className="btn-outline w-full"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentScenario) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentScenario.title}</h1>
            <p className="text-gray-600">{currentScenario.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{currentScore}</div>
            <div className="text-sm text-gray-500">Score</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
              {currentScenarioIndex + 1} of {getFilteredScenarios().length}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {currentScenario.difficulty}
            </span>
          </div>
          <button
            onClick={resetGame}
            className="btn-outline text-sm"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Scenario Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Situation</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{currentScenario.situation}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Cultural Context</h4>
                <p className="text-blue-800 text-sm">{currentScenario.culturalContext}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentScenario.question}</h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentScenario.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.isCorrect;
            const showResult = showExplanation && isSelected;
            
            let optionClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";
            
            if (showExplanation) {
              if (isSelected) {
                optionClass += isCorrect 
                  ? "border-green-500 bg-green-50 text-green-900" 
                  : "border-red-500 bg-red-50 text-red-900";
              } else if (isCorrect) {
                optionClass += "border-green-300 bg-green-25 text-green-700";
              } else {
                optionClass += "border-gray-200 bg-gray-50 text-gray-500";
              }
            } else {
              optionClass += isSelected 
                ? "border-primary-500 bg-primary-50 text-primary-900" 
                : "border-gray-200 hover:border-primary-300 hover:bg-primary-25";
            }

            return (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showExplanation}
                className={optionClass}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {showResult ? (
                      isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{option.id.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.text}</p>
                    {showResult && (
                      <p className="text-sm mt-2 opacity-75">{option.explanation}</p>
                    )}
                  </div>
                  {showResult && (
                    <div className="flex-shrink-0">
                      <span className="text-sm font-bold">+{option.points}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {showExplanation && (
          <div className="mt-6 text-center">
            <button
              onClick={nextScenario}
              className="btn-primary px-8 py-3"
            >
              {currentScenarioIndex + 1 < getFilteredScenarios().length ? 'Next Scenario' : 'Finish Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentEducationGame;
