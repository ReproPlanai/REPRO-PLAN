import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Shield, 
  Users, 
  Plus,
  Search,
  Play,
  Pause,
  Volume2,
  Flag,
  Mic,
  MicOff
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';
import { secretCodeManager } from '../../utils/secretCode';
import { apiService } from '../../services/api';

interface Story {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'audio' | 'video';
  category: 'contraception' | 'sti_prevention' | 'consent' | 'period_health' | 'relationships' | 'mental_health' | 'gbv_support' | 'general';
  author: string; // Anonymous identifier
  timestamp: string;
  likes: number;
  isAnonymous: boolean;
  isModerated: boolean;
  isApproved: boolean;
  tags: string[];
  audioUrl?: string;
  videoUrl?: string;
  duration?: number; // for audio/video
  language: 'english' | 'french' | 'twi' | 'ga' | 'ewe' | 'dagbani' | 'fante' | 'bassa' | 'kpelle' | 'kru' | 'vai';
  ageGroup: '13-17' | '18-24' | '25-35' | '35+';
  location?: string; // Region in Ghana
}

interface StoryForm {
  title: string;
  content: string;
  type: 'text' | 'audio' | 'video';
  category: string;
  isAnonymous: boolean;
  tags: string[];
  language: string;
  ageGroup: string;
  location: string;
}

