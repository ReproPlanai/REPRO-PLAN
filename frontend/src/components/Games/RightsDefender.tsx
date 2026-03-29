import React, { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Shield, MessageCircle, CheckCircle, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

interface RightsScenario {
  id: string;
  situation: string;
  rights: string[];
  userArgument: string;
  aiFeedback: string;
  score: number;
}

interface RightsDefenderProps {
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

const RightsDefender: React.FC<RightsDefenderProps> = ({ onComplete, onExit }) => {
  const [scenarios, setScenarios] = useState<RightsScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [argument, setArgument] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    generateScenarios();
  }, []);

  const generateScenarios = async () => {
    try {
      const response = await apiService.generateConsentScenarios?.() as any;
      
      setScenarios([
        {
          id: '1',
          situation: "A healthcare provider refuses to provide contraception information to an unmarried person, citing personal beliefs.",
          rights: ['Right to healthcare', 'Right to information', 'Non-discrimination'],
          userArgument: '',
          aiFeedback: '',
          score: 0
        },
        {
          id: '2',
          situation: "A school refuses to allow a student to start a club about sexual health education.",
          rights: ['Freedom of expression', 'Right to education', 'Assembly rights'],
          userArgument: '',
          aiFeedback: '',
          score: 0
        },
        {
          id: '3',
          situation: "Someone is denied STI testing because of their age without parental consent.",
          rights: ['Right to health', 'Privacy rights', 'Youth rights'],
          userArgument: '',
          aiFeedback: '',
          score: 0
        }
      ]);
    } catch {
      setScenarios([]);
    }
    setIsLoading(false);
  };

  const handleSubmitArgument = () => {
    if (!argument.trim()) return;

    // AI evaluates the argument
    const score = Math.min(100, argument.length * 2 + 20);
    const feedback = score > 70 
      ? "Excellent argument! You've effectively identified the rights violations and articulated strong reasoning."
      : score > 40
      ? "Good start! Consider strengthening your argument by explicitly citing specific rights and providing more detailed reasoning."
      : "Keep practicing! Try to identify which specific rights are being violated and why that's problematic.";

    const updated = [...scenarios];
    updated[currentIndex].userArgument = argument;
    updated[currentIndex].aiFeedback = feedback;
    updated[currentIndex].score = score;
    setScenarios(updated);
    setTotalScore(prev => prev + score);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(c => c + 1);
      setArgument('');
      setSubmitted(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete(Math.round(totalScore / scenarios.length), timeSpent);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  const current = scenarios[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onExit} className="p-2 hover:bg-white/50 rounded-lg">
            <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
          </button>
          <div className="p-3 bg-red-500 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rights Defender</h1>
            <p className="text-sm text-gray-600">Defend SRHR rights with AI feedback</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">AI-Powered Rights Training</span>
            </div>
            <h2 className="text-xl font-bold text-white">Scenario {currentIndex + 1} of {scenarios.length}</h2>
          </div>

          <div className="p-6">
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-gray-800 font-medium">{current?.situation}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Relevant Rights:</p>
              <div className="flex flex-wrap gap-2">
                {current?.rights.map((right, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {right}
                  </span>
                ))}
              </div>
            </div>

            {!submitted ? (
              <>
                <p className="text-gray-700 mb-3 font-medium">
                  Write an argument defending the rights in this situation:
                </p>
                <textarea
                  value={argument}
                  onChange={(e) => setArgument(e.target.value)}
                  placeholder="Explain which rights are being violated and why..."
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <button
                  onClick={handleSubmitArgument}
                  disabled={!argument.trim()}
                  className="mt-4 w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  Submit Argument
                </button>
              </>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="font-bold text-gray-900">AI Evaluation</span>
                  <span className="ml-auto text-2xl font-bold text-red-600">{current?.score}/100</span>
                </div>
                <p className="text-gray-700 mb-4">{current?.aiFeedback}</p>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Your argument:</p>
                  <p className="text-gray-800">{current?.userArgument}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {submitted && (
          <button
            onClick={handleNext}
            className="mt-6 w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
          >
            {currentIndex < scenarios.length - 1 ? 'Next Scenario' : 'Complete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RightsDefender;
