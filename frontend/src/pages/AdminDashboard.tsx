import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  Download,
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
  UserCheck,
  ShoppingCart,
  Pill,
  Store,
  PlusCircle
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import { dataSecurityManager } from '../utils/dataSecurity';
import { userVerificationService } from '../utils/userVerification';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
import InterRoleMessaging from '../components/Dashboard/InterRoleMessaging';
import UserManagement from './admin/UserManagement';
import SystemSettings from './admin/SystemSettings';
import StakeholderManagement from './admin/StakeholderManagement';
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
import { AdminHeader, AdminSidebar, AdminCard, AdminBadge } from '../components/Admin';

interface AdminDashboardProps {
  userData: any;
  onLogout: () => void;
}

const AnalyticsTab: React.FC<{
  userData: any;
  stakeholderAPI: ReturnType<typeof useStakeholderAPI>;
  dashboardMetrics: { totalUsers: number; activeUsers: number; totalStakeholders: number; totalAlerts: number; totalCases: number };
  dataSecurityManager: typeof dataSecurityManager;
}> = ({ stakeholderAPI, dashboardMetrics, dataSecurityManager }) => {
  const alertsByType = stakeholderAPI.alerts.reduce((acc: Record<string, number>, a) => {
    acc[a.alertType || 'other'] = (acc[a.alertType || 'other'] || 0) + 1;
    return acc;
  }, {});
  const casesByStatus = stakeholderAPI.cases.reduce((acc: Record<string, number>, c) => {
    acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1;
    return acc;
  }, {});
  const chartDataAlerts = Object.entries(alertsByType).map(([label, value]) => ({ id: label, label, value }));
  const chartDataCases = Object.entries(casesByStatus).map(([label, value]) => ({ id: label, label, value }));

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', String(dashboardMetrics.totalUsers)],
      ['Active Users', String(dashboardMetrics.activeUsers)],
      ['Total Stakeholders', String(dashboardMetrics.totalStakeholders)],
      ['Total Alerts', String(stakeholderAPI.alerts.length)],
      ['Total Cases', String(stakeholderAPI.cases.length)],
      ['Active Alerts', String(stakeholderAPI.alerts.filter(a => a.status === 'active').length)],
      ['Open Cases', String(stakeholderAPI.cases.filter(c => c.status === 'open').length)]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600">Platform metrics and trends</p>
        <button
          onClick={handleExportReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900">{dashboardMetrics.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-semibold text-green-600">{dashboardMetrics.activeUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Alerts</p>
          <p className="text-2xl font-semibold text-gray-900">{stakeholderAPI.alerts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Cases</p>
          <p className="text-2xl font-semibold text-gray-900">{stakeholderAPI.cases.length}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartDataAlerts.length > 0 && (
          <SecureDataViewer
            data={chartDataAlerts}
            chartType="bar"
            title="Alerts by Type"
            description="Distribution of emergency alerts by type"
            userRole="ADMIN"
            onDataAccess={(log) => dataSecurityManager.logDataAccess(log)}
          />
        )}
        {chartDataCases.length > 0 && (
          <SecureDataViewer
            data={chartDataCases}
            chartType="pie"
            title="Cases by Status"
            description="Case distribution by status"
            userRole="ADMIN"
            onDataAccess={(log) => dataSecurityManager.logDataAccess(log)}
          />
        )}
      </div>
      {chartDataAlerts.length === 0 && chartDataCases.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">No chart data yet. Alerts and cases will appear here as they are created.</p>
        </div>
      )}
    </div>
  );
};

