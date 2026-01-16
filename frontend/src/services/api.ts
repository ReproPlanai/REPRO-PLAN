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
  phoneNumber?: string;
  isVerified?: boolean;
  isUsed?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
};

type MockStakeholder = {
  id: number;
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
    phoneNumber: '+231-555-0101',
    isVerified: true,
    isUsed: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    secretCode: 'EFGH6789',
    surveyLink: 'https://repro-plan.local/survey/2',
    demographics: {
      gender: 'Female',
      ageRange: '25-34',
      county: 'Margibi',
      education: 'College',
      relationshipStatus: 'In a relationship',
      primaryLanguage: 'English',
      hasChildren: 'Yes',
      srhrExperience: 'Positive'
    },
    phoneNumber: '+231-555-0102',
    isVerified: true,
    isUsed: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 3,
    secretCode: 'IJKL3456',
    surveyLink: 'https://repro-plan.local/survey/3',
    demographics: {
      gender: 'Male',
      ageRange: '18-24',
      county: 'Bong',
      education: 'Secondary',
      relationshipStatus: 'Single',
      primaryLanguage: 'Kpelle',
      hasChildren: 'No',
      srhrExperience: 'Neutral'
    },
    phoneNumber: '+231-555-0103',
    isVerified: false,
    isUsed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: 4,
    secretCode: 'MNOP9012',
    surveyLink: 'https://repro-plan.local/survey/4',
    demographics: {
      gender: 'Non-binary',
      ageRange: '35-44',
      county: 'Nimba',
      education: 'University',
      relationshipStatus: 'Married',
      primaryLanguage: 'Gio',
      hasChildren: 'Yes',
      srhrExperience: 'Positive'
    },
    phoneNumber: '+231-555-0104',
    isVerified: true,
    isUsed: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 5,
    secretCode: 'QRST5678',
    surveyLink: 'https://repro-plan.local/survey/5',
    demographics: {
      gender: 'Female',
      ageRange: '15-17',
      county: 'Grand Bassa',
      education: 'Secondary',
      relationshipStatus: 'Single',
      primaryLanguage: 'English',
      hasChildren: 'No',
      srhrExperience: 'Neutral'
    },
    phoneNumber: '+231-555-0105',
    isVerified: true,
    isUsed: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 6,
    secretCode: 'UVWX1122',
    surveyLink: 'https://repro-plan.local/survey/6',
    demographics: {
      gender: 'Male',
      ageRange: '45-54',
      county: 'Bomi',
      education: 'Primary',
      relationshipStatus: 'Married',
      primaryLanguage: 'Bassa',
      hasChildren: 'Yes',
      srhrExperience: 'Prefer not to say'
    },
    phoneNumber: '+231-555-0106',
    isVerified: true,
    isUsed: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

const DEFAULT_STAKEHOLDERS: MockStakeholder[] = [
  {
    id: 1,
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
    role: 'ADMIN',
    phoneNumber: '+231-000-0006',
    name: 'Operations Lead',
    organization: 'REPRO PLAN',
    email: 'ops.admin@test.reproplan',
    permissions: ['system_access', 'user_management', 'analytics'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 3,
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
    id: 4,
    role: 'POLICE',
    phoneNumber: '+231-000-0007',
    name: 'Unit Supervisor',
    organization: 'Liberia Police',
    email: 'supervisor.police@test.reproplan',
    permissions: ['emergency_alerts', 'case_management', 'reports'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 5,
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
    id: 6,
    role: 'SAFEHOUSE',
    phoneNumber: '+231-000-0008',
    name: 'Shelter Manager',
    organization: 'Hope Safe House',
    email: 'manager.safehouse@test.reproplan',
    permissions: ['resident_management', 'access_control', 'resources'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString()
  },
  {
    id: 7,
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
    id: 8,
    role: 'MEDICAL',
    phoneNumber: '+231-000-0009',
    name: 'Clinic Supervisor',
    organization: 'Monrovia Women Wellness Clinic',
    email: 'clinic.supervisor@test.reproplan',
    permissions: ['patient_records', 'appointments', 'medical_resources'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
  },
  {
    id: 9,
    role: 'NGO',
    phoneNumber: '+231-000-0005',
    name: 'NGO Tester',
    organization: 'Community NGO',
    email: 'ngo@test.reproplan',
    permissions: ['program_management', 'community_outreach', 'resource_distribution', 'impact_tracking'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 10,
    role: 'NGO',
    phoneNumber: '+231-000-0010',
    name: 'Outreach Coordinator',
    organization: 'Youth Outreach NGO',
    email: 'outreach.ngo@test.reproplan',
    permissions: ['program_management', 'community_outreach', 'impact_tracking'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
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
  },
  {
    id: 4,
    name: 'Paynesville Youth Health Hub',
    address: 'Paynesville Red Light, Monrovia',
    phone: '+231-77-555-7788',
    hours: 'Mon - Sun: 9:00 AM - 7:00 PM',
    services: ['Youth SRHR', 'STI Testing', 'Contraception'],
    coordinates: { lat: 6.2895, lng: -10.7453 },
    type: 'clinic'
  },
  {
    id: 5,
    name: 'Buchanan Community Health Center',
    address: 'Port City Rd, Buchanan',
    phone: '+231-77-900-1122',
    hours: 'Mon - Fri: 8:30 AM - 4:30 PM',
    services: ['Primary Care', 'Counseling', 'Vaccinations'],
    coordinates: { lat: 5.8761, lng: -10.0491 },
    type: 'hospital'
  },
  {
    id: 6,
    name: 'West Point Emergency Clinic',
    address: 'West Point, Monrovia',
    phone: '+231-88-321-4567',
    hours: '24/7 Emergency Services',
    services: ['Emergency Care', 'First Aid', 'GBV Support'],
    coordinates: { lat: 6.3361, lng: -10.8309 },
    type: 'emergency'
  },
  {
    id: 7,
    name: 'Ganta Regional Health Center',
    address: 'Ganta City, Nimba',
    phone: '+231-77-630-9988',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
    services: ['Maternal Health', 'HIV Testing', 'Counseling'],
    coordinates: { lat: 7.2314, lng: -8.9728 },
    type: 'hospital'
  },
  {
    id: 8,
    name: 'Bensonville Youth Clinic',
    address: 'Bensonville, Montserrado',
    phone: '+231-88-455-2211',
    hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    services: ['Youth SRHR', 'Mental Health', 'Contraception'],
    coordinates: { lat: 6.4481, lng: -10.6114 },
    type: 'clinic'
  }
];

const DEFAULT_HEALTH_RECORDS: MockHealthRecord[] = [
  {
    id: 1,
    userId: 1,
    recordType: 'sti_test',
    data: {
      status: 'Completed',
      facility: 'Monrovia Women Wellness Clinic',
      result: 'Negative',
      notes: 'Routine screening'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
  },
  {
    id: 2,
    userId: 1,
    recordType: 'counseling_session',
    data: {
      counselor: 'Anonymous Counselor',
      focus: 'Safety planning',
      outcome: 'Follow-up scheduled'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 3,
    userId: 1,
    recordType: 'family_planning',
    data: {
      method: 'Injectable',
      dosage: '150mg',
      nextVisit: '2026-02-01'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 4,
    userId: 2,
    recordType: 'prenatal_visit',
    data: {
      status: 'Completed',
      facility: 'Redemption Hospital',
      trimester: 'Second',
      notes: 'Routine prenatal check'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 5,
    userId: 2,
    recordType: 'counseling_session',
    data: {
      counselor: 'Anonymous Counselor',
      focus: 'Mental wellness',
      outcome: 'Ongoing support'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 6,
    userId: 3,
    recordType: 'sti_test',
    data: {
      status: 'Pending',
      facility: 'Paynesville Youth Health Hub',
      notes: 'Results to be shared via secure code'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 7,
    userId: 5,
    recordType: 'contraception',
    data: {
      method: 'Injectable',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      nextDose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      notes: 'Follow-up reminder set'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
  },
  {
    id: 8,
    userId: 6,
    recordType: 'vaccination',
    data: {
      vaccine: 'HPV',
      dose: '2 of 3',
      facility: 'Bensonville Youth Clinic',
      nextDose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString()
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  },
  {
    id: 9,
    userId: 2,
    recordType: 'mental_health',
    data: {
      counselor: 'Anonymous Counselor',
      focus: 'Anxiety management',
      followUp: true
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
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
    priority: 'critical',
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
  },
  {
    id: 6,
    alertType: 'medical',
    priority: 'high',
    status: 'active',
    description: 'Urgent referral for emergency care.',
    location: {
      address: 'Redemption Hospital',
      city: 'Monrovia',
      coordinates: { lat: 6.3221, lng: -10.7832 }
    },
    assignedRole: 'MEDICAL',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: 3,
    alertType: 'safety',
    priority: 'high',
    status: 'responding',
    description: 'Safe house escort requested for high-risk resident.',
    location: {
      address: 'Paynesville',
      city: 'Monrovia',
      coordinates: { lat: 6.2881, lng: -10.7475 }
    },
    assignedRole: 'SAFEHOUSE',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: 4,
    alertType: 'community',
    priority: 'low',
    status: 'active',
    description: 'NGO outreach assistance requested for community visit.',
    location: {
      address: 'Congo Town',
      city: 'Monrovia',
      coordinates: { lat: 6.3503, lng: -10.7319 }
    },
    assignedRole: 'NGO',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 5,
    alertType: 'system',
    priority: 'medium',
    status: 'active',
    description: 'Admin review required for pending multi-role alert.',
    location: {
      address: 'Operations Center',
      city: 'Monrovia',
      coordinates: { lat: 6.3103, lng: -10.8006 }
    },
    assignedRole: 'ADMIN',
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 7,
    alertType: 'gbv',
    priority: 'critical',
    status: 'responding',
    description: 'High-risk GBV alert reported near school zone.',
    location: {
      address: 'Duala Market',
      city: 'Monrovia',
      coordinates: { lat: 6.2876, lng: -10.7562 }
    },
    assignedRole: 'POLICE',
    responseTime: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    id: 8,
    alertType: 'medical',
    priority: 'medium',
    status: 'active',
    description: 'Clinic follow-up requested for medication refill.',
    location: {
      address: 'Paynesville Red Light',
      city: 'Monrovia',
      coordinates: { lat: 6.2895, lng: -10.7453 }
    },
    assignedRole: 'MEDICAL',
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 9,
    alertType: 'safety',
    priority: 'high',
    status: 'active',
    description: 'Safe house transport needed for new intake.',
    location: {
      address: 'ELWA Junction',
      city: 'Monrovia',
      coordinates: { lat: 6.2813, lng: -10.7708 }
    },
    assignedRole: 'SAFEHOUSE',
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 10,
    alertType: 'community',
    priority: 'low',
    status: 'resolved',
    description: 'NGO outreach follow-up completed for youth forum.',
    location: {
      address: 'Caldwell',
      city: 'Monrovia',
      coordinates: { lat: 6.3462, lng: -10.7591 }
    },
    assignedRole: 'NGO',
    responseTime: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
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
    id: 6,
    caseNumber: 'CASE-0006',
    caseType: 'investigation',
    description: 'Active investigation for reported incident.',
    location: {
      address: 'Central Market Area',
      city: 'Monrovia',
      coordinates: { lat: 6.3136, lng: -10.8022 }
    },
    priority: 'high',
    status: 'in_progress',
    assignedRole: 'POLICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 7,
    caseNumber: 'CASE-0007',
    caseType: 'followup',
    description: 'Resolved community safety follow-up.',
    location: {
      address: 'West Point',
      city: 'Monrovia',
      coordinates: { lat: 6.3361, lng: -10.8309 }
    },
    priority: 'medium',
    status: 'resolved',
    assignedRole: 'POLICE',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
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
  },
  {
    id: 3,
    caseNumber: 'CASE-0003',
    caseType: 'shelter_intake',
    description: 'Safehouse intake and placement coordination.',
    location: {
      address: 'Sinkor',
      city: 'Monrovia',
      coordinates: { lat: 6.2907, lng: -10.7633 }
    },
    priority: 'high',
    status: 'in_progress',
    assignedRole: 'SAFEHOUSE',
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: 4,
    caseNumber: 'CASE-0004',
    caseType: 'outreach',
    description: 'Community outreach for SRHR education program.',
    location: {
      address: 'Buchanan',
      city: 'Grand Bassa',
      coordinates: { lat: 5.8769, lng: -10.0462 }
    },
    priority: 'low',
    status: 'open',
    assignedRole: 'NGO',
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
  },
  {
    id: 5,
    caseNumber: 'CASE-0005',
    caseType: 'system_review',
    description: 'Admin oversight for multi-role escalation.',
    location: {
      address: 'Operations Center',
      city: 'Monrovia',
      coordinates: { lat: 6.3103, lng: -10.8006 }
    },
    priority: 'medium',
    status: 'open',
    assignedRole: 'ADMIN',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 8,
    caseNumber: 'CASE-0008',
    caseType: 'gbv_response',
    description: 'Police response and survivor safety planning.',
    location: {
      address: 'Duala Market',
      city: 'Monrovia',
      coordinates: { lat: 6.2876, lng: -10.7562 }
    },
    priority: 'critical',
    status: 'in_progress',
    assignedRole: 'POLICE',
    relatedAlerts: [7],
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
  },
  {
    id: 9,
    caseNumber: 'CASE-0009',
    caseType: 'medical_referral',
    description: 'Referral for emergency treatment and follow-up.',
    location: {
      address: 'Redemption Hospital',
      city: 'Monrovia',
      coordinates: { lat: 6.3221, lng: -10.7832 }
    },
    priority: 'high',
    status: 'open',
    assignedRole: 'MEDICAL',
    relatedAlerts: [2, 8],
    createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString()
  },
  {
    id: 10,
    caseNumber: 'CASE-0010',
    caseType: 'shelter_transport',
    description: 'Transport and safety handoff to safehouse.',
    location: {
      address: 'ELWA Junction',
      city: 'Monrovia',
      coordinates: { lat: 6.2813, lng: -10.7708 }
    },
    priority: 'high',
    status: 'open',
    assignedRole: 'SAFEHOUSE',
    relatedAlerts: [9],
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString()
  },
  {
    id: 11,
    caseNumber: 'CASE-0011',
    caseType: 'community_outreach',
    description: 'Community forum planning for SRHR awareness.',
    location: {
      address: 'Caldwell',
      city: 'Monrovia',
      coordinates: { lat: 6.3462, lng: -10.7591 }
    },
    priority: 'low',
    status: 'resolved',
    assignedRole: 'NGO',
    relatedAlerts: [10],
    createdAt: new Date(Date.now() - 1000 * 60 * 560).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString()
  },
  {
    id: 12,
    caseNumber: 'CASE-0012',
    caseType: 'admin_review',
    description: 'Post-incident review and reporting.',
    location: {
      address: 'Operations Center',
      city: 'Monrovia',
      coordinates: { lat: 6.3103, lng: -10.8006 }
    },
    priority: 'medium',
    status: 'in_progress',
    assignedRole: 'ADMIN',
    relatedAlerts: [5],
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 220).toISOString()
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
  },
  {
    id: 2,
    fromRole: 'ADMIN',
    fromStakeholderId: 1,
    toRole: 'SAFEHOUSE',
    messageType: 'alert',
    subject: 'High-risk intake',
    content: 'Please prioritize the new intake case CASE-0003.',
    priority: 'high',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString()
  },
  {
    id: 3,
    fromRole: 'MEDICAL',
    fromStakeholderId: 4,
    toRole: 'ADMIN',
    messageType: 'update',
    subject: 'Clinic capacity update',
    content: 'Appointments today are near capacity. Recommend triage support.',
    priority: 'medium',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 4,
    fromRole: 'NGO',
    fromStakeholderId: 5,
    toRole: 'MEDICAL',
    messageType: 'request',
    subject: 'Health workshop support',
    content: 'Requesting medical staff for Buchanan outreach on Friday.',
    priority: 'low',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  },
  {
    id: 5,
    fromRole: 'POLICE',
    fromStakeholderId: 2,
    toRole: 'NGO',
    messageType: 'data_share',
    subject: 'Incident trend data',
    content: 'Sharing anonymized incident trend report for your outreach planning.',
    priority: 'medium',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
  },
  {
    id: 6,
    fromRole: 'SAFEHOUSE',
    fromStakeholderId: 5,
    toRole: 'POLICE',
    messageType: 'alert',
    subject: 'Transport needed',
    content: 'Requesting secure transport for new intake CASE-0010.',
    priority: 'high',
    isRead: false,
    relatedCaseId: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString()
  },
  {
    id: 7,
    fromRole: 'MEDICAL',
    fromStakeholderId: 7,
    toRole: 'SAFEHOUSE',
    messageType: 'request',
    subject: 'Post-visit safe housing',
    content: 'Patient needs safe housing after emergency care.',
    priority: 'high',
    isRead: false,
    relatedAlertId: 9,
    createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString()
  },
  {
    id: 8,
    fromRole: 'ADMIN',
    fromStakeholderId: 1,
    toRole: 'MEDICAL',
    messageType: 'notification',
    subject: 'QA review',
    content: 'Please verify emergency workflow logs for this week.',
    priority: 'low',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString()
  },
  {
    id: 9,
    fromRole: 'NGO',
    fromStakeholderId: 9,
    toRole: 'ADMIN',
    messageType: 'update',
    subject: 'Program milestone reached',
    content: 'Youth forum attendance exceeded targets. Updating impact report.',
    priority: 'medium',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 520).toISOString()
  },
  {
    id: 10,
    fromRole: 'POLICE',
    fromStakeholderId: 3,
    toRole: 'ADMIN',
    messageType: 'report',
    subject: 'Incident summary',
    content: 'Summary report for CASE-0008 is ready for review.',
    priority: 'medium',
    isRead: false,
    relatedCaseId: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString()
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
  healthRecords: [...DEFAULT_HEALTH_RECORDS],
  idCounters: {
    user: getMaxId(DEFAULT_USERS) + 1,
    stakeholder: getMaxId(DEFAULT_STAKEHOLDERS) + 1,
    alert: getMaxId(DEFAULT_ALERTS) + 1,
    case: getMaxId(DEFAULT_CASES) + 1,
    message: getMaxId(DEFAULT_MESSAGES) + 1,
    clinic: getMaxId(DEFAULT_CLINICS) + 1,
    healthRecord: getMaxId(DEFAULT_HEALTH_RECORDS) + 1
  }
});

const ensureSeedData = (db: MockDb) => {
  const hasUser = (code: string) => db.users.some((user) => user.secretCode === code);
  DEFAULT_USERS.forEach((user) => {
    if (!hasUser(user.secretCode)) {
      db.users.push({ ...user, createdAt: nowIso(), updatedAt: nowIso() });
    }
  });

  const hasStakeholder = (role: string, phoneNumber: string, email?: string) =>
    db.stakeholders.some(
      (stakeholder) =>
        stakeholder.role === role &&
        (stakeholder.phoneNumber === phoneNumber || (!!email && stakeholder.email === email))
    );
  DEFAULT_STAKEHOLDERS.forEach((stakeholder) => {
    if (!hasStakeholder(stakeholder.role, stakeholder.phoneNumber, stakeholder.email)) {
      db.stakeholders.push({ ...stakeholder, createdAt: nowIso(), updatedAt: nowIso() });
    }
  });

  if (!db.alerts || db.alerts.length === 0) {
    db.alerts = [...DEFAULT_ALERTS];
  }

  if (!db.cases || db.cases.length === 0) {
    db.cases = [...DEFAULT_CASES];
  }

  if (!db.messages || db.messages.length === 0) {
    db.messages = [...DEFAULT_MESSAGES];
  }

  if (!db.clinics || db.clinics.length === 0) {
    db.clinics = [...DEFAULT_CLINICS];
  }

  if (!db.healthRecords || db.healthRecords.length === 0) {
    db.healthRecords = [...DEFAULT_HEALTH_RECORDS];
  }

  db.users = db.users.map((user) => ({
    isVerified: user.isVerified ?? true,
    isUsed: user.isUsed ?? true,
    lastLogin: user.lastLogin,
    ...user
  }));

  db.idCounters.user = Math.max(db.idCounters.user, getMaxId(db.users) + 1);
  db.idCounters.stakeholder = Math.max(db.idCounters.stakeholder, getMaxId(db.stakeholders) + 1);
  db.idCounters.alert = Math.max(db.idCounters.alert, getMaxId(db.alerts) + 1);
  db.idCounters.case = Math.max(db.idCounters.case, getMaxId(db.cases) + 1);
  db.idCounters.message = Math.max(db.idCounters.message, getMaxId(db.messages) + 1);
  db.idCounters.clinic = Math.max(db.idCounters.clinic, getMaxId(db.clinics) + 1);
  db.idCounters.healthRecord = Math.max(
    db.idCounters.healthRecord,
    getMaxId(db.healthRecords) + 1
  );
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
      isVerified: true,
      isUsed: true,
      lastLogin: nowIso(),
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
        isVerified: true,
        isUsed: true,
        lastLogin: nowIso(),
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      db.users.push(user);
    } else {
      user.lastLogin = nowIso();
      user.isUsed = true;
      user.updatedAt = nowIso();
    }
    saveDb(db);
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
        isVerified: true,
        isUsed: true,
        lastLogin: nowIso(),
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      db.users.push(user);
    } else {
      user.secretCode = newCode;
      user.lastLogin = nowIso();
      user.isUsed = true;
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
    const stakeholder: MockStakeholder = {
      id,
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

  async loginStakeholder(secretCode: string | undefined, phoneNumber: string, role?: string) {
    const db = loadDb();
    let stakeholder: MockStakeholder | undefined;

    if (role && phoneNumber) {
      stakeholder = db.stakeholders.find(
        (s) => s.role === role && s.phoneNumber === phoneNumber
      );
    }
    if (!stakeholder && phoneNumber) {
      stakeholder = db.stakeholders.find((s) => s.phoneNumber === phoneNumber);
    }
    if (!stakeholder) {
      const id = nextId(db, 'stakeholder');
      const derivedRole = role || 'NGO';
      stakeholder = {
        id,
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
    const users = db.users.map((user) => ({
      ...user,
      isVerified: user.isVerified ?? true,
      isUsed: user.isUsed ?? true,
      lastLogin: user.lastLogin
    }));
    return { success: true, users };
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

