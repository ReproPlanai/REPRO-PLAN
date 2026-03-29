import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Shield, 
  Users, 
  Phone, 
  MapPin, 
  BookOpen,
  Search,
  Calendar,
  ExternalLink,
  Info,
  CheckCircle,
  Sparkles,
  Eye,
  Lock,
  MessageCircle
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';
import { apiService } from '../../services/api';
import PageContainer from '../Layout/PageContainer';

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

  const categories = [
    { value: 'all', label: 'All Services', icon: Users },
    { value: 'counseling', label: 'Counseling', icon: MessageCircle },
    { value: 'medical', label: 'Medical', icon: Heart },
    { value: 'support_group', label: 'Support Groups', icon: Users },
    { value: 'hotline', label: 'Hotlines', icon: Phone },
    { value: 'education', label: 'Education', icon: BookOpen },
    { value: 'legal', label: 'Legal', icon: Shield }
  ];

  // Fetch data from API instead of using sample data
  const loadData = useCallback(async () => {
    try {
      // Fetch from API first
      const [servicesResponse, resourcesResponse, groupsResponse] = await Promise.all([
        apiService.getClinics?.() as Promise<{ success?: boolean; clinics?: InclusiveService[] }>,
        apiService.getResources?.() as Promise<{ success?: boolean; resources?: InclusiveResource[] }>,
        apiService.getSupportGroups?.() as Promise<{ success?: boolean; groups?: SupportGroup[] }>
      ]);

      if (servicesResponse?.success && servicesResponse.clinics) {
        setServices(servicesResponse.clinics);
        await offlineStorage.storeData('inclusive_services', servicesResponse.clinics);
      } else {
        const storedServices = await offlineStorage.getData('inclusive_services');
        setServices(storedServices || []);
      }

      if (resourcesResponse?.success && resourcesResponse.resources) {
        setResources(resourcesResponse.resources);
        await offlineStorage.storeData('inclusive_resources', resourcesResponse.resources);
      } else {
        const storedResources = await offlineStorage.getData('inclusive_resources');
        setResources(storedResources || []);
      }

      if (groupsResponse?.success && groupsResponse.groups) {
        setSupportGroups(groupsResponse.groups);
        await offlineStorage.storeData('support_groups', groupsResponse.groups);
      } else {
        const storedGroups = await offlineStorage.getData('support_groups');
        setSupportGroups(storedGroups || []);
      }
    } catch (error) {
      console.error('Failed to load inclusive data:', error);
      // Fallback to offline storage on error
      const [storedServices, storedResources, storedGroups] = await Promise.all([
        offlineStorage.getData('inclusive_services'),
        offlineStorage.getData('inclusive_resources'),
        offlineStorage.getData('support_groups')
      ]);
      setServices(storedServices || []);
      setResources(storedResources || []);
      setSupportGroups(storedGroups || []);
    }
  }, []);

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
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Support</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Inclusive Youth Support</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Find LGBTQ+ friendly services, support groups, and resources tailored to your needs. Safe, confidential, and judgment-free.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Phone, title: '24/7', desc: 'Hotlines', color: 'from-red-500 to-pink-500' },
            { icon: Users, title: `${services.length}`, desc: 'Services', color: 'from-purple-500 to-indigo-500' },
            { icon: BookOpen, title: `${resources.length}`, desc: 'Resources', color: 'from-blue-500 to-cyan-500' }
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

        {/* Discreet Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowDiscreetMode(!showDiscreetMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              showDiscreetMode 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showDiscreetMode ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {showDiscreetMode ? 'Discreet Mode On' : 'Discreet Mode'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-1 mb-6">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'services', icon: Phone, label: 'Services' },
              { id: 'support_groups', icon: Users, label: 'Groups' },
              { id: 'resources', icon: BookOpen, label: 'Resources' },
              { id: 'safety', icon: Shield, label: 'Safety' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search services, resources, or support groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {activeTab === 'services' && (
            <div className="mt-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full sm:w-auto"
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

        {/* Tab Content */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* ... */}
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
                          onClick={() => handleCall('+233-24-555-0304')}
                          className="text-red-600 font-bold hover:underline"
                        >
                          +233-24-555-0304
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-800">Crisis Support</span>
                        <button
                          onClick={() => handleCall('+233-24-555-9999')}
                          className="text-red-600 font-bold hover:underline"
                        >
                          +233-24-555-9999
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
    </main>
  </PageContainer>
  );
};

export default InclusiveYouthSupport;
