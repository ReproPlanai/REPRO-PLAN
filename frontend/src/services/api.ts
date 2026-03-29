import { apiService as realApiService } from './apiReal';
export { apiService } from './apiReal';
export default realApiService;

// Re-export types for compatibility
export type { User, Stakeholder, Alert, Case, Message, Clinic, HealthRecord, SystemSettings } from './apiReal';