const StorytellingPlatform: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
  const [showAnonymousOnly, setShowAnonymousOnly] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);

  const [newStory, setNewStory] = useState<StoryForm>({
    title: '',
    content: '',
    type: 'text',
    category: 'general',
    isAnonymous: true,
    tags: [],
    language: 'english',
    ageGroup: '18-24',
    location: ''
  });

  const categories = [
    { value: 'contraception', label: 'Contraception', icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { value: 'sti_prevention', label: 'STI Prevention', icon: Shield, color: 'bg-blue-100 text-blue-600' },
    { value: 'consent', label: 'Consent & Relationships', icon: Users, color: 'bg-green-100 text-green-600' },
    { value: 'period_health', label: 'Period Health', icon: Heart, color: 'bg-purple-100 text-purple-600' },
    { value: 'mental_health', label: 'Mental Health', icon: Heart, color: 'bg-yellow-100 text-yellow-600' },
    { value: 'gbv_support', label: 'GBV Support', icon: Shield, color: 'bg-red-100 text-red-600' },
    { value: 'general', label: 'General SRHR', icon: MessageSquare, color: 'bg-gray-100 text-gray-600' }
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'french', label: 'French (Français)' },
    { value: 'twi', label: 'Twi' },
    { value: 'ga', label: 'Ga' },
    { value: 'ewe', label: 'Ewe' },
    { value: 'dagbani', label: 'Dagbani' },
    { value: 'fante', label: 'Fante' },
    { value: 'bassa', label: 'Bassa' },
    { value: 'kpelle', label: 'Kpelle' },
    { value: 'kru', label: 'Kru' },
    { value: 'vai', label: 'Vai' },
    { value: 'other', label: 'Other' }
  ];

  const ageGroups = [
    { value: '13-17', label: '13-17 years' },
    { value: '18-24', label: '18-24 years' },
    { value: '25-35', label: '25-35 years' },
    { value: '35+', label: '35+ years' }
  ];

  // Ghana regions
  const africanRegions = [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern',
    'Upper East', 'Upper West', 'Volta', 'Bono', 'Bono East', 'Ahafo',
    'Western North', 'Oti', 'Savannah', 'North East',
    'Accra', 'Kumasi', 'Tamale', 'Tema', 'Takoradi', 'Cape Coast', 'Sunyani'
  ];

  const commonTags = [
    'contraception', 'period', 'relationships', 'consent', 'sti', 'mental health',
    'family planning', 'pregnancy', 'safe sex', 'education', 'support', 'community'
  ];

  const loadStories = useCallback(async () => {
    try {
      // Try to fetch from API first
      const response = await apiService.getStories?.() as { success?: boolean; stories?: Story[] };
      if (response?.success && response.stories && response.stories.length > 0) {
        setStories(response.stories);
        await offlineStorage.storeData('srhr_stories', response.stories);
      } else {
        // Fall back to offline storage
        const storedStories = await offlineStorage.getData('srhr_stories');
        if (storedStories && storedStories.length > 0) {
          setStories(storedStories);
        } else {
          setStories([]);
        }
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
      // Fall back to offline storage on error
      try {
        const storedStories = await offlineStorage.getData('srhr_stories');
        if (storedStories) {
          setStories(storedStories);
        } else {
          setStories([]);
        }
      } catch {
        setStories([]);
      }
    }
  }, []);

  // Remove sample data generator - no longer needed

  const saveStories = async (storiesToSave: Story[]) => {
    try {
      await offlineStorage.storeData('srhr_stories', storiesToSave);
      setStories(storiesToSave);
    } catch (error) {
      console.error('Failed to save stories:', error);
    }
  };

  const filterAndSortStories = useCallback(() => {
    let filtered = stories.filter(story => story.isApproved);

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(story => story.category === selectedCategory);
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(story => story.language === selectedLanguage);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by anonymous only
    if (showAnonymousOnly) {
      filtered = filtered.filter(story => story.isAnonymous);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'most_liked':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    setFilteredStories(filtered);
  }, [stories, selectedCategory, selectedLanguage, searchTerm, showAnonymousOnly, sortBy]);

  const handleCreateStory = async () => {
    if (!newStory.title || !newStory.content) {
      alert('Please fill in title and content');
      return;
    }

    // Get the user's secret code for display
    const secretCode = secretCodeManager.getSecretCode();
    const authorDisplay = secretCode ? secretCode.code : 'Anonymous Youth';

    const story: Story = {
      id: Date.now().toString(),
      title: newStory.title,
      content: newStory.content,
      type: newStory.type,
      category: newStory.category as any,
      author: newStory.isAnonymous ? authorDisplay : authorDisplay,
      timestamp: new Date().toISOString(),
      likes: 0,
      isAnonymous: newStory.isAnonymous,
      isModerated: false,
      isApproved: false, // Stories need moderation
      tags: newStory.tags,
      language: newStory.language as any,
      ageGroup: newStory.ageGroup as any,
      location: newStory.location,
      audioUrl: recordedAudio || undefined
    };

    const updatedStories = [...stories, story];
    await saveStories(updatedStories);
    setShowCreateForm(false);
    setNewStory({
      title: '',
      content: '',
      type: 'text',
      category: 'general',
      isAnonymous: true,
      tags: [],
      language: 'english',
      ageGroup: '18-24',
      location: ''
    });
    setRecordedAudio(null);
  };

  const handleLikeStory = async (storyId: string) => {
    const updatedStories = stories.map(story =>
      story.id === storyId ? { ...story, likes: story.likes + 1 } : story
    );
    await saveStories(updatedStories);
  };

  const handleReportStory = async (storyId: string) => {
    if (window.confirm('Are you sure you want to report this story? It will be reviewed by moderators.')) {
      // In a real app, this would send a report to moderators
      alert('Story reported. Thank you for helping keep our community safe.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (audioUrl: string, storyId: string) => {
    if (isPlaying === storyId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(storyId);
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.play();
      audio.onended = () => setIsPlaying(null);
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleTagToggle = (tag: string) => {
    const tags = newStory.tags;
    const newTags = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag];
    setNewStory({ ...newStory, tags: newTags });
  };

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useEffect(() => {
    filterAndSortStories();
  }, [stories, selectedCategory, selectedLanguage, searchTerm, sortBy, showAnonymousOnly, filterAndSortStories]);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Share and learn from SRHR experiences</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center space-x-2 touch-target"
        >
          <Plus size={16} />
          <span className="text-sm sm:text-base">Share Story</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span className="font-medium text-purple-900 text-sm sm:text-base">Total Stories</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{stories.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="font-medium text-green-900 text-sm sm:text-base">Approved Stories</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {stories.filter(s => s.isApproved).length}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="font-medium text-blue-900 text-sm sm:text-base">Community Support</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {stories.reduce((sum, s) => sum + s.likes, 0)}
            </p>
          </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_liked">Most Liked</option>
            </select>
          </div>

          <div className="flex items-center sm:items-end">
            <label className="flex items-center space-x-2 touch-target">
              <input
                type="checkbox"
                checked={showAnonymousOnly}
                onChange={(e) => setShowAnonymousOnly(e.target.checked)}
                className="rounded w-4 h-4"
              />
              <span className="text-sm text-gray-700">Anonymous only</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search stories, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
            />
          </div>
        </div>
      </div>

      {/* Stories List - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-6">
        {filteredStories.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">Try adjusting your filters or be the first to share a story</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg mobile-btn"
            >
              Share Your Story
            </button>
          </div>
        ) : (
          filteredStories.map((story) => {
            const categoryInfo = getCategoryInfo(story.category);
            const CategoryIcon = categoryInfo.icon;
            
            return (
              <div key={story.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mobile-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-xl ${categoryInfo.color} flex-shrink-0`}>
                      <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <span>👤</span>
                          <span>{story.author}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>{formatDate(story.timestamp)}</span>
                        </span>
                        {story.location && (
                          <span className="flex items-center space-x-1">
                            <span>🌍</span>
                            <span>{story.location}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <span>🗣️</span>
                          <span>{languages.find(l => l.value === story.language)?.label}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>👥</span>
                          <span>{story.ageGroup}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleReportStory(story.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg touch-target"
                      title="Report story"
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base mobile-text-responsive">{story.content}</p>
                  
                  {story.type === 'audio' && story.audioUrl && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <button
                          onClick={() => playAudio(story.audioUrl!, story.id)}
                          className="p-2 sm:p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full touch-target"
                        >
                          {isPlaying === story.id ? <Pause size={16} className="sm:w-5 sm:h-5" /> : <Play size={16} className="sm:w-5 sm:h-5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm text-gray-600">Audio Story</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                            <div className="bg-purple-500 h-1.5 sm:h-2 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-16 sm:w-20"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-primary-50 text-primary-700 text-xs sm:text-sm rounded-full border border-primary-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLikeStory(story.id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-500 touch-target"
                    >
                      <Heart size={16} />
                      <span className="text-sm">{story.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Story Modal - Mobile Optimized */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 mobile-modal">
          <div className="bg-white rounded-t-lg sm:rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Share Your Story</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 touch-target p-2 -mr-2"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    placeholder="Give your story a title..."
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 touch-target">
                      <input
                        type="radio"
                        value="text"
                        checked={newStory.type === 'text'}
                        onChange={(e) => setNewStory({ ...newStory, type: e.target.value as any })}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm sm:text-base">Text</span>
                    </label>
                    <label className="flex items-center space-x-2 touch-target">
                      <input
                        type="radio"
                        value="audio"
                        checked={newStory.type === 'audio'}
                        onChange={(e) => setNewStory({ ...newStory, type: e.target.value as any })}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm sm:text-base">Audio</span>
                    </label>
                  </div>
                </div>

                {newStory.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Story *
                    </label>
                    <textarea
                      value={newStory.content}
                      onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                      placeholder="Share your experience, advice, or question..."
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
                      rows={6}
                    />
                  </div>
                )}

                {newStory.type === 'audio' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audio Recording
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                      {!recordedAudio ? (
                        <div>
                          <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4 text-sm sm:text-base">Record your story</p>
                          <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center space-x-2 mx-auto mobile-btn ${
                              isRecording ? 'bg-red-500 hover:bg-red-600' : ''
                            }`}
                          >
                            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                            <span className="text-sm sm:text-base">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-center space-x-4 mb-4">
                            <button
                              onClick={() => playAudio(recordedAudio, 'preview')}
                              className="p-2 sm:p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full touch-target"
                            >
                              {isPlaying === 'preview' ? <Pause size={16} className="sm:w-5 sm:h-5" /> : <Play size={16} className="sm:w-5 sm:h-5" />}
                            </button>
                            <span className="text-gray-600 text-sm sm:text-base">Audio recorded</span>
                          </div>
                          <button
                            onClick={() => setRecordedAudio(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 sm:py-2 rounded-lg mobile-btn"
                          >
                            Record Again
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newStory.category}
                      onChange={(e) => setNewStory({ ...newStory, category: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={newStory.language}
                      onChange={(e) => setNewStory({ ...newStory, language: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Group
                    </label>
                    <select
                      value={newStory.ageGroup}
                      onChange={(e) => setNewStory({ ...newStory, ageGroup: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
                    >
                      {ageGroups.map(group => (
                        <option key={group.value} value={group.value}>
                          {group.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <select
                      value={newStory.location}
                      onChange={(e) => setNewStory({ ...newStory, location: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile-input"
                    >
                      <option value="">Select Region/City</option>
                      {africanRegions.map(region => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm touch-target ${
                          newStory.tags.includes(tag)
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={newStory.isAnonymous}
                    onChange={(e) => setNewStory({ ...newStory, isAnonymous: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  <label htmlFor="isAnonymous" className="text-sm text-gray-700 touch-target">
                    Share anonymously (recommended)
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Community Guidelines</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Be respectful and supportive</li>
                        <li>• Share accurate information</li>
                        <li>• Respect others' privacy</li>
                        <li>• Stories are moderated before publication</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 sm:py-2 rounded-lg mobile-btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStory}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg mobile-btn"
                  >
                    Share Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorytellingPlatform;
