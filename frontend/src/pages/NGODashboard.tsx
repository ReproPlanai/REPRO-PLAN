import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Search,
  Eye,
  FileText,
  Globe,
  Bell,
  Target,
  MessageSquare
} from 'lucide-react';
import { LogoCircular } from '../assets';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import { dataSecurityManager } from '../utils/dataSecurity';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
// import InterRoleMessaging from '../components/Dashboard/InterRoleMessaging'; // Reserved for future use
import ProgramDetails from './ngo/ProgramDetails';

interface NGODashboardProps {
  userData: any;
  onLogout: () => void;
}

const NGODashboard: React.FC<NGODashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [searchQuery, setSearchQuery] = useState('');

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);


  const [programs] = useState([
    { 
      id: 1, 
      name: 'SRHR Education Initiative', 
      location: 'Monrovia Schools',
      beneficiaries: 450,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      status: 'Active',
      budget: '$25,000',
      progress: 65
    },
    { 
      id: 2, 
      name: 'Youth Counseling Program', 
      location: 'Gbarnga Community Center',
      beneficiaries: 320,
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      status: 'Active',
      budget: '$18,000',
      progress: 40
    },
    { 
      id: 3, 
      name: 'Safe Space Support', 
      location: 'Buchanan Safe House',
      beneficiaries: 180,
      startDate: '2023-09-01',
      endDate: '2024-03-31',
      status: 'Completing',
      budget: '$12,000',
      progress: 85
    }
  ]);

  const [events] = useState([
    { id: 1, name: 'SRHR Workshop - Monrovia', date: '2024-01-25', time: '10:00 AM', location: 'Community Center', attendees: 45, status: 'Scheduled' },
    { id: 2, name: 'Youth Health Fair - Gbarnga', date: '2024-01-28', time: '09:00 AM', location: 'Town Hall', attendees: 120, status: 'Scheduled' },
    { id: 3, name: 'Counselor Training - Buchanan', date: '2024-02-02', time: '08:30 AM', location: 'Training Center', attendees: 25, status: 'Scheduled' }
  ]);

  const [impactMetrics] = useState([
    { id: 1, metric: 'Youth Reached', value: '2,847', change: '+12%', trend: 'up' },
    { id: 2, metric: 'Communities Served', value: '45', change: '+8%', trend: 'up' },
    { id: 3, metric: 'Programs Completed', value: '45', change: '+15%', trend: 'up' },
    { id: 4, metric: 'Partner Organizations', value: '12', change: '+2', trend: 'up' }
  ]);

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
    { id: 'resources', label: 'Resources', icon: FileText }
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md ring-2 ring-orange-100">
                <img 
                  src={LogoCircular} 
                  alt="REPRO PLAN Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">NGO Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Community Programs & Outreach</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={18} className="sm:w-5 sm:h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></span>
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
                      ? 'border-orange-500 text-orange-700 bg-orange-50'
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 xl:p-8">
          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Program Management</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Total Beneficiaries</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{ngoData.ngoMetrics.totalBeneficiaries.toLocaleString()}</p>
                      </div>
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Active Programs</p>
                        <p className="text-lg sm:text-2xl font-semibold text-green-600">{ngoData.ngoMetrics.activePrograms}</p>
                      </div>
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Completed Programs</p>
                        <p className="text-lg sm:text-2xl font-semibold text-blue-600">{ngoData.ngoMetrics.completedPrograms}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Community Reach</p>
                        <p className="text-lg sm:text-2xl font-semibold text-orange-600">{ngoData.ngoMetrics.communityReach.toLocaleString()}</p>
                      </div>
                      <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Programs List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Active Programs</h3>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                          New Program
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
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
                        {programs.map((program) => (
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                    New Event
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Event Schedule</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                    <div className="flex items-center justify-between">
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
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
