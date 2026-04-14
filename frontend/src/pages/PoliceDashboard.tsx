import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Phone,
  Search,
  Eye,
  CheckCircle,
  Shield,
  Users,
  TrendingUp,
  Bell,
  FileText,
  Navigation,
  QrCode,
  MessageSquare,
  Menu,
  X,
  Settings,
  ClipboardList,
  BookOpen,
  LifeBuoy,
  Calendar,
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
  Book
} from 'lucide-react';
import { LogoCircular } from '../assets';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import EmergencyAlertSystem from '../components/EmergencyAlertSystem';
import MapTracking from '../components/MapTracking';
import QRVerificationManager from '../components/QRCode/QRVerificationManager';
import { dataSecurityManager } from '../utils/dataSecurity';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
import IncidentReports from './police/IncidentReports';
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
import PoliceBottomNavigation from '../components/Layout/PoliceBottomNavigation';

interface PoliceDashboardProps {
  userData: any;
  onLogout: () => void;
}

const PoliceDashboard: React.FC<PoliceDashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('emergency');
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyLocations, setEmergencyLocations] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [showMessageModal, setShowMessageModal] = useState(false); // Reserved for future use
  // const [selectedRole, setSelectedRole] = useState<string>(''); // Reserved for future use

  // Connect to backend API
  const stakeholderAPI = useStakeholderAPI({
    role: 'POLICE',
    stakeholderId: userData?.id
  });

  // Real police metrics from API data - using individual values instead of object

  // Fetch real data from backend
  useEffect(() => {
    if (userData?.id) {
      stakeholderAPI.fetchAlerts();
      stakeholderAPI.fetchCases();
      stakeholderAPI.fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  // Helper functions (declared before use)
  const isToday = (date: string) => {
    const today = new Date();
    const alertDate = new Date(date);
    return today.toDateString() === alertDate.toDateString();
  };

  const calculateAverageResponseTime = (alerts: any[]) => {
    const resolved = alerts.filter(a => a.status === 'resolved' && a.responseTime);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((sum, a) => sum + a.responseTime, 0);
    return Math.round(total / resolved.length);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Map API alerts to display format
  const emergencyAlerts = stakeholderAPI.alerts.map(alert => ({
    id: alert.id,
    type: alert.alertType,
    location: `${alert.location?.address || 'Unknown'}, ${alert.location?.city || 'Ghana'}`,
    time: formatTimeAgo(alert.createdAt),
    status: alert.status,
    priority: alert.priority,
    description: alert.description,
    coordinates: alert.location?.coordinates || { lat: 5.6037, lng: -0.1870 }
  }));

  // Aggregated emergency metrics for cards/visuals
  const emergencyData = {
    activeAlerts: stakeholderAPI.alerts.filter(a => a.status === 'active').length,
    resolvedToday: stakeholderAPI.alerts.filter(a => a.status === 'resolved' && isToday(a.createdAt)).length,
    averageResponseTime: calculateAverageResponseTime(stakeholderAPI.alerts),
    totalCases: stakeholderAPI.cases.length
  };

  // Map API cases to display format
  const recentCases = stakeholderAPI.cases.map(caseRecord => ({
    id: caseRecord.id,
    caseNumber: caseRecord.caseNumber,
    type: caseRecord.caseType,
    location: `${caseRecord.location?.address || 'Unknown'}, ${caseRecord.location?.city || 'Ghana'}`,
    status: caseRecord.status,
    assigned: caseRecord.assignedRole || 'Unassigned'
  }));

  // Real-time metrics from API data (no fallbacks)
  const policeData = {
    emergencyTypes: [
      { id: 1, label: 'GBV', value: stakeholderAPI.alerts.filter(a => a.alertType === 'gbv').length },
      { id: 2, label: 'Medical', value: stakeholderAPI.alerts.filter(a => a.alertType === 'medical').length },
      { id: 3, label: 'Safety', value: stakeholderAPI.alerts.filter(a => a.alertType === 'safety').length },
      { id: 4, label: 'Other', value: stakeholderAPI.alerts.filter(a => a.alertType === 'other').length }
    ].filter(item => item.value > 0),
    responseTimes: stakeholderAPI.alerts
      .filter(a => a.responseTime)
      .slice(0, 10)
      .map((a, i) => ({
        id: i + 1,
        label: new Date(a.createdAt).toLocaleDateString(),
        value: a.responseTime || 0
      })),
    caseStatus: [
      { id: 1, label: 'Open', value: stakeholderAPI.cases.filter(c => c.status === 'open').length },
      { id: 2, label: 'In Progress', value: stakeholderAPI.cases.filter(c => c.status === 'in_progress').length },
      { id: 3, label: 'Resolved', value: stakeholderAPI.cases.filter(c => c.status === 'resolved').length }
    ].filter(item => item.value > 0)
  };

  const tabs = [
    { id: 'emergency', label: 'Emergency Alerts', icon: AlertTriangle },
    { id: 'map', label: 'Map Tracking', icon: MapPin },
    { id: 'qr-scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'cases', label: 'Case Management', icon: FileText },
    { id: 'incidents', label: 'Incident Reports', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'patrol', label: 'Patrol Routes', icon: Navigation },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'responding': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md ring-2 ring-blue-100 bg-gradient-to-br from-blue-500 to-cyan-500">
                <img 
                  src={LogoCircular} 
                  alt="REPRO PLAN Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 flex flex-col leading-[1]">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">Police Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block -mt-2 leading-none">Emergency Response & Case Management</p>
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
                {emergencyAlerts.filter(alert => alert.status === 'active').length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
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
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
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
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
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
          {/* Emergency Alerts Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Emergency Response Center</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Active Alerts</p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{emergencyData.activeAlerts}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Resolved Today</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{emergencyData.resolvedToday}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Avg Response Time</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{emergencyData.averageResponseTime}m</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex-shrink-0">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Total Cases</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{emergencyData.totalCases}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Alerts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Active Emergency Alerts</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {emergencyAlerts.map((alert) => (
                        <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(alert.status)}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium text-gray-900">{alert.description}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(alert.priority)}`}>
                                    {alert.priority.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <MapPin size={14} />
                                    <span>{alert.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock size={14} />
                                    <span>{alert.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Eye size={16} />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                <CheckCircle size={16} />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                <Phone size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secure Data Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <SecureDataViewer
                    data={policeData.emergencyTypes}
                    chartType="pie"
                    title="Emergency Types Distribution"
                    description="Breakdown of emergency call types and frequencies"
                    userRole="POLICE"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                  
                  <SecureDataViewer
                    data={policeData.responseTimes}
                    chartType="line"
                    title="Response Time Trends"
                    description="Weekly response time performance metrics"
                    userRole="POLICE"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                </div>

                <SecureDataViewer
                  data={policeData.caseStatus}
                  chartType="bar"
                  title="Case Status Overview"
                  description="Current case status distribution and progress tracking"
                  userRole="POLICE"
                  onDataAccess={(accessLog) => {
                    dataSecurityManager.logDataAccess(accessLog);
                  }}
                />

                {/* Emergency Alert System */}
                <EmergencyAlertSystem
                  onAlertReceived={(alert) => {
                    setEmergencyLocations(prev => [alert, ...prev]);
                  }}
                  onLocationUpdate={(location) => {
                    // Handle location update
                    console.log('Location updated:', location);
                  }}
                />

                {/* Map Tracking */}
                <MapTracking
                  locations={emergencyLocations}
                  onLocationSelect={(location) => {
                    // Handle location selection
                    console.log('Location selected:', location);
                  }}
                  onNavigateToLocation={(location) => {
                    // Handle navigation to emergency location
                    console.log('Navigating to:', location);
                  }}
                />
              </div>
            </div>
          )}

          {/* Map Tracking Tab */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Location Tracking</h2>
                
                {/* Map Tracking Component */}
                <MapTracking
                  locations={emergencyLocations}
                  onLocationSelect={(location) => {
                    // Handle location selection
                    console.log('Location selected:', location);
                  }}
                  onNavigateToLocation={(location) => {
                    // Handle navigation to emergency location
                    console.log('Navigating to:', location);
                  }}
                />
              </div>
            </div>
          )}

          {/* QR Scanner Tab */}
          {activeTab === 'qr-scanner' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code Verification</h2>
                <p className="text-gray-600 mb-6">
                  Scan REPRO PLAN user QR codes to verify their accounts and access emergency information.
                </p>
                
                {/* QR Verification Manager */}
                <QRVerificationManager
                  userRole="police"
                  onVerificationComplete={(record) => {
                    console.log('Verification completed:', record);
                    // Handle verification completion
                  }}
                />
              </div>
            </div>
          )}

          {/* Case Management Tab */}
          {activeTab === 'cases' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Case Management</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    New Case
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Cases</h3>
                </div>
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                  <div className="p-3 space-y-3">
                    {recentCases.map((case_) => (
                      <div key={case_.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{case_.caseNumber}</p>
                            <p className="text-xs text-gray-500">{case_.type}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            case_.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            case_.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {case_.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{case_.location}</p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
                          <span>Assigned: {case_.assigned}</span>
                          <div className="flex items-center space-x-3">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye size={14} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <FileText size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case Number</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentCases.map((case_) => (
                        <tr key={case_.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{case_.caseNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{case_.type}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{case_.location}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              case_.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                              case_.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {case_.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{case_.assigned}</td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Eye size={16} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <FileText size={16} />
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

          {/* Other tabs */}
          {activeTab === 'patrol' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Patrol Routes</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Patrol route management and GPS tracking features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4 sm:space-y-6">
              <IncidentReports userData={userData} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Advanced reporting and analytics features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Operations Center</h2>
              <RoleQuickActionsPanel role="POLICE" />
              <RoleOperationsPanel
                role="POLICE"
                title="Incident Operations"
                focusAreas={[
                  'Rapid incident response routing',
                  'Patrol coordination checklist',
                  'Evidence chain-of-custody tracking',
                  'Cross-agency escalation protocols'
                ]}
                escalationTips={[
                  'Confirm incident details and verify location accuracy.',
                  'Assign patrol lead and share response ETA.',
                  'Coordinate with medical/NGO partners for survivor support.',
                  'Log resolution notes immediately after closure.'
                ]}
              />
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Collaboration</h2>
              <RoleCollaborationPanel
                role="POLICE"
                partnerTeams={[
                  'Emergency Dispatch',
                  'Medical Response Team',
                  'Safe House Operations',
                  'Legal Aid Partners'
                ]}
              />
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Training</h2>
              <RoleTrainingPanel
                role="POLICE"
                modules={[
                  { title: 'Rapid Response Playbook', status: 'Completed', duration: '35 min' },
                  { title: 'Evidence Handling & Privacy', status: 'In Progress', duration: '40 min' },
                  { title: 'Victim Support Coordination', status: 'Assigned', duration: '25 min' },
                  { title: 'Crisis Communication', status: 'Assigned', duration: '20 min' }
                ]}
              />
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Compliance</h2>
              <RoleCompliancePanel
                role="POLICE"
                checklist={[
                  'Verify chain-of-custody logs.',
                  'Review active NDA confirmations.',
                  'Confirm incident response timelines.',
                  'Update weekly compliance report.'
                ]}
              />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
              <RoleResourcesPanel
                role="POLICE"
                resources={[
                  { title: 'Incident Response Checklist', type: 'PDF', updated: 'Jan 2026' },
                  { title: 'Evidence Handling SOP', type: 'DOCX', updated: 'Dec 2025' },
                  { title: 'Emergency Call Scripts', type: 'PDF', updated: 'Nov 2025' },
                  { title: 'Case Handoff Template', type: 'XLSX', updated: 'Nov 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
              <RoleAuditPanel
                role="POLICE"
                recentAudits={[
                  { title: 'Incident Response Review', status: 'Completed', date: 'Jan 08, 2026' },
                  { title: 'Evidence Access Audit', status: 'In Review', date: 'Dec 20, 2025' },
                  { title: 'Patrol Compliance Check', status: 'Scheduled', date: 'Dec 12, 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Support</h2>
              <RoleSupportPanel
                role="POLICE"
                contacts={[
                  'Emergency Dispatch Lead',
                  'Legal Liaison',
                  'Digital Evidence Support',
                  'Incident Review Desk'
                ]}
              />
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Directory</h2>
              <RolePartnerDirectoryPanel
                role="POLICE"
                partners={[
                  { name: 'Emergency Dispatch', contact: 'dispatch@reproplan.org', focus: 'Incident routing' },
                  { name: 'Medical Response', contact: 'medical@reproplan.org', focus: 'Clinical support' },
                  { name: 'Safe House Network', contact: 'safehouses@reproplan.org', focus: 'Shelter coordination' },
                  { name: 'Legal Aid Partners', contact: 'legal@reproplan.org', focus: 'Legal advisory' }
                ]}
              />
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Scheduling</h2>
              <RoleSchedulingPanel
                role="POLICE"
                upcoming={[
                  { title: 'Patrol Shift Briefing', date: 'Jan 19, 2026', time: '07:00 AM' },
                  { title: 'Cross-Agency Sync', date: 'Jan 22, 2026', time: '03:00 PM' },
                  { title: 'Incident Review Board', date: 'Jan 26, 2026', time: '10:00 AM' }
                ]}
              />
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Impact</h2>
              <RoleImpactPanel
                role="POLICE"
                highlights={[
                  { label: 'Active Alerts', value: '48', change: '+6%' },
                  { label: 'Resolved Cases', value: '214', change: '+10%' },
                  { label: 'Avg Response Time', value: '22m', change: '-4%' },
                  { label: 'Partner Handoffs', value: '96', change: '+9%' }
                ]}
              />
            </div>
          )}

          {activeTab === 'geointel' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Geo Intelligence</h2>
              <RoleGeoIntelPanel
                role="POLICE"
                hotspots={[
                  { label: 'High Risk Zone', region: 'Accra Central', status: 'High' },
                  { label: 'Alert Cluster', region: 'Kumasi', status: 'Elevated' },
                  { label: 'Patrol Focus', region: 'Tamale', status: 'Moderate' },
                  { label: 'Partner Watch', region: 'Accra', status: 'Stable' }
                ]}
              />
            </div>
          )}

          {activeTab === 'fieldops' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Field Operations</h2>
              <RoleFieldOpsPanel
                role="POLICE"
                missions={[
                  { title: 'Night Patrol Sweep', region: 'Greater Accra', status: 'Active' },
                  { title: 'Community Liaison Visit', region: 'Ashanti', status: 'Planned' },
                  { title: 'Incident Scene Support', region: 'Northern Region', status: 'In Progress' },
                  { title: 'Cross-Agency Drill', region: 'Ghana', status: 'Planned' }
                ]}
              />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
              <RoleInventoryPanel
                role="POLICE"
                items={[
                  { name: 'Response Kits', level: '84 units', status: 'Healthy' },
                  { name: 'Body Cameras', level: '24 units', status: 'Monitor' },
                  { name: 'Safety Vests', level: '18 units', status: 'Low' },
                  { name: 'Incident Forms', level: '520 units', status: 'Healthy' }
                ]}
              />
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Funding</h2>
              <RoleFundingPanel
                role="POLICE"
                grants={[
                  { name: 'Emergency Response Upgrade', amount: '$58,000', status: 'Active' },
                  { name: 'Patrol Equipment Boost', amount: '$32,000', status: 'Pending' },
                  { name: 'Training Expansion', amount: '$24,000', status: 'Approved' },
                  { name: 'Community Safety Grant', amount: '$41,000', status: 'Active' }
                ]}
              />
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Risk Intelligence</h2>
              <RoleRiskPanel
                role="POLICE"
                risks={[
                  { label: 'High Priority Alerts', region: 'Accra', level: 'High' },
                  { label: 'Delayed Dispatch', region: 'Kumasi', level: 'Moderate' },
                  { label: 'Resource Shortage', region: 'Tamale', level: 'Elevated' },
                  { label: 'Partner Capacity', region: 'Accra', level: 'Moderate' }
                ]}
              />
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Data Sharing</h2>
              <RoleDataSharingPanel
                role="POLICE"
                policies={[
                  'Share only incident summaries with partners.',
                  'Remove identifying details before sharing.',
                  'Log outbound data packs for audit.'
                ]}
              />
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Transport Logistics</h2>
              <RoleTransportPanel
                role="POLICE"
                routes={[
                  { name: 'Rapid Response Route A', eta: 'ETA 30m', status: 'Active' },
                  { name: 'Escort Route B', eta: 'ETA 1h', status: 'Planned' },
                  { name: 'Secure Transfer Route C', eta: 'ETA 2h', status: 'In Progress' }
                ]}
              />
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Case QA</h2>
              <RoleCaseQualityPanel
                role="POLICE"
                reviews={[
                  { title: 'Incident Closure Review', status: 'In Progress', reviewer: 'QA Lead' },
                  { title: 'Evidence Handling Audit', status: 'Assigned', reviewer: 'Compliance' },
                  { title: 'Case Response Sampling', status: 'Completed', reviewer: 'Supervisor' }
                ]}
              />
            </div>
          )}

          {activeTab === 'grant-reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Grant Reports</h2>
              <RoleGrantReportingPanel
                role="POLICE"
                reports={[
                  { title: 'Community Safety Grant', status: 'Due Soon', due: 'Jan 28, 2026' },
                  { title: 'Equipment Upgrade Grant', status: 'Draft', due: 'Feb 05, 2026' },
                  { title: 'Training Support Grant', status: 'Submitted', due: 'Jan 12, 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Governance</h2>
              <RoleDataGovernancePanel
                role="POLICE"
                policies={[
                  'Retain incident logs for 180 days.',
                  'Restrict access to sensitive case files.',
                  'Monthly review of access permissions.'
                ]}
              />
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Contracts</h2>
              <RolePartnerContractsPanel
                role="POLICE"
                contracts={[
                  { name: 'Dispatch Coordination MoU', status: 'Active', renewal: 'Mar 2026' },
                  { name: 'Medical Response MoU', status: 'Active', renewal: 'Apr 2026' },
                  { name: 'Legal Support Agreement', status: 'Review', renewal: 'Feb 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'crisis-comms' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Crisis Communications</h2>
              <RoleCrisisCommsPanel
                role="POLICE"
                bulletins={[
                  { title: 'Active Incident Alert', status: 'Sent', time: '1 hour ago' },
                  { title: 'Community Safety Notice', status: 'Draft', time: 'Today' },
                  { title: 'Partner Response Update', status: 'Scheduled', time: 'Tomorrow' }
                ]}
              />
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Regional Insights</h2>
              <RoleRegionalInsightsPanel
                role="POLICE"
                insights={[
                  { region: 'Greater Accra', summary: 'Incident volume rising.', trend: 'Upward' },
                  { region: 'Ashanti', summary: 'Patrol coverage stable.', trend: 'Stable' },
                  { region: 'Northern Region', summary: 'High demand for support.', trend: 'Upward' }
                ]}
              />
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Volunteers</h2>
              <RoleVolunteerPanel
                role="POLICE"
                volunteers={[
                  { name: 'Community Liaison', status: 'Active', skill: 'Outreach' },
                  { name: 'Safety Advocate', status: 'Active', skill: 'Support' },
                  { name: 'Data Runner', status: 'Onboarding', skill: 'Operations' }
                ]}
              />
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Policy Updates</h2>
              <RolePolicyUpdatesPanel
                role="POLICE"
                updates={[
                  { title: 'Incident Response Policy', date: 'Jan 14, 2026', status: 'Pending' },
                  { title: 'Evidence Handling Update', date: 'Jan 02, 2026', status: 'Acknowledged' },
                  { title: 'Partner Escalation Policy', date: 'Dec 20, 2025', status: 'Acknowledged' }
                ]}
              />
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Stakeholder Directory</h2>
              <RoleStakeholderDirectoryPanel
                role="POLICE"
                stakeholders={[
                  { name: 'Emergency Dispatch', focus: 'Dispatch coordination', contact: 'dispatch@reproplan.org' },
                  { name: 'Medical Response Team', focus: 'Clinical support', contact: 'medical@reproplan.org' },
                  { name: 'Safe House Network', focus: 'Shelter coordination', contact: 'safehouses@reproplan.org' },
                  { name: 'Legal Aid Partners', focus: 'Legal support', contact: 'legal@reproplan.org' }
                ]}
              />
            </div>
          )}

          {activeTab === 'playbooks' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Playbooks</h2>
              <RolePlaybooksPanel
                role="POLICE"
                playbooks={[
                  { title: 'Rapid Response Playbook', status: 'Active', updated: 'Jan 2026' },
                  { title: 'Case Escalation Guide', status: 'Active', updated: 'Dec 2025' },
                  { title: 'Community Safety Drill', status: 'Active', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Knowledge</h2>
              <RoleKnowledgeBasePanel
                role="POLICE"
                articles={[
                  { title: 'Incident Reporting FAQ', category: 'Operations', updated: 'Jan 2026' },
                  { title: 'Evidence Handling Guide', category: 'Compliance', updated: 'Dec 2025' },
                  { title: 'Community Safety Playbook', category: 'Safety', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Feedback</h2>
              <RoleFeedbackPanel
                role="POLICE"
                highlights={[
                  { title: 'Incident Workflow Update', status: 'Open', date: 'Jan 17, 2026' },
                  { title: 'Dispatch Alert Feedback', status: 'In Review', date: 'Jan 09, 2026' },
                  { title: 'Patrol Route UI', status: 'Closed', date: 'Dec 27, 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <RoleSettingsPanel
                role="POLICE"
                title="Police Role Settings"
                subtitle="Manage alert routing, compliance, and session controls."
              />
              <SecurityPreferences role="POLICE" />
            </div>
          )}
        </div>
      
      <PoliceBottomNavigation />
      </div>
    </div>
  );
};

export default PoliceDashboard;
