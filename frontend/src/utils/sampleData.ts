// This file has been removed - all sample data has been replaced with real API data
// Components now fetch data from the backend instead of using static sample data

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

// Chart configuration helpers (still used for theming)
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

// Data sensitivity levels (still used for data handling)
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
