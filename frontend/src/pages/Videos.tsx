import React, { useState, useMemo } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { useOffline } from '../hooks/useOffline';
import PageContainer from '../components/Layout/PageContainer';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  youtubeId: string;
  views: number;
  rating: number;
  isDownloaded: boolean;
  isOfflineAvailable: boolean;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const Videos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty] = useState('all');
  const [downloadedVideos, setDownloadedVideos] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const { isOnline } = useOffline();

  // Comprehensive SRHR video content with YouTube embeds
  const videos: Video[] = useMemo(() => [
    // STI Prevention Videos
    {
      id: 'sti_1',
      title: 'Understanding STIs: Prevention and Protection',
      description: 'Learn about common sexually transmitted infections, how they spread, and effective prevention methods.',
      duration: '8:45',
      category: 'STI Prevention',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual STI prevention video ID
      views: 15420,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['STI', 'prevention', 'protection', 'health'],
      difficulty: 'beginner'
    },
    {
      id: 'sti_2',
      title: 'HIV/AIDS: Facts, Myths, and Modern Treatment',
      description: 'Comprehensive guide to HIV/AIDS, including transmission, prevention, testing, and current treatment options.',
      duration: '12:30',
      category: 'STI Prevention',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual HIV/AIDS video ID
      views: 8930,
      rating: 4.9,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['HIV', 'AIDS', 'treatment', 'prevention'],
      difficulty: 'intermediate'
    },
    {
      id: 'sti_3',
      title: 'HPV and Cervical Cancer Prevention',
      description: 'Understanding HPV, the HPV vaccine, and cervical cancer screening for women\'s health.',
      duration: '10:15',
      category: 'STI Prevention',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual HPV video ID
      views: 12350,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['HPV', 'cervical cancer', 'vaccine', 'women\'s health'],
      difficulty: 'intermediate'
    },

    // Contraception Videos
    {
      id: 'contra_1',
      title: 'Birth Control Methods: A Complete Guide',
      description: 'Overview of all contraceptive methods, their effectiveness, and how to choose the right one for you.',
      duration: '15:20',
      category: 'Contraception',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual contraception video ID
      views: 18750,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['contraception', 'birth control', 'family planning'],
      difficulty: 'beginner'
    },
    {
      id: 'contra_2',
      title: 'Emergency Contraception: When and How to Use',
      description: 'Everything you need to know about emergency contraception, including timing and effectiveness.',
      duration: '6:30',
      category: 'Contraception',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual emergency contraception video ID
      views: 9650,
      rating: 4.6,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['emergency contraception', 'morning after pill', 'unprotected sex'],
      difficulty: 'beginner'
    },
    {
      id: 'contra_3',
      title: 'IUDs and Implants: Long-term Contraception',
      description: 'Detailed information about intrauterine devices and contraceptive implants for long-term protection.',
      duration: '11:45',
      category: 'Contraception',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual IUD video ID
      views: 11200,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['IUD', 'implant', 'long-term contraception'],
      difficulty: 'intermediate'
    },

    // Reproductive Health Videos
    {
      id: 'repro_1',
      title: 'Understanding Your Menstrual Cycle',
      description: 'Learn about the menstrual cycle, ovulation, and how to track your fertility naturally.',
      duration: '9:15',
      category: 'Reproductive Health',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual menstrual cycle video ID
      views: 22300,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['menstrual cycle', 'ovulation', 'fertility', 'periods'],
      difficulty: 'beginner'
    },
    {
      id: 'repro_2',
      title: 'Pregnancy: What to Expect in Each Trimester',
      description: 'Comprehensive guide to pregnancy, including physical changes, prenatal care, and preparation for birth.',
      duration: '18:30',
      category: 'Reproductive Health',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual pregnancy video ID
      views: 15680,
      rating: 4.9,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['pregnancy', 'prenatal care', 'trimester', 'birth preparation'],
      difficulty: 'intermediate'
    },
    {
      id: 'repro_3',
      title: 'Menopause: Understanding the Transition',
      description: 'Information about menopause, symptoms, treatment options, and maintaining health during this life stage.',
      duration: '13:20',
      category: 'Reproductive Health',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual menopause video ID
      views: 8750,
      rating: 4.6,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['menopause', 'hormones', 'women\'s health', 'aging'],
      difficulty: 'intermediate'
    },

    // Mental Health and Relationships Videos
    {
      id: 'mental_1',
      title: 'Healthy Relationships: Communication and Boundaries',
      description: 'Learn about building healthy relationships, effective communication, and setting personal boundaries.',
      duration: '14:45',
      category: 'Mental Health',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual relationships video ID
      views: 19800,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['relationships', 'communication', 'boundaries', 'mental health'],
      difficulty: 'beginner'
    },
    {
      id: 'mental_2',
      title: 'Consent: Understanding and Practicing',
      description: 'Comprehensive guide to sexual consent, including enthusiastic consent and recognizing coercion.',
      duration: '12:15',
      category: 'Mental Health',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual consent video ID
      views: 16750,
      rating: 4.9,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['consent', 'sexual health', 'relationships', 'safety'],
      difficulty: 'beginner'
    },
    {
      id: 'mental_3',
      title: 'Body Image and Self-Esteem',
      description: 'Building positive body image and self-esteem for better mental health and sexual confidence.',
      duration: '10:30',
      category: 'Mental Health',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual body image video ID
      views: 13400,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['body image', 'self-esteem', 'mental health', 'confidence'],
      difficulty: 'beginner'
    },

    // Gender and Sexuality Videos
    {
      id: 'gender_1',
      title: 'Understanding Gender Identity and Expression',
      description: 'Learn about gender identity, gender expression, and supporting transgender and non-binary individuals.',
      duration: '16:20',
      category: 'Gender & Sexuality',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual gender identity video ID
      views: 12800,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['gender identity', 'transgender', 'non-binary', 'LGBTQ+'],
      difficulty: 'intermediate'
    },
    {
      id: 'gender_2',
      title: 'Sexual Orientation: Understanding Diversity',
      description: 'Exploring different sexual orientations and creating inclusive, supportive environments.',
      duration: '11:45',
      category: 'Gender & Sexuality',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual sexual orientation video ID
      views: 15200,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['sexual orientation', 'LGBTQ+', 'diversity', 'inclusion'],
      difficulty: 'beginner'
    },

    // Legal Rights and Advocacy Videos
    {
      id: 'legal_1',
      title: 'Your Reproductive Rights: Know Your Rights',
      description: 'Understanding reproductive rights, healthcare access, and legal protections for sexual health.',
      duration: '13:30',
      category: 'Legal Rights',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual reproductive rights video ID
      views: 9650,
      rating: 4.6,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['reproductive rights', 'legal rights', 'healthcare access'],
      difficulty: 'intermediate'
    },
    {
      id: 'legal_2',
      title: 'Sexual Harassment and Violence: Prevention and Support',
      description: 'Recognizing sexual harassment and violence, prevention strategies, and where to get help.',
      duration: '15:45',
      category: 'Legal Rights',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual sexual harassment video ID
      views: 11200,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['sexual harassment', 'violence prevention', 'support', 'safety'],
      difficulty: 'intermediate'
    },

    // Youth-Specific Videos
    {
      id: 'youth_1',
      title: 'Teen Sexual Health: What You Need to Know',
      description: 'Age-appropriate information about sexual health, relationships, and making informed decisions.',
      duration: '12:00',
      category: 'Youth Education',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual teen health video ID
      views: 18750,
      rating: 4.8,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['teen health', 'sexual education', 'youth', 'decision making'],
      difficulty: 'beginner'
    },
    {
      id: 'youth_2',
      title: 'Peer Pressure and Sexual Decisions',
      description: 'How to handle peer pressure and make confident decisions about your sexual health and relationships.',
      duration: '9:30',
      category: 'Youth Education',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual peer pressure video ID
      views: 14300,
      rating: 4.7,
      isDownloaded: false,
      isOfflineAvailable: true,
      tags: ['peer pressure', 'decision making', 'youth', 'confidence'],
      difficulty: 'beginner'
    }
  ], []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'STI Prevention', label: 'STI Prevention' },
    { value: 'Contraception', label: 'Contraception' },
    { value: 'Reproductive Health', label: 'Reproductive Health' },
    { value: 'Mental Health', label: 'Mental Health' },
    { value: 'Gender & Sexuality', label: 'Gender & Sexuality' },
    { value: 'Legal Rights', label: 'Legal Rights' },
    { value: 'Youth Education', label: 'Youth Education' }
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

  const handleViewDescription = (video: Video) => {
    setSelectedVideo(video);
    setShowDescriptionModal(true);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {/* Video Embed */}
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                {video.isOfflineAvailable && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Offline
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

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDescription(video)}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    View Details
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
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
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
    </PageContainer>
  );
};

export default Videos;
