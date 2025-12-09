// Centralized API service for REPRO PLAN
// Production API service - connects to backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://repro-plan-v3-hihzd.ondigitalocean.app/api';

// Log the API URL for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}
const TOKEN_STORAGE_KEY = 'repro-plan_jwt';

class APIService {
  private getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  private setToken(token?: string) {
    try {
      if (token && token.trim()) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
    } catch (e) {
      // ignore storage failures (e.g., private mode)
    }
  }

  clearToken() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }


  // Auth endpoints
  async registerUser(surveyLink: string, demographics?: any) {
    const result = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ surveyLink, demographics }),
    });
    if ((result as any)?.token) this.setToken((result as any).token);
    return result;
  }

  async loginUser(secretCode: string) {
    const result = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ secretCode }),
    });
    if ((result as any)?.token) this.setToken((result as any).token);
    return result;
  }

  async forgetCode(surveyLink: string) {
    const result = await this.request<any>('/auth/forget-code', {
      method: 'POST',
      body: JSON.stringify({ surveyLink }),
    });
    if ((result as any)?.token) this.setToken((result as any).token);
    return result;
  }

  // Stakeholder endpoints
  async registerStakeholder(data: {
    role: string;
    phoneNumber: string;
    surveyLink?: string;
    name?: string;
    organization?: string;
    email?: string;
  }) {
    const result = await this.request<any>('/stakeholders/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if ((result as any)?.token) this.setToken((result as any).token);
    return result;
  }

  async loginStakeholder(secretCode: string, phoneNumber: string) {
    const result = await this.request<any>('/stakeholders/login', {
      method: 'POST',
      body: JSON.stringify({ secretCode, phoneNumber }),
    });
    if ((result as any)?.token) this.setToken((result as any).token);
    return result;
  }

  // Emergency Alerts
  async getAlerts(role?: string, stakeholderId?: number, filters?: any) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (stakeholderId) params.append('stakeholderId', stakeholderId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    return this.request(`/stakeholders/alerts?${params.toString()}`);
  }

  async createAlert(alertData: {
    alertType: string;
    priority: string;
    location: any;
    description: string;
    userId?: number;
    stakeholderId?: number;
  }) {
    return this.request('/stakeholders/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async updateAlert(id: number, updates: any) {
    return this.request(`/stakeholders/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Cases
  async getCases(role?: string, stakeholderId?: number, filters?: any) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (stakeholderId) params.append('stakeholderId', stakeholderId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    return this.request(`/stakeholders/cases?${params.toString()}`);
  }

  async createCase(caseData: {
    caseType: string;
    location: any;
    description: string;
    priority?: string;
    assignedTo?: number;
    assignedRole?: string;
    relatedAlerts?: number[];
    createdBy?: number;
  }) {
    return this.request('/stakeholders/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async updateCase(id: number, updates: any) {
    return this.request(`/stakeholders/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Inter-Role Messaging
  async sendMessage(messageData: {
    fromRole: string;
    fromStakeholderId: number;
    toRole: string;
    toStakeholderId?: number;
    messageType: string;
    subject: string;
    content: string;
    priority?: string;
    relatedCaseId?: number;
    relatedAlertId?: number;
  }) {
    return this.request('/stakeholders/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getMessages(toRole?: string, toStakeholderId?: number, isRead?: boolean) {
    const params = new URLSearchParams();
    if (toRole) params.append('toRole', toRole);
    if (toStakeholderId) params.append('toStakeholderId', toStakeholderId.toString());
    if (isRead !== undefined) params.append('isRead', isRead.toString());

    return this.request(`/stakeholders/messages?${params.toString()}`);
  }

  async markMessageRead(id: number) {
    return this.request(`/stakeholders/messages/${id}/read`, {
      method: 'PUT',
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: number) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: number, updates: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Health Records
  async getHealthRecords(userId: number) {
    return this.request(`/health/records/${userId}`);
  }

  async createHealthRecord(recordData: {
    userId: number;
    recordType: string;
    data: any;
  }) {
    return this.request('/health/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  // Clinics
  async getClinics() {
    return this.request('/clinics');
  }

  async getClinic(id: number) {
    return this.request(`/clinics/${id}`);
  }

  // Admin-only clinic actions
  async createClinic(data: any) {
    return this.request('/clinics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClinic(id: number, updates: any) {
    return this.request(`/clinics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const apiService = new APIService();

