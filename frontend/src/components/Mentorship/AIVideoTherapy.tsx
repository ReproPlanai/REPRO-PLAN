import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageCircle, 
  Sparkles, 
  GraduationCap,
  Shield,
  Clock,
  ArrowLeft,
  Play,
  Settings,
  Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const REPROBOT_AVATAR_URL = 'https://static.vecteezy.com/system/resources/previews/035/186/557/large_2x/ai-generated-woman-lady-model-cheerful-happy-beauty-face-person-adult-smile-one-background-pretty-photo.jpg';

interface TherapySession {
  id: string;
  topic: string;
  duration: number;
  startTime: number;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: number }[];
}

const THERAPY_TOPICS = [
  { id: 'anxiety', label: 'Anxiety & Stress', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'relationships', label: 'Relationship Issues', icon: Heart, color: 'from-purple-500 to-pink-500' },
  { id: 'self-esteem', label: 'Self-Esteem', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
  { id: 'trauma', label: 'Trauma Support', icon: Shield, color: 'from-amber-500 to-orange-500' },
  { id: 'communication', label: 'Communication Skills', icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
  { id: 'decision-making', label: 'Decision Making', icon: GraduationCap, color: 'from-indigo-500 to-purple-500' }
];

const AIVideoTherapy: React.FC = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [message, setMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = (topicId: string) => {
    setSelectedTopic(topicId);
    const newSession: TherapySession = {
      id: Date.now().toString(),
      topic: topicId,
      duration: 0,
      startTime: Date.now(),
      messages: []
    };
    setCurrentSession(newSession);
    setSessionActive(true);
    setSessionTime(0);

    // Send initial AI greeting
    setTimeout(() => {
      const topic = THERAPY_TOPICS.find(t => t.id === topicId);
      const greeting = `Hello! I'm ReproBot, your AI therapy assistant. I'm here to help you with ${topic?.label || 'your concerns'}. This is a safe, confidential space where we can talk about what's on your mind. How are you feeling today?`;
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: greeting, timestamp: Date.now() }]
      } : null);
    }, 1000);
  };

  const endSession = () => {
    setSessionActive(false);
    setSelectedTopic(null);
    setSessionTime(0);
    setCurrentSession(null);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message
    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, { role: 'user', content: userMessage, timestamp: Date.now() }]
    } : null);

    // Simulate AI response
    setIsThinking(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl) {
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/reprobot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: `[Therapy context: Topic: ${currentSession.topic}, Session time: ${formatTime(sessionTime)}]\n\nUser: ${userMessage}`,
            history: currentSession.messages.map(m => ({ role: m.role, content: m.content }))
          })
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, { role: 'assistant', content: data.response || '', timestamp: Date.now() }]
          } : null);
        }
      }
    } catch (error) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: 'I understand. This is a safe space for you to share. Can you tell me more about how that makes you feel?', timestamp: Date.now() }]
      } : null);
    } finally {
      setIsThinking(false);
    }
  };

  if (sessionActive && currentSession) {
    const topic = THERAPY_TOPICS.find(t => t.id === currentSession.topic);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Session Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={endSession}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{topic?.label}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(sessionTime)}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={endSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Session</span>
          </button>
        </div>

        {/* Main Session Area */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Video Area */}
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
            {/* ReproBot Video */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="text-center">
                <img
                  src={REPROBOT_AVATAR_URL}
                  alt="ReproBot"
                  className="w-48 h-48 rounded-full object-cover mx-auto mb-6 shadow-2xl ring-4 ring-primary-500/50"
                />
                <h3 className="text-white text-2xl font-bold mb-2">ReproBot</h3>
                <p className="text-gray-400">AI Therapy Assistant</p>
                {isThinking && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>

              {/* User Video (Placeholder) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-2xl flex items-center justify-center border-2 border-gray-600">
                {isVideoEnabled ? (
                  <Video className="w-8 h-8 text-gray-400" />
                ) : (
                  <VideoOff className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-800 flex items-center justify-center gap-4">
              <button
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`p-4 rounded-full ${isVideoEnabled ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'} hover:opacity-80 transition-opacity`}
              >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-4 rounded-full ${isAudioEnabled ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'} hover:opacity-80 transition-opacity`}
              >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button className="p-4 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-full sm:w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-600" />
                Session Chat
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentSession.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isThinking}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isThinking}
                  className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-2xl shadow-primary-500/20 mb-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">AI-Powered</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">AI Video Therapy</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Connect with ReproBot for confidential, AI-powered video therapy sessions. Get support for anxiety, relationships, self-esteem, and more in a safe space.
              </p>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {THERAPY_TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.id}
                onClick={() => startSession(topic.id)}
                className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${topic.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{topic.label}</h3>
                <p className="text-sm text-gray-600">
                  Confidential AI-powered support tailored to your needs
                </p>
              </button>
            );
          })}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Shield, title: '100% Confidential', desc: 'Your conversations are private and secure' },
            { icon: Clock, title: 'Available 24/7', desc: 'Get support whenever you need it' },
            { icon: Sparkles, title: 'AI-Powered', desc: 'Advanced AI for personalized therapy' }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Safety Notice */}
        <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 text-lg mb-2">Your Safety Matters</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>If you're in immediate danger, call emergency services (191 in Ghana)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>AI therapy is supportive but not a replacement for professional mental health care</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>All sessions are confidential and your data is protected</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVideoTherapy;
