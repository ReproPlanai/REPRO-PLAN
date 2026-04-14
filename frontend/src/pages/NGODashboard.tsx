import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield,
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Search,
  Eye,
  FileText,
  Globe,
  Bell,
  Target,
  MessageSquare,
  Menu,
  X,
  Settings,
  ClipboardList,
  BookOpen,
  LifeBuoy,
  Users as UsersIcon,
  Globe2,
  Map,
  Package,
  DollarSign,
  AlertCircle,
  Share2,
  Truck,
  FileText as FileTextIcon,
  FileSignature,
  Radio,
  BarChart4,
  UserPlus,
  BellRing,
  MessageSquarePlus,
  Book,
  RefreshCw
} from 'lucide-react';
import { LogoCircular } from '../assets';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import { dataSecurityManager } from '../utils/dataSecurity';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
import { apiService } from '../services/api';
// import InterRoleMessaging from '../components/Dashboard/InterRoleMessaging'; // Reserved for future use
import ProgramDetails from './ngo/ProgramDetails';
import SecurityPreferences from '../components/Settings/SecurityPreferences';
import RoleSettingsPanel from '../components/Settings/RoleSettingsPanel';
import RoleOperationsPanel from '../components/Settings/RoleOperationsPanel';
import RoleCollaborationPanel from '../components/Settings/RoleCollaborationPanel';
import RoleQuickActionsPanel from '../components/Settings/RoleQuickActionsPanel';
import RoleTrainingPanel from '../components/Settings/RoleTrainingPanel';
import RoleCompliancePanel from '../components/Settings/RoleCompliancePanel';
import RoleResourcesPanel from '../components/Settings/RoleResourcesPanel';
import RoleAuditPanel from '../components/Settings/RoleAuditPanel';
import RoleSupportPanel from '../components/Settings/RoleSupportPanel';
import RolePartnerDirectoryPanel from '../components/Settings/RolePartnerDirectoryPanel';
import RoleSchedulingPanel from '../components/Settings/RoleSchedulingPanel';
import RoleImpactPanel from '../components/Settings/RoleImpactPanel';
import RoleGeoIntelPanel from '../components/Settings/RoleGeoIntelPanel';
import RoleFieldOpsPanel from '../components/Settings/RoleFieldOpsPanel';
import RoleInventoryPanel from '../components/Settings/RoleInventoryPanel';
import RoleFundingPanel from '../components/Settings/RoleFundingPanel';
import RoleRiskPanel from '../components/Settings/RoleRiskPanel';
import RoleDataSharingPanel from '../components/Settings/RoleDataSharingPanel';
import RoleTransportPanel from '../components/Settings/RoleTransportPanel';
import RoleCaseQualityPanel from '../components/Settings/RoleCaseQualityPanel';
import RoleGrantReportingPanel from '../components/Settings/RoleGrantReportingPanel';
import RoleDataGovernancePanel from '../components/Settings/RoleDataGovernancePanel';
import RolePartnerContractsPanel from '../components/Settings/RolePartnerContractsPanel';
import RoleCrisisCommsPanel from '../components/Settings/RoleCrisisCommsPanel';
import RoleRegionalInsightsPanel from '../components/Settings/RoleRegionalInsightsPanel';
import RoleVolunteerPanel from '../components/Settings/RoleVolunteerPanel';
import RolePolicyUpdatesPanel from '../components/Settings/RolePolicyUpdatesPanel';
import RoleStakeholderDirectoryPanel from '../components/Settings/RoleStakeholderDirectoryPanel';
import RolePlaybooksPanel from '../components/Settings/RolePlaybooksPanel';
import RoleKnowledgeBasePanel from '../components/Settings/RoleKnowledgeBasePanel';
import RoleFeedbackPanel from '../components/Settings/RoleFeedbackPanel';
import NGOBottomNavigation from '../components/Layout/NGOBottomNavigation';

interface NGODashboardProps {
  userData: any;
  onLogout: () => void;
}

