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
  Smile,
  MessageCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import PageContainer from '../components/Layout/PageContainer';

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
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-indigo-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-200/60 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Direct Messages</h1>
              <p className="text-xs sm:text-sm text-gray-500">Communicate securely with your team</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-72 sm:w-80 border-r border-gray-200/60 flex flex-col">
              <div className="p-4 border-b border-gray-200/60">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <div className="divide-y divide-gray-100">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setSelectedConversation(conv.id);
                          messages.filter(m => !m.isRead && m.toStakeholderId === stakeholderId).forEach(m => markAsRead(m.id));
                        }}
                        className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                          selectedConversation === conv.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : ''
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          {conv.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate text-sm">{conv.name}</h3>
                            <span className="text-xs text-gray-400">
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
                  <div className="p-4 border-b border-gray-200/60 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{selectedConv.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{selectedConv.role}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
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
                              className={`max-w-md px-4 py-2.5 rounded-2xl ${
                                isMe
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isMe ? 'text-indigo-200' : 'text-gray-400'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <div className="p-4 border-t border-gray-200/60 bg-white">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50/50">
                  <div className="text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-300" />
                    </div>
                    <p className="text-sm font-medium">Select a conversation</p>
                    <p className="text-xs text-gray-400">Start messaging with your team</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
};

export default DirectMessages;
