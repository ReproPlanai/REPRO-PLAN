// Centralized API service for REPRO PLAN
// MOCK MODE: Frontend is disconnected from backend for prototype demonstration
// Set REACT_APP_USE_MOCK_API=true to use mock data (default: true)

const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API !== 'false'; // Default to true (mock mode)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock data storage (simulates backend)
const mockStorage = {
  users: new Map<string, any>(),
  stakeholders: new Map<string, any>(),
  alerts: [] as any[],
  cases: [] as any[],
  messages: [] as any[],
  clinics: [] as any[],
  healthRecords: new Map<number, any[]>(),
};

// Initialize mock data
const initializeMockData = () => {
  // Mock clinics
  mockStorage.clinics = [
    { id: 1, name: 'Community Health Center', location: { lat: 6.3153, lng: -10.8074 }, address: 'Monrovia, Liberia' },
    { id: 2, name: 'Women\'s Health Clinic', location: { lat: 6.4281, lng: -10.7608 }, address: 'Gbarnga, Liberia' },
  ];

  // Mock alerts
  mockStorage.alerts = [
    { id: 1, alertType: 'Emergency', priority: 'high', status: 'active', createdAt: new Date().toISOString() },
    { id: 2, alertType: 'Panic Button', priority: 'critical', status: 'active', createdAt: new Date().toISOString() },
  ];

  // Mock cases
  mockStorage.cases = [
    { id: 1, caseType: 'Emergency Response', status: 'active', priority: 'high', createdAt: new Date().toISOString() },
  ];

  // Mock messages
  mockStorage.messages = [
    { id: 1, subject: 'Emergency Coordination', content: 'Need assistance with case #1', isRead: false, createdAt: new Date().toISOString() },
  ];
};

