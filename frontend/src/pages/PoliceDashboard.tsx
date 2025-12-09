import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Phone,
  Search,
  Eye,
  CheckCircle,
  TrendingUp,
  Bell,
  FileText,
  Navigation,
  QrCode,
  MessageSquare
} from 'lucide-react';
import { LogoCircular } from '../assets';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import EmergencyAlertSystem from '../components/EmergencyAlertSystem';
import MapTracking from '../components/MapTracking';
import QRVerificationManager from '../components/QRCode/QRVerificationManager';
import { dataSecurityManager } from '../utils/dataSecurity';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
import IncidentReports from './police/IncidentReports';

interface PoliceDashboardProps {
  userData: any;
  onLogout: () => void;
}

const PoliceDashboard: React.FC<PoliceDashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('emergency');
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyLocations, setEmergencyLocations] = useState<any[]>([]);
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

  // Placeholder data for secure visualizations
  const policeData = {
    emergencyTypes: [
      { id: 1, label: 'GBV', value: stakeholderAPI.alerts.filter(a => a.alertType === 'gbv').length || 10 },
      { id: 2, label: 'Medical', value: stakeholderAPI.alerts.filter(a => a.alertType === 'medical').length || 8 },
      { id: 3, label: 'Safety', value: stakeholderAPI.alerts.filter(a => a.alertType === 'safety').length || 6 },
      { id: 4, label: 'Other', value: stakeholderAPI.alerts.filter(a => a.alertType === 'other').length || 4 }
    ],
    responseTimes: [
      { id: 1, label: 'Avg Response (min)', value: calculateAverageResponseTime(stakeholderAPI.alerts) }
    ],
    caseStatus: [
      { id: 1, label: 'Open', value: stakeholderAPI.cases.filter(c => c.status === 'open').length },
      { id: 2, label: 'In Progress', value: stakeholderAPI.cases.filter(c => c.status === 'in_progress').length },
      { id: 3, label: 'Resolved', value: stakeholderAPI.cases.filter(c => c.status === 'resolved').length }
    ]
  };

  const tabs = [
    { id: 'emergency', label: 'Emergency Alerts', icon: AlertTriangle },
    { id: 'map', label: 'Map Tracking', icon: MapPin },
    { id: 'qr-scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'cases', label: 'Case Management', icon: FileText },
    { id: 'incidents', label: 'Incident Reports', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'patrol', label: 'Patrol Routes', icon: Navigation },
    { id: 'reports', label: 'Reports', icon: TrendingUp }
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
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Police Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Emergency Response & Case Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={18} className="sm:w-5 sm:h-5" />
                {emergencyAlerts.filter(alert => alert.status === 'active').length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
          {/* Emergency Alerts Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Emergency Response Center</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Active Alerts</p>
                        <p className="text-lg sm:text-2xl font-semibold text-red-600">{emergencyData.activeAlerts}</p>
                      </div>
                      <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Resolved Today</p>
                        <p className="text-lg sm:text-2xl font-semibold text-green-600">{emergencyData.resolvedToday}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Avg Response Time</p>
                        <p className="text-lg sm:text-2xl font-semibold text-blue-600">{emergencyData.averageResponseTime}m</p>
                      </div>
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Total Cases</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{emergencyData.totalCases}</p>
                      </div>
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 flex-shrink-0" />
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Case Management</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    New Case
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Cases</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
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
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
