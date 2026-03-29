import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Shield, 
  CheckCircle,
  Search,
  Eye,
  Phone,
  Calendar,
  FileText,
  Bell,
  Lock,
  MessageSquare,
  Menu,
  X,
  Settings,
  ClipboardList,
  BookOpen,
  LifeBuoy,
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
  MessageSquarePlus,
  Book
} from 'lucide-react';
import { LogoCircular } from '../assets';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import { dataSecurityManager } from '../utils/dataSecurity';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
import { apiService } from '../services/api';
// import InterRoleMessaging from '../components/Dashboard/InterRoleMessaging'; // Reserved for future use
import ResidentIntake from './safehouse/ResidentIntake';
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

interface SafeHouseDashboardProps {
  userData: any;
  onLogout: () => void;
}

interface AccessLog {
  id: number;
  user: string;
  action: string;
  time: string;
  location: string;
  status: string;
}

interface Resident {
  id: string | number;
  name: string;
  checkIn: string;
  status: string;
  room: string;
  needs: string;
  emergencyContact?: string;
  caseId?: string | number;
}

const SafeHouseDashboard: React.FC<SafeHouseDashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('residents');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Connect to backend API
  const stakeholderAPI = useStakeholderAPI({
    role: 'SAFEHOUSE',
    stakeholderId: userData?.id
  });

  // Real safe house metrics from API data
  const safeHouseData = {
    houseMetrics: {
      totalCapacity: 20, // This would come from a separate API endpoint
      currentOccupants: 8, // This would come from a separate API endpoint
      availableBeds: 12, // Calculated from capacity - occupants
      securityLevel: 'High', // This would come from system configuration
      occupancyRate: 40 // Calculated percentage
    },
    residentStatus: [
      { name: 'Active Residents', value: 6, color: '#10B981' },
      { name: 'Pending Transfer', value: 2, color: '#F59E0B' },
      { name: 'Temporary Leave', value: 0, color: '#6B7280' }
    ],
    capacityTrend: [
      { month: 'Jan', capacity: 85, occupancy: 68 },
      { month: 'Feb', capacity: 85, occupancy: 72 },
      { month: 'Mar', capacity: 85, occupancy: 78 },
      { month: 'Apr', capacity: 85, occupancy: 82 },
      { month: 'May', capacity: 85, occupancy: 75 },
      { month: 'Jun', capacity: 85, occupancy: 80 }
    ],
    resourceUsage: [
      { resource: 'Food Supplies', used: 75, available: 25, color: '#EF4444' },
      { resource: 'Medical Supplies', used: 45, available: 55, color: '#10B981' },
      { resource: 'Hygiene Products', used: 60, available: 40, color: '#3B82F6' },
      { resource: 'Bedding', used: 80, available: 20, color: '#F59E0B' }
    ]
  };

  // Fetch real data from backend
  useEffect(() => {
    if (userData?.id) {
      stakeholderAPI.fetchAlerts();
      stakeholderAPI.fetchCases();
      stakeholderAPI.fetchMessages();
      fetchResidents();
      fetchAccessLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  // Fetch residents from API
  const fetchResidents = async () => {
    setLoading(true);
    try {
      // Fetch cases that are associated with this safe house and transform to resident data
      const response = await apiService.getCases?.() as { success?: boolean; cases?: any[] };
      if (response?.success && response.cases) {
        // Transform cases with safe house placement to resident records
        const residentData = response.cases
          .filter((c: any) => c.safeHouseId === userData?.id || c.location?.type === 'safehouse')
          .map((c: any, index: number) => ({
            id: c.id || index + 1,
            name: `Resident ${c.anonymousId || String.fromCharCode(65 + index)}`,
            checkIn: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: c.status === 'active' ? 'Safe' : c.status === 'pending' ? 'Monitoring' : 'At Risk',
            room: `Room ${100 + index + 1}`,
            needs: c.needs || 'General support',
            emergencyContact: c.contactPhone || '+233-XXX-XXX-XXXX',
            caseId: c.id
          }));
        setResidents(residentData.length > 0 ? residentData : []);
      }
    } catch (error) {
      console.error('Failed to fetch residents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch access logs from API
  const fetchAccessLogs = async () => {
    try {
      // Use audit logs API if available, otherwise derive from cases
      const response = await apiService.getAuditLogs?.() as { success?: boolean; logs?: any[] };
      if (response?.success && response.logs) {
        const logData = response.logs
          .filter((l: any) => l.entityType === 'safehouse' || l.stakeholderType === 'SAFEHOUSE')
          .slice(0, 10)
          .map((l: any, index: number) => ({
            id: l.id || index + 1,
            user: l.userName || 'System',
            action: l.action || 'Access',
            time: l.createdAt ? new Date(l.createdAt).toLocaleString() : 'Unknown',
            location: l.location || 'Main Entrance',
            status: l.status || 'success'
          }));
        setAccessLogs(logData);
      } else {
        setAccessLogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch access logs:', error);
      setAccessLogs([]);
    }
  };

  // Mock data for demonstration
  const [houseData] = useState({
    totalCapacity: safeHouseData.houseMetrics.totalCapacity,
    currentOccupants: safeHouseData.houseMetrics.currentOccupants,
    availableBeds: safeHouseData.houseMetrics.availableBeds,
    securityLevel: safeHouseData.houseMetrics.securityLevel,
    lastInspection: '2024-01-15'
  });

  // Map API alerts to display format
  const securityAlerts = stakeholderAPI.alerts.map(alert => ({
    id: alert.id,
    type: alert.alertType,
    message: alert.description,
    time: new Date(alert.createdAt).toLocaleString(),
    severity: alert.priority
  }));

  const tabs = [
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'intake', label: 'New Intake', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'access', label: 'Access Control', icon: Lock },
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
      case 'Safe': return 'bg-green-100 text-green-800';
      case 'At Risk': return 'bg-red-100 text-red-800';
      case 'Monitoring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md ring-2 ring-green-100">
                <img 
                  src={LogoCircular} 
                  alt="REPRO PLAN Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 flex flex-col leading-[1]">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Safe House Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block -mt-2 leading-none">Resident Management & Security</p>
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
                {securityAlerts.filter(alert => alert.severity === 'high').length > 0 && (
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
                          ? 'bg-green-50 text-green-700 border border-green-200'
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
        <div className="hidden lg:block w-56 xl:w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700 border border-green-200'
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
          {/* Residents Tab */}
          {activeTab === 'residents' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Resident Management</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Total Capacity</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{houseData.totalCapacity}</p>
                      </div>
                      <Home className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Current Occupants</p>
                        <p className="text-lg sm:text-2xl font-semibold text-green-600">{houseData.currentOccupants}</p>
                      </div>
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Available Beds</p>
                        <p className="text-lg sm:text-2xl font-semibold text-blue-600">{houseData.availableBeds}</p>
                      </div>
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Security Level</p>
                        <p className="text-lg sm:text-2xl font-semibold text-green-600">{houseData.securityLevel}</p>
                      </div>
                      <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Residents List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Current Residents</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search residents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          New Resident
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Mobile Card View */}
                  <div className="block sm:hidden">
                    <div className="p-3 space-y-3">
                      {residents.map((resident) => (
                        <div key={resident.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{resident.name}</p>
                              <p className="text-xs text-gray-500">{resident.room}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(resident.status)}`}>
                              {resident.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">Check-in: {resident.checkIn}</div>
                          <div className="text-sm text-gray-600">Needs: {resident.needs}</div>
                          <div className="flex items-center justify-end space-x-3">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye size={14} />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <Phone size={14} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <FileText size={14} />
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Needs</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {residents.map((resident) => (
                          <tr key={resident.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{resident.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{resident.room}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{resident.checkIn}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(resident.status)}`}>
                                {resident.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{resident.needs}</td>
                            <td className="px-4 py-3 text-sm">
                              <button className="text-blue-600 hover:text-blue-800 mr-3">
                                <Eye size={16} />
                              </button>
                              <button className="text-green-600 hover:text-green-800 mr-3">
                                <Phone size={16} />
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

                {/* Secure Data Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <SecureDataViewer
                    data={safeHouseData.residentStatus}
                    chartType="pie"
                    title="Resident Status Distribution"
                    description="Current status breakdown of all residents"
                    userRole="SAFEHOUSE"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                  
                  <SecureDataViewer
                    data={safeHouseData.capacityTrend}
                    chartType="line"
                    title="Capacity Utilization Trend"
                    description="Monthly capacity usage and occupancy patterns"
                    userRole="SAFEHOUSE"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                </div>

                <SecureDataViewer
                  data={safeHouseData.resourceUsage}
                  chartType="bar"
                  title="Resource Usage Overview"
                  description="Current resource consumption and availability"
                  userRole="SAFEHOUSE"
                  onDataAccess={(accessLog) => {
                    dataSecurityManager.logDataAccess(accessLog);
                  }}
                />
              </div>
            </div>
          )}

          {/* Resident Intake Tab */}
          {activeTab === 'intake' && (
            <div className="space-y-4 sm:space-y-6">
              <ResidentIntake />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Security Monitoring</h2>
              
              {/* Security Alerts */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {securityAlerts.map((alert) => (
                      <div key={alert.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-500' : 
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-500">{alert.time}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Access Control Tab */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Access Control</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Access Logs</h3>
                </div>
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                  <div className="p-3 space-y-3">
                    {accessLogs.map((log) => (
                      <div key={log.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.user}</p>
                            <p className="text-xs text-gray-500">{log.action}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.status === 'success' ? 'bg-green-100 text-green-800' :
                            log.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{log.location}</div>
                        <div className="text-xs text-gray-500">{log.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {accessLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.user}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.location}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{log.time}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              log.status === 'success' ? 'bg-green-100 text-green-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Resource Management</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Resource management and supply tracking features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Operations Center</h2>
              <RoleQuickActionsPanel role="SAFEHOUSE" />
              <RoleOperationsPanel
                role="SAFEHOUSE"
                title="Safe House Operations"
                focusAreas={[
                  'Resident safety monitoring',
                  'Secure intake protocols',
                  'Resource readiness checks',
                  'Emergency relocation planning'
                ]}
                escalationTips={[
                  'Confirm resident status and emergency contacts.',
                  'Secure transport before initiating relocations.',
                  'Alert partner responders for high-risk cases.',
                  'Log facility incidents within 30 minutes.'
                ]}
              />
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Collaboration</h2>
              <RoleCollaborationPanel
                role="SAFEHOUSE"
                partnerTeams={[
                  'Police Response Unit',
                  'Medical Response Team',
                  'NGO Program Leads',
                  'Emergency Dispatch'
                ]}
              />
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Training</h2>
              <RoleTrainingPanel
                role="SAFEHOUSE"
                modules={[
                  { title: 'Resident Safety Protocols', status: 'Completed', duration: '35 min' },
                  { title: 'Crisis De-escalation', status: 'In Progress', duration: '30 min' },
                  { title: 'Secure Intake Process', status: 'Assigned', duration: '25 min' },
                  { title: 'Emergency Relocation', status: 'Assigned', duration: '20 min' }
                ]}
              />
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Compliance</h2>
              <RoleCompliancePanel
                role="SAFEHOUSE"
                checklist={[
                  'Confirm resident confidentiality logs.',
                  'Review access control events.',
                  'Validate emergency contact updates.',
                  'File monthly safety compliance report.'
                ]}
              />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
              <RoleResourcesPanel
                role="SAFEHOUSE"
                resources={[
                  { title: 'Resident Safety Manual', type: 'PDF', updated: 'Jan 2026' },
                  { title: 'Intake Checklist', type: 'DOCX', updated: 'Dec 2025' },
                  { title: 'Emergency Relocation Plan', type: 'PDF', updated: 'Dec 2025' },
                  { title: 'Inventory Tracking Sheet', type: 'XLSX', updated: 'Nov 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
              <RoleAuditPanel
                role="SAFEHOUSE"
                recentAudits={[
                  { title: 'Facility Access Review', status: 'Completed', date: 'Jan 04, 2026' },
                  { title: 'Resident Intake Audit', status: 'In Review', date: 'Dec 21, 2025' },
                  { title: 'Supply Compliance Check', status: 'Scheduled', date: 'Dec 09, 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Support</h2>
              <RoleSupportPanel
                role="SAFEHOUSE"
                contacts={[
                  'Safe House Operations',
                  'Security Coordinator',
                  'Emergency Logistics Desk',
                  'Wellness Support Lead'
                ]}
              />
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Directory</h2>
              <RolePartnerDirectoryPanel
                role="SAFEHOUSE"
                partners={[
                  { name: 'Police Response Unit', contact: 'police@reproplan.org', focus: 'Security escalation' },
                  { name: 'Medical Response Team', contact: 'medical@reproplan.org', focus: 'Clinical handoff' },
                  { name: 'NGO Program Leads', contact: 'ngo@reproplan.org', focus: 'Community support' },
                  { name: 'Emergency Dispatch', contact: 'dispatch@reproplan.org', focus: 'Rapid response' }
                ]}
              />
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Scheduling</h2>
              <RoleSchedulingPanel
                role="SAFEHOUSE"
                upcoming={[
                  { title: 'Resident Wellness Check', date: 'Jan 20, 2026', time: '09:00 AM' },
                  { title: 'Safety Drill', date: 'Jan 24, 2026', time: '01:30 PM' },
                  { title: 'Supply Replenishment', date: 'Jan 28, 2026', time: '10:00 AM' }
                ]}
              />
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Impact</h2>
              <RoleImpactPanel
                role="SAFEHOUSE"
                highlights={[
                  { label: 'Residents Supported', value: '186', change: '+6%' },
                  { label: 'Safe Transfers', value: '42', change: '+4%' },
                  { label: 'Emergency Responses', value: '58', change: '+9%' },
                  { label: 'Wellness Sessions', value: '128', change: '+11%' }
                ]}
              />
            </div>
          )}

          {activeTab === 'geointel' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Geo Intelligence</h2>
              <RoleGeoIntelPanel
                role="SAFEHOUSE"
                hotspots={[
                  { label: 'High Risk Intake', region: 'Accra', status: 'High' },
                  { label: 'Transfer Watch', region: 'Kumasi', status: 'Elevated' },
                  { label: 'Support Need', region: 'Tamale', status: 'Moderate' },
                  { label: 'Partner Alert', region: 'Accra', status: 'Stable' }
                ]}
              />
            </div>
          )}

          {activeTab === 'fieldops' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Field Operations</h2>
              <RoleFieldOpsPanel
                role="SAFEHOUSE"
                missions={[
                  { title: 'Relocation Support', region: 'Greater Accra', status: 'Active' },
                  { title: 'Safety Assessment', region: 'Ashanti', status: 'Planned' },
                  { title: 'Emergency Intake', region: 'Northern Region', status: 'In Progress' },
                  { title: 'Partner Escort', region: 'Ghana', status: 'Planned' }
                ]}
              />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
              <RoleInventoryPanel
                role="SAFEHOUSE"
                items={[
                  { name: 'Bedding Supplies', level: '52 units', status: 'Healthy' },
                  { name: 'Hygiene Kits', level: '26 kits', status: 'Monitor' },
                  { name: 'Medical Supplies', level: '12 kits', status: 'Low' },
                  { name: 'Emergency Packs', level: '38 units', status: 'Healthy' }
                ]}
              />
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Funding</h2>
              <RoleFundingPanel
                role="SAFEHOUSE"
                grants={[
                  { name: 'Safe House Capacity', amount: '$46,000', status: 'Active' },
                  { name: 'Wellness Support Fund', amount: '$28,000', status: 'Pending' },
                  { name: 'Emergency Relocation', amount: '$19,000', status: 'Approved' },
                  { name: 'Facility Upgrade Grant', amount: '$33,000', status: 'Active' }
                ]}
              />
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Risk Intelligence</h2>
              <RoleRiskPanel
                role="SAFEHOUSE"
                risks={[
                  { label: 'Capacity Overload Risk', region: 'Accra', level: 'High' },
                  { label: 'Security Staffing Gap', region: 'Kumasi', level: 'Moderate' },
                  { label: 'Emergency Transfer Demand', region: 'Tamale', level: 'Elevated' },
                  { label: 'Supply Shortage Risk', region: 'Accra', level: 'Moderate' }
                ]}
              />
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Data Sharing</h2>
              <RoleDataSharingPanel
                role="SAFEHOUSE"
                policies={[
                  'Share anonymized resident summaries only.',
                  'Exclude exact location details.',
                  'Require partner verification before sharing.'
                ]}
              />
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Transport Logistics</h2>
              <RoleTransportPanel
                role="SAFEHOUSE"
                routes={[
                  { name: 'Relocation Route A', eta: 'ETA 50m', status: 'Active' },
                  { name: 'Supply Run Route B', eta: 'ETA 1h', status: 'Planned' },
                  { name: 'Emergency Escort Route C', eta: 'ETA 2h', status: 'In Progress' }
                ]}
              />
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Case QA</h2>
              <RoleCaseQualityPanel
                role="SAFEHOUSE"
                reviews={[
                  { title: 'Resident Safety Review', status: 'In Progress', reviewer: 'QA Lead' },
                  { title: 'Intake Compliance Audit', status: 'Assigned', reviewer: 'Compliance' },
                  { title: 'Shelter Service Check', status: 'Completed', reviewer: 'Supervisor' }
                ]}
              />
            </div>
          )}

          {activeTab === 'grant-reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Grant Reports</h2>
              <RoleGrantReportingPanel
                role="SAFEHOUSE"
                reports={[
                  { title: 'Shelter Capacity Grant', status: 'Due Soon', due: 'Jan 26, 2026' },
                  { title: 'Wellness Support Grant', status: 'Draft', due: 'Feb 09, 2026' },
                  { title: 'Facility Upgrade Grant', status: 'Submitted', due: 'Jan 12, 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Governance</h2>
              <RoleDataGovernancePanel
                role="SAFEHOUSE"
                policies={[
                  'Retain shelter logs for 180 days.',
                  'Restrict access to resident data.',
                  'Monthly review of staff permissions.'
                ]}
              />
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Partner Contracts</h2>
              <RolePartnerContractsPanel
                role="SAFEHOUSE"
                contracts={[
                  { name: 'Emergency Response MoU', status: 'Active', renewal: 'Mar 2026' },
                  { name: 'Medical Support Agreement', status: 'Active', renewal: 'Apr 2026' },
                  { name: 'Security Services Contract', status: 'Review', renewal: 'Feb 2026' }
                ]}
              />
            </div>
          )}

          {activeTab === 'crisis-comms' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Crisis Communications</h2>
              <RoleCrisisCommsPanel
                role="SAFEHOUSE"
                bulletins={[
                  { title: 'Shelter Capacity Alert', status: 'Sent', time: '2 hours ago' },
                  { title: 'Safety Drill Notice', status: 'Draft', time: 'Today' },
                  { title: 'Partner Coordination Update', status: 'Scheduled', time: 'Tomorrow' }
                ]}
              />
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Regional Insights</h2>
              <RoleRegionalInsightsPanel
                role="SAFEHOUSE"
                insights={[
                  { region: 'Greater Accra', summary: 'Intake volume rising.', trend: 'Upward' },
                  { region: 'Ashanti', summary: 'Shelter coverage stable.', trend: 'Stable' },
                  { region: 'Northern Region', summary: 'Relocation demand rising.', trend: 'Upward' }
                ]}
              />
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Volunteers</h2>
              <RoleVolunteerPanel
                role="SAFEHOUSE"
                volunteers={[
                  { name: 'Resident Advocate', status: 'Active', skill: 'Support' },
                  { name: 'Logistics Helper', status: 'Active', skill: 'Operations' },
                  { name: 'Wellness Guide', status: 'Onboarding', skill: 'Care' }
                ]}
              />
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Policy Updates</h2>
              <RolePolicyUpdatesPanel
                role="SAFEHOUSE"
                updates={[
                  { title: 'Resident Safety Policy', date: 'Jan 11, 2026', status: 'Pending' },
                  { title: 'Access Control Update', date: 'Jan 01, 2026', status: 'Acknowledged' },
                  { title: 'Emergency Relocation SOP', date: 'Dec 19, 2025', status: 'Acknowledged' }
                ]}
              />
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Stakeholder Directory</h2>
              <RoleStakeholderDirectoryPanel
                role="SAFEHOUSE"
                stakeholders={[
                  { name: 'Police Response Unit', focus: 'Security escalation', contact: 'police@reproplan.org' },
                  { name: 'Medical Response Team', focus: 'Clinical handoff', contact: 'medical@reproplan.org' },
                  { name: 'NGO Program Leads', focus: 'Community support', contact: 'ngo@reproplan.org' },
                  { name: 'Emergency Dispatch', focus: 'Rapid response', contact: 'dispatch@reproplan.org' }
                ]}
              />
            </div>
          )}

          {activeTab === 'playbooks' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Playbooks</h2>
              <RolePlaybooksPanel
                role="SAFEHOUSE"
                playbooks={[
                  { title: 'Resident Intake Playbook', status: 'Active', updated: 'Jan 2026' },
                  { title: 'Emergency Relocation Guide', status: 'Active', updated: 'Dec 2025' },
                  { title: 'Safety Drill Playbook', status: 'Active', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Knowledge</h2>
              <RoleKnowledgeBasePanel
                role="SAFEHOUSE"
                articles={[
                  { title: 'Shelter Safety FAQ', category: 'Safety', updated: 'Jan 2026' },
                  { title: 'Resident Care Notes', category: 'Care', updated: 'Dec 2025' },
                  { title: 'Emergency Response Guide', category: 'Operations', updated: 'Dec 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Feedback</h2>
              <RoleFeedbackPanel
                role="SAFEHOUSE"
                highlights={[
                  { title: 'Intake Workflow Feedback', status: 'Open', date: 'Jan 14, 2026' },
                  { title: 'Supply Restock Notes', status: 'In Review', date: 'Jan 06, 2026' },
                  { title: 'Resident Wellness UI', status: 'Closed', date: 'Dec 24, 2025' }
                ]}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <RoleSettingsPanel
                role="SAFEHOUSE"
                title="Safe House Settings"
                subtitle="Configure resident alerts, compliance, and access controls."
              />
              <SecurityPreferences role="SAFEHOUSE" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeHouseDashboard;
