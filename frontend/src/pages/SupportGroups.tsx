import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Calendar,
  MapPin,
  Heart,
  Users2
} from 'lucide-react';
import { apiService } from '../services/api';
import PageContainer from '../components/Layout/PageContainer';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  meetingSchedule: {
    day: string;
    time: string;
    location: string;
  };
  facilitators: string[];
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  tags: string[];
  created_at: string;
}

const SupportGroups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showJoinModal, setShowJoinModal] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSupportGroups?.();
      if (response?.success) {
        setGroups(response.groups);
      }
    } catch (err) {
      setError('Failed to load support groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      const response = await apiService.joinSupportGroup?.(groupId);
      if (response?.success) {
        setGroups(groups.map(g => 
          g.id === groupId ? { ...g, memberCount: g.memberCount + 1 } : g
        ));
        setShowJoinModal(null);
      }
    } catch (err) {
      setError('Failed to join group');
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(groups.map(g => g.category)))];

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-purple-50/20"
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
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Groups</h1>
              <p className="text-xs sm:text-sm text-gray-500">Connect with others and find support</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search support groups..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-200/60">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No support groups found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                      <Heart className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">{group.meetingSchedule.day}s at {group.meetingSchedule.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">{group.meetingSchedule.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">{group.memberCount} / {group.maxMembers} members</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowJoinModal(group.id)}
                    disabled={!group.isActive || group.memberCount >= group.maxMembers}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Join Support Group</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to join this support group? You'll be able to participate in meetings and connect with other members.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoinModal(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleJoin(showJoinModal)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  Join Group
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageContainer>
  );
};

export default SupportGroups;
