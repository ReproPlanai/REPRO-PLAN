// Sample data generators for different stakeholder roles
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface DashboardMetrics {
  total: number;
  active: number;
  completed: number;
  pending: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

// Admin Dashboard Data
export const generateAdminData = () => ({
  userMetrics: {
    totalUsers: 1247,
    activeUsers: 892,
    newUsers: 45,
    trend: 'up' as const,
    percentage: 12.5
  },
  systemHealth: {
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.2,
    trend: 'stable' as const
  },
  securityAlerts: [
    { name: 'Failed Logins', value: 23, severity: 'medium' },
    { name: 'Suspicious Activity', value: 8, severity: 'high' },
    { name: 'Data Breach Attempts', value: 3, severity: 'critical' },
    { name: 'Unauthorized Access', value: 12, severity: 'medium' }
  ],
  userActivity: [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 145 },
    { name: 'Mar', value: 98 },
    { name: 'Apr', value: 167 },
    { name: 'May', value: 189 },
    { name: 'Jun', value: 203 }
  ],
  systemUsage: [
    { name: 'CPU Usage', value: 45 },
    { name: 'Memory Usage', value: 67 },
    { name: 'Storage Usage', value: 23 },
    { name: 'Network Usage', value: 34 }
  ]
});

// Police Dashboard Data
export const generatePoliceData = () => ({
  emergencyMetrics: {
    activeAlerts: 3,
    resolvedToday: 12,
    averageResponseTime: 4.2,
    totalCases: 156
  },
  emergencyTypes: [
    { name: 'Panic Button', value: 45, color: '#EF4444' },
    { name: 'Emergency Call', value: 32, color: '#F59E0B' },
    { name: 'SOS Signal', value: 28, color: '#8B5CF6' },
    { name: 'Distress Signal', value: 15, color: '#10B981' }
  ],
  responseTimes: [
    { name: 'Mon', value: 3.2 },
    { name: 'Tue', value: 4.1 },
    { name: 'Wed', value: 2.8 },
    { name: 'Thu', value: 5.2 },
    { name: 'Fri', value: 3.9 },
    { name: 'Sat', value: 4.5 },
    { name: 'Sun', value: 3.7 }
  ],
  caseStatus: [
    { name: 'Active', value: 23 },
    { name: 'Resolved', value: 89 },
    { name: 'Under Investigation', value: 12 },
    { name: 'Closed', value: 32 }
  ],
  locationData: [
    { name: 'Monrovia', value: 67, incidents: 45 },
    { name: 'Gbarnga', value: 34, incidents: 23 },
    { name: 'Buchanan', value: 28, incidents: 18 },
    { name: 'Ganta', value: 19, incidents: 12 }
  ]
});

// Safe House Dashboard Data
export const generateSafeHouseData = () => ({
  houseMetrics: {
    totalCapacity: 20,
    currentOccupants: 8,
    availableBeds: 12,
    securityLevel: 'High',
    occupancyRate: 40
  },
  residentStatus: [
    { name: 'Safe', value: 6, color: '#10B981' },
    { name: 'At Risk', value: 2, color: '#F59E0B' },
    { name: 'Emergency', value: 0, color: '#EF4444' }
  ],
  capacityTrend: [
    { name: 'Jan', value: 15 },
    { name: 'Feb', value: 18 },
    { name: 'Mar', value: 12 },
    { name: 'Apr', value: 20 },
    { name: 'May', value: 16 },
    { name: 'Jun', value: 8 }
  ],
  securityAlerts: [
    { name: 'Low', value: 2, color: '#10B981' },
    { name: 'Medium', value: 1, color: '#F59E0B' },
    { name: 'High', value: 0, color: '#EF4444' },
    { name: 'Critical', value: 0, color: '#991B1B' }
  ],
  resourceUsage: [
    { name: 'Food', value: 75 },
    { name: 'Medical Supplies', value: 45 },
    { name: 'Hygiene Items', value: 60 },
    { name: 'Safety Equipment', value: 90 }
  ]
});

// Medical Dashboard Data
export const generateMedicalData = () => ({
  medicalMetrics: {
    totalPatients: 1247,
    activePatients: 892,
    appointmentsToday: 23,
    emergencyCases: 3,
    averageWaitTime: 15
  },
  patientConditions: [
    { name: 'Prenatal Care', value: 45, color: '#8B5CF6' },
    { name: 'STI Testing', value: 32, color: '#EF4444' },
    { name: 'Family Planning', value: 28, color: '#10B981' },
    { name: 'Emergency Care', value: 15, color: '#F59E0B' }
  ],
  appointmentTrend: [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 145 },
    { name: 'Mar', value: 98 },
    { name: 'Apr', value: 167 },
    { name: 'May', value: 189 },
    { name: 'Jun', value: 203 }
  ],
  patientAgeGroups: [
    { name: '15-19', value: 25 },
    { name: '20-24', value: 45 },
    { name: '25-29', value: 30 },
    { name: '30-34', value: 20 },
    { name: '35+', value: 15 }
  ],
  treatmentOutcomes: [
    { name: 'Successful', value: 78 },
    { name: 'Ongoing', value: 15 },
    { name: 'Referred', value: 5 },
    { name: 'Follow-up Required', value: 2 }
  ]
});

// NGO Dashboard Data
export const generateNGOData = () => ({
  ngoMetrics: {
    totalBeneficiaries: 2847,
    activePrograms: 12,
    completedPrograms: 45,
    upcomingEvents: 8,
    communityReach: 15600
  },
  programTypes: [
    { name: 'SRHR Education', value: 35, color: '#8B5CF6' },
    { name: 'Youth Counseling', value: 28, color: '#10B981' },
    { name: 'Community Outreach', value: 22, color: '#F59E0B' },
    { name: 'Health Awareness', value: 15, color: '#EF4444' }
  ],
  beneficiaryTrend: [
    { name: 'Jan', value: 450 },
    { name: 'Feb', value: 520 },
    { name: 'Mar', value: 380 },
    { name: 'Apr', value: 610 },
    { name: 'May', value: 580 },
    { name: 'Jun', value: 720 }
  ],
  programStatus: [
    { name: 'Active', value: 12 },
    { name: 'Completed', value: 45 },
    { name: 'Planning', value: 8 },
    { name: 'On Hold', value: 2 }
  ],
  impactMetrics: [
    { name: 'Lives Impacted', value: 2847 },
    { name: 'Communities Reached', value: 45 },
    { name: 'Training Sessions', value: 120 },
    { name: 'Resources Distributed', value: 850 }
  ]
});

// Chart configuration helpers
export const getChartConfig = (userRole: string) => {
  const roleConfigs = {
    'ADMIN': {
      colors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
      theme: 'blue'
    },
    'POLICE': {
      colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
      theme: 'red'
    },
    'SAFEHOUSE': {
      colors: ['#10B981', '#059669', '#047857', '#065F46'],
      theme: 'green'
    },
    'MEDICAL': {
      colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
      theme: 'purple'
    },
    'NGO': {
      colors: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
      theme: 'orange'
    }
  };

  return roleConfigs[userRole as keyof typeof roleConfigs] || roleConfigs.ADMIN;
};

// Data sensitivity levels
export const getDataSensitivity = (dataType: string): 'low' | 'medium' | 'high' | 'critical' => {
  const sensitivityMap: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
    'user_metrics': 'medium',
    'system_health': 'high',
    'security_alerts': 'critical',
    'emergency_data': 'critical',
    'patient_data': 'critical',
    'resident_data': 'high',
    'beneficiary_data': 'medium',
    'program_data': 'low'
  };

  return sensitivityMap[dataType] || 'medium';
};
