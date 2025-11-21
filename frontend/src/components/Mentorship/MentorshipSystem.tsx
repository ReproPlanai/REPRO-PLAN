import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  MessageCircle, 
  Shield, 
  Send,
  XCircle,
  UserPlus
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';

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

  // Sample mentors data
  const sampleMentors: Mentor[] = useMemo(() => [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      experience: '5 years in SRHR counseling',
      specialties: ['Contraception', 'STI Prevention', 'Relationships'],
      rating: 4.9,
      reviews: 127,
      available: true,
      languages: ['English', 'Kpelle'],
      bio: 'Passionate about empowering young people with accurate SRHR information. Trained counselor with experience in youth-friendly services.',
      isOnline: true,
      responseTime: 'Usually responds within 2 hours'
    },
    {
      id: '2',
      name: 'Michael Brown',
      age: 32,
      experience: '7 years in healthcare',
      specialties: ['Men\'s Health', 'Mental Health', 'Peer Support'],
      rating: 4.8,
      reviews: 89,
      available: true,
      languages: ['English', 'Bassa'],
      bio: 'Healthcare professional dedicated to supporting young men with their health and wellness journey.',
      isOnline: false,
      responseTime: 'Usually responds within 4 hours'
    },
    {
      id: '3',
      name: 'Aisha Kamara',
      age: 25,
      experience: '3 years in youth advocacy',
      specialties: ['Gender Rights', 'Consent Education', 'Crisis Support'],
      rating: 4.9,
      reviews: 156,
      available: true,
      languages: ['English', 'Kru', 'Vai'],
      bio: 'Youth advocate and trained peer counselor specializing in gender-based violence prevention and support.',
      isOnline: true,
      responseTime: 'Usually responds within 1 hour'
    },
    {
      id: '4',
      name: 'David Wilson',
      age: 30,
      experience: '6 years in community health',
      specialties: ['HIV/AIDS', 'Testing', 'Treatment Support'],
      rating: 4.7,
      reviews: 98,
      available: false,
      languages: ['English'],
      bio: 'Community health worker with extensive experience in HIV prevention and support services.',
      isOnline: false,
      responseTime: 'Usually responds within 6 hours'
    }
  ], []);

  const loadMentorshipData = useCallback(async () => {
    try {
      const [mentorsData, requestsData, messagesData] = await Promise.all([
        offlineStorage.getData('mentors'),
        offlineStorage.getData('mentorship_requests'),
        offlineStorage.getData('chat_messages')
      ]);
      
      setMentors(mentorsData || sampleMentors);
      setMentorshipRequests(requestsData || []);
      setChatMessages(messagesData || []);
    } catch (error) {
      console.error('Failed to load mentorship data:', error);
      setMentors(sampleMentors);
    }
  }, [sampleMentors]);

  const saveMentorshipData = async () => {
    try {
      await Promise.all([
        offlineStorage.storeData('mentors', mentors),
        offlineStorage.storeData('mentorship_requests', mentorshipRequests),
        offlineStorage.storeData('chat_messages', chatMessages)
      ]);
    } catch (error) {
      console.error('Failed to save mentorship data:', error);
    }
  };

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
    saveMentorshipData();
    
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
    saveMentorshipData();
    setNewMessage('');
  };


  const getMentorMessages = (mentorId: string) => {
    return chatMessages.filter(msg => 
      (msg.senderId === 'current_user' && msg.receiverId === mentorId) ||
      (msg.receiverId === 'current_user' && msg.senderId === mentorId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700'
    ];
    return colors[specialty.length % colors.length];
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (showChat && selectedMentor) {
    const messages = getMentorMessages(selectedMentor.id);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMentor.name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${selectedMentor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-500">
                      {selectedMentor.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'current_user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === 'current_user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages yet</p>
                <p className="text-gray-400 text-sm">Start a conversation with {selectedMentor.name}</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 input-field"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Peer Mentorship</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Connect with trained mentors for guidance and support
          </p>
        </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">{mentor.experience}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{mentor.bio}</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties:</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs ${getSpecialtyColor(specialty)}`}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Languages:</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.languages.map((language, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${mentor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {mentor.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <span className="text-xs text-gray-500">{mentor.responseTime}</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedMentor(mentor);
                  setShowRequestForm(true);
                }}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <UserPlus size={16} />
                <span>Request</span>
              </button>
              <button
                onClick={() => {
                  setSelectedMentor(mentor);
                  setShowChat(true);
                }}
                className="flex-1 btn-outline flex items-center justify-center space-x-2"
              >
                <MessageCircle size={16} />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Form Modal */}
      {showRequestForm && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Request Mentorship
                </h3>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Requesting mentorship from <strong>{selectedMentor.name}</strong>
                </p>
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
                    className="input-field"
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
                    className="input-field"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestMentorship}
                    disabled={!requestForm.topic || !requestForm.message}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Safe Mentorship</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• All mentors are trained and verified</li>
              <li>• Conversations are anonymous and confidential</li>
              <li>• Report any inappropriate behavior immediately</li>
              <li>• Mentors provide guidance, not medical advice</li>
              <li>• For emergencies, use the emergency features</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MentorshipSystem;
