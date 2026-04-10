import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  Shield,
  Clock,
  ArrowLeft,
  Settings,
  Heart,
  Brain,
  MessageCircle,
  Users,
  ChevronRight,
  Maximize2,
  Minimize2,
  Monitor,
  MonitorOff
} from 'lucide-react';

const REPROBOT_AVATAR_URL = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&crop=face';

interface TherapySession {
  id: string;
  topic: string;
  duration: number;
  startTime: number;
}

const THERAPY_TOPICS = [
  { 
    id: 'anxiety', 
    label: 'Anxiety Management', 
    icon: Heart, 
    color: 'from-rose-500 via-pink-500 to-red-500',
    description: 'Learn evidence-based techniques to manage anxiety, panic attacks, and stress. Cognitive behavioral approaches tailored to your needs.',
    duration: '30-45 min',
    category: 'Mental Health'
  },
  { 
    id: 'relationships', 
    label: 'Relationship Counseling', 
    icon: Users, 
    color: 'from-purple-500 via-violet-500 to-indigo-500',
    description: 'Navigate complex relationship dynamics, improve communication, and build healthier connections with partners, family, and friends.',
    duration: '45-60 min',
    category: 'Interpersonal'
  },
  { 
    id: 'self-esteem', 
    label: 'Self-Esteem Building', 
    icon: Sparkles, 
    color: 'from-amber-500 via-yellow-500 to-orange-500',
    description: 'Develop a stronger sense of self-worth, overcome negative self-talk, and build confidence through proven therapeutic techniques.',
    duration: '30-45 min',
    category: 'Personal Growth'
  },
  { 
    id: 'trauma', 
    label: 'Trauma Recovery', 
    icon: Shield, 
    color: 'from-emerald-500 via-green-500 to-teal-500',
    description: 'Safe, supportive space for processing traumatic experiences with trauma-informed approaches and healing techniques.',
    duration: '45-60 min',
    category: 'Healing'
  },
  { 
    id: 'communication', 
    label: 'Communication Skills', 
    icon: MessageCircle, 
    color: 'from-blue-500 via-cyan-500 to-sky-500',
    description: 'Enhance your ability to express yourself clearly, listen actively, and navigate difficult conversations with confidence.',
    duration: '30-45 min',
    category: 'Skills'
  },
  { 
    id: 'decision-making', 
    label: 'Life Decisions', 
    icon: Brain, 
    color: 'from-indigo-500 via-purple-500 to-pink-500',
    description: 'Get guidance on important life decisions, career choices, and personal dilemmas with structured decision-making frameworks.',
    duration: '30-45 min',
    category: 'Life Planning'
  },
  { 
    id: 'depression', 
    label: 'Depression Support', 
    icon: Heart, 
    color: 'from-slate-500 via-gray-500 to-zinc-500',
    description: 'Compassionate support for managing depression symptoms, building resilience, and finding hope through evidence-based approaches.',
    duration: '45-60 min',
    category: 'Mental Health'
  },
  { 
    id: 'stress-management', 
    label: 'Stress Management', 
    icon: Sparkles, 
    color: 'from-teal-500 via-cyan-500 to-blue-500',
    description: 'Practical techniques for managing daily stress, work-life balance, and building sustainable coping mechanisms.',
    duration: '30-45 min',
    category: 'Wellness'
  }
];

