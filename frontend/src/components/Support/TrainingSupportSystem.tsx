import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Star, 
  Users, 
  MessageCircle, 
  Search, 
  Filter, 
  Download, 
  Share, 
  Bookmark, 
  HelpCircle, 
  Video, 
  FileText, 
  Image, 
  Headphones, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Target, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Settings,
  X,
  Eye
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'interactive' | 'document' | 'quiz';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isCompleted: boolean;
  progress: number;
  rating: number;
  thumbnail?: string;
  tags: string[];
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responseTime?: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: string;
  author: string;
}

interface TrainingSupportSystemProps {
  userRole: string;
  onModuleCompleted: (module: TrainingModule) => void;
  onTicketCreated: (ticket: SupportTicket) => void;
  onArticleViewed: (article: KnowledgeArticle) => void;
}

const TrainingSupportSystem: React.FC<TrainingSupportSystemProps> = ({
  userRole,
  onModuleCompleted,
  onTicketCreated,
  onArticleViewed
}) => {
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [activeTab, setActiveTab] = useState<'training' | 'support' | 'knowledge'>('training');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [moduleProgress, setModuleProgress] = useState(0);

  // Initialize training modules
  useEffect(() => {
    const modules: TrainingModule[] = [
      {
        id: '1',
        title: 'Emergency Response Basics',
        description: 'Learn the fundamentals of emergency response and crisis management',
        type: 'video',
        duration: 45,
        difficulty: 'beginner',
        category: 'Emergency Response',
        isCompleted: false,
        progress: 0,
        rating: 4.8,
        tags: ['emergency', 'response', 'basics', 'crisis']
      },
      {
        id: '2',
        title: 'Data Security & Privacy',
        description: 'Understand data protection, encryption, and privacy regulations',
        type: 'interactive',
        duration: 30,
        difficulty: 'intermediate',
        category: 'Security',
        isCompleted: true,
        progress: 100,
        rating: 4.9,
        tags: ['security', 'privacy', 'encryption', 'compliance']
      },
      {
        id: '3',
        title: 'System Navigation',
        description: 'Master the Safe Link platform interface and features',
        type: 'video',
        duration: 20,
        difficulty: 'beginner',
        category: 'Platform Training',
        isCompleted: false,
        progress: 35,
        rating: 4.6,
        tags: ['navigation', 'interface', 'platform', 'tutorial']
      },
      {
        id: '4',
        title: 'Advanced Analytics',
        description: 'Learn to interpret data visualizations and predictive insights',
        type: 'interactive',
        duration: 60,
        difficulty: 'advanced',
        category: 'Analytics',
        isCompleted: false,
        progress: 0,
        rating: 4.7,
        tags: ['analytics', 'data', 'visualization', 'insights']
      }
    ];

    setTrainingModules(modules);
  }, []);

  // Initialize support tickets
  useEffect(() => {
    const tickets: SupportTicket[] = [
      {
        id: '1',
        title: 'Login Issues',
        description: 'Unable to access dashboard after password reset',
        status: 'resolved',
        priority: 'high',
        category: 'Technical',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        assignedTo: 'Support Team',
        responseTime: 15
      },
      {
        id: '2',
        title: 'Feature Request',
        description: 'Request for additional reporting features',
        status: 'in_progress',
        priority: 'medium',
        category: 'Feature Request',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        assignedTo: 'Product Team'
      },
      {
        id: '3',
        title: 'Training Materials',
        description: 'Need access to advanced training modules',
        status: 'open',
        priority: 'low',
        category: 'Training',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];

    setSupportTickets(tickets);
  }, []);

  // Initialize knowledge articles
  useEffect(() => {
    const articles: KnowledgeArticle[] = [
      {
        id: '1',
        title: 'How to Create Emergency Alerts',
        content: 'Step-by-step guide to creating and managing emergency alerts...',
        category: 'Emergency Response',
        tags: ['alerts', 'emergency', 'tutorial'],
        views: 1247,
        helpful: 89,
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        author: 'Support Team'
      },
      {
        id: '2',
        title: 'Data Security Best Practices',
        content: 'Comprehensive guide to maintaining data security and privacy...',
        category: 'Security',
        tags: ['security', 'privacy', 'best-practices'],
        views: 892,
        helpful: 67,
        lastUpdated: new Date(Date.now() - 172800000).toISOString(),
        author: 'Security Team'
      },
      {
        id: '3',
        title: 'Troubleshooting Common Issues',
        content: 'Solutions to frequently encountered problems...',
        category: 'Troubleshooting',
        tags: ['troubleshooting', 'issues', 'solutions'],
        views: 1563,
        helpful: 124,
        lastUpdated: new Date(Date.now() - 259200000).toISOString(),
        author: 'Technical Team'
      }
    ];

    setKnowledgeArticles(articles);
  }, []);

  const startModule = (moduleId: string) => {
    setCurrentModule(moduleId);
    setModuleProgress(0);
  };

  const completeModule = (moduleId: string) => {
    setTrainingModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isCompleted: true, progress: 100 }
        : module
    ));
    
    const completedModule = trainingModules.find(m => m.id === moduleId);
    if (completedModule) {
      onModuleCompleted(completedModule);
    }
    
    setCurrentModule(null);
    setModuleProgress(0);
  };

  const createSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    onTicketCreated(newTicket);
    setIsCreatingTicket(false);
  };

  const getDifficultyColor = (difficulty: TrainingModule['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: TrainingModule['type']) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'interactive': return <Zap className="w-5 h-5 text-blue-500" />;
      case 'document': return <FileText className="w-5 h-5 text-green-500" />;
      case 'quiz': return <Target className="w-5 h-5 text-purple-500" />;
      default: return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Training & Support</h2>
            <p className="text-gray-600">Learn, get help, and access resources</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'training', label: 'Training', icon: BookOpen },
            { id: 'support', label: 'Support', icon: MessageCircle },
            { id: 'knowledge', label: 'Knowledge Base', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Training Tab */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search training modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Emergency Response">Emergency Response</option>
                  <option value="Security">Security</option>
                  <option value="Platform Training">Platform Training</option>
                  <option value="Analytics">Analytics</option>
                </select>
              </div>

              {/* Training Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingModules
                  .filter(module => 
                    (selectedCategory === 'all' || module.category === selectedCategory) &&
                    (searchQuery === '' || module.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((module) => (
                    <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(module.type)}
                          <span className="text-sm text-gray-600">{module.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{module.rating}</span>
                        </div>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-2">{module.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                        <span className="text-sm text-gray-600">{module.duration} min</span>
                      </div>

                      {module.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        {module.isCompleted ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => startModule(module.id)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            {module.progress > 0 ? 'Continue' : 'Start'}
                          </button>
                        )}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
                <button
                  onClick={() => setIsCreatingTicket(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Ticket
                </button>
              </div>

              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Created: {formatTimeAgo(ticket.createdAt)}</span>
                          <span>•</span>
                          <span>Category: {ticket.category}</span>
                          {ticket.assignedTo && (
                            <>
                              <span>•</span>
                              <span>Assigned: {ticket.assignedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {knowledgeArticles
                  .filter(article => 
                    searchQuery === '' || 
                    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((article) => (
                    <div key={article.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{article.content.substring(0, 150)}...</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Category: {article.category}</span>
                            <span>•</span>
                            <span>{article.views} views</span>
                            <span>•</span>
                            <span>{article.helpful} helpful</span>
                            <span>•</span>
                            <span>Updated: {formatTimeAgo(article.lastUpdated)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Share className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreatingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Create Support Ticket</h3>
                <button
                  onClick={() => setIsCreatingTicket(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="Technical">Technical</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Training">Training</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Detailed description of your issue or request"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSupportSystem;
