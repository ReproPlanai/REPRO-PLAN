// Centralized API service for REPRO PLAN
// Connects frontend to backend API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ surveyLink, demographics }),
    });
  }

  async loginUser(secretCode: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ secretCode }),
    });
  }

  async forgetCode(surveyLink: string) {
    return this.request('/auth/forget-code', {
      method: 'POST',
      body: JSON.stringify({ surveyLink }),
    });
  }

  // Stakeholder endpoints
  async registerStakeholder(data: {
    role: string;
    phoneNumber: string;
    name?: string;
    organization?: string;
    email?: string;
  }) {
    return this.request('/stakeholders/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginStakeholder(secretCode: string, phoneNumber: string) {
    return this.request('/stakeholders/login', {
      method: 'POST',
      body: JSON.stringify({ secretCode, phoneNumber }),
    });
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
}

export const apiService = new APIService();

