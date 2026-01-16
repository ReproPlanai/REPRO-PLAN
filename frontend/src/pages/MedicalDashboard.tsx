import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Eye,
  Phone,
  FileText,
  Bell,
  Pill,
  MessageSquare,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { LogoCircular } from '../assets';
import SecureDataViewer from '../components/DataVisualization/SecureDataViewer';
import { dataSecurityManager } from '../utils/dataSecurity';
import { useStakeholderAPI } from '../hooks/useStakeholderAPI';
// import InterRoleMessaging from '../components/Dashboard/InterRoleMessaging'; // Reserved for future use
import PatientRecords from './medical/PatientRecords';
import SecurityPreferences from '../components/Settings/SecurityPreferences';

interface MedicalDashboardProps {
  userData: any;
  onLogout: () => void;
}

const MedicalDashboard: React.FC<MedicalDashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Connect to backend API
  const stakeholderAPI = useStakeholderAPI({
    role: 'MEDICAL',
    stakeholderId: userData?.id
  });

  // Real medical metrics from API data - using individual values instead of object

  // Fetch real data from backend
  useEffect(() => {
    if (userData?.id) {
      stakeholderAPI.fetchAlerts();
      stakeholderAPI.fetchCases();
      stakeholderAPI.fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);


  const [patients] = useState([
    { 
      id: 1, 
      name: 'Anonymous Patient A', 
      age: 24, 
      condition: 'Prenatal Care',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-22',
      status: 'Active',
      priority: 'Normal'
    },
    { 
      id: 2, 
      name: 'Anonymous Patient B', 
      age: 19, 
      condition: 'STI Testing',
      lastVisit: '2024-01-14',
      nextAppointment: '2024-01-21',
      status: 'Follow-up',
      priority: 'High'
    },
    { 
      id: 3, 
      name: 'Anonymous Patient C', 
      age: 22, 
      condition: 'Contraception Counseling',
      lastVisit: '2024-01-13',
      nextAppointment: '2024-01-20',
      status: 'Active',
      priority: 'Normal'
    },
    {
      id: 4,
      name: 'Anonymous Patient D',
      age: 28,
      condition: 'Post-incident Care',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-19',
      status: 'Follow-up',
      priority: 'High'
    },
    {
      id: 5,
      name: 'Anonymous Patient E',
      age: 31,
      condition: 'General SRHR Consultation',
      lastVisit: '2024-01-11',
      nextAppointment: '2024-01-18',
      status: 'Active',
      priority: 'Medium'
    }
  ]);

  const [appointments] = useState([
    { id: 1, patient: 'Anonymous Patient A', time: '09:00 AM', type: 'Prenatal Checkup', doctor: 'Dr. Johnson', status: 'Scheduled' },
    { id: 2, patient: 'Anonymous Patient B', time: '10:30 AM', type: 'STI Testing', doctor: 'Dr. Smith', status: 'In Progress' },
    { id: 3, patient: 'Anonymous Patient C', time: '02:00 PM', type: 'Contraception Consultation', doctor: 'Dr. Brown', status: 'Scheduled' },
    { id: 4, patient: 'Anonymous Patient D', time: '03:30 PM', type: 'Follow-up Care', doctor: 'Dr. Kromah', status: 'Scheduled' },
    { id: 5, patient: 'Anonymous Patient E', time: '04:30 PM', type: 'SRHR Counseling', doctor: 'Dr. Doe', status: 'Scheduled' }
  ]);

  // Map API alerts to display format
  const emergencyAlerts = stakeholderAPI.alerts.map(alert => ({
    id: alert.id,
    type: alert.alertType,
    message: alert.description,
    time: new Date(alert.createdAt).toLocaleString(),
    severity: alert.priority
  }));

  // Placeholder data for secure visualizations
  const medicalData = {
    medicalMetrics: {
      totalPatients: 0,
      activePatients: 0,
      appointmentsToday: 0,
      emergencyCases: emergencyAlerts.filter((a) => a.severity === 'critical').length
    },
    patientConditions: [
      { id: 1, label: 'Prenatal Care', value: 35 },
      { id: 2, label: 'STI Testing', value: 25 },
      { id: 3, label: 'Counseling', value: 20 },
      { id: 4, label: 'Other', value: 20 }
    ],
    appointmentTrend: [
      { id: 1, label: 'Week 1', value: 12 },
      { id: 2, label: 'Week 2', value: 18 },
      { id: 3, label: 'Week 3', value: 15 },
      { id: 4, label: 'Week 4', value: 20 }
    ],
    patientAgeGroups: [
      { id: 1, label: '18-24', value: 40 },
      { id: 2, label: '25-34', value: 30 },
      { id: 3, label: '35-44', value: 20 },
      { id: 4, label: '45+', value: 10 }
    ]
  };

  const tabs = [
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'records', label: 'Patient Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'resources', label: 'Resources', icon: Pill },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Follow-up': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md ring-2 ring-purple-100">
                <img 
                  src={LogoCircular} 
                  alt="REPRO PLAN Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Medical Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Patient Care & Medical Services</p>
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
                {emergencyAlerts.filter(alert => alert.severity === 'high').length > 0 && (
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
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
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
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
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
          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Patient Management</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Total Patients</p>
                        <p className="text-lg sm:text-2xl font-semibold text-gray-900">{medicalData.medicalMetrics.totalPatients.toLocaleString()}</p>
                      </div>
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Active Patients</p>
                        <p className="text-lg sm:text-2xl font-semibold text-green-600">{medicalData.medicalMetrics.activePatients.toLocaleString()}</p>
                      </div>
                      <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Appointments Today</p>
                        <p className="text-lg sm:text-2xl font-semibold text-blue-600">{medicalData.medicalMetrics.appointmentsToday}</p>
                      </div>
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Emergency Cases</p>
                        <p className="text-lg sm:text-2xl font-semibold text-red-600">{medicalData.medicalMetrics.emergencyCases}</p>
                      </div>
                      <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Patients List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Patient Records</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                          New Patient
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Mobile Card View */}
                  <div className="block sm:hidden">
                    <div className="p-3 space-y-3">
                      {patients.map((patient) => (
                        <div key={patient.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                              <p className="text-xs text-gray-500">{patient.condition}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">Age: {patient.age}</div>
                          <div className="text-sm text-gray-600">Last visit: {patient.lastVisit}</div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(patient.priority)}`}>
                              {patient.priority}
                            </span>
                            <div className="flex items-center space-x-3">
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patients.map((patient) => (
                          <tr key={patient.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{patient.age}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{patient.condition}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{patient.lastVisit}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                                {patient.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(patient.priority)}`}>
                                {patient.priority}
                              </span>
                            </td>
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
                    data={medicalData.patientConditions}
                    chartType="pie"
                    title="Patient Conditions Distribution"
                    description="Breakdown of patient conditions and treatment types"
                    userRole="MEDICAL"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                  
                  <SecureDataViewer
                    data={medicalData.appointmentTrend}
                    chartType="line"
                    title="Appointment Trends"
                    description="Monthly appointment scheduling and patient flow"
                    userRole="MEDICAL"
                    onDataAccess={(accessLog) => {
                      dataSecurityManager.logDataAccess(accessLog);
                    }}
                  />
                </div>

                <SecureDataViewer
                  data={medicalData.patientAgeGroups}
                  chartType="bar"
                  title="Patient Age Demographics"
                  description="Age group distribution of patient population"
                  userRole="MEDICAL"
                  onDataAccess={(accessLog) => {
                    dataSecurityManager.logDataAccess(accessLog);
                  }}
                />
              </div>
            </div>
          )}

          {/* Patient Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-4 sm:space-y-6">
              <PatientRecords />
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Appointment Schedule</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                    New Appointment
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
                </div>
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                  <div className="p-3 space-y-3">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                            <p className="text-xs text-gray-500">{appointment.type}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">Time: {appointment.time}</div>
                        <div className="text-sm text-gray-600">Doctor: {appointment.doctor}</div>
                        <div className="flex items-center justify-end space-x-3">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={14} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <CheckCircle size={14} />
                          </button>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{appointment.time}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{appointment.patient}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{appointment.type}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{appointment.doctor}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Eye size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              <CheckCircle size={16} />
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

          {/* Emergency Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Emergency Response</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Emergency Alerts</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {emergencyAlerts.map((alert) => (
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

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Medical Resources</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Medical resource management and supply tracking features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <SecurityPreferences role="MEDICAL" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;
