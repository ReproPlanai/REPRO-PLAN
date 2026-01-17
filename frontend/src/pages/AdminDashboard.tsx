import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Bell, 
  Search,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  MessageSquare,
  FileText,
  ClipboardList,
  BookOpen,
  LifeBuoy,
  Calendar,
  TrendingUp,
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
  Users,
  BookOpen,
  MessageSquarePlus,
  Book
} from 'lucide-react';
import { LogoCircular } from '../assets';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import { dataSecurityManager } from '../utils/dataSecurity';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
import InterRoleMessaging from '../components/Dashboard/InterRoleMessaging';
import UserManagement from './admin/UserManagement';
import SystemSettings from './admin/SystemSettings';
import { apiService } from '../services/api';
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

interface AdminDashboardProps {
  userData: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalAlerts: 0,
    totalCases: 0,
    activeAlerts: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalStakeholders: 0,
    systemHealth: 100,
    responseTime: 0
  });

  // Connect to backend API
  const stakeholderAPI = useStakeholderAPI({
    role: 'ADMIN',
    stakeholderId: userData?.id
  });

  // Fetch real dashboard data
  useEffect(() => {
    if (userData?.id) {
      fetchDashboardMetrics();
      stakeholderAPI.fetchAlerts();
      stakeholderAPI.fetchCases();
      stakeholderAPI.fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  const fetchDashboardMetrics = async () => {
    try {
      // In a real implementation, you'd have API endpoints for these metrics
      // For now, we'll calculate from available data
      const alertsResponse = await apiService.getAlerts('ADMIN', userData?.id) as { success?: boolean; alerts?: any[] };
      const casesResponse = await apiService.getCases('ADMIN', userData?.id) as { success?: boolean; cases?: any[] };

      // Calculate metrics from API responses
      const totalAlerts = alertsResponse?.success ? (alertsResponse.alerts?.length || 0) : 0;
      const totalCases = casesResponse?.success ? (casesResponse.cases?.length || 0) : 0;
      const activeAlerts = stakeholderAPI.alerts.filter(a => a.status === 'active').length;

      setDashboardMetrics({
        totalAlerts,
        totalCases,
        activeAlerts,
        totalUsers: 0, // Would need a separate API endpoint
        activeUsers: 0, // Would need a separate API endpoint
        totalStakeholders: 0, // Would need a separate API endpoint
        systemHealth: 100, // Mock for now - would be from system monitoring
        responseTime: Math.floor(Math.random() * 100) + 50 // Mock response time
      });
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    }
  };

  // Dashboard data using real metrics
  const dashboardData = {
    totalUsers: dashboardMetrics.totalUsers,
    activeUsers: dashboardMetrics.activeUsers,
    emergencyAlerts: stakeholderAPI.alerts.filter(a => a.status === 'active').length,
    systemHealth: dashboardMetrics.systemHealth,
    responseTime: dashboardMetrics.responseTime,
    totalCases: stakeholderAPI.cases.length
  };

  const recentAlerts = stakeholderAPI.alerts.slice(0, 10).map(alert => ({
    id: alert.id,
    type: alert.alertType,
    message: alert.description,
    time: new Date(alert.createdAt).toLocaleString(),
    status: alert.status
  }));

  const [userActivity] = useState([
    { id: 1, user: 'Anonymous User', action: 'Accessed chatbot', time: '5 min ago', location: 'Accra' },
    { id: 2, user: 'Anonymous User', action: 'Downloaded resource', time: '12 min ago', location: 'Kumasi' },
    { id: 3, user: 'Anonymous User', action: 'Used emergency feature', time: '18 min ago', location: 'Tamale' },
    { id: 4, user: 'Anonymous User', action: 'Submitted mentorship request', time: '22 min ago', location: 'Monrovia' },
    { id: 5, user: 'Anonymous User', action: 'Completed SRHR quiz', time: '30 min ago', location: 'Buchanan' },
    { id: 6, user: 'Anonymous User', action: 'Generated QR verification', time: '45 min ago', location: 'Ganta' }
  ]);

  // Placeholder data for secure visualizations
  const adminData = {
    userActivity,
    systemUsage: [
      { id: 1, label: 'CPU', value: 45 },
      { id: 2, label: 'Memory', value: 60 },
      { id: 3, label: 'Network', value: 30 }
    ],
    securityAlerts: stakeholderAPI.alerts.map((alert) => ({
      id: alert.id || alert.caseNumber || Math.random().toString(),
      label: alert.alertType || 'alert',
      value: 1
    }))
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'cases', label: 'Cases', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md ring-2 ring-blue-100">
                <img 
                  src={LogoCircular} 
                  alt="REPRO PLAN Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">System Administration Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={18} className="sm:w-5 sm:h-5" />
                {recentAlerts.filter(alert => alert.status === 'active').length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
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
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-4">
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
        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 xl:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">System Overview</h2>
                
                {/* Stats Cards - Mobile Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Total Users</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{dashboardData.totalUsers.toLocaleString()}</p>
                      </div>
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Active Users</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{dashboardData.activeUsers.toLocaleString()}</p>
                      </div>
                      <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Emergency Alerts</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{dashboardData.emergencyAlerts}</p>
                      </div>
                      <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">System Health</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{dashboardData.systemHealth}%</p>
                      </div>
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Recent Alerts - Mobile Responsive */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Alerts</h3>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {recentAlerts.map((alert) => (
                        <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 sm:mt-0 ${
                              alert.status === 'active' ? 'bg-red-500' : 
                              alert.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 break-words">{alert.message}</p>
                              <p className="text-xs text-gray-500">{alert.time}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full self-start sm:self-auto ${
                            alert.status === 'active' ? 'bg-red-100 text-red-700' :
                            alert.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secure Data Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <SecureDataViewer
                    data={adminData.userActivity}
                    chartType="line"
                    title="User Activity Trend"
                    description="Monthly user activity and engagement metrics"
                    userRole="ADMIN"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                  
                  <SecureDataViewer
                    data={adminData.systemUsage}
                    chartType="pie"
                    title="System Resource Usage"
                    description="Current system resource utilization"
                    userRole="ADMIN"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                </div>

                <SecureDataViewer
                  data={adminData.securityAlerts}
                  chartType="bar"
                  title="Security Alerts Distribution"
                  description="Security incidents and threat analysis"
                  userRole="ADMIN"
                  onDataAccess={(accessLog) => {
                    dataSecurityManager.logDataAccess(accessLog);
                  }}
                />
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Management</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-auto pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Export Data
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent User Activity</h3>
                </div>
                
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                  <div className="p-3 space-y-3">
                    {userActivity.map((activity) => (
                      <div key={activity.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-medium text-gray-900">{activity.user}</span>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <div className="text-sm text-gray-600">{activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.location}</div>
                        <div className="flex space-x-2 pt-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            <Eye size={14} className="inline mr-1" />
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm">
                            <Download size={14} className="inline mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userActivity.map((activity) => (
                        <tr key={activity.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{activity.user}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{activity.action}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{activity.location}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{activity.time}</td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Eye size={16} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Download size={16} />
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

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Inter-Role Messaging</h2>
              <InterRoleMessaging 
                role="ADMIN" 
                stakeholderId={userData?.id}
                allowedRoles={['POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO']}
              />
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4 sm:space-y-6">
              <UserManagement />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Security Dashboard</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Security monitoring and access control features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Advanced analytics and reporting features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Operations Center</h2>
              <RoleQuickActionsPanel role="ADMIN" />
              <RoleOperationsPanel
                role="ADMIN"
                title="System Operations"
                focusAreas={[
                  'User escalation workflows',
                  'Cross-role incident triage',
                  'Platform compliance monitoring',
                  'High-risk case routing'
                ]}
                escalationTips={[
                  'Validate incident severity and assign a lead responder.',
                  'Notify partner stakeholders within agreed SLAs.',
                  'Log audit trails for every sensitive data access.',
                  'Schedule post-incident review within 24 hours.'
                ]}
              />
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Collaboration</h2>
              <RoleCollaborationPanel
                role="ADMIN"
                partnerTeams={[
                  'Police Response Unit',
                  'Medical Response Team',
                  'NGO Program Leads',
                  'Safe House Coordinators'
                ]}
              />
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Training</h2>
              <RoleTrainingPanel
                role="ADMIN"
                modules={[
                  { title: 'System Security Briefing', status: 'Completed', duration: '45 min' },
                  { title: 'Incident Escalation Protocols', status: 'In Progress', duration: '30 min' },
                  { title: 'Compliance Update', status: 'Assigned', duration: '25 min' },
                  { title: 'Cross-Role Collaboration', status: 'Assigned', duration: '20 min' }
                ]}
              />
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Compliance</h2>
              <RoleCompliancePanel
                role="ADMIN"
                checklist={[
                  'Review access logs and sensitive data exports.',
                  'Confirm NDA confirmations remain active.',
                  'Validate emergency response audits.',
                  'Export monthly compliance summary.'
                ]}
              />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
              <RoleResourcesPanel
                role="ADMIN"
                resources={[
                  { title: 'Incident Response Handbook', type: 'PDF', updated: 'Jan 2026' },
                  { title: 'Stakeholder SOPs', type: 'DOCX', updated: 'Dec 2025' },
                  { title: 'Data Governance Guide', type: 'PDF', updated: 'Dec 2025' },
                  { title: 'Monthly Reporting Template', type: 'XLSX', updated: 'Nov 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
              <RoleAuditPanel
                role="ADMIN"
                recentAudits={[
                  { title: 'Quarterly Data Access Review', status: 'Completed', date: 'Jan 05, 2026' },
                  { title: 'Emergency Response Audit', status: 'In Review', date: 'Dec 22, 2025' },
                  { title: 'Stakeholder Access Check', status: 'Scheduled', date: 'Dec 10, 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Support</h2>
              <RoleSupportPanel
                role="ADMIN"
                contacts={[
                  'Platform Operations Desk',
                  'Data Privacy Officer',
                  'Security Engineering Team',
                  'Stakeholder Success Lead'
                ]}
              />
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Directory</h2>
              <RolePartnerDirectoryPanel
                role="ADMIN"
                partners={[
                  { name: 'National Emergency Dispatch', contact: 'dispatch@reproplan.org', focus: 'Emergency routing' },
                  { name: 'Regional Medical Network', contact: 'medical@reproplan.org', focus: 'Clinical escalation' },
                  { name: 'Safe House Alliance', contact: 'safehouses@reproplan.org', focus: 'Shelter coordination' },
                  { name: 'Youth Outreach Coalition', contact: 'outreach@reproplan.org', focus: 'Community programs' }
                ]}
              />
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Scheduling</h2>
              <RoleSchedulingPanel
                role="ADMIN"
                upcoming={[
                  { title: 'Stakeholder Coordination Call', date: 'Jan 20, 2026', time: '09:00 AM' },
                  { title: 'Monthly Compliance Review', date: 'Jan 24, 2026', time: '02:00 PM' },
                  { title: 'Incident Response Drill', date: 'Jan 28, 2026', time: '11:00 AM' }
                ]}
              />
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Impact</h2>
              <RoleImpactPanel
                role="ADMIN"
                highlights={[
                  { label: 'Incidents Resolved', value: '312', change: '+8%' },
                  { label: 'Stakeholder Coverage', value: '92%', change: '+3%' },
                  { label: 'Avg Response Time', value: '18m', change: '-6%' },
                  { label: 'Community Reach', value: '28k', change: '+12%' }
                ]}
              />
            </div>
          )}

          {activeTab === 'geointel' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Geo Intelligence</h2>
              <RoleGeoIntelPanel
                role="ADMIN"
                hotspots={[
                  { label: 'Hotspot Alpha', region: 'Accra', status: 'High' },
                  { label: 'Hotspot Bravo', region: 'Kumasi', status: 'Moderate' },
                  { label: 'Hotspot Delta', region: 'Tamale', status: 'Elevated' },
                  { label: 'Hotspot Echo', region: 'Monrovia', status: 'Stable' }
                ]}
              />
            </div>
          )}

          {activeTab === 'fieldops' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Field Operations</h2>
              <RoleFieldOpsPanel
                role="ADMIN"
                missions={[
                  { title: 'Incident Assessment Team', region: 'Greater Accra', status: 'Active' },
                  { title: 'Stakeholder Field Visit', region: 'Ashanti', status: 'Planned' },
                  { title: 'Community Safety Audit', region: 'Northern Region', status: 'In Progress' },
                  { title: 'Partnership Outreach', region: 'Liberia', status: 'Planned' }
                ]}
              />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
              <RoleInventoryPanel
                role="ADMIN"
                items={[
                  { name: 'Emergency Kits', level: '142 units', status: 'Healthy' },
                  { name: 'Mobile Devices', level: '58 units', status: 'Monitor' },
                  { name: 'Safety Gear', level: '37 units', status: 'Low' },
                  { name: 'Printed Materials', level: '620 units', status: 'Healthy' }
                ]}
              />
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Funding</h2>
              <RoleFundingPanel
                role="ADMIN"
                grants={[
                  { name: 'Youth Safety Expansion', amount: '$120,000', status: 'Active' },
                  { name: 'Emergency Response Fund', amount: '$75,000', status: 'Pending' },
                  { name: 'Data Security Upgrade', amount: '$42,000', status: 'Approved' },
                  { name: 'Regional Partner Grants', amount: '$55,000', status: 'Active' }
                ]}
              />
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Risk Intelligence</h2>
              <RoleRiskPanel
                role="ADMIN"
                risks={[
                  { label: 'Data Access Anomaly', region: 'Accra', level: 'High' },
                  { label: 'Delayed Response Trend', region: 'Kumasi', level: 'Moderate' },
                  { label: 'Partner Capacity Strain', region: 'Tamale', level: 'Elevated' },
                  { label: 'Funding Gap Risk', region: 'Monrovia', level: 'Moderate' }
                ]}
              />
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Data Sharing</h2>
              <RoleDataSharingPanel
                role="ADMIN"
                policies={[
                  'Share only anonymized reports with partners.',
                  'Require NDA confirmation for sensitive data.',
                  'Log all exports with audit trails.'
                ]}
              />
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Transport Logistics</h2>
              <RoleTransportPanel
                role="ADMIN"
                routes={[
                  { name: 'Emergency Support Route A', eta: 'ETA 45m', status: 'Active' },
                  { name: 'Partner Delivery Route B', eta: 'ETA 2h', status: 'Planned' },
                  { name: 'Regional Transfer Route C', eta: 'ETA 3h', status: 'In Progress' }
                ]}
              />
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Case QA</h2>
              <RoleCaseQualityPanel
                role="ADMIN"
                reviews={[
                  { title: 'Emergency Case Review', status: 'In Progress', reviewer: 'QA Lead' },
                  { title: 'Partner Escalation Audit', status: 'Assigned', reviewer: 'Compliance' },
                  { title: 'Stakeholder Case Sampling', status: 'Completed', reviewer: 'Admin' }
                ]}
              />
            </div>
          )}

          {activeTab === 'grant-reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Grant Reports</h2>
              <RoleGrantReportingPanel
                role="ADMIN"
                reports={[
                  { title: 'Emergency Response Grant', status: 'Due Soon', due: 'Jan 30, 2026' },
                  { title: 'Regional Growth Fund', status: 'Draft', due: 'Feb 10, 2026' },
                  { title: 'Security Upgrade Grant', status: 'Submitted', due: 'Jan 12, 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Governance</h2>
              <RoleDataGovernancePanel
                role="ADMIN"
                policies={[
                  'Enforce 90-day retention for operational logs.',
                  'Require NDA confirmation for sensitive exports.',
                  'Quarterly access reviews for all stakeholders.'
                ]}
              />
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Contracts</h2>
              <RolePartnerContractsPanel
                role="ADMIN"
                contracts={[
                  { name: 'Emergency Dispatch MoU', status: 'Active', renewal: 'Mar 2026' },
                  { name: 'Safe House Alliance MoU', status: 'Active', renewal: 'Apr 2026' },
                  { name: 'Medical Network Agreement', status: 'Review', renewal: 'Feb 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'crisis-comms' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Crisis Communications</h2>
              <RoleCrisisCommsPanel
                role="ADMIN"
                bulletins={[
                  { title: 'Rapid Response Advisory', status: 'Sent', time: '2 hours ago' },
                  { title: 'Partner Safety Update', status: 'Draft', time: 'Today' },
                  { title: 'Coverage Notice', status: 'Scheduled', time: 'Tomorrow' }
                ]}
              />
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Regional Insights</h2>
              <RoleRegionalInsightsPanel
                role="ADMIN"
                insights={[
                  { region: 'Greater Accra', summary: 'Alert volume rising by 12%.', trend: 'Upward' },
                  { region: 'Ashanti', summary: 'Partner coverage steady with new outreach.', trend: 'Stable' },
                  { region: 'Northern Region', summary: 'Referral demand increasing.', trend: 'Upward' }
                ]}
              />
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Volunteers</h2>
              <RoleVolunteerPanel
                role="ADMIN"
                volunteers={[
                  { name: 'Volunteer Coordinator', status: 'Active', skill: 'Operations' },
                  { name: 'Outreach Lead', status: 'Active', skill: 'Community' },
                  { name: 'Data Support', status: 'Onboarding', skill: 'Analytics' }
                ]}
              />
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Policy Updates</h2>
              <RolePolicyUpdatesPanel
                role="ADMIN"
                updates={[
                  { title: 'Data Handling Update', date: 'Jan 15, 2026', status: 'Pending' },
                  { title: 'Incident Reporting Standard', date: 'Jan 10, 2026', status: 'Acknowledged' },
                  { title: 'Partner Access Policy', date: 'Dec 28, 2025', status: 'Acknowledged' }
                ]}
              />
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Stakeholder Directory</h2>
              <RoleStakeholderDirectoryPanel
                role="ADMIN"
                stakeholders={[
                  { name: 'Police Response Unit', focus: 'Emergency response', contact: 'police@reproplan.org' },
                  { name: 'Medical Response Team', focus: 'Clinical triage', contact: 'medical@reproplan.org' },
                  { name: 'Safe House Coordinators', focus: 'Shelter support', contact: 'safehouses@reproplan.org' },
                  { name: 'NGO Program Leads', focus: 'Community outreach', contact: 'ngo@reproplan.org' }
                ]}
              />
            </div>
          )}

          {activeTab === 'playbooks' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Playbooks</h2>
              <RolePlaybooksPanel
                role="ADMIN"
                playbooks={[
                  { title: 'Emergency Response Playbook', status: 'Active', updated: 'Jan 2026' },
                  { title: 'Partner Escalation Guide', status: 'Active', updated: 'Dec 2025' },
                  { title: 'Data Breach Response', status: 'Active', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Knowledge</h2>
              <RoleKnowledgeBasePanel
                role="ADMIN"
                articles={[
                  { title: 'Stakeholder Governance FAQ', category: 'Governance', updated: 'Jan 2026' },
                  { title: 'Incident Escalation Guide', category: 'Operations', updated: 'Dec 2025' },
                  { title: 'Data Security Checklist', category: 'Security', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Feedback</h2>
              <RoleFeedbackPanel
                role="ADMIN"
                highlights={[
                  { title: 'Dashboard UI Update', status: 'Open', date: 'Jan 18, 2026' },
                  { title: 'Report Export Request', status: 'In Review', date: 'Jan 12, 2026' },
                  { title: 'Access Controls Feedback', status: 'Closed', date: 'Dec 28, 2025' }
                ]}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <RoleSettingsPanel
                role="ADMIN"
                title="Administrator Settings"
                subtitle="Configure access controls, reporting, and compliance preferences."
              />
              <SystemSettings />
              <SecurityPreferences role="ADMIN" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
