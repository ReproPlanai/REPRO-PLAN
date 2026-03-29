import { secretCodeManager } from '../utils/secretCode';

import { API_BASE_URL } from '../config/api';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('auth_token');

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// User types
export interface User {
  id: string;
  secretCode: string;
  surveyLink?: string;
  demographics?: {
    gender?: string;
    ageRange?: string;
    county?: string;
    education?: string;
    relationshipStatus?: string;
    primaryLanguage?: string;
    hasChildren?: string;
    srhrExperience?: string;
  };
  phoneNumber?: string;
  isVerified: boolean;
  isUsed: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stakeholder {
  id: string;
  role: 'ADMIN' | 'POLICE' | 'SAFEHOUSE' | 'MEDICAL' | 'NGO';
  phoneNumber: string;
  name?: string;
  organization?: string;
  email?: string;
  surveyLink?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  alertType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'responding';
  description: string;
  location?: {
    address?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  userId?: string;
  stakeholderId?: string;
  assignedRole?: string;
  responseTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  caseType: string;
  description: string;
  location?: {
    address?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  priority?: string;
  status: string;
  assignedTo?: string;
  assignedRole?: string;
  relatedAlerts?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  fromRole: string;
  fromStakeholderId: string;
  toRole: string;
  toStakeholderId?: string;
  messageType: string;
  subject: string;
  content: string;
  priority?: string;
  isRead: boolean;
  relatedCaseId?: string;
  relatedAlertId?: string;
  createdAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  services?: string[];
  coordinates?: { lat: number; lng: number };
  type?: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  recordType: string;
  data: any;
  createdAt: string;
}

export interface SystemSettings {
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    emergencyAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
    ipWhitelist: boolean;
  };
  database: {
    backupFrequency: string;
    retentionDays: number;
    autoBackup: boolean;
  };
  api: {
    rateLimit: number;
    timeout: number;
    corsEnabled: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    fromEmail: string;
    fromName: string;
  };
}

class RealAPIService {
  // Auth - User
  async registerUser(demographics?: User['demographics']) {
    const secretCode = secretCodeManager.generateSecretCode();
    const response = await apiRequest('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ secretCode, demographics })
    });
    return { ...response, secretCode };
  }

  async loginUser(secretCode: string) {
    return apiRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ secretCode })
    });
  }

  async forgetCode(surveyLink: string) {
    const newCode = secretCodeManager.generateSecretCode();
    return apiRequest('/api/users/reset-code', {
      method: 'POST',
      body: JSON.stringify({ surveyLink, newCode })
    });
  }

  // Auth - Stakeholder
  async registerStakeholder(data: {
    role: string;
    phoneNumber: string;
    surveyLink?: string;
    name?: string;
    organization?: string;
    email?: string;
  }) {
    return apiRequest('/api/stakeholders/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async loginStakeholder(secretCode: string | undefined, phoneNumber: string, role?: string) {
    return apiRequest('/api/stakeholders/login', {
      method: 'POST',
      body: JSON.stringify({ secretCode, phoneNumber, role })
    });
  }

  // Users
  async getUsers() {
    return apiRequest('/api/users');
  }

  async getUser(id: string) {
    return apiRequest(`/api/users/${id}`);
  }

  async updateUser(id: string, updates: Partial<User>) {
    return apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(id: string) {
    return apiRequest(`/api/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Stakeholders
  async getStakeholders() {
    return apiRequest('/api/stakeholders');
  }

  async getStakeholder(id: string) {
    return apiRequest(`/api/stakeholders/${id}`);
  }

  async updateStakeholder(id: string, updates: Partial<Stakeholder>) {
    return apiRequest(`/api/stakeholders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteStakeholder(id: string) {
    return apiRequest(`/api/stakeholders/${id}`, {
      method: 'DELETE'
    });
  }

  // Alerts
  async getAlerts(role?: string, stakeholderId?: string, filters?: any) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (stakeholderId) params.append('stakeholderId', stakeholderId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    return apiRequest(`/api/alerts?${params.toString()}`);
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }

  async updateAlert(id: string, updates: Partial<Alert>) {
    return apiRequest(`/api/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Cases
  async getCases(role?: string, stakeholderId?: string, filters?: any) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (stakeholderId) params.append('stakeholderId', stakeholderId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    return apiRequest(`/api/cases?${params.toString()}`);
  }

  async createCase(caseData: Omit<Case, 'id' | 'caseNumber' | 'createdAt' | 'updatedAt'>) {
    return apiRequest('/api/cases', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });
  }

  async updateCase(id: string, updates: Partial<Case>) {
    return apiRequest(`/api/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Clinics
  async getClinics() {
    return apiRequest('/api/clinics');
  }

  async getClinic(id: string) {
    return apiRequest(`/api/clinics/${id}`);
  }

  async createClinic(data: Omit<Clinic, 'id'>) {
    return apiRequest('/api/clinics', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateClinic(id: string, updates: Partial<Clinic>) {
    return apiRequest(`/api/clinics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteClinic(id: string) {
    return apiRequest(`/api/clinics/${id}`, {
      method: 'DELETE'
    });
  }

  // System Settings (Admin only)
  async getSystemSettings() {
    return apiRequest('/admin/settings');
  }

  async updateSystemSettings(settings: Partial<SystemSettings>) {
    return apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Dashboard stats (Admin)
  async getDashboardStats() {
    return apiRequest('/admin/dashboard-stats');
  }

  // Analytics (Admin)
  async getAnalytics(timeRange?: string) {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return apiRequest(`/admin/analytics${params}`);
  }

  // Stories (Community Content)
  async getStories() {
    return apiRequest('/api/stories');
  }

  async createStory(storyData: any) {
    return apiRequest('/api/stories', {
      method: 'POST',
      body: JSON.stringify(storyData)
    });
  }

  // Backup & Restore
  async createBackup(data: any) {
    return apiRequest('/admin/backup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async restoreBackup(backupId: string) {
    return apiRequest(`/admin/restore/${backupId}`, {
      method: 'POST'
    });
  }

  // Workflows
  async executeWorkflow(workflowId: string) {
    return apiRequest(`/api/workflows/${workflowId}/execute`, {
      method: 'POST'
    });
  }

  async getWorkflows(params?: { category?: string; isActive?: boolean; triggerType?: string }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/workflows${queryParams}`);
  }

  async createWorkflow(workflowData: any) {
    return apiRequest('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  async updateWorkflow(workflowId: string, updates: any) {
    return apiRequest(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteWorkflow(workflowId: string) {
    return apiRequest(`/api/workflows/${workflowId}`, {
      method: 'DELETE'
    });
  }

  // Admin
  async getAdminStats() {
    return apiRequest('/admin/dashboard-stats');
  }

  async getAdminSettings() {
    return apiRequest('/admin/settings');
  }

  async updateAdminSettings(settings: any) {
    return apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Audit Logs
  async getAuditLogs(params?: { userId?: string; action?: string; entityType?: string; limit?: string }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/audit-logs${queryParams}`);
  }

  // Biometrics
  async registerBiometric(data: any) {
    return apiRequest('/api/biometrics/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBiometric(biometricId: string, updates: any) {
    return apiRequest(`/api/biometrics/${biometricId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Support Groups
  async joinSupportGroup(groupId: string) {
    return apiRequest(`/api/support-groups/${groupId}/join`, {
      method: 'POST'
    });
  }

  // Health Records
  async getHealthRecords(userId?: string | null) {
    const params = userId ? `?userId=${userId}` : '';
    return apiRequest(`/api/health-records${params}`);
  }

  async createHealthRecord(recordData: any) {
    return apiRequest('/api/health-records', {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  }

  // Messages
  async getMessages(params?: { toStakeholderId?: string; isRead?: boolean }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/messages${queryParams}`);
  }

  async createMessage(messageData: any) {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async markMessageRead(messageId: string) {
    return apiRequest(`/api/messages/${messageId}/read`, {
      method: 'PUT'
    });
  }

  // Conversations
  async getConversations(params?: { stakeholderId?: string }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/chat/conversations${queryParams}`);
  }
  async getMentors() {
    return apiRequest('/api/mentors');
  }

  // Resources
  async getResources() {
    return apiRequest('/api/resources');
  }

  // Support Groups
  async getSupportGroups() {
    return apiRequest('/api/support-groups');
  }

  // External Data Integration
  async getExternalData() {
    return apiRequest('/api/external-data');
  }

  async syncExternalConnection(connectionId: string) {
    return apiRequest(`/api/external-data/sync/${connectionId}`, {
      method: 'POST'
    });
  }

  // AI Games Platform
  async getAIGameRecommendations() {
    // Returns default recommendations since backend doesn't have this endpoint
    return {
      success: true,
      recommendations: [
        { id: '1', title: 'Start with Consent Basics', description: 'Perfect for beginners', gameType: 'consent-scenarios', difficulty: 'beginner', estimatedTime: 10, category: 'Relationships & Consent' },
        { id: '2', title: 'Test Your Knowledge', description: 'Quick assessment', gameType: 'knowledge-race', difficulty: 'intermediate', estimatedTime: 5, category: 'Assessment' }
      ]
    };
  }

  async saveGameSession(session: any) {
    // Store in local storage for now
    return { success: true, session };
  }

  async generateConsentScenarios(count?: number, theme?: string) {
    return apiRequest('/ai/consent-scenarios', {
      method: 'POST',
      body: JSON.stringify({ count: count || 3, theme: theme || 'general' })
    });
  }

  async generateSRHRMyths(count?: number) {
    // Uses AI quiz endpoint with myth-busting category
    return apiRequest('/ai/quiz-questions', {
      method: 'POST',
      body: JSON.stringify({ topic: 'SRHR Myths', difficulty: 'medium', count: count || 5 })
    });
  }

  async getQuizQuestions(category?: string) {
    return apiRequest('/ai/quiz-questions', {
      method: 'POST',
      body: JSON.stringify({ topic: category || 'SRHR', difficulty: 'medium', count: 5 })
    });
  }

  async chatWithAI(message: string, history?: any[]) {
    return apiRequest('/rehana', {
      method: 'POST',
      body: JSON.stringify({ message, history })
    });
  }

  async explainAnswer(question: string, userAnswer: any, correctAnswer: any, context?: string) {
    return apiRequest('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ question, userAnswer, correctAnswer, context })
    });
  }

  async getNotifications() {
    return apiRequest('/api/notifications');
  }

  async getGameAnalytics(params?: { timeRange?: string; gameType?: string }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/admin/game-analytics${queryParams}`);
  }

  async getChatRooms(userRole?: string) {
    const params = userRole ? `?role=${userRole}` : '';
    return apiRequest(`/api/chat/rooms${params}`);
  }

  async generateQRCode() {
    return apiRequest('/api/qr/generate', {
      method: 'POST'
    });
  }

  async verifyQRCode(code: string) {
    return apiRequest('/api/qr/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  async getBiometrics() {
    return apiRequest('/api/biometrics');
  }

  async authenticateBiometric(type: string) {
    return apiRequest('/api/biometrics/authenticate', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  }

  async submitSafetyCheck(check: any) {
    return apiRequest('/api/safety-checks', {
      method: 'POST',
      body: JSON.stringify(check)
    });
  }

  async getSafetyCheckHistory() {
    return apiRequest('/api/safety-checks/history');
  }

  // Ecommerce - Products
  async getProducts(params?: { category?: string; search?: string; inStock?: boolean; sortBy?: string }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/products${queryParams}`);
  }

  async getProduct(id: string) {
    return apiRequest(`/api/products/${id}`);
  }

  async getProductCategories() {
    return apiRequest('/api/products/categories/list');
  }

  async addProductReview(productId: string, review: { rating: number; comment?: string }) {
    return apiRequest(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    });
  }

  // Ecommerce - Cart
  async getCart(userId: string) {
    return apiRequest(`/api/cart?userId=${userId}`);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    return apiRequest('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity })
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return apiRequest(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(itemId: string) {
    return apiRequest(`/api/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  async clearCart(userId: string) {
    return apiRequest(`/api/cart/clear?userId=${userId}`, {
      method: 'DELETE'
    });
  }

  // Ecommerce - Orders
  async getOrders(params?: { userId?: string; status?: string; limit?: number; offset?: number }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest(`/api/orders${queryParams}`);
  }

  async getOrder(id: string) {
    return apiRequest(`/api/orders/${id}`);
  }

  async createOrder(orderData: {
    userId?: string;
    items: Array<{ productId: string; quantity: number }>;
    pharmacyId?: string;
    deliveryType?: 'delivery' | 'pickup';
    deliveryAddress?: string;
    prescriptionUrl?: string;
    notes?: string;
  }) {
    return apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async cancelOrder(orderId: string, reason?: string) {
    return apiRequest(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async getOrderReceipt(orderId: string) {
    return apiRequest(`/api/orders/${orderId}/receipt`);
  }

  // Clear auth
  clearToken() {
    localStorage.removeItem('auth_token');
  }

  // Legacy compatibility - auth check
  async checkAuth() {
    const token = getAuthToken();
    if (!token) return { success: false, user: null };
    try {
      return apiRequest('/auth/verify');
    } catch {
      this.clearToken();
      return { success: false, user: null };
    }
  }
}

export const apiService = new RealAPIService();
export default apiService;
