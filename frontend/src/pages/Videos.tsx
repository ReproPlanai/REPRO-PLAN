import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Clock, 
  Eye, 
  Heart, 
  Shield, 
  BookOpen, 
  Users, 
  Star,
  Search,
  Download,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

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
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
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

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
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

  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSelectedVideo(null);
  };


  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'STI Prevention':
        return Shield;
      case 'Contraception':
        return Heart;
      case 'Reproductive Health':
        return BookOpen;
      case 'Mental Health':
        return Users;
      case 'Gender & Sexuality':
        return Users;
      case 'Legal Rights':
        return Shield;
      case 'Youth Education':
        return BookOpen;
      default:
        return Play;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="card mb-6 sm:mb-8">
            <div className="space-y-4 sm:space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search videos, topics, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 text-sm sm:text-base"
                />
              </div>

              {/* Filters */}
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

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="input-field text-sm sm:text-base"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Offline Status */}
                <div className="flex items-end">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg w-full">
                    {isOnline ? (
                      <Wifi className="w-5 h-5 text-green-500" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {isOnline ? 'Online' : 'Offline Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-600">
              Showing {filteredVideos.length} of {videos.length} videos
            </p>
          </div>

          {/* Video Grid - 2 videos per row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredVideos.map((video) => {
              const CategoryIcon = getCategoryIcon(video.category);
              const isDownloaded = downloadedVideos.includes(video.id);
              
              return (
                <div key={video.id} className="card group hover:shadow-xl transition-all duration-300">
                  {/* YouTube Video Embed - Larger Size */}
                  <div className="relative mb-4">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&showinfo=0`}
                        title={video.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded">
                      {video.duration}
                    </div>

                    {/* Offline Badge */}
                    {video.isOfflineAvailable && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-sm px-3 py-1 rounded">
                        Offline
                      </div>
                    )}
                  </div>

                  {/* Video Info - Simplified */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <CategoryIcon className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-gray-500">{video.category}</span>
                        <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(video.difficulty)}`}>
                          {video.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Stats - Simplified */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatViews(video.views)} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{video.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{video.duration}</span>
                      </div>
                    </div>

                    {/* Actions - View Description Button */}
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => handleViewDescription(video)}
                        className="flex-1 btn-primary text-sm sm:text-base py-3 flex items-center justify-center space-x-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>View Description</span>
                      </button>
                      
                      {video.isOfflineAvailable && (
                        <button
                          onClick={() => handleDownload(video.id)}
                          disabled={isDownloaded}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isDownloaded
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredVideos.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No videos found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="btn-outline"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Offline Notice */}
          {!isOnline && (
            <div className="mt-6 sm:mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-yellow-900 mb-2 text-sm sm:text-base">Offline Mode</h4>
                  <p className="text-yellow-800 text-xs sm:text-sm mb-3 leading-relaxed">
                    You're currently offline. Only downloaded videos and offline-available content can be accessed.
                    Download videos when online to watch them later.
                  </p>
                  <div className="text-yellow-700 text-xs sm:text-sm">
                    <p>• Downloaded videos: {downloadedVideos.length}</p>
                    <p>• Offline-available videos: {videos.filter(v => v.isOfflineAvailable).length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Description Modal */}
      {showDescriptionModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6" />
                  <h3 className="text-lg sm:text-xl font-semibold">Video Description</h3>
                </div>
                <button
                  onClick={closeDescriptionModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {/* Video Title */}
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                {selectedVideo.title}
              </h4>

              {/* Video Stats */}
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(selectedVideo.views)} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedVideo.duration}</span>
                </div>
              </div>

              {/* Category and Difficulty */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const CategoryIcon = getCategoryIcon(selectedVideo.category);
                    return <CategoryIcon className="w-5 h-5 text-primary-600" />;
                  })()}
                  <span className="text-sm text-gray-500">{selectedVideo.category}</span>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(selectedVideo.difficulty)}`}>
                  {selectedVideo.difficulty}
                </span>
              </div>

              {/* Full Description */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
                <p className="text-gray-600 leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Tags</h5>
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

              {/* Video Embed */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Video Preview</h5>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1&showinfo=0`}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={closeDescriptionModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              {selectedVideo.isOfflineAvailable && (
                <button
                  onClick={() => {
                    handleDownload(selectedVideo.id);
                    closeDescriptionModal();
                  }}
                  disabled={downloadedVideos.includes(selectedVideo.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    downloadedVideos.includes(selectedVideo.id)
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  {downloadedVideos.includes(selectedVideo.id) ? 'Downloaded' : 'Download'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