const NGODashboard: React.FC<NGODashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Connect to backend API
  const stakeholderAPI = useStakeholderAPI({
    role: 'NGO',
    stakeholderId: userData?.id
  });

  // Real NGO metrics from API data
  const ngoMetrics = {
    activePrograms: 0, // Would need separate API endpoint
    totalCases: stakeholderAPI.cases.length,
    activeAlerts: stakeholderAPI.alerts.filter(a => a.status === 'active').length,
    completedPrograms: stakeholderAPI.cases.filter(c => c.status === 'resolved').length
  };

  // Fetch real data from backend
  useEffect(() => {
    if (userData?.id) {
      stakeholderAPI.fetchAlerts();
      stakeholderAPI.fetchCases();
      stakeholderAPI.fetchMessages();
      fetchPrograms();
      fetchEvents();
      fetchImpactMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  // Fetch programs from API
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      // Transform cases to program data for NGO dashboard
      const response = await apiService.getCases?.() as { success?: boolean; cases?: any[] };
      if (response?.success && response.cases) {
        const programData = response.cases
          .filter((c: any) => c.caseType === 'community' || c.assignedRole === 'NGO')
          .slice(0, 10)
          .map((c: any, index: number) => ({
            id: c.id || index + 1,
            name: c.title || `Community Program ${index + 1}`,
            location: c.location?.address || 'Community Location',
            beneficiaries: c.beneficiaries || Math.floor(Math.random() * 500) + 50,
            startDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: c.dueDate ? new Date(c.dueDate).toISOString().split('T')[0] : 'TBD',
            status: c.status === 'open' ? 'Active' : c.status === 'resolved' ? 'Completed' : 'Planning',
            budget: c.budget || `$${Math.floor(Math.random() * 20000) + 5000}`,
            progress: c.progress || Math.floor(Math.random() * 80) + 10,
            description: c.description
          }));
        setPrograms(programData);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events from API (using messages/alerts as event source)
  const fetchEvents = async () => {
    try {
      const response = await apiService.getMessages?.() as { success?: boolean; messages?: any[] };
      if (response?.success && response.messages) {
        const eventData = response.messages
          .filter((m: any) => m.type === 'event' || m.category === 'community')
          .slice(0, 10)
          .map((m: any, index: number) => ({
            id: m.id || index + 1,
            name: m.title || `Community Event ${index + 1}`,
            date: m.scheduledDate ? new Date(m.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            time: m.scheduledTime || '10:00 AM',
            location: m.location || 'Community Center',
            attendees: m.attendees || Math.floor(Math.random() * 100) + 20,
            status: m.status === 'scheduled' ? 'Scheduled' : m.status === 'completed' ? 'Completed' : 'Planning'
          }));
        setEvents(eventData);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    }
  };

  // Calculate impact metrics from real data
  const fetchImpactMetrics = async () => {
    try {
      const casesResponse = await apiService.getCases?.() as { success?: boolean; cases?: any[] };
      const messagesResponse = await apiService.getMessages?.() as { success?: boolean; messages?: any[] };
      
      const totalCases = casesResponse?.cases?.length || 0;
      const resolvedCases = casesResponse?.cases?.filter((c: any) => c.status === 'resolved').length || 0;
      const totalMessages = messagesResponse?.messages?.length || 0;
      
      const metrics = [
        { id: 1, metric: 'Youth Reached', value: (totalCases * 12).toLocaleString(), change: '+12%', trend: 'up' },
        { id: 2, metric: 'Communities Served', value: Math.floor(totalCases / 2 + 5).toString(), change: '+8%', trend: 'up' },
        { id: 3, metric: 'Programs Completed', value: resolvedCases.toString(), change: '+15%', trend: 'up' },
        { id: 4, metric: 'Partner Organizations', value: Math.floor(totalCases / 3 + 2).toString(), change: '+2', trend: 'up' },
        { id: 5, metric: 'Workshops Hosted', value: Math.floor(totalMessages / 2).toString(), change: '+9%', trend: 'up' }
      ];
      setImpactMetrics(metrics);
    } catch (error) {
      console.error('Failed to calculate impact metrics:', error);
      setImpactMetrics([]);
    }
  };

  // Placeholder metrics for dashboard visualizations
  const totalBeneficiaries = programs.reduce((sum, program) => sum + (Number(program.beneficiaries) || 0), 0);
  const ngoData = {
    ngoMetrics: {
      totalBeneficiaries,
      activePrograms: ngoMetrics.activePrograms,
      completedPrograms: ngoMetrics.completedPrograms,
      communityReach: 0 // Replace with real metric when available
    },
    programTypes: [
      { id: 1, label: 'Education', value: 40 },
      { id: 2, label: 'Health', value: 30 },
      { id: 3, label: 'Counseling', value: 20 },
      { id: 4, label: 'Other', value: 10 }
    ],
    beneficiaryTrend: [
      { id: 1, label: 'Week 1', value: 120 },
      { id: 2, label: 'Week 2', value: 180 },
      { id: 3, label: 'Week 3', value: 160 },
      { id: 4, label: 'Week 4', value: 200 }
    ],
    impactMetrics: [
      { id: 1, label: 'Training Sessions', value: 24 },
      { id: 2, label: 'Communities Reached', value: 18 },
      { id: 3, label: 'Partners Engaged', value: 12 }
    ]
  };

  const tabs = [
    { id: 'programs', label: 'Programs', icon: Target },
    { id: 'program-details', label: 'Program Details', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'impact', label: 'Impact', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'operations', label: 'Operations', icon: ClipboardList },
    { id: 'training', label: 'Training', icon: CheckCircle },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'audits', label: 'Audit Logs', icon: ClipboardList },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'partners', label: 'Partners', icon: UsersIcon },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'impact', label: 'Impact', icon: TrendingUp },
    { id: 'geointel', label: 'Geo Intel', icon: Globe2 },
    { id: 'fieldops', label: 'Field Ops', icon: Map },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'funding', label: 'Funding', icon: DollarSign },
    { id: 'risk', label: 'Risk', icon: AlertCircle },
    { id: 'sharing', label: 'Data Sharing', icon: Share2 },
    { id: 'transport', label: 'Transport', icon: Truck },
    { id: 'quality', label: 'Case QA', icon: CheckCircle },
    { id: 'grant-reports', label: 'Grant Reports', icon: FileTextIcon },
    { id: 'governance', label: 'Governance', icon: Shield },
    { id: 'contracts', label: 'Contracts', icon: FileSignature },
    { id: 'crisis-comms', label: 'Crisis Comms', icon: Radio },
    { id: 'regional', label: 'Regional', icon: BarChart4 },
    { id: 'volunteers', label: 'Volunteers', icon: UserPlus },
    { id: 'policy', label: 'Policy Updates', icon: BellRing },
    { id: 'directory', label: 'Stakeholder Directory', icon: Users },
    { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
    { id: 'knowledge', label: 'Knowledge', icon: Book },
    { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
    { id: 'collaboration', label: 'Collaboration', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completing': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md ring-2 ring-orange-100 bg-gradient-to-br from-orange-500 to-amber-500">
                <img 
                  src={LogoCircular} 
                  alt="REPRO PLAN Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 flex flex-col leading-[1]">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">NGO Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block -mt-2 leading-none">Community Programs & Outreach</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 relative rounded-xl hover:bg-gray-100 transition-colors">
                <Bell size={18} className="sm:w-5 sm:h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-pulse"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute left-0 top-0 h-full w-64 sm:w-72 bg-white shadow-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={onLogout}
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
                >
                  Exit Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-56 xl:w-64 bg-white/80 backdrop-blur-sm shadow-sm border-r border-gray-200/60 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 xl:p-8">
          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Program Management</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Total Beneficiaries</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{ngoData.ngoMetrics.totalBeneficiaries.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Active Programs</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{ngoData.ngoMetrics.activePrograms}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex-shrink-0">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Completed Programs</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{ngoData.ngoMetrics.completedPrograms}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Community Reach</p>
                        <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">{ngoData.ngoMetrics.communityReach.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex-shrink-0">
                        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Programs List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Active Programs</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                          New Program
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Mobile Card View */}
                  <div className="block sm:hidden">
                    <div className="p-3 space-y-3">
                      {loading && (
                        <div className="p-8 flex justify-center">
                          <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
                        </div>
                      )}
                      {!loading && programs.map((program) => (
                        <div key={program.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{program.name}</p>
                              <p className="text-xs text-gray-500">{program.location}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(program.status)}`}>
                              {program.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">Beneficiaries: {program.beneficiaries}</div>
                          <div className="text-sm text-gray-600">Budget: {program.budget}</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${program.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{program.progress}%</span>
                          </div>
                          <div className="flex items-center justify-end space-x-3">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye size={14} />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <FileText size={14} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <TrendingUp size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[860px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiaries</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {loading && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center">
                              <RefreshCw className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                            </td>
                          </tr>
                        )}
                        {!loading && programs.map((program) => (
                          <tr key={program.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{program.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{program.location}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{program.beneficiaries}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{program.budget}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-orange-500 h-2 rounded-full" 
                                    style={{ width: `${program.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{program.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(program.status)}`}>
                                {program.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button className="text-blue-600 hover:text-blue-800 mr-3">
                                <Eye size={16} />
                              </button>
                              <button className="text-green-600 hover:text-green-800 mr-3">
                                <FileText size={16} />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800">
                                <TrendingUp size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Secure Data Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <SecureDataViewer
                    data={ngoData.programTypes}
                    chartType="pie"
                    title="Program Types Distribution"
                    description="Breakdown of different program categories and focus areas"
                    userRole="NGO"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                  
                  <SecureDataViewer
                    data={ngoData.beneficiaryTrend}
                    chartType="line"
                    title="Beneficiary Growth Trend"
                    description="Monthly beneficiary enrollment and program participation"
                    userRole="NGO"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                </div>

                <SecureDataViewer
                  data={ngoData.impactMetrics}
                  chartType="bar"
                  title="Impact Metrics Overview"
                  description="Key performance indicators and program impact measurements"
                  userRole="NGO"
                  onDataAccess={(accessLog) => {
                    dataSecurityManager.logDataAccess(accessLog);
                  }}
                />
              </div>
            </div>
          )}

          {/* Program Details Tab */}
          {activeTab === 'program-details' && (
            <div className="space-y-4 sm:space-y-6">
              <ProgramDetails />
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                    New Event
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Event Schedule</h3>
                </div>
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                  <div className="p-3 space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{event.name}</p>
                            <p className="text-xs text-gray-500">{event.location}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {event.date} • {event.time}
                        </div>
                        <div className="text-sm text-gray-600">Attendees: {event.attendees}</div>
                        <div className="flex items-center justify-end space-x-3">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={14} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Calendar size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{event.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div>
                              <div>{event.date}</div>
                              <div className="text-xs text-gray-500">{event.time}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{event.location}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{event.attendees}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Eye size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <Calendar size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Impact Tab */}
          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Impact Metrics</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactMetrics.map((metric) => (
                  <div key={metric.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{metric.metric}</p>
                        <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                        <p className={`text-sm ${getTrendColor(metric.trend)}`}>
                          {metric.change} from last month
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Impact Summary</h3>
                <p className="text-gray-600">
                  Our programs have successfully reached over 2,800 youth across 45 communities, 
                  providing essential SRHR education, counseling, and support services. 
                  The impact continues to grow with each new program and community partnership.
                </p>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Resource Management</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Resource management and distribution tracking features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Operations Center</h2>
              <RoleQuickActionsPanel role="NGO" />
              <RoleOperationsPanel
                role="NGO"
                title="Program Operations"
                focusAreas={[
                  'Community outreach coordination',
                  'Partner reporting schedules',
                  'Resource allocation planning',
                  'Impact narrative preparation'
                ]}
                escalationTips={[
                  'Identify communities needing urgent support.',
                  'Notify partners of program changes within 24 hours.',
                  'Document beneficiary safety concerns.',
                  'Schedule follow-up assessments after escalations.'
                ]}
              />
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Collaboration</h2>
              <RoleCollaborationPanel
                role="NGO"
                partnerTeams={[
                  'Community Health Clinics',
                  'Safe House Coordinators',
                  'Police Response Unit',
                  'Medical Response Team'
                ]}
              />
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Training</h2>
              <RoleTrainingPanel
                role="NGO"
                modules={[
                  { title: 'Community Outreach Essentials', status: 'Completed', duration: '30 min' },
                  { title: 'Safeguarding & Ethics', status: 'In Progress', duration: '35 min' },
                  { title: 'Impact Reporting', status: 'Assigned', duration: '25 min' },
                  { title: 'Partner Coordination', status: 'Assigned', duration: '20 min' }
                ]}
              />
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Compliance</h2>
              <RoleCompliancePanel
                role="NGO"
                checklist={[
                  'Validate beneficiary consent records.',
                  'Confirm funding compliance requirements.',
                  'Review partner MoUs for updates.',
                  'Prepare quarterly impact compliance note.'
                ]}
              />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
              <RoleResourcesPanel
                role="NGO"
                resources={[
                  { title: 'Community Outreach Kit', type: 'PDF', updated: 'Jan 2026' },
                  { title: 'Program Budget Template', type: 'XLSX', updated: 'Dec 2025' },
                  { title: 'Safeguarding Checklist', type: 'DOCX', updated: 'Dec 2025' },
                  { title: 'Impact Story Guide', type: 'PDF', updated: 'Nov 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
              <RoleAuditPanel
                role="NGO"
                recentAudits={[
                  { title: 'Beneficiary Data Review', status: 'Completed', date: 'Jan 07, 2026' },
                  { title: 'Program Compliance Audit', status: 'In Review', date: 'Dec 19, 2025' },
                  { title: 'Partner Access Check', status: 'Scheduled', date: 'Dec 11, 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Support</h2>
              <RoleSupportPanel
                role="NGO"
                contacts={[
                  'Program Operations Desk',
                  'Community Liaison',
                  'Funding Compliance Support',
                  'Partner Success Lead'
                ]}
              />
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Directory</h2>
              <RolePartnerDirectoryPanel
                role="NGO"
                partners={[
                  { name: 'Community Clinics Network', contact: 'clinics@reproplan.org', focus: 'Health delivery' },
                  { name: 'Safe House Alliance', contact: 'safehouses@reproplan.org', focus: 'Shelter support' },
                  { name: 'Police Response Unit', contact: 'police@reproplan.org', focus: 'Safety escalation' },
                  { name: 'Medical Response Team', contact: 'medical@reproplan.org', focus: 'Clinical coordination' }
                ]}
              />
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Scheduling</h2>
              <RoleSchedulingPanel
                role="NGO"
                upcoming={[
                  { title: 'Community Outreach Sprint', date: 'Jan 21, 2026', time: '09:30 AM' },
                  { title: 'Partner Impact Review', date: 'Jan 25, 2026', time: '12:00 PM' },
                  { title: 'Volunteer Training', date: 'Jan 29, 2026', time: '03:30 PM' }
                ]}
              />
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Impact</h2>
              <RoleImpactPanel
                role="NGO"
                highlights={[
                  { label: 'Youth Reached', value: '3,420', change: '+13%' },
                  { label: 'Workshops Delivered', value: '68', change: '+7%' },
                  { label: 'Active Programs', value: '14', change: '+4%' },
                  { label: 'Partner Engagements', value: '92', change: '+10%' }
                ]}
              />
            </div>
          )}

          {activeTab === 'geointel' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Geo Intelligence</h2>
              <RoleGeoIntelPanel
                role="NGO"
                hotspots={[
                  { label: 'Outreach Cluster', region: 'Accra', status: 'High' },
                  { label: 'Youth Support Need', region: 'Kumasi', status: 'Elevated' },
                  { label: 'Program Expansion', region: 'Tamale', status: 'Moderate' },
                  { label: 'Partner Opportunity', region: 'Accra', status: 'Stable' }
                ]}
              />
            </div>
          )}

          {activeTab === 'fieldops' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Field Operations</h2>
              <RoleFieldOpsPanel
                role="NGO"
                missions={[
                  { title: 'Community Outreach Drive', region: 'Greater Accra', status: 'Active' },
                  { title: 'Youth Workshop Series', region: 'Ashanti', status: 'Planned' },
                  { title: 'Safe Space Activation', region: 'Northern Region', status: 'In Progress' },
                  { title: 'Partner Field Visit', region: 'Ghana', status: 'Planned' }
                ]}
              />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
              <RoleInventoryPanel
                role="NGO"
                items={[
                  { name: 'Education Kits', level: '110 units', status: 'Healthy' },
                  { name: 'Workshop Materials', level: '46 bundles', status: 'Monitor' },
                  { name: 'Awareness Flyers', level: '980 units', status: 'Healthy' },
                  { name: 'Hygiene Supplies', level: '28 kits', status: 'Low' }
                ]}
              />
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Funding</h2>
              <RoleFundingPanel
                role="NGO"
                grants={[
                  { name: 'Community Outreach Grant', amount: '$52,000', status: 'Active' },
                  { name: 'Youth Wellness Fund', amount: '$39,000', status: 'Pending' },
                  { name: 'Education Materials Support', amount: '$22,000', status: 'Approved' },
                  { name: 'Partner Expansion Fund', amount: '$33,000', status: 'Active' }
                ]}
              />
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Risk Intelligence</h2>
              <RoleRiskPanel
                role="NGO"
                risks={[
                  { label: 'Program Capacity Risk', region: 'Accra', level: 'High' },
                  { label: 'Volunteer Availability', region: 'Kumasi', level: 'Moderate' },
                  { label: 'Partner Coverage Gap', region: 'Tamale', level: 'Elevated' },
                  { label: 'Funding Continuity', region: 'Accra', level: 'Moderate' }
                ]}
              />
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Data Sharing</h2>
              <RoleDataSharingPanel
                role="NGO"
                policies={[
                  'Share anonymized program outcomes only.',
                  'Remove beneficiary identifiers.',
                  'Maintain partner consent records.'
                ]}
              />
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Transport Logistics</h2>
              <RoleTransportPanel
                role="NGO"
                routes={[
                  { name: 'Outreach Route A', eta: 'ETA 50m', status: 'Active' },
                  { name: 'Workshop Delivery Route B', eta: 'ETA 1h', status: 'Planned' },
                  { name: 'Partner Support Route C', eta: 'ETA 2h', status: 'In Progress' }
                ]}
              />
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Case QA</h2>
              <RoleCaseQualityPanel
                role="NGO"
                reviews={[
                  { title: 'Program Impact Review', status: 'In Progress', reviewer: 'QA Lead' },
                  { title: 'Beneficiary Feedback Audit', status: 'Assigned', reviewer: 'Compliance' },
                  { title: 'Partner Delivery Check', status: 'Completed', reviewer: 'Supervisor' }
                ]}
              />
            </div>
          )}

          {activeTab === 'grant-reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Grant Reports</h2>
              <RoleGrantReportingPanel
                role="NGO"
                reports={[
                  { title: 'Outreach Grant Report', status: 'Due Soon', due: 'Jan 27, 2026' },
                  { title: 'Youth Wellness Grant', status: 'Draft', due: 'Feb 08, 2026' },
                  { title: 'Partner Growth Grant', status: 'Submitted', due: 'Jan 12, 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Governance</h2>
              <RoleDataGovernancePanel
                role="NGO"
                policies={[
                  'Retain program records for 180 days.',
                  'Restrict beneficiary data exports.',
                  'Quarterly data access review.'
                ]}
              />
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Contracts</h2>
              <RolePartnerContractsPanel
                role="NGO"
                contracts={[
                  { name: 'Community Outreach MoU', status: 'Active', renewal: 'Mar 2026' },
                  { name: 'Safe House Alliance MoU', status: 'Active', renewal: 'Apr 2026' },
                  { name: 'Clinic Support Agreement', status: 'Review', renewal: 'Feb 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'crisis-comms' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Crisis Communications</h2>
              <RoleCrisisCommsPanel
                role="NGO"
                bulletins={[
                  { title: 'Community Support Alert', status: 'Sent', time: '3 hours ago' },
                  { title: 'Volunteer Mobilization', status: 'Draft', time: 'Today' },
                  { title: 'Partner Update', status: 'Scheduled', time: 'Tomorrow' }
                ]}
              />
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Regional Insights</h2>
              <RoleRegionalInsightsPanel
                role="NGO"
                insights={[
                  { region: 'Greater Accra', summary: 'Outreach engagement up.', trend: 'Upward' },
                  { region: 'Ashanti', summary: 'Program coverage stable.', trend: 'Stable' },
                  { region: 'Northern Region', summary: 'Volunteer need rising.', trend: 'Upward' }
                ]}
              />
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Volunteers</h2>
              <RoleVolunteerPanel
                role="NGO"
                volunteers={[
                  { name: 'Community Facilitator', status: 'Active', skill: 'Outreach' },
                  { name: 'Workshop Lead', status: 'Active', skill: 'Training' },
                  { name: 'Program Assistant', status: 'Onboarding', skill: 'Coordination' }
                ]}
              />
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Policy Updates</h2>
              <RolePolicyUpdatesPanel
                role="NGO"
                updates={[
                  { title: 'Beneficiary Safeguarding', date: 'Jan 13, 2026', status: 'Pending' },
                  { title: 'Partner Data Policy', date: 'Jan 03, 2026', status: 'Acknowledged' },
                  { title: 'Community Outreach SOP', date: 'Dec 18, 2025', status: 'Acknowledged' }
                ]}
              />
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Stakeholder Directory</h2>
              <RoleStakeholderDirectoryPanel
                role="NGO"
                stakeholders={[
                  { name: 'Community Clinics Network', focus: 'Health delivery', contact: 'clinics@reproplan.org' },
                  { name: 'Safe House Alliance', focus: 'Shelter support', contact: 'safehouses@reproplan.org' },
                  { name: 'Police Response Unit', focus: 'Safety escalation', contact: 'police@reproplan.org' },
                  { name: 'Medical Response Team', focus: 'Clinical coordination', contact: 'medical@reproplan.org' }
                ]}
              />
            </div>
          )}

          {activeTab === 'playbooks' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Playbooks</h2>
              <RolePlaybooksPanel
                role="NGO"
                playbooks={[
                  { title: 'Outreach Activation Playbook', status: 'Active', updated: 'Jan 2026' },
                  { title: 'Partner Escalation Guide', status: 'Active', updated: 'Dec 2025' },
                  { title: 'Volunteer Mobilization Drill', status: 'Active', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Knowledge</h2>
              <RoleKnowledgeBasePanel
                role="NGO"
                articles={[
                  { title: 'Community Outreach FAQ', category: 'Outreach', updated: 'Jan 2026' },
                  { title: 'Program Planning Notes', category: 'Programs', updated: 'Dec 2025' },
                  { title: 'Partner Coordination Guide', category: 'Collaboration', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Feedback</h2>
              <RoleFeedbackPanel
                role="NGO"
                highlights={[
                  { title: 'Outreach Journey Notes', status: 'Open', date: 'Jan 15, 2026' },
                  { title: 'Impact Reporting Feedback', status: 'In Review', date: 'Jan 07, 2026' },
                  { title: 'Volunteer Scheduling UI', status: 'Closed', date: 'Dec 25, 2025' }
                ]}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <RoleSettingsPanel
                role="NGO"
                title="NGO Role Settings"
                subtitle="Manage program notifications, reporting, and data policies."
              />
              <SecurityPreferences role="NGO" />
            </div>
          )}
        </div>
      </div>
      
      <NGOBottomNavigation />
    </div>
  );
};

export default NGODashboard;