const UserAnalyticsTab: React.FC<{
  userAnalytics: any;
  loginEvents: any[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onRefresh: () => void;
}> = ({ userAnalytics, loginEvents, timeRange, onTimeRangeChange, onRefresh }) => {
  if (!userAnalytics) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const { summary, userActivity, demographics } = userAnalytics;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600">User analytics and activity data</p>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Logins</p>
          <p className="text-2xl font-semibold text-blue-600">{summary.totalLogins}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">New Signups</p>
          <p className="text-2xl font-semibold text-green-600">{summary.newSignups}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-semibold text-purple-600">{summary.activeUsers}</p>
        </div>
      </div>

      {/* User Activity Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent User Activity</h3>
          <p className="text-sm text-gray-600">Latest 100 users with signup and login timestamps</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">User ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Signup Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Last Login</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userActivity.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{user.id}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.signupDate ? new Date(user.signupDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.activityStatus === 'today' ? 'bg-green-100 text-green-800' :
                      user.activityStatus === 'week' ? 'bg-blue-100 text-blue-800' :
                      user.activityStatus === 'month' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.activityStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isVerified ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <AlertCircle size={16} className="text-gray-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Login Events with IPs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Login Events with IP Addresses</h3>
          <p className="text-sm text-gray-600">Recent login attempts with IP tracking</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">User ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">IP Address</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loginEvents.length > 0 ? loginEvents.map((event: any) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{event.userId || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{event.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-900 font-mono text-xs">{event.ipAddress || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                    {event.userAgent || 'N/A'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No login events recorded yet. Enable tracking to start collecting data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demographics */}
      {demographics && demographics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Demographics</h3>
            <p className="text-sm text-gray-600">Distribution by gender and age range</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demographics.map((demo: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {demo.gender || 'Unknown'} - {demo.ageRange || 'Unknown'}
                  </p>
                  <p className="text-2xl font-semibold text-blue-600">{demo.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [alertFilters, setAlertFilters] = useState<{ status?: string; priority?: string }>({});
  const [caseFilters, setCaseFilters] = useState<{ status?: string; priority?: string }>({});
  const [verificationRefresh, setVerificationRefresh] = useState(0);
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
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [loginEvents, setLoginEvents] = useState<any[]>([]);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('30d');

  // Connect to backend API
  const stakeholderAPI = useStakeholderAPI({
    role: 'ADMIN',
    stakeholderId: userData?.id
  });

  // Fetch real dashboard data
  useEffect(() => {
    if (userData?.id) {
      fetchDashboardMetrics();
      fetchUserAnalytics();
      fetchLoginEvents();
      stakeholderAPI.fetchAlerts();
      stakeholderAPI.fetchCases();
      stakeholderAPI.fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, analyticsTimeRange]);

  const fetchUserAnalytics = async () => {
    try {
      const response = await apiService.getUserAnalytics(analyticsTimeRange);
      if (response.success) {
        setUserAnalytics(response.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
    }
  };

  const fetchLoginEvents = async () => {
    try {
      const response = await apiService.getLoginEvents(20, 0);
      if (response.success) {
        setLoginEvents(response.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch login events:', error);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      const [alertsResponse, casesResponse, usersResponse, stakeholdersResponse] = await Promise.all([
        apiService.getAlerts('ADMIN', userData?.id) as Promise<{ success?: boolean; alerts?: any[] }>,
        apiService.getCases('ADMIN', userData?.id) as Promise<{ success?: boolean; cases?: any[] }>,
        apiService.getUsers() as Promise<{ success?: boolean; users?: any[] }>,
        apiService.getStakeholders() as Promise<{ success?: boolean; stakeholders?: any[] }>
      ]);

      const totalAlerts = alertsResponse?.success ? (alertsResponse.alerts?.length || 0) : 0;
      const totalCases = casesResponse?.success ? (casesResponse.cases?.length || 0) : 0;
      const users = usersResponse?.success ? (usersResponse.users || []) : [];
      const totalUsers = users.length;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const activeUsers = users.filter((u: any) => u.isUsed && u.lastLogin && u.lastLogin >= sevenDaysAgo).length;
      const totalStakeholders = stakeholdersResponse?.success ? (stakeholdersResponse.stakeholders?.length || 0) : 0;
      const activeAlerts = (alertsResponse?.alerts || []).filter((a: any) => a.status === 'active').length;

      setDashboardMetrics({
        totalAlerts,
        totalCases,
        activeAlerts,
        totalUsers,
        activeUsers,
        totalStakeholders,
        systemHealth: 100,
        responseTime: Math.floor(Math.random() * 100) + 50
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
    { id: 4, user: 'Anonymous User', action: 'Submitted mentorship request', time: '22 min ago', location: 'Accra' },
    { id: 5, user: 'Anonymous User', action: 'Completed SRHR quiz', time: '30 min ago', location: 'Tema' },
    { id: 6, user: 'Anonymous User', action: 'Generated QR verification', time: '45 min ago', location: 'Tamale' }
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
    { id: 'verification', label: 'Verification Requests', icon: UserCheck },
    { id: 'ecommerce', label: 'E-Commerce', icon: Store },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'user-analytics', label: 'User Analytics', icon: UsersIcon },
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
    { id: 'stakeholders', label: 'Stakeholders', icon: UsersIcon },
    { id: 'directory', label: 'Stakeholder Directory', icon: Users },
    { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
    { id: 'knowledge', label: 'Knowledge', icon: Book },
    { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
    { id: 'collaboration', label: 'Collaboration', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Sidebar */}
        <AdminSidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          items={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <AdminHeader
            onMenuToggle={() => setIsMenuOpen(true)}
            title="Admin Dashboard"
          />

          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">System Overview</h2>
                
                {/* Stats Cards - Mobile Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <AdminCard hover padding="md" shadow="lg">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Total Users</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{dashboardData.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                  </AdminCard>
                  
                  <AdminCard hover padding="md" shadow="lg">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Active Users</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{dashboardData.activeUsers.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex-shrink-0">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </div>
                  </AdminCard>
                  
                  <AdminCard hover padding="md" shadow="lg">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">Emergency Alerts</p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{dashboardData.emergencyAlerts}</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      </div>
                    </div>
                  </AdminCard>
                  
                  <AdminCard hover padding="md" shadow="lg">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">System Health</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{dashboardData.systemHealth}%</p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </div>
                  </AdminCard>
                </div>

                {/* Recent Alerts - Mobile Responsive */}
                <AdminCard padding="md" shadow="lg">
                  <div className="p-3 sm:p-4 border-b border-gray-200/60">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Alerts</h3>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {recentAlerts.map((alert) => (
                        <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl space-y-2 sm:space-y-0 hover:bg-gray-100/80 transition-colors">
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
                          <AdminBadge 
                            variant={alert.status === 'active' ? 'danger' : alert.status === 'resolved' ? 'success' : 'warning'}
                          >
                            {alert.status}
                          </AdminBadge>
                        </div>
                      ))}
                    </div>
                  </div>
                </AdminCard>

                {/* Secure Data Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <AdminCard padding="lg" shadow="lg">
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
                  </AdminCard>
                  
                  <AdminCard padding="lg" shadow="lg">
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
                  </AdminCard>
                </div>

                <AdminCard padding="lg" shadow="lg">
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
                </AdminCard>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Emergency Alerts</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={alertFilters.status ?? ''}
                  onChange={(e) => {
                    const next = { ...alertFilters, status: e.target.value || undefined };
                    setAlertFilters(next);
                    stakeholderAPI.fetchAlerts(next);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={alertFilters.priority ?? ''}
                  onChange={(e) => {
                    const next = { ...alertFilters, priority: e.target.value || undefined };
                    setAlertFilters(next);
                    stakeholderAPI.fetchAlerts(next);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  onClick={() => {
                    setAlertFilters({});
                    stakeholderAPI.fetchAlerts();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Reset Filters
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="block sm:hidden p-3 space-y-3">
                  {stakeholderAPI.alerts.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">No alerts found</p>
                  ) : (
                    stakeholderAPI.alerts.map((alert) => (
                      <div key={alert.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900">{alert.alertType}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            alert.status === 'active' ? 'bg-red-100 text-red-700' :
                            alert.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{alert.status}</span>
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500">{alert.location?.address || 'N/A'}, {alert.location?.city || ''}</p>
                        <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
                        {alert.status === 'active' && (
                          <button
                            onClick={() => stakeholderAPI.updateAlert(alert.id, { status: 'resolved' })}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stakeholderAPI.alerts.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No alerts found</td></tr>
                      ) : (
                        stakeholderAPI.alerts.map((alert) => (
                          <tr key={alert.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{alert.alertType}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{alert.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{alert.location?.address || 'N/A'}, {alert.location?.city || ''}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                alert.status === 'active' ? 'bg-red-100 text-red-700' :
                                alert.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{alert.status}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(alert.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">
                              {alert.status === 'active' && (
                                <button
                                  onClick={() => stakeholderAPI.updateAlert(alert.id, { status: 'resolved' })}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === 'cases' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Case Management</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={caseFilters.status ?? ''}
                  onChange={(e) => {
                    const next = { ...caseFilters, status: e.target.value || undefined };
                    setCaseFilters(next);
                    stakeholderAPI.fetchCases(next);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={caseFilters.priority ?? ''}
                  onChange={(e) => {
                    const next = { ...caseFilters, priority: e.target.value || undefined };
                    setCaseFilters(next);
                    stakeholderAPI.fetchCases(next);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  onClick={() => {
                    setCaseFilters({});
                    stakeholderAPI.fetchCases();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Reset Filters
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="block sm:hidden p-3 space-y-3">
                  {stakeholderAPI.cases.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">No cases found</p>
                  ) : (
                    stakeholderAPI.cases.map((c) => (
                      <div key={c.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900">{c.caseNumber}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            c.status === 'open' ? 'bg-red-100 text-red-700' :
                            c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{c.status}</span>
                        </div>
                        <p className="text-sm text-gray-600">{c.description}</p>
                        <p className="text-xs text-gray-500">{c.location?.address || 'N/A'}, {c.location?.city || ''}</p>
                        <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                        {c.status === 'open' && (
                          <button
                            onClick={() => stakeholderAPI.updateCase(c.id, { status: 'resolved' })}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stakeholderAPI.cases.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No cases found</td></tr>
                      ) : (
                        stakeholderAPI.cases.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{c.caseNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{c.caseType}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{c.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{c.location?.address || 'N/A'}, {c.location?.city || ''}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                c.status === 'open' ? 'bg-red-100 text-red-700' :
                                c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{c.status}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">
                              {c.status === 'open' && (
                                <button
                                  onClick={() => stakeholderAPI.updateCase(c.id, { status: 'resolved' })}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Access Log Summary</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(() => {
                      const logs = dataSecurityManager.getAccessLogs('ADMIN').slice(-20).reverse();
                      return logs.length === 0 ? (
                        <p className="text-sm text-gray-500">No access logs yet</p>
                      ) : (
                        logs.map((log, i) => (
                          <div key={i} className="text-sm p-2 bg-gray-50 rounded">
                            <span className="font-medium">{log.userRole}</span> accessed <span className="font-medium">{log.dataType}</span>
                            {log.accessGranted ? (
                              <span className="text-green-600 ml-1">✓</span>
                            ) : (
                              <span className="text-red-600 ml-1">✗</span>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Security Status</h3>
                  {(() => {
                    const status = dataSecurityManager.getSecurityStatus('ADMIN');
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active NDA</span>
                          <span className={status.hasActiveNDA ? 'text-green-600' : 'text-gray-500'}>
                            {status.hasActiveNDA ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sensitive Data Access</span>
                          <span className={status.canAccessSensitiveData ? 'text-green-600' : 'text-gray-500'}>
                            {status.canAccessSensitiveData ? 'Allowed' : 'Restricted'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Recent Access Count</span>
                          <span className="text-gray-900">{status.recentAccessCount}</span>
                        </div>
                        {status.lastAccessTime && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Access</span>
                            <span className="text-gray-900 text-sm">{new Date(status.lastAccessTime).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Security Preferences</h4>
                    <SecurityPreferences role="ADMIN" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-base font-medium text-gray-900 mb-2">Active Sessions</h3>
                <p className="text-sm text-gray-600">Stakeholder sessions are managed via OTP. No persistent sessions in demo mode.</p>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Verification Requests</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {(() => {
                  void verificationRefresh; // trigger re-render when refresh changes
                  const requests = userVerificationService.getAllRequests();
                  const pending = requests.filter(r => r.status === 'pending');
                  return pending.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No pending verification requests
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {pending.map((req) => (
                        <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">ID: {req.id}</p>
                            <p className="text-sm text-gray-600">Phone: {req.phoneNumber}</p>
                            <p className="text-sm text-gray-600">Reason: {req.reason}</p>
                            <p className="text-xs text-gray-500">{new Date(req.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                userVerificationService.adminApprove(req.id);
                                setVerificationRefresh(v => v + 1);
                              }}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                userVerificationService.adminReject(req.id);
                                setVerificationRefresh(v => v + 1);
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Requests (All)</h3>
                {(() => {
                  void verificationRefresh;
                  const all = userVerificationService.getAllRequests().slice(-10).reverse();
                  return all.length === 0 ? (
                    <p className="text-sm text-gray-500">No verification requests yet</p>
                  ) : (
                    <div className="space-y-2">
                      {all.map((r) => (
                        <div key={r.id} className="text-sm flex justify-between items-center">
                          <span>{r.phoneNumber} - {(r.reason || '').slice(0, 40)}{(r.reason || '').length > 40 ? '...' : ''}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'ecommerce' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Store className="w-6 h-6 text-primary-600" />
                    E-Commerce Management
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage products, orders, and pharmacy inventory</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.open('/medication-order', '_blank')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-all shadow-sm"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Open Store
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
                    </div>
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                      <Pill className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Orders Today</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">-</p>
                    </div>
                    <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Revenue</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">-</p>
                    </div>
                    <div className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Low Stock Items</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">-</p>
                    </div>
                    <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button 
                    onClick={() => window.open('/medication-order', '_blank')}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left"
                  >
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <PlusCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Add Product</p>
                      <p className="text-sm text-gray-500">Create new medication listing</p>
                    </div>
                  </button>
                  <button 
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View Orders</p>
                      <p className="text-sm text-gray-500">Manage pending orders</p>
                    </div>
                  </button>
                  <button 
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pharmacies</p>
                      <p className="text-sm text-gray-500">Manage pharmacy partners</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Pill className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Full Store Management</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Access the complete medication ordering system to manage products, process orders, 
                      and configure pharmacy partnerships. The store supports anonymous youth access with 
                      privacy-preserving features.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-primary-700 border border-primary-200">
                        Anonymous Access
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-primary-700 border border-primary-200">
                        Offline Support
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-primary-700 border border-primary-200">
                        Privacy Protected
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-primary-700 border border-primary-200">
                        Tier 3 Security
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <AnalyticsTab
                userData={userData}
                stakeholderAPI={stakeholderAPI}
                dashboardMetrics={dashboardMetrics}
                dataSecurityManager={dataSecurityManager}
              />
            </div>
          )}

          {activeTab === 'user-analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">User Analytics</h2>
              <UserAnalyticsTab
                userAnalytics={userAnalytics}
                loginEvents={loginEvents}
                timeRange={analyticsTimeRange}
                onTimeRangeChange={setAnalyticsTimeRange}
                onRefresh={() => {
                  fetchUserAnalytics();
                  fetchLoginEvents();
                }}
              />
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
                  { label: 'Hotspot Echo', region: 'Accra', status: 'Stable' }
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
                  { title: 'Partnership Outreach', region: 'Ghana', status: 'Planned' }
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
                  { label: 'Funding Gap Risk', region: 'Accra', level: 'Moderate' }
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

          {activeTab === 'stakeholders' && (
            <div className="space-y-6">
              <StakeholderManagement />
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
    </PageContainer>
  );
};

export default AdminDashboard;
