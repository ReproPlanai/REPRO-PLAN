// API Configuration
// Automatically selects the correct backend URL based on environment

const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost';

// Production Railway backend
const PRODUCTION_API_URL = 'https://repro-plan-server-production.up.railway.app';

// Local development backend
const LOCAL_API_URL = 'http://localhost:8080';

// Export the appropriate API base URL
export const API_BASE_URL = isDevelopment && isLocalhost 
  ? LOCAL_API_URL 
  : PRODUCTION_API_URL;

// Mapbox access key
export const MAPBOX_ACCESS_KEY = process.env.REACT_APP_MAPBOX_ACCESS_KEY || '';

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // Users
  USERS: {
    BASE: '/api/users',
    REGISTER: '/api/users/register',
    LOGIN: '/api/users/login',
    RESET_CODE: '/api/users/reset-code',
  },
  
  // Stakeholders
  STAKEHOLDERS: {
    BASE: '/api/stakeholders',
    REGISTER: '/api/stakeholders/register',
    LOGIN: '/api/stakeholders/login',
  },
  
  // Alerts & Cases
  ALERTS: '/api/alerts',
  CASES: '/api/cases',
  MESSAGES: '/api/messages',
  
  // Data
  CLINICS: '/api/clinics',
  HEALTH_RECORDS: '/api/health-records',
  
  // Admin
  ADMIN: {
    SETTINGS: '/api/admin/settings',
    DASHBOARD_STATS: '/api/admin/dashboard-stats',
    ANALYTICS: '/api/admin/analytics',
    AUDIT_LOGS: '/api/admin/audit-logs',
    BACKUP: '/api/admin/backup',
  },
  
  // Services
  REPROBOT: '/reprobot',
  TRANSCRIBE: '/transcribe',
  AI: '/ai',
  
  // Health check
  HEALTH: '/health',
} as const;

export default API_BASE_URL;
