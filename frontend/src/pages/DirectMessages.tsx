import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  User,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';
import { apiService } from '../services/api';

interface Message {
  id: string;
  fromRole: string;
  fromStakeholderId?: string;
  toRole: string;
  toStakeholderId?: string;
  messageType: string;
  subject: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  relatedCaseId?: string;
  relatedAlertId?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

const DirectMessages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = localStorage.getItem('userRole') || 'USER';
  const stakeholderId = localStorage.getItem('stakeholderId');

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getConversations?.({
        stakeholderId: stakeholderId || undefined
      });
      if (response?.success) {
        setConversations(response.conversations);
      }
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await apiService.getMessages?.({
        toStakeholderId: conversationId,
        isRead: undefined
      });
      if (response?.success) {
        setMessages(response.messages);
      }
    } catch (err) {
      setError('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await apiService.createMessage?.({
        fromRole: userRole,
        fromStakeholderId: stakeholderId || undefined,
        toRole: 'STAKEHOLDER',
        toStakeholderId: selectedConversation,
        messageType: 'direct',
        subject: 'Direct Message',
        content: newMessage,
        priority: 'medium'
      });

      if (response?.success) {
        setMessages([...messages, response.message]);
        setNewMessage('');
      }
    } catch (err) {
      setError('Failed to send message');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markAsRead = async (messageId: string) => {
    try {
      await apiService.markMessageRead?.(messageId);
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    } catch (err) {
      console.error('Failed to mark message as read');
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Direct Messages</h1>
                <p className="text-sm text-gray-500">Communicate securely with your team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 flex justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                          selectedConversation === conv.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : ''
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          {conv.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">{conv.name}</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(conv.lastMessageTime).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400 capitalize">{conv.role}</span>
                            {conv.unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation && selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedConv.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{selectedConv.role}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.fromStakeholderId === stakeholderId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-md px-4 py-2 rounded-lg ${
                                isMe
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isMe ? 'text-indigo-200' : 'text-gray-500'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {new Date(msg.createdAt).toLocaleTimeString()}
                                {isMe && (
                                  msg.isRead ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
