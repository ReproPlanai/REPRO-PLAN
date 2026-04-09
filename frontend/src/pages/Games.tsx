import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  Heart, 
  Sparkles, 
  Trophy, 
  ArrowRight,
  Brain,
  Target,
  Clock,
  Shield
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import AccessibleQuizGame from '../components/Games/AccessibleQuizGame';

const Games: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'quiz'>('select');

  if (mode === 'quiz') {
    return <AccessibleQuizGame onBack={() => setMode('select')} />;
  }

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
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Learn & Play</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Interactive Games</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Test your knowledge with AI-generated quizzes and scenarios. Earn scores, track progress, and learn about SRHR in a fun way.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { icon: Brain, title: 'AI-Powered', desc: 'Smart Content', color: 'from-blue-500 to-cyan-500' },
            { icon: Target, title: 'Track', desc: 'Progress', color: 'from-emerald-500 to-teal-500' },
            { icon: Clock, title: 'Fast', desc: 'Learning', color: 'from-purple-500 to-indigo-500' },
            { icon: Shield, title: 'Safe', desc: 'Anonymous', color: 'from-amber-500 to-orange-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={desc} className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Game Cards */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            Available Games
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setMode('quiz')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-200/60 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-primary-600 text-sm mb-0.5">
                  SRHR Knowledge Quiz
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  AI-generated questions on contraception, reproductive health, STIs, and more.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
            </button>

            <button
              onClick={() => navigate('/consent-game')}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-200/60 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-pink-600 text-sm mb-0.5">
                  Consent Game
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  AI-generated scenarios on consent, boundaries, and healthy relationships.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Progress
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-gray-900 text-sm">Track your achievements</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Both games save your scores and achievements. Complete quizzes and scenarios to build your SRHR knowledge and earn badges.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-bold text-primary-600">0</p>
                <p className="text-xs text-gray-500">Quizzes</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-bold text-pink-600">0</p>
                <p className="text-xs text-gray-500">Scenarios</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-bold text-amber-600">0</p>
                <p className="text-xs text-gray-500">Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="font-semibold text-blue-900 text-sm">Anonymous & Safe Learning</h4>
              <p className="text-blue-800 text-xs mt-1 leading-relaxed">
                All game progress is stored locally on your device. No personal information is collected or shared. Learn at your own pace in a safe environment.
              </p>
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
};

export default Games;
