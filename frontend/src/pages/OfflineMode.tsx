import React, { useState, useEffect, useMemo } from 'react';
import { 
  WifiOff, 
  Download, 
  BookOpen, 
  Play, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  Smartphone,
  Phone,
  MessageSquare,
  ArrowRight,
  Wifi
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOffline } from '../hooks/useOffline';

interface OfflineContent {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'guide';
  size: string;
  downloadedAt: string;
  lastAccessed: string;
  category: string;
  isEssential: boolean;
}

interface CachedData {
  videos: number;
  articles: number;
  quizzes: number;
  guides: number;
  totalSize: string;
  lastSync: string;
}

const OfflineMode: React.FC = () => {
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [cachedData, setCachedData] = useState<CachedData>({
    videos: 0,
    articles: 0,
    quizzes: 0,
    guides: 0,
    totalSize: '0 MB',
    lastSync: 'Never'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const { isOnline } = useOffline();

  // Sample offline content
  const sampleOfflineContent: OfflineContent[] = useMemo(() => [
    {
      id: '1',
      title: 'STI Prevention: Complete Guide',
      type: 'video',
      size: '45.2 MB',
      downloadedAt: '2024-01-15',
      lastAccessed: '2024-01-20',
      category: 'STI Prevention',
      isEssential: true
    },
    {
      id: '2',
      title: 'Understanding Contraception Methods',
      type: 'article',
      size: '2.1 MB',
      downloadedAt: '2024-01-14',
      lastAccessed: '2024-01-19',
      category: 'Contraception',
      isEssential: true
    },
    {
      id: '3',
      title: 'SRHR Knowledge Quiz',
      type: 'quiz',
      size: '1.8 MB',
      downloadedAt: '2024-01-13',
      lastAccessed: '2024-01-18',
      category: 'Education',
      isEssential: false
    },
    {
      id: '4',
      title: 'Emergency Contacts and Services',
      type: 'guide',
      size: '0.5 MB',
      downloadedAt: '2024-01-12',
      lastAccessed: '2024-01-17',
      category: 'Emergency',
      isEssential: true
    },
    {
      id: '5',
      title: 'Healthy Relationships Guide',
      type: 'video',
      size: '38.7 MB',
      downloadedAt: '2024-01-11',
      lastAccessed: '2024-01-16',
      category: 'Mental Health',
      isEssential: false
    },
    {
      id: '6',
      title: 'Reproductive Health Basics',
      type: 'article',
      size: '3.2 MB',
      downloadedAt: '2024-01-10',
      lastAccessed: '2024-01-15',
      category: 'Reproductive Health',
      isEssential: true
    }
  ], []);

  useEffect(() => {
    setOfflineContent(sampleOfflineContent);
    
    // Calculate cached data stats
    const stats = {
      videos: sampleOfflineContent.filter(item => item.type === 'video').length,
      articles: sampleOfflineContent.filter(item => item.type === 'article').length,
      quizzes: sampleOfflineContent.filter(item => item.type === 'quiz').length,
      guides: sampleOfflineContent.filter(item => item.type === 'guide').length,
      totalSize: '91.5 MB',
      lastSync: '2024-01-15 14:30'
    };
    setCachedData(stats);
  }, [sampleOfflineContent]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'STI Prevention', label: 'STI Prevention' },
    { value: 'Contraception', label: 'Contraception' },
    { value: 'Education', label: 'Education' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'Mental Health', label: 'Mental Health' },
    { value: 'Reproductive Health', label: 'Reproductive Health' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'video', label: 'Videos' },
    { value: 'article', label: 'Articles' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'guide', label: 'Guides' }
  ];

  const filteredContent = offlineContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Play;
      case 'article':
        return FileText;
      case 'quiz':
        return BookOpen;
      case 'guide':
        return Shield;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-700';
      case 'article':
        return 'bg-blue-100 text-blue-700';
      case 'quiz':
        return 'bg-green-100 text-green-700';
      case 'guide':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDeleteContent = (id: string) => {
    setOfflineContent(prev => prev.filter(item => item.id !== id));
  };

  const handleRefresh = () => {
    // In a real app, this would sync with server when online
    console.log('Refreshing offline content...');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Connection Status Banner */}
          <div className={`rounded-xl p-4 sm:p-6 text-white mb-6 sm:mb-8 ${
            isOnline 
              ? 'bg-gradient-to-r from-green-500 to-blue-500' 
              : 'bg-gradient-to-r from-orange-500 to-red-500'
          }`}>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {isOnline ? (
                <Wifi className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              ) : (
                <WifiOff className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold mb-1">
                  {isOnline ? 'You\'re Online' : 'You\'re Offline'}
                </h2>
                <p className="text-sm sm:text-base opacity-90">
                  {isOnline 
                    ? 'REPRO PLAN is connected. You can access all features and sync your content.'
                    : 'REPRO PLAN is working in offline mode. You can access all your downloaded content and offline services.'
                  }
                </p>
              </div>
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${
                isOnline 
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-white bg-opacity-20'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-400' : 'bg-red-400 animate-pulse'
                }`}></div>
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Offline Services Quick Access */}
          {!isOnline && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Offline Communication Services</h3>
              </div>
              <p className="text-blue-800 text-sm mb-4">
                Even when offline, you can still access essential communication services through SMS and USSD codes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/sms"
                  className="group bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        SMS & USSD Services
                      </h4>
                      <p className="text-sm text-gray-600">
                        Send messages and access health info via USSD codes
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
                
                <Link
                  to="/sms-alerts"
                  className="group bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        SRHR Alerts
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get important health alerts and notifications
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Storage Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="card text-center">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-gray-900">{cachedData.videos}</div>
              <div className="text-xs sm:text-sm text-gray-500">Videos</div>
            </div>
            <div className="card text-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-gray-900">{cachedData.articles}</div>
              <div className="text-xs sm:text-sm text-gray-500">Articles</div>
            </div>
            <div className="card text-center">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-gray-900">{cachedData.quizzes}</div>
              <div className="text-xs sm:text-sm text-gray-500">Quizzes</div>
            </div>
            <div className="card text-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-gray-900">{cachedData.guides}</div>
              <div className="text-xs sm:text-sm text-gray-500">Guides</div>
            </div>
            <div className="card text-center">
              <Download className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl font-bold text-gray-900">{cachedData.totalSize}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Size</div>
            </div>
            <div className="card text-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mx-auto mb-2" />
              <div className="text-xs sm:text-sm font-bold text-gray-900">{formatDate(cachedData.lastSync)}</div>
              <div className="text-xs sm:text-sm text-gray-500">Last Sync</div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field text-sm sm:text-base"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input-field text-sm sm:text-base"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={!isOnline}
                  className="flex-1 btn-outline text-sm sm:text-base flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync</span>
                </button>
                <button className="btn-outline p-3">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Essential Content Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Essential Content</h4>
                <p className="text-blue-800 text-xs sm:text-sm mb-3 leading-relaxed">
                  Essential content is automatically downloaded and kept up-to-date. This includes emergency contacts, 
                  basic health information, and critical safety resources that are always available offline.
                </p>
                <div className="text-blue-700 text-xs sm:text-sm">
                  <p>• Emergency contacts and services</p>
                  <p>• Basic STI prevention information</p>
                  <p>• Contraception methods overview</p>
                  <p>• Reproductive health basics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="space-y-4 sm:space-y-6">
            {filteredContent.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              
              return (
                <div key={item.id} className="card">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${getTypeColor(item.type)} flex-shrink-0`}>
                      <TypeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                            <span>{item.category}</span>
                            <span>{item.size}</span>
                            {item.isEssential && (
                              <span className="flex items-center space-x-1 text-orange-600">
                                <Shield className="w-3 h-3" />
                                <span>Essential</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>Downloaded: {formatDate(item.downloadedAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>Last viewed: {formatDate(item.lastAccessed)}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button className="btn-primary text-xs sm:text-sm px-3 py-1">
                            Open
                          </button>
                          {!item.isEssential && (
                            <button
                              onClick={() => handleDeleteContent(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Content */}
          {filteredContent.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <Download className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No offline content found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                {selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters to see more content'
                  : 'Download content when online to access it offline'
                }
              </p>
              {(selectedCategory !== 'all' || selectedType !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                  className="btn-outline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Offline Tips */}
          <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Offline Tips</h4>
                <div className="text-green-800 text-xs sm:text-sm space-y-1">
                  <p>• Essential content is always available offline</p>
                  <p>• Download videos and articles when you have internet</p>
                  <p>• Content syncs automatically when you're back online</p>
                  <p>• Use the search function to find specific topics</p>
                  <p>• Emergency contacts are always accessible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfflineMode;
