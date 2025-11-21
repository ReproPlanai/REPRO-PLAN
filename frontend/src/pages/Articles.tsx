import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  Eye, 
  Heart, 
  Shield, 
  Users, 
  Search,
  Wifi,
  WifiOff,
  FileText,
  Bookmark,
  Share2
} from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  views: number;
  rating: number;
  isBookmarked: boolean;
  isOfflineAvailable: boolean;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: string;
  publishedDate: string;
  lastUpdated: string;
}

const Articles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const { isOnline } = useOffline();

  // Comprehensive SRHR articles database
  const articles: Article[] = useMemo(() => [
    // STI Prevention Articles
    {
      id: 'sti_1',
      title: 'Complete Guide to STI Prevention and Protection',
      excerpt: 'Learn about the most effective methods to prevent sexually transmitted infections and protect your sexual health.',
      content: 'Full article content about STI prevention...',
      category: 'STI Prevention',
      readTime: '8 min',
      views: 15420,
      rating: 4.8,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['STI', 'prevention', 'protection', 'health'],
      difficulty: 'beginner',
      author: 'Dr. Sarah Johnson',
      publishedDate: '2024-01-15',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'sti_2',
      title: 'Understanding HIV/AIDS: Facts, Myths, and Modern Treatment',
      excerpt: 'A comprehensive guide to HIV/AIDS, including transmission, prevention, testing, and current treatment options.',
      content: 'Full article content about HIV/AIDS...',
      category: 'STI Prevention',
      readTime: '12 min',
      views: 8930,
      rating: 4.9,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['HIV', 'AIDS', 'treatment', 'prevention'],
      difficulty: 'intermediate',
      author: 'Dr. Michael Chen',
      publishedDate: '2024-01-10',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'sti_3',
      title: 'HPV and Cervical Cancer: Prevention and Early Detection',
      excerpt: 'Understanding HPV, the HPV vaccine, and cervical cancer screening for women\'s health.',
      content: 'Full article content about HPV...',
      category: 'STI Prevention',
      readTime: '10 min',
      views: 12350,
      rating: 4.7,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['HPV', 'cervical cancer', 'vaccine', 'women\'s health'],
      difficulty: 'intermediate',
      author: 'Dr. Emily Rodriguez',
      publishedDate: '2024-01-08',
      lastUpdated: '2024-01-16'
    },

    // Contraception Articles
    {
      id: 'contra_1',
      title: 'Birth Control Methods: Choosing What\'s Right for You',
      excerpt: 'A comprehensive overview of all contraceptive methods, their effectiveness, and how to choose the right one.',
      content: 'Full article content about contraception...',
      category: 'Contraception',
      readTime: '15 min',
      views: 18750,
      rating: 4.8,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['contraception', 'birth control', 'family planning'],
      difficulty: 'beginner',
      author: 'Dr. Lisa Thompson',
      publishedDate: '2024-01-12',
      lastUpdated: '2024-01-19'
    },
    {
      id: 'contra_2',
      title: 'Emergency Contraception: When and How to Use It',
      excerpt: 'Everything you need to know about emergency contraception, including timing and effectiveness.',
      content: 'Full article content about emergency contraception...',
      category: 'Contraception',
      readTime: '6 min',
      views: 9650,
      rating: 4.6,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['emergency contraception', 'morning after pill', 'unprotected sex'],
      difficulty: 'beginner',
      author: 'Dr. James Wilson',
      publishedDate: '2024-01-05',
      lastUpdated: '2024-01-14'
    },

    // Reproductive Health Articles
    {
      id: 'repro_1',
      title: 'Understanding Your Menstrual Cycle: A Complete Guide',
      excerpt: 'Learn about the menstrual cycle, ovulation, and how to track your fertility naturally.',
      content: 'Full article content about menstrual cycle...',
      category: 'Reproductive Health',
      readTime: '9 min',
      views: 22300,
      rating: 4.8,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['menstrual cycle', 'ovulation', 'fertility', 'periods'],
      difficulty: 'beginner',
      author: 'Dr. Maria Garcia',
      publishedDate: '2024-01-14',
      lastUpdated: '2024-01-21'
    },
    {
      id: 'repro_2',
      title: 'Pregnancy: What to Expect in Each Trimester',
      excerpt: 'A comprehensive guide to pregnancy, including physical changes, prenatal care, and preparation for birth.',
      content: 'Full article content about pregnancy...',
      category: 'Reproductive Health',
      readTime: '18 min',
      views: 15680,
      rating: 4.9,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['pregnancy', 'prenatal care', 'trimester', 'birth preparation'],
      difficulty: 'intermediate',
      author: 'Dr. Jennifer Lee',
      publishedDate: '2024-01-11',
      lastUpdated: '2024-01-17'
    },
    {
      id: 'repro_3',
      title: 'Menopause: Understanding the Transition',
      excerpt: 'Information about menopause, symptoms, treatment options, and maintaining health during this life stage.',
      content: 'Full article content about menopause...',
      category: 'Reproductive Health',
      readTime: '13 min',
      views: 8750,
      rating: 4.6,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['menopause', 'hormones', 'women\'s health', 'aging'],
      difficulty: 'intermediate',
      author: 'Dr. Patricia Brown',
      publishedDate: '2024-01-09',
      lastUpdated: '2024-01-15'
    },

    // Mental Health Articles
    {
      id: 'mental_1',
      title: 'Healthy Relationships: Communication and Boundaries',
      excerpt: 'Learn about building healthy relationships, effective communication, and setting personal boundaries.',
      content: 'Full article content about healthy relationships...',
      category: 'Mental Health',
      readTime: '14 min',
      views: 19800,
      rating: 4.8,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['relationships', 'communication', 'boundaries', 'mental health'],
      difficulty: 'beginner',
      author: 'Dr. Robert Taylor',
      publishedDate: '2024-01-13',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'mental_2',
      title: 'Consent: Understanding and Practicing',
      excerpt: 'A comprehensive guide to sexual consent, including enthusiastic consent and recognizing coercion.',
      content: 'Full article content about consent...',
      category: 'Mental Health',
      readTime: '12 min',
      views: 16750,
      rating: 4.9,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['consent', 'sexual health', 'relationships', 'safety'],
      difficulty: 'beginner',
      author: 'Dr. Amanda Davis',
      publishedDate: '2024-01-07',
      lastUpdated: '2024-01-16'
    },
    {
      id: 'mental_3',
      title: 'Body Image and Self-Esteem: Building Confidence',
      excerpt: 'Building positive body image and self-esteem for better mental health and sexual confidence.',
      content: 'Full article content about body image...',
      category: 'Mental Health',
      readTime: '10 min',
      views: 13400,
      rating: 4.7,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['body image', 'self-esteem', 'mental health', 'confidence'],
      difficulty: 'beginner',
      author: 'Dr. Rachel Green',
      publishedDate: '2024-01-06',
      lastUpdated: '2024-01-13'
    },

    // Gender and Sexuality Articles
    {
      id: 'gender_1',
      title: 'Understanding Gender Identity and Expression',
      excerpt: 'Learn about gender identity, gender expression, and supporting transgender and non-binary individuals.',
      content: 'Full article content about gender identity...',
      category: 'Gender & Sexuality',
      readTime: '16 min',
      views: 12800,
      rating: 4.8,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['gender identity', 'transgender', 'non-binary', 'LGBTQ+'],
      difficulty: 'intermediate',
      author: 'Dr. Alex Martinez',
      publishedDate: '2024-01-04',
      lastUpdated: '2024-01-12'
    },
    {
      id: 'gender_2',
      title: 'Sexual Orientation: Understanding Diversity',
      excerpt: 'Exploring different sexual orientations and creating inclusive, supportive environments.',
      content: 'Full article content about sexual orientation...',
      category: 'Gender & Sexuality',
      readTime: '11 min',
      views: 15200,
      rating: 4.7,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['sexual orientation', 'LGBTQ+', 'diversity', 'inclusion'],
      difficulty: 'beginner',
      author: 'Dr. Sam Johnson',
      publishedDate: '2024-01-03',
      lastUpdated: '2024-01-11'
    },

    // Legal Rights Articles
    {
      id: 'legal_1',
      title: 'Your Reproductive Rights: Know Your Rights',
      excerpt: 'Understanding reproductive rights, healthcare access, and legal protections for sexual health.',
      content: 'Full article content about reproductive rights...',
      category: 'Legal Rights',
      readTime: '13 min',
      views: 9650,
      rating: 4.6,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['reproductive rights', 'legal rights', 'healthcare access'],
      difficulty: 'intermediate',
      author: 'Dr. Legal Expert',
      publishedDate: '2024-01-02',
      lastUpdated: '2024-01-10'
    },
    {
      id: 'legal_2',
      title: 'Sexual Harassment and Violence: Prevention and Support',
      excerpt: 'Recognizing sexual harassment and violence, prevention strategies, and where to get help.',
      content: 'Full article content about sexual harassment...',
      category: 'Legal Rights',
      readTime: '15 min',
      views: 11200,
      rating: 4.8,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['sexual harassment', 'violence prevention', 'support', 'safety'],
      difficulty: 'intermediate',
      author: 'Dr. Safety Expert',
      publishedDate: '2024-01-01',
      lastUpdated: '2024-01-09'
    },

    // Youth Education Articles
    {
      id: 'youth_1',
      title: 'Teen Sexual Health: What You Need to Know',
      excerpt: 'Age-appropriate information about sexual health, relationships, and making informed decisions.',
      content: 'Full article content about teen sexual health...',
      category: 'Youth Education',
      readTime: '12 min',
      views: 18750,
      rating: 4.8,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['teen health', 'sexual education', 'youth', 'decision making'],
      difficulty: 'beginner',
      author: 'Dr. Youth Specialist',
      publishedDate: '2023-12-30',
      lastUpdated: '2024-01-08'
    },
    {
      id: 'youth_2',
      title: 'Peer Pressure and Sexual Decisions',
      excerpt: 'How to handle peer pressure and make confident decisions about your sexual health and relationships.',
      content: 'Full article content about peer pressure...',
      category: 'Youth Education',
      readTime: '9 min',
      views: 14300,
      rating: 4.7,
      isBookmarked: false,
      isOfflineAvailable: true,
      tags: ['peer pressure', 'decision making', 'youth', 'confidence'],
      difficulty: 'beginner',
      author: 'Dr. Youth Counselor',
      publishedDate: '2023-12-29',
      lastUpdated: '2024-01-07'
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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleRead = (article: Article) => {
    // In a real app, this would open the article reader
    console.log('Reading article:', article.title);
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
        return FileText;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-3 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="card mb-4 sm:mb-6 lg:mb-8">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-9 sm:pl-10 text-sm sm:text-base"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field text-xs sm:text-sm lg:text-base"
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="input-field text-xs sm:text-sm lg:text-base"
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
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg w-full">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    )}
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {isOnline ? 'Online' : 'Offline Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Showing {filteredArticles.length} of {articles.length} articles
            </p>
          </div>

          {/* Articles Grid */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {filteredArticles.map((article) => {
              const CategoryIcon = getCategoryIcon(article.category);
              const isBookmarked = bookmarkedArticles.includes(article.id);
              
              return (
                <div key={article.id} className="card group hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Category Icon */}
                    <div className="p-2 sm:p-3 bg-primary-100 rounded-xl flex-shrink-0">
                      <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(article.difficulty)}`}>
                                {article.difficulty}
                              </span>
                              <span className="hidden sm:inline">{article.category}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="sm:hidden">{article.category}</span>
                              <span>By {article.author}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleBookmark(article.id)}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                              isBookmarked 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'bg-gray-100 text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          <button className="p-1.5 sm:p-2 bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{article.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatViews(article.views)}</span>
                          </div>
                          <div className="text-gray-400 text-xs sm:text-sm">
                            Updated {formatDate(article.lastUpdated)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {article.isOfflineAvailable && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                              Offline
                            </span>
                          )}
                          <button
                            onClick={() => handleRead(article)}
                            className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center space-x-1 sm:space-x-2"
                          >
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Read Article</span>
                            <span className="sm:hidden">Read</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-500 mb-3 sm:mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="btn-outline text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Offline Notice */}
          {!isOnline && (
            <div className="mt-4 sm:mt-6 lg:mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 lg:p-6">
              <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4">
                <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">Offline Mode</h4>
                  <p className="text-yellow-800 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">
                    You're currently offline. Only offline-available articles can be accessed.
                    Bookmark articles when online to save them for later reading.
                  </p>
                  <div className="text-yellow-700 text-xs sm:text-sm space-y-1">
                    <p>• Bookmarked articles: {bookmarkedArticles.length}</p>
                    <p>• Offline-available articles: {articles.filter(a => a.isOfflineAvailable).length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Articles;
