// Frontend-only mock API service for REPRO PLAN
// This keeps the UI fully functional during testing without any backend.

import { secretCodeManager } from '../utils/secretCode';

const DB_STORAGE_KEY = 'repro-plan_mock_db';
const SEED_VERSION = 1;

type MockUser = {
  id: number;
  secretCode: string;
  surveyLink?: string;
  demographics?: any;
  createdAt: string;
  updatedAt: string;
};

type MockStakeholder = {
  id: number;
  secretCode: string;
  role: string;
  phoneNumber: string;
  name?: string;
  organization?: string;
  email?: string;
  surveyLink?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
};

type MockAlert = {
  id: number;
  alertType: string;
  priority: string;
  status: string;
  description: string;
  location?: any;
  userId?: number;
  stakeholderId?: number;
  assignedRole?: string;
  responseTime?: number;
  createdAt: string;
  updatedAt: string;
};

type MockCase = {
  id: number;
  caseNumber: string;
  caseType: string;
  description: string;
  location?: any;
  priority?: string;
  status: string;
  assignedTo?: number;
  assignedRole?: string;
  relatedAlerts?: number[];
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
};

type MockMessage = {
  id: number;
  fromRole: string;
  fromStakeholderId: number;
  toRole: string;
  toStakeholderId?: number;
  messageType: string;
  subject: string;
  content: string;
  priority?: string;
  isRead: boolean;
  relatedCaseId?: number;
  relatedAlertId?: number;
  createdAt: string;
};

type MockClinic = {
  id: number;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  services?: string[];
  coordinates?: { lat: number; lng: number };
  type?: string;
};

type MockHealthRecord = {
  id: number;
  userId: number;
  recordType: string;
  data: any;
  createdAt: string;
};

type MockDb = {
  seedVersion: number;
  users: MockUser[];
  stakeholders: MockStakeholder[];
  alerts: MockAlert[];
  cases: MockCase[];
  messages: MockMessage[];
  clinics: MockClinic[];
  healthRecords: MockHealthRecord[];
  idCounters: {
    user: number;
    stakeholder: number;
    alert: number;
    case: number;
    message: number;
    clinic: number;
    healthRecord: number;
  };
};

