import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  Gamepad2, 
  BookOpen, 
  Trophy,
  Target,
  Sparkles,
  Activity,
  Users,
  TrendingUp,
  ChevronRight,
  Lock,
  Shield,
  Heart,
  MessageCircle,
  Clock,
  Award,
  BarChart3,
  Zap,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  Home
} from 'lucide-react';
import { apiService } from '../../services/api';
import ConsentScenarioGame from './ConsentScenarioGame';
import SRHRMythBuster from './SRHRMythBuster';
import KnowledgeRace from './KnowledgeRace';
import DailyChallenge from './DailyChallenge';
import AILearningChat from './AILearningChat';
import InteractiveStory from './InteractiveStory';
import RightsDefender from './RightsDefender';

interface GameSession {
  id: string;
  gameType: string;
  score: number;
  progress: number;
  timeSpent: number;
  completedAt: string;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  gameType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  category: string;
}

const AIGamesPlatform: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<GameSession[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const gameModules = [
    {
      id: 'consent-scenarios',
      title: 'Consent Challenge',
      description: 'AI-generated interactive scenarios teaching consent and healthy boundaries',
      icon: Shield,
      color: 'bg-blue-500',
      category: 'Relationships & Consent',
      component: ConsentScenarioGame,
      featured: true
    },
    {
      id: 'myth-buster',
      title: 'SRHR Myth Buster',
      description: 'AI-powered myth-busting game with real-time fact checking',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      category: 'Health Education',
      component: SRHRMythBuster,
      featured: true
    },
    {
      id: 'knowledge-race',
      title: 'Knowledge Race',
      description: 'Fast-paced AI-generated quiz competing against time',
      icon: Zap,
      color: 'bg-purple-500',
      category: 'General Knowledge',
      component: KnowledgeRace,
      featured: false
    },
    {
      id: 'interactive-story',
      title: 'Choose Your Path',
      description: 'AI-driven interactive stories with SRHR decision-making',
      icon: BookOpen,
      color: 'bg-green-500',
      category: 'Decision Making',
      component: InteractiveStory,
      featured: true
    },
    {
      id: 'rights-defender',
      title: 'Rights Defender',
      description: 'Defend rights in simulated scenarios - AI judges your arguments',
      icon: Trophy,
      color: 'bg-red-500',
      category: 'Legal & Rights',
      component: RightsDefender,
      featured: false
    },
    {
      id: 'daily-challenge',
      title: 'Daily Challenge',
      description: 'New AI-generated challenge every day with global leaderboard',
      icon: Target,
      color: 'bg-orange-500',
      category: 'Daily Learning',
      component: DailyChallenge,
      featured: true
    },
    {
      id: 'ai-learning-chat',
      title: 'Learn with ReproBot',
      description: 'Gamified AI chat - earn points by asking good questions',
      icon: MessageCircle,
      color: 'bg-pink-500',
      category: 'AI Tutor',
      component: AILearningChat,
      featured: true
    }
  ];

  // Note: Game sessions are NOT saved locally - all data comes from API
  // This ensures fresh data from AI provider

  const loadUserData = useCallback(async () => {
    try {
      // Sessions are ephemeral - not stored locally
      setUserSessions([]);
      // Profile data comes from API only
      setUserLevel(1);
      setTotalXP(0);
      setStreak(0);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  const fetchAIRecommendations = useCallback(async () => {
    try {
      const response = await apiService.getAIGameRecommendations?.() as {
        success?: boolean;
        recommendations?: AIRecommendation[];
      };
      
      if (response?.success && response.recommendations) {
        setRecommendations(response.recommendations);
      } else {
        // Generate default recommendations
        setRecommendations([
          {
            id: '1',
            title: 'Start with Consent Basics',
            description: 'Perfect for beginners - learn about healthy boundaries',
            gameType: 'consent-scenarios',
            difficulty: 'beginner',
            estimatedTime: 10,
            category: 'Relationships & Consent'
          },
          {
            id: '2',
            title: 'Test Your Knowledge',
            description: 'Quick assessment to personalize your learning path',
            gameType: 'knowledge-race',
            difficulty: 'intermediate',
            estimatedTime: 5,
            category: 'Assessment'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUserData();
    fetchAIRecommendations();
  }, [loadUserData, fetchAIRecommendations]);

  const saveGameSession = async (session: GameSession) => {
    try {
      const updated = [session, ...userSessions].slice(0, 50);
      setUserSessions(updated);
      // Note: NOT saving to local storage - sessions are ephemeral
      // Only sync to server for admin tracking
      await apiService.saveGameSession?.(session);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const calculateProgress = () => {
    if (userSessions.length === 0) return 0;
    const completed = userSessions.filter(s => s.progress >= 100).length;
    return Math.round((completed / 7) * 100); // 7 total games
  };

  const GameComponent = activeGame ? gameModules.find(g => g.id === activeGame)?.component : null;

  if (activeGame && GameComponent) {
    return (
      <GameComponent 
        onComplete={async (score: number, timeSpent: number) => {
          await saveGameSession({
            id: Date.now().toString(),
            gameType: activeGame,
            score,
            progress: 100,
            timeSpent,
            completedAt: new Date().toISOString()
          });
          setActiveGame(null);
        }}
        onExit={() => setActiveGame(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">AI is preparing your personalized learning experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Learn & Play</h1>
                  <p className="text-gray-600">AI-powered interactive learning experiences</p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="text-xl font-bold text-gray-900">{userLevel}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">XP</p>
                  <p className="text-xl font-bold text-gray-900">{totalXP}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Streak</p>
                  <p className="text-xl font-bold text-gray-900">{streak}d</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 2).map(rec => (
                <div 
                  key={rec.id}
                  className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 border border-purple-200 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setActiveGame(rec.gameType)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                          {rec.difficulty}
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                          {rec.estimatedTime} min
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Games */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModules.filter(g => g.featured).map(game => (
              <div 
                key={game.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => setActiveGame(game.id)}
              >
                <div className={`${game.color} p-6`}>
                  <div className="flex items-center justify-between">
                    <game.icon className="w-10 h-10 text-white" />
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4">{game.title}</h3>
                  <p className="text-white/90 text-sm mt-1">{game.category}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600">{game.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Brain className="w-3 h-3" />
                      AI-Generated
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Games */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Learning Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameModules.map(game => (
              <div 
                key={game.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all flex items-center gap-4"
                onClick={() => setActiveGame(game.id)}
              >
                <div className={`${game.color} p-3 rounded-xl`}>
                  <game.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{game.title}</h3>
                  <p className="text-xs text-gray-500">{game.category}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Learning Journey</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-semibold text-gray-900">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {userSessions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600">Games Played</p>
                <p className="text-2xl font-bold text-purple-900">{userSessions.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">Completed</p>
                <p className="text-2xl font-bold text-blue-900">
                  {userSessions.filter(s => s.progress >= 100).length}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600">Avg Score</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(userSessions.reduce((a, s) => a + s.score, 0) / (userSessions.length || 1))}%
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600">Time Learning</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(userSessions.reduce((a, s) => a + s.timeSpent, 0) / 60)}m
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGamesPlatform;
