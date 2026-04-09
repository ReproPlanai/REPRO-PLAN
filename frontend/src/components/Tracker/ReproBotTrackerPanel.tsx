import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';

const REPROBOT_AVATAR_URL = 'https://static.vecteezy.com/system/resources/previews/035/186/557/large_2x/ai-generated-woman-lady-model-cheerful-happy-beauty-face-person-adult-smile-one-background-pretty-photo.jpg';
const USER_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars-neutral/png?seed=user&size=128';

interface ReproBotTrackerPanelProps {
  initialPrompt?: string | null;
  onPromptSent?: () => void;
  cycleContext: {
    nextPeriod?: string;
    ovulation?: string;
    fertileWindow?: { start: string; end: string };
    cycleLength: number;
    periodLength: number;
    lastPeriod?: string;
    recentSymptoms?: string[];
    avgCycleLength?: number;
    regularityScore?: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const QUICK_PROMPTS = [
  'Explain my cycle predictions',
  'Why might I feel tired?',
  'When am I most fertile?',
  'What do my symptoms mean?',
  'How can I manage cramps?'
];

const ReproBotTrackerPanel: React.FC<ReproBotTrackerPanelProps> = ({
  cycleContext,
  isExpanded,
  onToggle,
  initialPrompt,
  onPromptSent
}) => {
  const { isOnline } = useOffline();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && isExpanded) {
      sendMessage(initialPrompt);
      onPromptSent?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, isExpanded]);

  const buildContext = (): string => {
    const parts: string[] = [];
    if (cycleContext.nextPeriod) parts.push(`Next period predicted: ${cycleContext.nextPeriod}`);
    if (cycleContext.ovulation) parts.push(`Ovulation: ${cycleContext.ovulation}`);
    if (cycleContext.fertileWindow) parts.push(`Fertile window: ${cycleContext.fertileWindow.start} to ${cycleContext.fertileWindow.end}`);
    parts.push(`Cycle length: ${cycleContext.cycleLength} days`);
    parts.push(`Period length: ${cycleContext.periodLength} days`);
    if (cycleContext.lastPeriod) parts.push(`Last period: ${cycleContext.lastPeriod}`);
    if (cycleContext.recentSymptoms?.length) parts.push(`Recent symptoms: ${cycleContext.recentSymptoms.join(', ')}`);
    if (cycleContext.regularityScore !== undefined) parts.push(`Cycle regularity: ${cycleContext.regularityScore}%`);
    return parts.join('. ');
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const context = buildContext();
    const fullMessage = context
      ? `[Tracker context: ${context.trim()}]\n\nUser question: ${trimmed}`
      : trimmed;

    const userMsg = { role: 'user' as const, content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      let response = '';

      if (isOnline && apiUrl) {
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/reprobot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: fullMessage, history })
        });
        if (res.ok) {
          const data = await res.json();
          response = data.response || '';
        }
      }

      if (!response) {
        response = "I'm ReproBot, your SRHR assistant. I can help explain your cycle, symptoms, and reproductive health. For personalized answers, make sure you're connected to the internet. You can also ask me in the main Chat section.";
      }

      setMessages(prev => [...prev, { role: 'assistant' as const, content: response }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: "I'm having trouble connecting right now. Try again when you're online, or visit the main Chat for more help."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 hover:bg-gray-50/80 transition-colors text-left touch-manipulation"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={REPROBOT_AVATAR_URL}
              alt="ReproBot"
              className="w-11 h-11 rounded-2xl object-cover shadow-lg ring-2 ring-gray-100"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" title="Online" />
          </div>
          <div className="flex flex-col gap-0" style={{ marginTop: '-2px' }}>
            <span className="font-semibold text-gray-900 text-base leading-tight">Ask ReproBot</span>
            <span className="text-xs text-gray-500 leading-tight" style={{ marginTop: '-4px' }}>
              Get cycle insights and SRHR answers
            </span>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {isExpanded && (
        <div className="flex flex-col border-t border-gray-200/80">
          {/* Messages area - matches main chat */}
          <div className="flex-1 overflow-y-auto p-4 max-h-64 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="px-3 py-2 text-xs sm:text-sm bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200/50 transition-all shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="flex-shrink-0 w-10 h-10">
                    {msg.role === 'user' ? (
                      <img src={USER_AVATAR_URL} alt="You" className="w-10 h-10 rounded-full object-cover shadow-md" />
                    ) : (
                      <img src={REPROBOT_AVATAR_URL} alt="ReproBot" className="w-10 h-10 rounded-full object-cover shadow-md" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-3 py-2.5 shadow-lg backdrop-blur-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                        : 'bg-white/90 text-gray-900 border border-gray-200/50'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed break-words [&_p]:my-1 [&_ul]:my-2 [&_li]:my-0 [&_strong]:font-semibold">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <img src={REPROBOT_AVATAR_URL} alt="ReproBot" className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-md" />
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">ReproBot is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - matches main chat */}
          <form onSubmit={handleSubmit} className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about your cycle..."
                className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all active:scale-95"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReproBotTrackerPanel;