const DEFAULT_USERS: MockUser[] = [
  {
    id: 1,
    secretCode: 'ABCD2345',
    surveyLink: 'https://repro-plan.local/survey/1',
    demographics: {
      gender: 'Prefer not to say',
      ageRange: '18-24',
      county: 'Montserrado',
      education: 'Secondary',
      relationshipStatus: 'Single',
      primaryLanguage: 'English',
      hasChildren: 'No',
      srhrExperience: 'Prefer not to say'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

const DEFAULT_STAKEHOLDERS: MockStakeholder[] = [
  {
    id: 1,
    secretCode: 'REPROPLAN_ADMIN_2024',
    role: 'ADMIN',
    phoneNumber: '+231-000-0001',
    name: 'Admin Tester',
    organization: 'REPRO PLAN',
    email: 'admin@test.reproplan',
    permissions: ['system_access', 'user_management', 'analytics', 'content_management'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 2,
    secretCode: 'REPROPLAN_POLICE_2024',
    role: 'POLICE',
    phoneNumber: '+231-000-0002',
    name: 'Police Tester',
    organization: 'Liberia Police',
    email: 'police@test.reproplan',
    permissions: ['emergency_alerts', 'case_management', 'location_access', 'reports'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 3,
    secretCode: 'REPROPLAN_SAFE_2024',
    role: 'SAFEHOUSE',
    phoneNumber: '+231-000-0003',
    name: 'Safehouse Tester',
    organization: 'Safe House Network',
    email: 'safehouse@test.reproplan',
    permissions: ['resident_management', 'access_control', 'security_alerts', 'resources'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 4,
    secretCode: 'REPROPLAN_MED_2024',
    role: 'MEDICAL',
    phoneNumber: '+231-000-0004',
    name: 'Medical Tester',
    organization: 'SRHR Clinic',
    email: 'medical@test.reproplan',
    permissions: ['patient_records', 'appointments', 'medical_resources', 'health_analytics'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 5,
    secretCode: 'REPROPLAN_NGO_2024',
    role: 'NGO',
    phoneNumber: '+231-000-0005',
    name: 'NGO Tester',
    organization: 'Community NGO',
    email: 'ngo@test.reproplan',
    permissions: ['program_management', 'community_outreach', 'resource_distribution', 'impact_tracking'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  }
];

const DEFAULT_CLINICS: MockClinic[] = [
  {
    id: 1,
    name: 'Monrovia Women Wellness Clinic',
    address: 'Tubman Blvd, Monrovia',
    phone: '+231-77-123-4567',
    hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
    services: ['SRHR Counseling', 'Family Planning', 'STI Testing'],
    coordinates: { lat: 6.3156, lng: -10.8074 },
    type: 'clinic'
  },
  {
    id: 2,
    name: 'Redemption Hospital',
    address: 'New Kru Town, Monrovia',
    phone: '+231-88-555-1122',
    hours: '24/7 Emergency Services',
    services: ['Emergency Care', 'Maternal Health', 'Counseling'],
    coordinates: { lat: 6.3221, lng: -10.7832 },
    type: 'hospital'
  },
  {
    id: 3,
    name: 'Safe Space Counseling Center',
    address: 'Broad St, Monrovia',
    phone: '+231-77-222-3344',
    hours: 'Mon - Fri: 9:00 AM - 5:00 PM',
    services: ['Trauma Counseling', 'Legal Support', 'GBV Support'],
    coordinates: { lat: 6.3103, lng: -10.8006 },
    type: 'counseling'
  }
];

const DEFAULT_ALERTS: MockAlert[] = [
  {
    id: 1,
    alertType: 'gbv',
    priority: 'high',
    status: 'active',
    description: 'Immediate support requested near central market.',
    location: {
      address: 'Central Market Area',
      city: 'Monrovia',
      coordinates: { lat: 6.3136, lng: -10.8022 }
    },
    assignedRole: 'POLICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: 2,
    alertType: 'medical',
    priority: 'medium',
    status: 'resolved',
    description: 'Follow-up care requested by anonymous user.',
    location: {
      address: 'Sinkor',
      city: 'Monrovia',
      coordinates: { lat: 6.2907, lng: -10.7633 }
    },
    assignedRole: 'MEDICAL',
    responseTime: 18,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
];

const DEFAULT_CASES: MockCase[] = [
  {
    id: 1,
    caseNumber: 'CASE-0001',
    caseType: 'safety',
    description: 'Ongoing safety monitoring for a high-risk user.',
    location: {
      address: 'Paynesville',
      city: 'Monrovia',
      coordinates: { lat: 6.2881, lng: -10.7475 }
    },
    priority: 'high',
    status: 'open',
    assignedRole: 'POLICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 2,
    caseNumber: 'CASE-0002',
    caseType: 'medical_followup',
    description: 'Scheduled follow-up visit and counseling.',
    location: {
      address: 'Congo Town',
      city: 'Monrovia',
      coordinates: { lat: 6.3503, lng: -10.7319 }
    },
    priority: 'medium',
    status: 'resolved',
    assignedRole: 'MEDICAL',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 960).toISOString()
  }
];

const DEFAULT_MESSAGES: MockMessage[] = [
  {
    id: 1,
    fromRole: 'ADMIN',
    fromStakeholderId: 1,
    toRole: 'POLICE',
    messageType: 'notification',
    subject: 'Weekly security briefing',
    content: 'Review the latest incident trends in the dashboard.',
    priority: 'medium',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

let inMemoryDb: MockDb | null = null;

const nowIso = () => new Date().toISOString();
const getMaxId = (items: { id: number }[]) => Math.max(0, ...items.map((item) => item.id));

const createDefaultDb = (): MockDb => ({
  seedVersion: SEED_VERSION,
  users: [...DEFAULT_USERS],
  stakeholders: [...DEFAULT_STAKEHOLDERS],
  alerts: [...DEFAULT_ALERTS],
  cases: [...DEFAULT_CASES],
  messages: [...DEFAULT_MESSAGES],
  clinics: [...DEFAULT_CLINICS],
  healthRecords: [],
  idCounters: {
    user: getMaxId(DEFAULT_USERS) + 1,
    stakeholder: getMaxId(DEFAULT_STAKEHOLDERS) + 1,
    alert: getMaxId(DEFAULT_ALERTS) + 1,
    case: getMaxId(DEFAULT_CASES) + 1,
    message: getMaxId(DEFAULT_MESSAGES) + 1,
    clinic: getMaxId(DEFAULT_CLINICS) + 1,
    healthRecord: 1
  }
});

const ensureSeedData = (db: MockDb) => {
  const hasUser = (code: string) => db.users.some((user) => user.secretCode === code);
  DEFAULT_USERS.forEach((user) => {
    if (!hasUser(user.secretCode)) {
      db.users.push({ ...user, createdAt: nowIso(), updatedAt: nowIso() });
    }
  });

  const hasStakeholder = (code: string) =>
    db.stakeholders.some((stakeholder) => stakeholder.secretCode === code);
  DEFAULT_STAKEHOLDERS.forEach((stakeholder) => {
    if (!hasStakeholder(stakeholder.secretCode)) {
      db.stakeholders.push({ ...stakeholder, createdAt: nowIso(), updatedAt: nowIso() });
    }
  });

  if (!db.clinics || db.clinics.length === 0) {
    db.clinics = [...DEFAULT_CLINICS];
  }

  db.idCounters.user = Math.max(db.idCounters.user, getMaxId(db.users) + 1);
  db.idCounters.stakeholder = Math.max(db.idCounters.stakeholder, getMaxId(db.stakeholders) + 1);
  db.idCounters.alert = Math.max(db.idCounters.alert, getMaxId(db.alerts) + 1);
  db.idCounters.case = Math.max(db.idCounters.case, getMaxId(db.cases) + 1);
  db.idCounters.message = Math.max(db.idCounters.message, getMaxId(db.messages) + 1);
  db.idCounters.clinic = Math.max(db.idCounters.clinic, getMaxId(db.clinics) + 1);
};

const loadDb = (): MockDb => {
  if (inMemoryDb) return inMemoryDb;
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MockDb>;
      const defaults = createDefaultDb();
      const merged: MockDb = {
        ...defaults,
        ...parsed,
        idCounters: {
          ...defaults.idCounters,
          ...(parsed.idCounters || {})
        },
        users: parsed.users || defaults.users,
        stakeholders: parsed.stakeholders || defaults.stakeholders,
        alerts: parsed.alerts || defaults.alerts,
        cases: parsed.cases || defaults.cases,
        messages: parsed.messages || defaults.messages,
        clinics: parsed.clinics && parsed.clinics.length > 0 ? parsed.clinics : defaults.clinics,
        healthRecords: parsed.healthRecords || defaults.healthRecords
      };
      if (merged.seedVersion !== SEED_VERSION) {
        merged.seedVersion = SEED_VERSION;
      }
      ensureSeedData(merged);
      saveDb(merged);
      inMemoryDb = merged;
      return merged;
    }
  } catch (error) {
    // Ignore storage errors and fall back to memory
  }
  inMemoryDb = createDefaultDb();
  ensureSeedData(inMemoryDb);
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(inMemoryDb));
  } catch (error) {
    // Ignore storage errors
  }
  return inMemoryDb;
};

const saveDb = (db: MockDb) => {
  inMemoryDb = db;
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    // Ignore storage errors
  }
};

const nextId = (db: MockDb, key: keyof MockDb['idCounters']) => {
  const id = db.idCounters[key];
  db.idCounters[key] = id + 1;
  return id;
};

const buildSurveyLink = (userId: number) => `https://repro-plan.local/survey/${userId}`;

const generateStakeholderCode = () => `REPROPLAN_${secretCodeManager.generateSecretCode()}`;

const getRoleFromStakeholderCode = (code: string) => {
  if (!code.startsWith('REPROPLAN_')) return undefined;
  const roleMatch = code.match(/REPROPLAN_(\w{4})_/);
  if (!roleMatch) return undefined;
  const roleCode = roleMatch[1];
  const roleMap: { [key: string]: string } = {
    ADMI: 'ADMIN',
    POLI: 'POLICE',
    SAFE: 'SAFEHOUSE',
    MEDI: 'MEDICAL',
    NGO_: 'NGO'
  };
  return roleMap[roleCode];
};

const defaultPermissions: Record<string, string[]> = {
  ADMIN: ['system_access', 'user_management', 'analytics', 'content_management'],
  POLICE: ['emergency_alerts', 'case_management', 'location_access', 'reports'],
  SAFEHOUSE: ['resident_management', 'access_control', 'security_alerts', 'resources'],
  MEDICAL: ['patient_records', 'appointments', 'medical_resources', 'health_analytics'],
  NGO: ['program_management', 'community_outreach', 'resource_distribution', 'impact_tracking']
};

class APIService {
  clearToken() {
    // No-op in frontend-only mode
  }

  // Auth endpoints
  async registerUser(demographics?: any) {
    const db = loadDb();
    const id = nextId(db, 'user');
    const secretCode = secretCodeManager.generateSecretCode();
    const surveyLink = buildSurveyLink(id);
    const user: MockUser = {
      id,
      secretCode,
      surveyLink,
      demographics,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.users.push(user);
    saveDb(db);
    return { success: true, user, surveyLink, secretCode };
  }

  async loginUser(secretCode: string) {
    const db = loadDb();
    let user = db.users.find((u) => u.secretCode.toUpperCase() === secretCode.toUpperCase());
    if (!user) {
      const id = nextId(db, 'user');
      user = {
        id,
        secretCode,
        surveyLink: buildSurveyLink(id),
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      db.users.push(user);
      saveDb(db);
    }
    return { success: true, user };
  }

  async forgetCode(surveyLink: string) {
    const db = loadDb();
    let user = db.users.find((u) => u.surveyLink === surveyLink);
    const newCode = secretCodeManager.generateSecretCode();
    if (!user) {
      const id = nextId(db, 'user');
      user = {
        id,
        secretCode: newCode,
        surveyLink: surveyLink || buildSurveyLink(id),
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      db.users.push(user);
    } else {
      user.secretCode = newCode;
      user.updatedAt = nowIso();
    }
    saveDb(db);
    return { success: true, secretCode: newCode, accountType: 'user' };
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
    const db = loadDb();
    const id = nextId(db, 'stakeholder');
    const secretCode = generateStakeholderCode();
    const stakeholder: MockStakeholder = {
      id,
      secretCode,
      role: data.role,
      phoneNumber: data.phoneNumber,
      name: data.name,
      organization: data.organization,
      email: data.email,
      surveyLink: data.surveyLink,
      permissions: defaultPermissions[data.role] || [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.stakeholders.push(stakeholder);
    saveDb(db);
    return { success: true, stakeholder };
  }

  async loginStakeholder(secretCode: string, phoneNumber: string) {
    const db = loadDb();
    let stakeholder = db.stakeholders.find(
      (s) => s.secretCode.toUpperCase() === secretCode.toUpperCase()
    );
    if (!stakeholder) {
      const id = nextId(db, 'stakeholder');
      const derivedRole = getRoleFromStakeholderCode(secretCode) || 'NGO';
      stakeholder = {
        id,
        secretCode,
        role: derivedRole,
        phoneNumber,
        permissions: defaultPermissions[derivedRole] || [],
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      db.stakeholders.push(stakeholder);
      saveDb(db);
    } else if (!stakeholder.phoneNumber && phoneNumber) {
      stakeholder.phoneNumber = phoneNumber;
      stakeholder.updatedAt = nowIso();
      saveDb(db);
    }
    return { success: true, stakeholder };
  }

  // Emergency Alerts
  async getAlerts(role?: string, stakeholderId?: number, filters?: any) {
    const db = loadDb();
    let alerts = [...db.alerts];
    if (role) {
      alerts = alerts.filter((alert) => !alert.assignedRole || alert.assignedRole === role);
    }
    if (stakeholderId) {
      alerts = alerts.filter(
        (alert) => alert.stakeholderId === stakeholderId || alert.userId === stakeholderId
      );
    }
    if (filters?.status) {
      alerts = alerts.filter((alert) => alert.status === filters.status);
    }
    if (filters?.priority) {
      alerts = alerts.filter((alert) => alert.priority === filters.priority);
    }
    return { success: true, alerts };
  }

  async createAlert(alertData: {
    alertType: string;
    priority: string;
    location: any;
    description: string;
    userId?: number;
    stakeholderId?: number;
  }) {
    const db = loadDb();
    const alert: MockAlert = {
      id: nextId(db, 'alert'),
      alertType: alertData.alertType,
      priority: alertData.priority,
      status: 'active',
      description: alertData.description,
      location: alertData.location,
      userId: alertData.userId,
      stakeholderId: alertData.stakeholderId,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.alerts.unshift(alert);
    saveDb(db);
    return { success: true, alert };
  }

  async updateAlert(id: number, updates: any) {
    const db = loadDb();
    const alert = db.alerts.find((item) => item.id === id);
    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }
    Object.assign(alert, updates, { updatedAt: nowIso() });
    if (alert.status === 'resolved' && !alert.responseTime) {
      alert.responseTime = Math.max(
        1,
        Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 60000)
      );
    }
    saveDb(db);
    return { success: true, alert };
  }

  // Cases
  async getCases(role?: string, stakeholderId?: number, filters?: any) {
    const db = loadDb();
    let cases = [...db.cases];
    if (role) {
      cases = cases.filter((caseItem) => !caseItem.assignedRole || caseItem.assignedRole === role);
    }
    if (stakeholderId) {
      cases = cases.filter(
        (caseItem) => caseItem.assignedTo === stakeholderId || caseItem.createdBy === stakeholderId
      );
    }
    if (filters?.status) {
      cases = cases.filter((caseItem) => caseItem.status === filters.status);
    }
    if (filters?.priority) {
      cases = cases.filter((caseItem) => caseItem.priority === filters.priority);
    }
    return { success: true, cases };
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
    const db = loadDb();
    const id = nextId(db, 'case');
    const caseItem: MockCase = {
      id,
      caseNumber: `CASE-${id.toString().padStart(4, '0')}`,
      caseType: caseData.caseType,
      description: caseData.description,
      location: caseData.location,
      priority: caseData.priority,
      status: 'open',
      assignedTo: caseData.assignedTo,
      assignedRole: caseData.assignedRole,
      relatedAlerts: caseData.relatedAlerts,
      createdBy: caseData.createdBy,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    db.cases.unshift(caseItem);
    saveDb(db);
    return { success: true, case: caseItem };
  }

  async updateCase(id: number, updates: any) {
    const db = loadDb();
    const caseItem = db.cases.find((item) => item.id === id);
    if (!caseItem) {
      return { success: false, message: 'Case not found' };
    }
    Object.assign(caseItem, updates, { updatedAt: nowIso() });
    saveDb(db);
    return { success: true, case: caseItem };
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
    const db = loadDb();
    const message: MockMessage = {
      id: nextId(db, 'message'),
      fromRole: messageData.fromRole,
      fromStakeholderId: messageData.fromStakeholderId,
      toRole: messageData.toRole,
      toStakeholderId: messageData.toStakeholderId,
      messageType: messageData.messageType,
      subject: messageData.subject,
      content: messageData.content,
      priority: messageData.priority,
      relatedCaseId: messageData.relatedCaseId,
      relatedAlertId: messageData.relatedAlertId,
      isRead: false,
      createdAt: nowIso()
    };
    db.messages.unshift(message);
    saveDb(db);
    return { success: true, message };
  }

  async getMessages(toRole?: string, toStakeholderId?: number, isRead?: boolean) {
    const db = loadDb();
    let messages = [...db.messages];
    if (toRole) {
      messages = messages.filter((message) => message.toRole === toRole);
    }
    if (toStakeholderId !== undefined) {
      messages = messages.filter((message) => message.toStakeholderId === toStakeholderId);
    }
    if (isRead !== undefined) {
      messages = messages.filter((message) => message.isRead === isRead);
    }
    return { success: true, messages };
  }

  async markMessageRead(id: number) {
    const db = loadDb();
    const message = db.messages.find((item) => item.id === id);
    if (!message) {
      return { success: false, message: 'Message not found' };
    }
    message.isRead = true;
    saveDb(db);
    return { success: true, message };
  }

  // Users
  async getUsers() {
    const db = loadDb();
    return { success: true, users: db.users };
  }

  async getUser(id: number) {
    const db = loadDb();
    const user = db.users.find((item) => item.id === id);
    return { success: !!user, user };
  }

  async updateUser(id: number, updates: any) {
    const db = loadDb();
    const user = db.users.find((item) => item.id === id);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    Object.assign(user, updates, { updatedAt: nowIso() });
    saveDb(db);
    return { success: true, user };
  }

  // Health Records
  async getHealthRecords(userId: number) {
    const db = loadDb();
    const records = db.healthRecords.filter((record) => record.userId === userId);
    return { success: true, records };
  }

  async createHealthRecord(recordData: {
    userId: number;
    recordType: string;
    data: any;
  }) {
    const db = loadDb();
    const record: MockHealthRecord = {
      id: nextId(db, 'healthRecord'),
      userId: recordData.userId,
      recordType: recordData.recordType,
      data: recordData.data,
      createdAt: nowIso()
    };
    db.healthRecords.unshift(record);
    saveDb(db);
    return { success: true, record };
  }

  // Clinics
  async getClinics() {
    const db = loadDb();
    return { success: true, clinics: db.clinics };
  }

  async getClinic(id: number) {
    const db = loadDb();
    const clinic = db.clinics.find((item) => item.id === id);
    return { success: !!clinic, clinic };
  }

  // Admin-only clinic actions
  async createClinic(data: any) {
    const db = loadDb();
    const clinic: MockClinic = {
      id: nextId(db, 'clinic'),
      name: data.name,
      address: data.address,
      phone: data.phone,
      hours: data.hours,
      services: data.services,
      coordinates: data.coordinates,
      type: data.type
    };
    db.clinics.push(clinic);
    saveDb(db);
    return { success: true, clinic };
  }

  async updateClinic(id: number, updates: any) {
    const db = loadDb();
    const clinic = db.clinics.find((item) => item.id === id);
    if (!clinic) {
      return { success: false, message: 'Clinic not found' };
    }
    Object.assign(clinic, updates);
    saveDb(db);
    return { success: true, clinic };
  }
}

export const apiService = new APIService();

