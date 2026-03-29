import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Heart, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import AccessibleQuizGame from '../components/Games/AccessibleQuizGame';

const Games: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'quiz'>('select');

  if (mode === 'quiz') {
    return <AccessibleQuizGame onBack={() => setMode('select')} />;
  }

  return (
    <PageContainer gradient>
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-600 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Learning
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Learn & Play</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Test your knowledge with AI-generated quizzes. Earn scores, track progress, and learn about SRHR.
          </p>
        </div>

        {/* Game cards */}
        <div className="space-y-4">
          <button
            onClick={() => setMode('quiz')}
            className="w-full text-left p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">SRHR Knowledge Quiz</h2>
                <p className="text-sm text-gray-600 mb-3">
                  AI-generated questions on contraception, reproductive health, STIs, and more. Get personalized explanations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-medium">AI-generated</span>
                  <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">Scores & stats</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0 mt-1" />
            </div>
          </button>

          <button
            onClick={() => navigate('/consent-game')}
            className="w-full text-left p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">Consent Game</h2>
                <p className="text-sm text-gray-600 mb-3">
                  AI-generated scenarios on consent, boundaries, and healthy relationships. Learn through real-life situations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-pink-50 text-pink-600 text-xs font-medium">AI scenarios</span>
                  <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">Points & achievements</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 flex-shrink-0 mt-1" />
            </div>
          </button>
        </div>

        {/* Stats teaser */}
        <div className="mt-8 p-4 rounded-2xl bg-white/80 border border-gray-200/60">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-gray-900 text-sm">Track your progress</span>
          </div>
          <p className="text-xs text-gray-600">
            Both games save your scores and achievements. Complete quizzes and scenarios to build your SRHR knowledge.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Games;
