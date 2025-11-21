import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Shield
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'emergency';
  isRead: boolean;
  isEncrypted: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'emergency' | 'general' | 'case' | 'group';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
}

interface RealTimeChatProps {
  userRole: string;
  userId: string;
  userName: string;
  onEmergencyCall: (participantId: string) => void;
  onVideoCall: (participantId: string) => void;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({
  userRole,
  userId,
  userName,
  onEmergencyCall,
  onVideoCall
}) => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate chat rooms based on user role
  useEffect(() => {
    const roleBasedRooms: ChatRoom[] = [
      {
        id: 'emergency-1',
        name: 'Emergency Response',
        type: 'emergency',
        participants: ['police', 'medical', 'safehouse'],
        unreadCount: 3,
        isActive: true
      },
      {
        id: 'general-1',
        name: 'General Communication',
        type: 'general',
        participants: ['admin', 'police', 'medical', 'safehouse', 'ngo'],
        unreadCount: 1,
        isActive: true
      }
    ];

    if (userRole === 'POLICE') {
      roleBasedRooms.push({
        id: 'police-1',
        name: 'Police Operations',
        type: 'group',
        participants: ['police'],
        unreadCount: 0,
        isActive: true
      });
    }

    setChatRooms(roleBasedRooms);
  }, [userRole]);

  // Simulate messages
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: '1',
        senderId: 'police-1',
        senderName: 'Officer Johnson',
        senderRole: 'POLICE',
        content: 'Emergency reported in Monrovia. Need medical assistance.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'emergency',
        isRead: true,
        isEncrypted: true,
        priority: 'critical'
      },
      {
        id: '2',
        senderId: 'medical-1',
        senderName: 'Dr. Smith',
        senderRole: 'MEDICAL',
        content: 'Medical team dispatched. ETA 5 minutes.',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        type: 'text',
        isRead: true,
        isEncrypted: true,
        priority: 'high'
      },
      {
        id: '3',
        senderId: 'safehouse-1',
        senderName: 'Safe House Manager',
        senderRole: 'SAFEHOUSE',
        content: 'Safe house ready to receive if needed.',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        type: 'text',
        isRead: false,
        isEncrypted: true,
        priority: 'medium'
      }
    ];

    setMessages(sampleMessages);
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !activeRoom) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false,
      isEncrypted: true,
      priority: 'medium'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      content: `📎 ${file.name}`,
      timestamp: new Date().toISOString(),
      type: 'file',
      isRead: false,
      isEncrypted: true,
      priority: 'medium'
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const startVideoCall = (participantId: string) => {
    onVideoCall(participantId);
    // In real implementation, this would start a video call
    alert(`Starting video call with ${participantId}`);
  };

  const startEmergencyCall = (participantId: string) => {
    onEmergencyCall(participantId);
    // In real implementation, this would start an emergency call
    alert(`Emergency call to ${participantId}`);
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-red-200 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-200 text-green-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'POLICE': return 'text-blue-600';
      case 'MEDICAL': return 'text-purple-600';
      case 'SAFEHOUSE': return 'text-green-600';
      case 'NGO': return 'text-orange-600';
      case 'ADMIN': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-96 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Chat Rooms Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Chat Rooms</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                activeRoom === room.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{room.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{room.type}</div>
                </div>
                {room.unreadCount > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {room.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {chatRooms.find(r => r.id === activeRoom)?.name}
                </h4>
                <div className="text-sm text-gray-500">
                  {chatRooms.find(r => r.id === activeRoom)?.participants.length} participants
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => startVideoCall('group')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Start Video Call"
                >
                  <Video size={18} />
                </button>
                <button
                  onClick={() => startEmergencyCall('emergency')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Emergency Call"
                >
                  <Phone size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === userId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.type === 'emergency' && (
                      <div className="flex items-center space-x-1 mb-1">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="text-xs font-medium text-red-600">EMERGENCY</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-medium ${getRoleColor(msg.senderRole)}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-xs opacity-75">{formatTime(msg.timestamp)}</span>
                    </div>
                    
                    <div className="text-sm">{msg.content}</div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-1">
                        {msg.isEncrypted && <Shield size={12} className="opacity-75" />}
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(msg.priority)}`}>
                          {msg.priority}
                        </span>
                      </div>
                      {msg.senderId === userId && (
                        <div className="flex items-center space-x-1">
                          {msg.isRead ? (
                            <CheckCircle size={12} className="text-blue-300" />
                          ) : (
                            <Clock size={12} className="text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Paperclip size={18} />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setIsTyping(true);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {isTyping && (
                    <div className="absolute right-2 top-2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={24} />
              </div>
              <p>Select a chat room to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChat;
