import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Heart, 
  Shield, 
  Users, 
  MessageCircle, 
  Phone, 
  MapPin, 
  BookOpen, 
  Lock,
  Eye,
  CheckCircle,
  Info,
  ExternalLink,
  Search,
  Calendar
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';

interface InclusiveService {
  id: string;
  name: string;
  type: 'counseling' | 'medical' | 'support_group' | 'hotline' | 'education' | 'legal';
  description: string;
  services: string[];
  contact: string;
  location: string;
  hours: string;
  isAnonymous: boolean;
  isLGBTQFriendly: boolean;
  languages: string[];
  specialFeatures: string[];
  rating: number;
  isVerified: boolean;
  website?: string;
}

interface InclusiveResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'guide' | 'faq';
  content: string;
  category: 'health' | 'rights' | 'relationships' | 'safety' | 'mental_health';
  language: string;
  isAgeAppropriate: boolean;
  tags: string[];
}

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  meetingSchedule: string;
  location: string;
  isOnline: boolean;
  isAnonymous: boolean;
  ageGroup: string;
  focus: string[];
  contact: string;
  isActive: boolean;
}

const InclusiveYouthSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'resources' | 'support_groups' | 'safety'>('services');
  const [services, setServices] = useState<InclusiveService[]>([]);
  const [resources, setResources] = useState<InclusiveResource[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDiscreetMode, setShowDiscreetMode] = useState(false);

  const inclusiveServices: InclusiveService[] = useMemo(() => [
    {
      id: '1',
      name: 'Liberia Youth Health Network',
      description: 'Comprehensive SRHR services for all youth, including LGBTQ+ individuals',
      type: 'counseling',
      services: ['Confidential counseling', 'STI testing', 'Mental health support', 'Peer support groups'],
      contact: '+231-555-0301',
      location: 'Monrovia, Montserrado',
      hours: 'Mon-Sat: 9AM-6PM',
      isAnonymous: true,
      isLGBTQFriendly: true,
      languages: ['English', 'Liberian English'],
      specialFeatures: ['LGBTQ+ friendly', 'Confidential', 'Peer counselors', 'Free services'],
      rating: 4.8,
      isVerified: true,
      website: 'www.youthhealthnetwork.lr'
    },
    {
      id: '2',
      name: 'Safe Space Counseling Center',
      description: 'Dedicated counseling services for marginalized youth',
      type: 'counseling',
      services: ['Individual counseling', 'Group therapy', 'Crisis intervention', 'Family support'],
      contact: '+231-555-0302',
      location: 'Paynesville, Montrovia',
      hours: 'Mon-Fri: 8AM-5PM',
      isAnonymous: true,
      isLGBTQFriendly: true,
      languages: ['English', 'Liberian English', 'Bassa'],
      specialFeatures: ['LGBTQ+ affirming', 'Trauma-informed care', 'Sliding scale fees', 'Online sessions'],
      rating: 4.9,
      isVerified: true
    },
    {
      id: '3',
      name: 'Inclusive Health Clinic',
      description: 'Medical services with a focus on inclusive care',
      type: 'medical',
      services: ['STI testing and treatment', 'HIV prevention', 'Mental health screening', 'Hormone therapy'],
      contact: '+231-555-0303',
      location: 'Sinkor, Monrovia',
      hours: 'Mon-Fri: 8AM-4PM',
      isAnonymous: true,
      isLGBTQFriendly: true,
      languages: ['English', 'Liberian English'],
      specialFeatures: ['LGBTQ+ competent', 'Confidential', 'Free testing', 'PrEP available'],
      rating: 4.7,
      isVerified: true
    },
    {
      id: '4',
      name: 'Liberia LGBTQ+ Support Hotline',
      description: '24/7 confidential support for LGBTQ+ youth',
      type: 'hotline',
      services: ['Crisis support', 'Information and referrals', 'Peer counseling', 'Safety planning'],
      contact: '+231-555-0304',
      location: 'Nationwide',
      hours: '24/7',
      isAnonymous: true,
      isLGBTQFriendly: true,
      languages: ['English', 'Liberian English'],
      specialFeatures: ['24/7 availability', 'Anonymous', 'Crisis intervention', 'Peer support'],
      rating: 4.9,
      isVerified: true
    }
  ], []);

  const inclusiveResources: InclusiveResource[] = useMemo(() => [
    {
      id: '1',
      title: 'Understanding Your Identity',
      type: 'guide',
      content: 'A comprehensive guide to understanding sexual orientation and gender identity, written specifically for Liberian youth.',
      category: 'health',
      language: 'English',
      isAgeAppropriate: true,
      tags: ['identity', 'LGBTQ+', 'self-acceptance', 'coming out']
    },
    {
      id: '2',
      title: 'Safe Relationships for Everyone',
      type: 'article',
      content: 'Information about healthy relationships, consent, and communication for all types of relationships.',
      category: 'relationships',
      language: 'English',
      isAgeAppropriate: true,
      tags: ['relationships', 'consent', 'communication', 'safety']
    },
    {
      id: '3',
      title: 'Mental Health and Wellbeing',
      type: 'guide',
      content: 'Resources for maintaining mental health, dealing with stress, and finding support.',
      category: 'mental_health',
      language: 'English',
      isAgeAppropriate: true,
      tags: ['mental health', 'stress', 'anxiety', 'depression', 'support']
    },
    {
      id: '4',
      title: 'Your Rights and Legal Protections',
      type: 'article',
      content: 'Understanding your rights as a young person and where to find legal support if needed.',
      category: 'rights',
      language: 'English',
      isAgeAppropriate: true,
      tags: ['rights', 'legal', 'protection', 'discrimination']
    },
    {
      id: '5',
      title: 'STI Prevention and Testing',
      type: 'guide',
      content: 'Comprehensive information about STI prevention, testing, and treatment options.',
      category: 'health',
      language: 'English',
      isAgeAppropriate: true,
      tags: ['STI', 'prevention', 'testing', 'treatment', 'safe sex']
    }
  ], []);

  const sampleSupportGroups: SupportGroup[] = useMemo(() => [
    {
      id: '1',
      name: 'Liberia Youth Support Circle',
      description: 'A safe space for LGBTQ+ youth to connect, share experiences, and support each other',
      meetingSchedule: 'Every Saturday, 2PM-4PM',
      location: 'Monrovia Youth Center',
      isOnline: false,
      isAnonymous: true,
      ageGroup: '16-25',
      focus: ['Peer support', 'Identity exploration', 'Community building'],
      contact: '+231-555-0401',
      isActive: true
    },
    {
      id: '2',
      name: 'Online Support Group',
      description: 'Virtual support group for youth who cannot attend in-person meetings',
      meetingSchedule: 'Every Wednesday, 7PM-8PM',
      location: 'Online (Zoom)',
      isOnline: true,
      isAnonymous: true,
      ageGroup: '18-30',
      focus: ['Online support', 'Mental health', 'Peer connection'],
      contact: 'support@youthhealthnetwork.lr',
      isActive: true
    },
    {
      id: '3',
      name: 'Parents and Allies Group',
      description: 'Support group for parents, family members, and allies of LGBTQ+ youth',
      meetingSchedule: 'First Sunday of each month, 3PM-5PM',
      location: 'Community Center, Paynesville',
      isOnline: false,
      isAnonymous: false,
      ageGroup: 'All ages',
      focus: ['Family support', 'Education', 'Advocacy'],
      contact: '+231-555-0403',
      isActive: true
    }
  ], []);

  const categories = [
    { value: 'all', label: 'All Services', icon: Users },
    { value: 'counseling', label: 'Counseling', icon: MessageCircle },
    { value: 'medical', label: 'Medical', icon: Heart },
    { value: 'support_group', label: 'Support Groups', icon: Users },
    { value: 'hotline', label: 'Hotlines', icon: Phone },
    { value: 'education', label: 'Education', icon: BookOpen },
    { value: 'legal', label: 'Legal', icon: Shield }
  ];

  const loadData = useCallback(async () => {
    try {
      const [storedServices, storedResources, storedGroups] = await Promise.all([
        offlineStorage.getData('inclusive_services'),
        offlineStorage.getData('inclusive_resources'),
        offlineStorage.getData('support_groups')
      ]);

      setServices(storedServices || inclusiveServices);
      setResources(storedResources || inclusiveResources);
      setSupportGroups(storedGroups || sampleSupportGroups);

      // Store sample data if not exists
      if (!storedServices) await offlineStorage.storeData('inclusive_services', inclusiveServices);
      if (!storedResources) await offlineStorage.storeData('inclusive_resources', inclusiveResources);
      if (!storedGroups) await offlineStorage.storeData('support_groups', sampleSupportGroups);
    } catch (error) {
      console.error('Failed to load inclusive data:', error);
      setServices(inclusiveServices);
      setResources(inclusiveResources);
      setSupportGroups(sampleSupportGroups);
    }
  }, [inclusiveServices, inclusiveResources, sampleSupportGroups]);

  const getFilteredServices = () => {
    let filtered = services;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.type === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getFilteredResources = () => {
    let filtered = resources;
    
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getFilteredSupportGroups = () => {
    let filtered = supportGroups.filter(group => group.isActive);
    
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.focus.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWebsite = (website: string) => {
    window.open(`https://${website}`, '_blank');
  };




  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Discreet Mode Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowDiscreetMode(!showDiscreetMode)}
              className={`p-3 rounded-xl transition-colors ${
                showDiscreetMode 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              title={showDiscreetMode ? 'Exit discreet mode' : 'Enter discreet mode'}
            >
              {showDiscreetMode ? <Eye size={20} /> : <Lock size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-rainbow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-rainbow-600" />
                <span className="font-medium text-rainbow-900 text-sm sm:text-base">Inclusive Services</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-rainbow-600">{services.length}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="font-medium text-green-900 text-sm sm:text-base">Anonymous Access</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {services.filter(s => s.isAnonymous).length}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm sm:text-base">Resources</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{resources.length}</p>
            </div>
          </div>
      </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'services'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm sm:text-base">Services</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'resources'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm sm:text-base">Resources</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('support_groups')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'support_groups'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm sm:text-base">Support Groups</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'safety'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm sm:text-base">Safety</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search services, resources, or support groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            {activeTab === 'services' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field w-full"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {getFilteredServices().length > 0 ? (
              getFilteredServices().map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className="p-3 bg-rainbow-100 rounded-xl flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-rainbow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-3">{service.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin size={12} />
                            <span className="truncate">{service.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span className="truncate">{service.hours}</span>
                          </div>
                          {service.isAnonymous && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Anonymous
                            </span>
                          )}
                          {service.isLGBTQFriendly && (
                            <span className="px-2 py-1 bg-rainbow-100 text-rainbow-700 text-xs rounded-full">
                              LGBTQ+ Friendly
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Services Offered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.services.map((serviceItem, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-200"
                        >
                          {serviceItem}
                        </span>
                      ))}
                    </div>
                  </div>

                  {service.specialFeatures.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Special Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.specialFeatures.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        onClick={() => handleCall(service.contact)}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2 text-sm"
                      >
                        <Phone size={14} />
                        <span>Call Now</span>
                      </button>
                      {service.website && (
                        <button
                          onClick={() => handleWebsite(service.website!)}
                          className="flex-1 btn-outline flex items-center justify-center space-x-2 text-sm"
                        >
                          <ExternalLink size={14} />
                          <span>Website</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
            ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          {getFilteredResources().length > 0 ? (
            getFilteredResources().map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 mb-3">{resource.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'support_groups' && (
        <div className="space-y-6">
          {getFilteredSupportGroups().length > 0 ? (
            getFilteredSupportGroups().map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                      <p className="text-gray-600 mb-3">{group.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{group.meetingSchedule}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{group.location}</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {group.ageGroup}
                        </span>
                        {group.isAnonymous && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Anonymous
                          </span>
                        )}
                        {group.isOnline && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Focus Areas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.focus.map((focus, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-200"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => handleCall(group.contact)}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <Phone size={16} />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No support groups found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Safety Information</h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Emergency Contacts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-red-800">LGBTQ+ Support Hotline</span>
                        <button
                          onClick={() => handleCall('+231-555-0304')}
                          className="text-red-600 font-bold hover:underline"
                        >
                          +231-555-0304
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-800">Crisis Support</span>
                        <button
                          onClick={() => handleCall('+231-555-9999')}
                          className="text-red-600 font-bold hover:underline"
                        >
                          +231-555-9999
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Safety Tips</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Trust your instincts - if something doesn't feel right, leave</li>
                      <li>• All services are confidential and anonymous</li>
                      <li>• You have the right to be treated with respect</li>
                      <li>• Keep emergency numbers saved in your phone</li>
                      <li>• Consider using discreet mode when browsing</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Your Rights</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Right to privacy and confidentiality</li>
                      <li>• Right to respectful, non-discriminatory care</li>
                      <li>• Right to access appropriate health services</li>
                      <li>• Right to make your own decisions about your body</li>
                      <li>• Right to support and community</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
};

export default InclusiveYouthSupport;
