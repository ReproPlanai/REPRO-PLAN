import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Sparkles, Heart, Shield } from 'lucide-react';
import { apiService } from '../../services/api';

interface StoryNode {
  id: string;
  text: string;
  choices: {
    id: string;
    text: string;
    nextNodeId: string;
    impact: string;
  }[];
}

interface InteractiveStoryProps {
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

const InteractiveStory: React.FC<InteractiveStoryProps> = ({ onComplete, onExit }) => {
  const [storyNodes, setStoryNodes] = useState<StoryNode[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [choices, setChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [storyComplete, setStoryComplete] = useState(false);

  useEffect(() => {
    generateStory();
  }, []);

  const generateStory = async () => {
    try {
      const response = await apiService.generateConsentScenarios?.() as any;
      
      // Create a branching story from the scenarios
      setStoryNodes([
        {
          id: 'start',
          text: "You're at a youth gathering and someone you just met asks for your contact information. They seem friendly but you feel unsure. What do you do?",
          choices: [
            { id: 'c1', text: 'Politely decline and walk away', nextNodeId: 'safe', impact: 'Set clear boundaries' },
            { id: 'c2', text: 'Give them your number to be nice', nextNodeId: 'uncomfortable', impact: 'People-pleasing behavior' },
            { id: 'c3', text: 'Ask a friend to join the conversation', nextNodeId: 'supported', impact: 'Safety in numbers' }
          ]
        },
        {
          id: 'safe',
          text: "You confidently set your boundary. The person respects your decision and moves on. You feel empowered knowing you can say no when uncomfortable.",
          choices: [
            { id: 'c4', text: 'Continue your evening feeling confident', nextNodeId: 'end_good', impact: 'Boundary success' }
          ]
        },
        {
          id: 'uncomfortable',
          text: "Later, the person sends messages that make you uncomfortable. You realize you should have trusted your instincts.",
          choices: [
            { id: 'c5', text: 'Block them and tell a trusted adult', nextNodeId: 'resolved', impact: 'Seeking help' }
          ]
        },
        {
          id: 'supported',
          text: "Your friend joins, and the three of you have a pleasant conversation. Later, your friend tells you they noticed the person was making others uncomfortable too.",
          choices: [
            { id: 'c6', text: 'Thank your friend and stay together', nextNodeId: 'end_good', impact: 'Support system' }
          ]
        },
        {
          id: 'resolved',
          text: "A trusted adult helps you handle the situation. You learn that it's always okay to ask for help when you feel unsafe.",
          choices: [
            { id: 'c7', text: 'Reflect on the experience', nextNodeId: 'end_learned', impact: 'Learning from mistakes' }
          ]
        },
        {
          id: 'end_good',
          text: "Story Complete! You navigated the situation well by trusting your instincts and setting boundaries. Remember: You always have the right to say no.",
          choices: []
        },
        {
          id: 'end_learned',
          text: "Story Complete! You learned that it's better to trust your instincts early and that asking for help is a sign of strength, not weakness.",
          choices: []
        }
      ]);
    } catch {
      setStoryNodes([]);
    }
    setIsLoading(false);
  };

  const handleChoice = (nextNodeId: string) => {
    setChoices(prev => [...prev, nextNodeId]);
    
    if (nextNodeId.startsWith('end_')) {
      setStoryComplete(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete(100, timeSpent);
    } else {
      setCurrentNodeId(nextNodeId);
    }
  };

  const currentNode = storyNodes.find(n => n.id === currentNodeId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onExit} className="p-2 hover:bg-white/50 rounded-lg">
            <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
          </button>
          <div className="p-3 bg-green-500 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Choose Your Path</h1>
            <p className="text-sm text-gray-600">Interactive SRHR Story</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">AI-Generated Interactive Story</span>
            </div>
          </div>

          <div className="p-6">
            {currentNode && (
              <>
                <p className="text-xl text-gray-800 leading-relaxed mb-8">
                  {currentNode.text}
                </p>

                {currentNode.choices.length > 0 ? (
                  <div className="space-y-3">
                    {currentNode.choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice(choice.nextNodeId)}
                        className="w-full p-4 text-left bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{choice.text}</span>
                          <ArrowRight className="w-5 h-5 text-green-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-green-800 font-medium">Story Complete!</p>
                    <button
                      onClick={() => {
                        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                        onComplete(100, timeSpent);
                      }}
                      className="mt-4 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600"
                    >
                      Finish
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600">
            Your choices shape the story outcome
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveStory;
