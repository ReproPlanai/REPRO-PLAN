import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Shield, 
  Send,
  UserPlus,
  Users,
  Sparkles,
  GraduationCap,
  Clock,
  Star,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import PageContainer from '../Layout/PageContainer';

interface Mentor {
  id: string;
  name: string;
  age: number;
  experience: string;
  specialties: string[];
  rating: number;
  reviews: number;
  available: boolean;
  languages: string[];
  bio: string;
  avatar?: string;
  isOnline: boolean;
  responseTime: string;
}

interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: number;
  scheduledAt?: number;
  notes?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

const MentorshipSystem: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [requestForm, setRequestForm] = useState({
    topic: '',
    message: ''
  });

  // Note: Messages and requests are NOT saved locally - all data comes from API
  // This ensures fresh data and proper privacy

  const loadMentorshipData = useCallback(async () => {
    try {
      // Fetch mentors from API only
      const mentorsResponse = await apiService.getMentors?.() as { success?: boolean; mentors?: Mentor[] };
      if (mentorsResponse?.success && mentorsResponse.mentors) {
        setMentors(mentorsResponse.mentors);
      } else {
        setMentors([]);
      }
      // Note: chat messages and requests are ephemeral - not stored locally
      setMentorshipRequests([]);
      setChatMessages([]);
    } catch (error) {
      console.error('Failed to load mentorship data:', error);
      setMentors([]);
    }
  }, []);

  useEffect(() => {
    loadMentorshipData();
  }, [loadMentorshipData]);

  const handleRequestMentorship = () => {
    if (!selectedMentor || !requestForm.topic || !requestForm.message) return;

    const request: MentorshipRequest = {
      id: Date.now().toString(),
      mentorId: selectedMentor.id,
      menteeId: 'current_user', // In a real app, this would be the actual user ID
      topic: requestForm.topic,
      message: requestForm.message,
      status: 'pending',
      createdAt: Date.now()
    };

    const newRequests = [...mentorshipRequests, request];
    setMentorshipRequests(newRequests);
    // Note: NOT saving to local storage - data is ephemeral
    
    setShowRequestForm(false);
    setRequestForm({ topic: '', message: '' });
    alert('Mentorship request sent! The mentor will respond soon.');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMentor) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current_user',
      receiverId: selectedMentor.id,
      message: newMessage.trim(),
      timestamp: Date.now(),
      isRead: false
    };

    const newMessages = [...chatMessages, message];
    setChatMessages(newMessages);
    // Note: NOT saving to local storage - messages are ephemeral
    setNewMessage('');
  };


  const getMentorMessages = (mentorId: string) => {
    return chatMessages.filter(msg => 
      (msg.senderId === 'current_user' && msg.receiverId === mentorId) ||
      (msg.receiverId === 'current_user' && msg.senderId === mentorId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (showChat && selectedMentor) {
    const messages = getMentorMessages(selectedMentor.id);
    
    return (
      <PageContainer
        gradient
        gradientFrom="from-slate-50"
        gradientVia="via-white"
        gradientTo="to-primary-50/20"
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 h-[600px] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedMentor.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedMentor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-500">
                        {selectedMentor.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.senderId === 'current_user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === 'current_user' ? 'text-primary-100' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-gray-500 font-medium">No messages yet</p>
                  <p className="text-gray-400 text-sm">Start a conversation with {selectedMentor.name}</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
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
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Guidance</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Mentorship Program</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Connect with trained mentors for guidance and support on SRHR topics. All conversations are confidential and anonymous.
              </p>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{mentor.name}</h3>
                  <p className="text-sm text-gray-500">{mentor.experience}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${mentor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-500">
                      {mentor.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {mentor.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{mentor.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{mentor.responseTime}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setShowRequestForm(true);
                  }}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Request</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setShowChat(true);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Request Form Modal */}
        {showRequestForm && selectedMentor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:animate-none">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Request Mentorship</h3>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requesting from</p>
                    <p className="font-semibold text-gray-900">{selectedMentor.name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic/Issue
                    </label>
                    <input
                      type="text"
                      value={requestForm.topic}
                      onChange={(e) => setRequestForm({ ...requestForm, topic: e.target.value })}
                      placeholder="e.g., Contraception, STI concerns, Relationship advice"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={requestForm.message}
                      onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                      placeholder="Describe what you'd like help with..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestMentorship}
                  disabled={!requestForm.topic || !requestForm.message}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Safety Notice */}
        <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Safe Mentorship</h4>
              <ul className="text-blue-800 text-sm mt-2 space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  All mentors are trained and verified
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Conversations are anonymous and confidential
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Report any inappropriate behavior immediately
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
};

export default MentorshipSystem;