const AIVideoTherapy: React.FC = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = (topicId: string) => {
    setIsConnecting(true);
    // Simulate connection delay for realistic UX
    setTimeout(() => {
      const newSession: TherapySession = {
        id: Date.now().toString(),
        topic: topicId,
        duration: 0,
        startTime: Date.now()
      };
      setCurrentSession(newSession);
      setSessionActive(true);
      setSessionTime(0);
      setIsConnecting(false);
    }, 1500);
  };

  const endSession = () => {
    setSessionActive(false);
    setSessionTime(0);
    setCurrentSession(null);
  };

  if (sessionActive && currentSession) {
    const topic = THERAPY_TOPICS.find(t => t.id === currentSession.topic);
    return (
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen">
        {/* Premium Session Header */}
        <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={endSession}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-base sm:text-lg">{topic?.label}</h2>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(sessionTime)}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-xs text-white/50">{topic?.duration}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={endSession}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-500/20 border border-red-500/30"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Session</span>
          </button>
        </div>

        {/* Main Session Area */}
        <div className="flex flex-col min-h-[calc(100vh-72px)]">
          {/* Video Area */}
          <div className="flex-1 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
            
            {/* ReproBot Video */}
            <div className="flex-1 flex items-center justify-center relative p-4 sm:p-8">
              <div className="text-center relative z-10">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                  <img
                    src={REPROBOT_AVATAR_URL}
                    alt="ReproBot"
                    className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full object-cover shadow-2xl ring-4 ring-white/20 border-4 border-white/10"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>Online</span>
                  </div>
                </div>
                <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2 tracking-tight">ReproBot</h3>
                <p className="text-white/60 text-sm sm:text-base">AI Therapy Assistant</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 text-xs text-white/70">
                    {topic?.category}
                  </div>
                  <div className="px-3 py-1.5 bg-primary-500/20 backdrop-blur-sm rounded-lg border border-primary-500/30 text-xs text-primary-300">
                    {topic?.duration}
                  </div>
                </div>
              </div>

              {/* User Video (Premium Placeholder) */}
              <div className="absolute bottom-6 right-6 w-40 h-28 sm:w-48 sm:h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
                {isVideoEnabled ? (
                  <div className="text-center">
                    <Video className="w-8 h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-xs text-white/30">Camera On</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="w-8 h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-xs text-white/30">Camera Off</p>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Controls */}
            <div className="p-4 sm:p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent border-t border-white/10">
              <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className={`p-4 rounded-2xl transition-all ${isVideoEnabled ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`p-4 rounded-2xl transition-all ${isAudioEnabled ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}
                >
                  {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-4 rounded-2xl transition-all ${isScreenSharing ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}
                >
                  {isScreenSharing ? <Monitor className="w-6 h-6" /> : <MonitorOff className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all"
                >
                  {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                </button>
                <button className="p-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Premium Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-8 sm:p-12 shadow-2xl shadow-primary-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
        <div className="relative flex items-start gap-6">
          <div className="flex-shrink-0 p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <Video className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/25 backdrop-blur-sm rounded-full text-xs font-semibold text-white uppercase tracking-wider border border-white/20">AI-Powered Therapy</span>
              <Sparkles className="w-4 h-4 text-white/80" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">AI Video Therapy Sessions</h1>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl">
              Connect with ReproBot for confidential, AI-powered video therapy sessions. Get evidence-based support for anxiety, relationships, self-esteem, trauma, and more in a safe, judgment-free space.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Evidence-Based</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white/80 border border-gray-200/60 text-gray-600 hover:border-primary-300'}`}
        >
          All Topics
        </button>
        {['Mental Health', 'Interpersonal', 'Personal Growth', 'Healing', 'Skills', 'Life Planning', 'Wellness'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === category ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white/80 border border-gray-200/60 text-gray-600 hover:border-primary-300'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Premium Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {THERAPY_TOPICS.filter(topic => selectedCategory === 'all' || topic.category === selectedCategory).map((topic) => {
          const Icon = topic.icon;
          return (
            <button
              key={topic.id}
              onClick={() => startSession(topic.id)}
              disabled={isConnecting}
              className="group bg-white rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-2xl transition-all transform hover:-translate-y-2 p-6 text-left relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${topic.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{topic.category}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors">{topic.label}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{topic.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topic.duration}
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${topic.color} group-hover:scale-110 transition-transform`}>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Premium Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            icon: Shield, 
            title: 'End-to-End Encryption', 
            desc: 'Military-grade encryption ensures your therapy sessions remain completely private and secure.',
            color: 'from-green-500 to-emerald-500'
          },
          { 
            icon: Clock, 
            title: 'Available 24/7', 
            desc: 'Access professional AI therapy support anytime, anywhere. No appointments needed.',
            color: 'from-blue-500 to-cyan-500'
          },
          { 
            icon: Sparkles, 
            title: 'Evidence-Based Approaches', 
            desc: 'Our AI is trained on proven therapeutic techniques including CBT, DBT, and mindfulness.',
            color: 'from-purple-500 to-pink-500'
          },
          { 
            icon: Users, 
            title: 'Culturally Sensitive', 
            desc: 'Understanding of Ghanaian culture and context for more relevant and effective therapy.',
            color: 'from-amber-500 to-orange-500'
          },
          { 
            icon: Brain, 
            title: 'Personalized Care', 
            desc: 'AI adapts to your unique needs, learning from each session to provide better support.',
            color: 'from-rose-500 to-red-500'
          },
          { 
            icon: Heart, 
            title: 'Free & Accessible', 
            desc: 'Quality mental health support without financial barriers. Always free for everyone.',
            color: 'from-teal-500 to-cyan-500'
          }
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 hover:shadow-lg transition-all group">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Premium Safety Notice */}
      <div className="rounded-3xl bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border border-red-200/60 p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex-shrink-0 shadow-lg">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-900 text-lg sm:text-xl mb-4">Your Safety & Well-Being Matter</h4>
            <ul className="text-red-800 text-sm sm:text-base space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-relaxed">If you're in immediate danger or experiencing a crisis, call emergency services immediately (<span className="font-semibold">191 in Ghana</span>)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-relaxed">AI therapy provides valuable support but is not a replacement for professional mental health care or emergency services</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-relaxed">All sessions are encrypted and confidential. Your data is protected under strict privacy protocols</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-relaxed">For severe mental health concerns, we recommend consulting with licensed mental health professionals</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVideoTherapy;
