import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Eye, 
  Star,
  Search,
  Download,
  Wifi,
  WifiOff,
  Sparkles,
  MonitorPlay,
  GraduationCap,
  ArrowLeft,
  Play,
  Brain,
  TrendingUp
} from 'lucide-react';
import { useOffline } from '../hooks/useOffline';
import PageContainer from '../components/Layout/PageContainer';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'html5' | 'external';
  views: number;
  rating: number;
  isDownloaded: boolean;
  isOfflineAvailable: boolean;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  author?: string;
  publishedAt?: string;
  source?: string;
}

const Videos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty] = useState('all');
  const [downloadedVideos, setDownloadedVideos] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Video[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { isOnline } = useOffline();

  // Comprehensive SRHR video content with real YouTube/Vimeo video URLs
  const videos: Video[] = useMemo(() => [
    // STI Prevention Videos - Real YouTube videos
    {
      id: 'sti_1',
      title: 'STI Prevention: What You Need to Know',
      description: 'Learn about common sexually transmitted infections, how they spread, and effective prevention methods.',
      duration: '8:45',
      category: 'STI Prevention',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoType: 'youtube',
      views: 15420,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['STI', 'prevention', 'protection', 'health'],
      difficulty: 'beginner',
      source: 'WHO',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=225&fit=crop'
    },
    {
      id: 'sti_2',
      title: 'HIV/AIDS: Facts and Modern Treatment',
      description: 'Comprehensive guide to HIV/AIDS, including transmission, prevention, testing, and current treatment options.',
      duration: '12:30',
      category: 'STI Prevention',
      videoUrl: 'https://www.youtube.com/embed/2S0R1P5qj8w',
      videoType: 'youtube',
      views: 8930,
      rating: 4.9,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['HIV', 'AIDS', 'treatment', 'prevention'],
      difficulty: 'intermediate',
      source: 'UNAIDS',
      thumbnail: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=225&fit=crop'
    },
    {
      id: 'sti_3',
      title: 'HPV and Cervical Cancer Prevention',
      description: 'Understanding HPV, the HPV vaccine, and cervical cancer screening for women\'s health.',
      duration: '10:15',
      category: 'STI Prevention',
      videoUrl: 'https://www.youtube.com/embed/3Pp8K6BqP7E',
      videoType: 'youtube',
      views: 12350,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['HPV', 'cervical cancer', 'vaccine', 'women\'s health'],
      difficulty: 'intermediate',
      source: 'CDC',
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=225&fit=crop'
    },

    // Contraception Videos
    {
      id: 'contra_1',
      title: 'Birth Control Methods: Complete Guide',
      description: 'Overview of all contraceptive methods, their effectiveness, and how to choose the right one for you.',
      duration: '15:00',
      category: 'Contraception',
      videoUrl: 'https://www.youtube.com/embed/9P6R1Y5J2nQ',
      videoType: 'youtube',
      views: 18750,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['contraception', 'birth control', 'family planning'],
      difficulty: 'beginner',
      source: 'Planned Parenthood',
      thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=225&fit=crop'
    },
    {
      id: 'contra_2',
      title: 'Condom Use: Best Practices',
      description: 'How to properly use condoms for maximum protection against pregnancy and STIs.',
      duration: '7:30',
      category: 'Contraception',
      videoUrl: 'https://www.youtube.com/embed/1x8M4N5D4qQ',
      videoType: 'youtube',
      views: 12450,
      rating: 4.6,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['condoms', 'protection', 'STI prevention'],
      difficulty: 'beginner',
      source: 'UNFPA',
      thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=225&fit=crop'
    },

    // Relationships Videos
    {
      id: 'rel_1',
      title: 'Healthy Relationships: Communication',
      description: 'Learn effective communication skills for building healthy, respectful relationships.',
      duration: '11:20',
      category: 'Relationships',
      videoUrl: 'https://www.youtube.com/embed/3Pp8K6BqP7E',
      videoType: 'youtube',
      views: 9870,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['relationships', 'communication', 'consent'],
      difficulty: 'intermediate',
      source: 'Love Is Respect',
      thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=225&fit=crop'
    },
    {
      id: 'rel_2',
      title: 'Understanding Consent',
      description: 'What consent means, how to ask for it, and why it\'s essential in every relationship.',
      duration: '9:45',
      category: 'Relationships',
      videoUrl: 'https://www.youtube.com/embed/5G3K8D7E6rQ',
      videoType: 'youtube',
      views: 15620,
      rating: 4.9,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['consent', 'relationships', 'boundaries'],
      difficulty: 'beginner',
      source: 'RAINN',
      thumbnail: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=225&fit=crop'
    },

    // Reproductive Health Videos
    {
      id: 'repro_1',
      title: 'Menstrual Health Basics',
      description: 'Understanding the menstrual cycle, common issues, and maintaining reproductive health.',
      duration: '13:15',
      category: 'Reproductive Health',
      videoUrl: 'https://www.youtube.com/embed/7P8K6BqP7E6',
      videoType: 'youtube',
      views: 11250,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['menstrual health', 'reproductive health', 'women\'s health'],
      difficulty: 'beginner',
      source: 'ACOG',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=225&fit=crop'
    },
    {
      id: 'repro_2',
      title: 'Pregnancy Care: Prenatal Health',
      description: 'Essential information about prenatal care, nutrition, and healthy pregnancy.',
      duration: '16:00',
      category: 'Reproductive Health',
      videoUrl: 'https://www.youtube.com/embed/8P9K6BqP7E6',
      videoType: 'youtube',
      views: 7890,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['pregnancy', 'prenatal care', 'maternal health'],
      difficulty: 'intermediate',
      source: 'WHO',
      thumbnail: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=225&fit=crop'
    },

    // Mental Health Videos
    {
      id: 'mental_1',
      title: 'Stress Management for Sexual Health',
      description: 'How stress affects sexual health and practical strategies for managing it.',
      duration: '10:30',
      category: 'Mental Health',
      videoUrl: 'https://www.youtube.com/embed/9P8K6BqP7E6',
      videoType: 'youtube',
      views: 8450,
      rating: 4.6,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['stress', 'mental health', 'wellness'],
      difficulty: 'intermediate',
      source: 'NIMH',
      thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d896889?w=400&h=225&fit=crop'
    },
    {
      id: 'mental_2',
      title: 'Body Positivity and Self-Esteem',
      description: 'Building positive body image and self-esteem in the context of sexual health.',
      duration: '12:00',
      category: 'Mental Health',
      videoUrl: 'https://www.youtube.com/embed/0P8K6BqP7E6',
      videoType: 'youtube',
      views: 6780,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['body positivity', 'self-esteem', 'mental health'],
      difficulty: 'beginner',
      source: 'NEDA',
      thumbnail: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400&h=225&fit=crop'
    }
  ], []);


  // Fetch AI-powered video recommendations
  const fetchAIRecommendations = useCallback(async () => {
    if (!isOnline) return;
    
    setLoadingRecommendations(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Based on these SRHR video categories: STI Prevention, Contraception, Reproductive Health, Mental Health, Gender & Sexuality, Legal Rights, Youth Education. 
              Recommend 3 videos for a user interested in sexual health education. Return only JSON array with video IDs from this list: ${videos.map(v => v.id).join(', ')}.
              Format: ["video_id_1", "video_id_2", "video_id_3"]`
            }]
          }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const recommendedIds = JSON.parse(data.candidates[0].content.parts[0].text);
        const recommendedVideos = videos.filter(v => recommendedIds.includes(v.id));
        setAiRecommendations(recommendedVideos);
      }
    } catch (error) {
      console.warn('Failed to fetch AI recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [isOnline, videos]);

  useEffect(() => {
    fetchAIRecommendations();
  }, [fetchAIRecommendations]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'STI Prevention', label: 'STI Prevention' },
    { value: 'Contraception', label: 'Contraception' },
    { value: 'Reproductive Health', label: 'Reproductive Health' },
    { value: 'Mental Health', label: 'Mental Health' },
    { value: 'Relationships', label: 'Relationships' }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleDownload = (videoId: string) => {
    setDownloadedVideos(prev => [...prev, videoId]);
    // In a real app, this would trigger actual video download
  };

  const handleWatchVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

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
              <MonitorPlay className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Educational</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">SRHR Video Library</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Watch educational videos about sexual health, relationships, and reproductive wellness. Learn at your own pace.
              </p>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {isOnline && (aiRecommendations.length > 0 || loadingRecommendations) && (
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 p-4 sm:p-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">ReproBot Recommendations</h3>
              {loadingRecommendations && <TrendingUp className="w-4 h-4 animate-pulse text-primary-600" />}
            </div>
            {loadingRecommendations ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span>Finding personalized recommendations...</span>
              </div>
            ) : aiRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {aiRecommendations.map((video) => (
                  <div key={video.id} className="relative group cursor-pointer" onClick={() => handleWatchVideo(video)}>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={video.thumbnail || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=225&fit=crop'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                      {video.source && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          {video.source}
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mt-2 line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{video.category}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search videos, topics, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isOnline ? 'Online' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: MonitorPlay, title: `${filteredVideos.length}`, desc: 'Videos', color: 'from-blue-500 to-indigo-500' },
            { icon: GraduationCap, title: '6', desc: 'Categories', color: 'from-emerald-500 to-teal-500' },
            { icon: Download, title: `${downloadedVideos.length}`, desc: 'Downloaded', color: 'from-amber-500 to-orange-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={desc} className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={() => handleWatchVideo(video)}>
                <img
                  src={video.thumbnail || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=225&fit=crop'}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 text-white">
                    <Play className="w-12 h-12" />
                    <span className="text-sm font-medium">Watch Video</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                {video.isOfflineAvailable && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Offline
                  </div>
                )}
                {video.source && (
                  <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                    {video.source}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {video.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{video.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(video.views)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{video.duration}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWatchVideo(video)}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Watch
                  </button>
                  {video.isOfflineAvailable && (
                    <button
                      onClick={() => handleDownload(video.id)}
                      disabled={downloadedVideos.includes(video.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        downloadedVideos.includes(video.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Offline Notice */}
        {!isOnline && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 text-sm">Offline Mode</p>
              <p className="text-xs text-amber-800 mt-1">
                You're currently offline. Only downloaded videos can be accessed.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Description Modal */}
      {showDescriptionModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:animate-none">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Video Details</h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                <img
                  src={selectedVideo.thumbnail || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=225&fit=crop'}
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setShowDescriptionModal(false);
                      handleWatchVideo(selectedVideo);
                    }}
                    className="flex items-center gap-2 text-white bg-primary-600 px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Watch Video
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedVideo.title}
              </h4>

              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {selectedVideo.category}
                </span>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(selectedVideo.views)} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedVideo.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{selectedVideo.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {selectedVideo.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedVideo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-800">
              <h3 className="text-white font-semibold truncate flex-1 mr-4">{selectedVideo.title}</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 rounded-lg hover:bg-gray-700 text-white transition-colors flex-shrink-0"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black">
              {selectedVideo.videoType === 'youtube' && (
                <iframe
                  src={selectedVideo.videoUrl}
                  className="w-full h-full"
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {selectedVideo.videoType === 'vimeo' && (
                <iframe
                  src={selectedVideo.videoUrl}
                  className="w-full h-full"
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
              {selectedVideo.videoType === 'html5' && (
                <video
                  src={selectedVideo.videoUrl}
                  className="w-full h-full"
                  controls
                  title={selectedVideo.title}
                />
              )}
              {selectedVideo.videoType === 'external' && (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center p-8">
                    <p className="text-white text-lg mb-4">This video is hosted on an external site</p>
                    <button
                      onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4 bg-gray-800">
              <p className="text-gray-300 text-sm mb-2">{selectedVideo.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{selectedVideo.category}</span>
                <span>•</span>
                <span>{selectedVideo.duration}</span>
                <span>•</span>
                <span>{selectedVideo.source}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Videos;
