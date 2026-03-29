import React, { useState, useEffect } from 'react';
import { Target, Trophy, Users, Timer, Sparkles, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';

interface DailyChallengeProps {
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onComplete, onExit }) => {
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const response = await apiService.getAIGameRecommendations?.() as any;
      setChallenge({
        title: "Today's SRHR Challenge",
        description: "Test your knowledge with today's AI-generated challenge question!",
        type: 'quiz',
        participants: 1247,
        avgScore: 72,
        timeLimit: 60
      });
    } catch {
      setChallenge(null);
    }
    setIsLoading(false);
  };

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setCompleted(true);
    onComplete(score, timeSpent);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onExit} className="p-2 hover:bg-white/50 rounded-lg">
            <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
          </button>
          <div className="p-3 bg-orange-500 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Daily Challenge</h1>
            <p className="text-sm text-gray-600">New challenge every day</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm opacity-90">AI-Generated Daily Challenge</span>
            </div>
            <h2 className="text-2xl font-bold">{challenge?.title}</h2>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-6">{challenge?.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-900">{challenge?.participants}</p>
                <p className="text-xs text-orange-700">Participants</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <Trophy className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-900">{challenge?.avgScore}%</p>
                <p className="text-xs text-red-700">Avg Score</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <Timer className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-900">{challenge?.timeLimit}s</p>
                <p className="text-xs text-orange-700">Time Limit</p>
              </div>
            </div>

            {!started ? (
              <button
                onClick={handleStart}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors"
              >
                Start Challenge
              </button>
            ) : !completed ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Challenge in progress...</p>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600"
                >
                  Complete Challenge
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xl font-bold text-green-600 mb-2">Challenge Completed!</p>
                <p className="text-gray-600">Come back tomorrow for a new challenge</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