// Initialize on first load
if (USE_MOCK_API && typeof window !== 'undefined') {
  initializeMockData();
}

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If mock mode is enabled, return mock data
    if (USE_MOCK_API) {
      return this.getMockResponse<T>(endpoint, options);
    }

    // Otherwise, make real API call (for future production use)
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

  // Mock response handler
  private async getMockResponse<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};

    // Route to appropriate mock handler
    if (endpoint.startsWith('/auth/')) {
      return this.handleAuthMock(endpoint, method, body) as T;
    } else if (endpoint.startsWith('/stakeholders/')) {
      return this.handleStakeholderMock(endpoint, method, body) as T;
    } else if (endpoint.startsWith('/users/')) {
      return this.handleUserMock(endpoint, method, body) as T;
    } else if (endpoint.startsWith('/health/')) {
      return this.handleHealthMock(endpoint, method, body) as T;
    } else if (endpoint.startsWith('/clinics')) {
      return this.handleClinicMock(endpoint, method, body) as T;
    }

    return { success: true, message: 'Mock response' } as T;
  }

  private handleAuthMock(endpoint: string, method: string, body: any) {
    if (endpoint === '/auth/login' && method === 'POST') {
      const { secretCode } = body;
      if (secretCode && secretCode.length >= 4) {
        // Store user in mock storage
        const userId = Date.now();
        mockStorage.users.set(secretCode, { id: userId, secretCode, surveyLink: '' });
        return {
          success: true,
          user: { id: userId, secretCode, surveyLink: '' },
          message: 'Login successful'
        };
      }
      return { success: false, message: 'Invalid secret code' };
    }

    if (endpoint === '/auth/register' && method === 'POST') {
      const userId = Date.now();
      const secretCode = `CODE${userId}`.substring(0, 8);
      mockStorage.users.set(secretCode, { id: userId, secretCode, surveyLink: body.surveyLink || '' });
      return {
        success: true,
        user: { id: userId, secretCode, surveyLink: body.surveyLink || '' },
        message: 'Registration successful'
      };
    }

    if (endpoint === '/auth/forget-code' && method === 'POST') {
      return {
        success: true,
        message: 'Recovery instructions sent (mock)'
      };
    }

    return { success: false, message: 'Unknown auth endpoint' };
  }

  private handleStakeholderMock(endpoint: string, method: string, body: any) {
    if (endpoint.includes('/register') && method === 'POST') {
      const stakeholderId = Date.now();
      const secretCode = `REPROPLAN_${body.role}_${stakeholderId}`;
      mockStorage.stakeholders.set(secretCode, {
        id: stakeholderId,
        role: body.role,
        phoneNumber: body.phoneNumber,
        secretCode
      });
      return {
        success: true,
        stakeholder: { id: stakeholderId, role: body.role, secretCode },
        message: 'Stakeholder registered successfully'
      };
    }

    if (endpoint.includes('/login') && method === 'POST') {
      const { secretCode, phoneNumber } = body;
      const stakeholder = Array.from(mockStorage.stakeholders.values()).find(
        s => s.secretCode === secretCode && s.phoneNumber === phoneNumber
      );
      if (stakeholder) {
        return {
          success: true,
          stakeholder,
          message: 'Login successful'
        };
      }
      return { success: false, message: 'Invalid credentials' };
    }

    if (endpoint.includes('/alerts')) {
      if (method === 'GET') {
        return { success: true, alerts: mockStorage.alerts };
      }
      if (method === 'POST') {
        const newAlert = {
          id: mockStorage.alerts.length + 1,
          ...body,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        mockStorage.alerts.push(newAlert);
        return { success: true, alert: newAlert };
      }
      if (method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop() || '0');
        const alert = mockStorage.alerts.find(a => a.id === id);
        if (alert) {
          Object.assign(alert, body);
          return { success: true, alert };
        }
      }
    }

    if (endpoint.includes('/cases')) {
      if (method === 'GET') {
        return { success: true, cases: mockStorage.cases };
      }
      if (method === 'POST') {
        const newCase = {
          id: mockStorage.cases.length + 1,
          ...body,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        mockStorage.cases.push(newCase);
        return { success: true, case: newCase };
      }
      if (method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop() || '0');
        const caseItem = mockStorage.cases.find(c => c.id === id);
        if (caseItem) {
          Object.assign(caseItem, body);
          return { success: true, case: caseItem };
        }
      }
    }

    if (endpoint.includes('/messages')) {
      if (method === 'GET') {
        return { success: true, messages: mockStorage.messages };
      }
      if (method === 'POST') {
        const newMessage = {
          id: mockStorage.messages.length + 1,
          ...body,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        mockStorage.messages.push(newMessage);
        return { success: true, message: newMessage };
      }
      if (endpoint.includes('/read') && method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop() || '0');
        const message = mockStorage.messages.find(m => m.id === id);
        if (message) {
          message.isRead = true;
          return { success: true, message };
        }
      }
    }

    return { success: true, message: 'Mock stakeholder response' };
  }

  private handleUserMock(endpoint: string, method: string, body: any) {
    if (method === 'GET') {
      const id = parseInt(endpoint.split('/').pop() || '0');
      const user = Array.from(mockStorage.users.values()).find(u => u.id === id);
      return { success: true, user: user || { id, secretCode: 'MOCK' } };
    }
    if (method === 'PUT') {
      return { success: true, message: 'User updated (mock)' };
    }
    return { success: true, users: Array.from(mockStorage.users.values()) };
  }

  private handleHealthMock(endpoint: string, method: string, body: any) {
    if (method === 'GET') {
      const userId = parseInt(endpoint.split('/').pop() || '0');
      const records = mockStorage.healthRecords.get(userId) || [];
      return { success: true, records };
    }
    if (method === 'POST') {
      const records = mockStorage.healthRecords.get(body.userId) || [];
      const newRecord = { id: records.length + 1, ...body, createdAt: new Date().toISOString() };
      records.push(newRecord);
      mockStorage.healthRecords.set(body.userId, records);
      return { success: true, record: newRecord };
    }
    return { success: true, message: 'Mock health response' };
  }

  private handleClinicMock(endpoint: string, method: string, body: any) {
    if (method === 'GET') {
      if (endpoint.includes('/')) {
        const id = parseInt(endpoint.split('/').pop() || '0');
        const clinic = mockStorage.clinics.find(c => c.id === id);
        return { success: true, clinic: clinic || mockStorage.clinics[0] };
      }
      return { success: true, clinics: mockStorage.clinics };
    }
    return { success: true, clinics: mockStorage.clinics };
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

