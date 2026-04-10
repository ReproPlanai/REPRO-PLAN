import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Download,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  FileText,
  Video,
  Headphones,
  ExternalLink,
  Bookmark,
  Share2,
  Sparkles,
  Library
} from 'lucide-react';
import { apiService } from '../services/api';
import PageContainer from '../components/Layout/PageContainer';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'link';
  category: string;
  tags: string[];
  url: string;
  fileSize?: string;
  duration?: string;
  downloadCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const ResourcesLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await apiService.getResources?.();
      if (response?.success) {
        setResources(response.resources);
      }
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-600" />;
      case 'audio':
        return <Headphones className="w-5 h-5 text-purple-600" />;
      case 'link':
        return <ExternalLink className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];
  const types = ['all', 'document', 'video', 'audio', 'link'];

  const featuredResources = resources.filter(r => r.isFeatured);

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
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resources Library</h1>
              <p className="text-xs sm:text-sm text-gray-500">Educational materials and guides</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredResources.slice(0, 3).map((resource) => (
                <div key={resource.id} className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-5 sm:p-6 rounded-2xl shadow-xl shadow-indigo-500/20">
                  <div className="flex items-start justify-between mb-4">
                    {getTypeIcon(resource.type)}
                    <Bookmark className="w-5 h-5 text-white/70" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">{resource.title}</h3>
                  <p className="text-sm text-indigo-100 line-clamp-2 mb-4">{resource.description}</p>
                  <button className="text-sm font-medium text-white/90 hover:text-white flex items-center gap-1">
                    View Resource <span className="text-lg">→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-200/60">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bookmark className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>

                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium">
                      {resource.category}
                    </span>
                    {resource.fileSize && <span className="text-xs">{resource.fileSize}</span>}
                    {resource.duration && <span className="text-xs">{resource.duration}</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {resource.downloadCount} downloads
                    </span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Access
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageContainer>
  );
};

export default ResourcesLibrary;
