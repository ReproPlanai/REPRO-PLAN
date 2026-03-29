import { Pool, PoolClient } from 'pg';
import { getEnv } from './env';
import { logger } from './logger';

const env = getEnv();

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log pool events
pool.on('error', (err) => {
  logger.error({ error: err.message }, 'Unexpected PostgreSQL pool error');
});

pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected to pool');
});

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Execute a query with automatic release
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Execute a single row query
 */
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results[0] || null;
}

/**
 * Check database connection health
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection check failed');
    return false;
  }
}

/**
 * Initialize database - create tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    logger.info('Initializing database schema...');
    
    await client.query(schemaSQL);
    
    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize database schema');
    throw error;
  } finally {
    client.release();
  }
}

// SQL Schema for REPRO PLAN
const schemaSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (anonymous access codes)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  secret_code VARCHAR(255) UNIQUE NOT NULL,
  survey_link VARCHAR(255),
  demographics JSONB DEFAULT '{}',
  phone_number VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  is_used BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholders table (admins, police, safehouse, medical, NGO)
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO')),
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  organization VARCHAR(255),
  email VARCHAR(255),
  survey_link VARCHAR(255),
  permissions TEXT[] DEFAULT '{}',
  secret_code VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'responding')),
  description TEXT NOT NULL,
  location JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  assigned_role VARCHAR(20),
  response_time INTEGER, -- in minutes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR(100) UNIQUE NOT NULL,
  case_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  assigned_to UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  assigned_role VARCHAR(20),
  related_alerts UUID[] DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (inter-role messaging)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_role VARCHAR(20) NOT NULL,
  from_stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  to_role VARCHAR(20) NOT NULL,
  to_stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  message_type VARCHAR(50) DEFAULT 'general',
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  related_case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  related_alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  hours VARCHAR(255),
  services TEXT[] DEFAULT '{}',
  coordinates JSONB DEFAULT '{}',
  type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_type VARCHAR(100) NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories/Community content table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_type VARCHAR(20) DEFAULT 'anonymous', -- 'anonymous', 'user', 'stakeholder'
  author_id UUID,
  is_approved BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SURVEY TABLES (Fortune 500 Compliance)
-- ============================================

-- Survey definitions/questions
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'demographics', 'feedback', 'assessment', 'srhr_knowledge'
  is_active BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT true,
  questions JSONB NOT NULL DEFAULT '[]', -- Array of question objects
  estimated_duration INTEGER, -- in minutes
  created_by UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Survey responses from users
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}', -- Question-answer pairs
  completion_status VARCHAR(20) DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Demographics tracking (detailed breakdown)
CREATE TABLE IF NOT EXISTS user_demographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age_range VARCHAR(20),
  gender VARCHAR(50),
  county VARCHAR(100),
  education_level VARCHAR(50),
  relationship_status VARCHAR(50),
  primary_language VARCHAR(50) DEFAULT 'en',
  has_children BOOLEAN,
  srhr_experience VARCHAR(255),
  disability_status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SECRET CODE MANAGEMENT (Enhanced Security)
-- ============================================

-- Secret codes with full metadata and tracking
CREATE TABLE IF NOT EXISTS secret_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(255) UNIQUE NOT NULL,
  code_hash VARCHAR(255) NOT NULL, -- Hashed version for security
  type VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (type IN ('user', 'stakeholder', 'admin', 'emergency')),
  entity_id UUID, -- References users.id or stakeholders.id
  entity_type VARCHAR(20), -- 'user' or 'stakeholder'
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  last_used_ip INET,
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP,
  revoked_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

-- Code usage audit trail
CREATE TABLE IF NOT EXISTS secret_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_id UUID REFERENCES secret_codes(id) ON DELETE CASCADE,
  used_by UUID, -- user or stakeholder who used it
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  failure_reason TEXT
);

-- ============================================
-- STAKEHOLDER ENHANCEMENT TABLES
-- ============================================

-- Stakeholder departments/teams
CREATE TABLE IF NOT EXISTS stakeholder_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO')),
  location JSONB DEFAULT '{}',
  operating_hours VARCHAR(255),
  emergency_contact VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholder shifts/availability
CREATE TABLE IF NOT EXISTS stakeholder_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_on_call BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholder performance metrics
CREATE TABLE IF NOT EXISTS stakeholder_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  cases_handled INTEGER DEFAULT 0,
  alerts_responded INTEGER DEFAULT 0,
  avg_response_time INTEGER, -- in minutes
  satisfaction_score DECIMAL(3,2), -- 0.00 to 5.00
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(stakeholder_id, metric_date)
);

-- ============================================
-- REAL-TIME CHAT SYSTEM
-- ============================================

-- Chat rooms (for peer support, stakeholder coordination)
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'support' CHECK (type IN ('support', 'crisis', 'stakeholder', 'peer', 'ai')),
  description TEXT,
  allowed_roles TEXT[] DEFAULT '{}', -- Which stakeholder roles can access
  is_private BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat room participants
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_type VARCHAR(20) DEFAULT 'user' CHECK (participant_type IN ('user', 'stakeholder', 'ai')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID, -- Can be user or stakeholder
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'stakeholder', 'system', 'ai')),
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'ai')),
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATION SYSTEM
-- ============================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('user', 'stakeholder')),
  type VARCHAR(50) NOT NULL, -- 'alert', 'message', 'case_update', 'system', 'appointment'
  title VARCHAR(255) NOT NULL,
  content TEXT,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  action_url VARCHAR(500),
  action_taken BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  alert_types TEXT[] DEFAULT '{}',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SESSION & SECURITY MANAGEMENT
-- ============================================

-- Active sessions tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AI/GAME TRACKING TABLES
-- ============================================

-- AI game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(50) NOT NULL, -- 'consent', 'quiz', 'scenario', 'myth_buster'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  score INTEGER,
  max_score INTEGER,
  duration_seconds INTEGER,
  answers JSONB DEFAULT '[]',
  feedback TEXT,
  ai_interactions INTEGER DEFAULT 0
);

-- Consent education scenarios
CREATE TABLE IF NOT EXISTS consent_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  scenario_type VARCHAR(50) NOT NULL, -- 'healthy', 'unhealthy', 'ambiguous'
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  age_appropriate JSONB DEFAULT '[]', -- Age ranges
  learning_objectives TEXT[] DEFAULT '{}',
  correct_response JSONB NOT NULL,
  explanation TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SRHR Myths/Facts database
CREATE TABLE IF NOT EXISTS srhr_myths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  myth TEXT NOT NULL,
  fact TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'contraception', 'sti', 'consent', 'anatomy', 'periods'
  difficulty VARCHAR(20) DEFAULT 'medium',
  evidence_source VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz questions bank
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  options JSONB NOT NULL, -- Array of {text, isCorrect}
  correct_answer_explanation TEXT,
  age_appropriate JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MENTORSHIP & SUPPORT TABLES
-- ============================================

-- Mentors directory
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  expertise TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}', -- 'career', 'mental_health', 'srhr', 'relationships'
  availability_schedule JSONB DEFAULT '{}',
  max_mentees INTEGER DEFAULT 5,
  current_mentees INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentorship relationships
CREATE TABLE IF NOT EXISTS mentorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  goals TEXT[] DEFAULT '{}',
  notes TEXT,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mentor_id, mentee_id)
);

-- Mentorship appointments
CREATE TABLE IF NOT EXISTS mentorship_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentorship_id UUID REFERENCES mentorships(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'phone', 'chat', 'in_person')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Educational resources
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'article', 'video', 'infographic', 'pdf', 'external_link'
  category VARCHAR(50) NOT NULL, -- 'contraception', 'sti', 'consent', 'mental_health', 'relationships'
  url VARCHAR(500),
  file_path VARCHAR(500),
  thumbnail_url VARCHAR(500),
  content JSONB DEFAULT '{}', -- For structured content
  age_appropriate JSONB DEFAULT '[]',
  language VARCHAR(10) DEFAULT 'en',
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support groups
CREATE TABLE IF NOT EXISTS support_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  focus_area VARCHAR(50) NOT NULL, -- 'teen_parents', 'survivors', 'lgbtq', 'mental_health'
  facilitator_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  meeting_schedule JSONB DEFAULT '{}', -- {day, time, frequency}
  is_virtual BOOLEAN DEFAULT true,
  location JSONB DEFAULT '{}', -- For in-person meetings
  max_members INTEGER DEFAULT 20,
  current_members INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support group memberships
CREATE TABLE IF NOT EXISTS support_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'co_facilitator')),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- WORKFLOW & AUTOMATION TABLES
-- ============================================

-- Workflow templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- 'alert_created', 'case_assigned', 'scheduled', 'manual'
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL, -- Array of actions to execute
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  triggered_by VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50), -- 'alert', 'case', 'user'
  entity_id UUID,
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  results JSONB DEFAULT '{}',
  error_message TEXT
);

-- System scheduled tasks
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cron_expression VARCHAR(100) NOT NULL,
  task_type VARCHAR(50) NOT NULL, -- 'backup', 'report', 'cleanup', 'notification'
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  last_run_status VARCHAR(20),
  last_run_error TEXT,
  next_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  user_id UUID,
  user_type VARCHAR(20), -- 'user', 'stakeholder', 'system'
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance (Fortune 500 Grade)

-- Core tables
CREATE INDEX IF NOT EXISTS idx_users_secret_code ON users(secret_code);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- Stakeholders
CREATE INDEX IF NOT EXISTS idx_stakeholders_role ON stakeholders(role);
CREATE INDEX IF NOT EXISTS idx_stakeholders_phone ON stakeholders(phone_number);
CREATE INDEX IF NOT EXISTS idx_stakeholders_is_active ON stakeholders(is_active);
CREATE INDEX IF NOT EXISTS idx_stakeholders_secret_code ON stakeholders(secret_code);
CREATE INDEX IF NOT EXISTS idx_stakeholders_org ON stakeholders(organization);

-- Alerts & Cases
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_stakeholder ON alerts(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_stakeholder_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_messages_related_case ON messages(related_case_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Health records
CREATE INDEX IF NOT EXISTS idx_health_records_user ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);

-- Stories
CREATE INDEX IF NOT EXISTS idx_stories_approved ON stories(is_approved);
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at);

-- ============================================
-- SURVEY INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_surveys_category ON surveys(category);
CREATE INDEX IF NOT EXISTS idx_surveys_active ON surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_status ON survey_responses(completion_status);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed ON survey_responses(completed_at);

CREATE INDEX IF NOT EXISTS idx_user_demographics_user ON user_demographics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_demographics_age ON user_demographics(age_range);
CREATE INDEX IF NOT EXISTS idx_user_demographics_county ON user_demographics(county);
CREATE INDEX IF NOT EXISTS idx_user_demographics_gender ON user_demographics(gender);

-- ============================================
-- SECRET CODE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_secret_codes_code ON secret_codes(code);
CREATE INDEX IF NOT EXISTS idx_secret_codes_type ON secret_codes(type);
CREATE INDEX IF NOT EXISTS idx_secret_codes_entity ON secret_codes(entity_id);
CREATE INDEX IF NOT EXISTS idx_secret_codes_active ON secret_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_secret_codes_expires ON secret_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_secret_code_usage_code ON secret_code_usage(code_id);
CREATE INDEX IF NOT EXISTS idx_secret_code_usage_user ON secret_code_usage(used_by);
CREATE INDEX IF NOT EXISTS idx_secret_code_usage_date ON secret_code_usage(used_at);

-- ============================================
-- STAKEHOLDER ENHANCEMENT INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stakeholder_dept_role ON stakeholder_departments(role_type);
CREATE INDEX IF NOT EXISTS idx_stakeholder_dept_active ON stakeholder_departments(is_active);

CREATE INDEX IF NOT EXISTS idx_stakeholder_shifts_stakeholder ON stakeholder_shifts(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_shifts_day ON stakeholder_shifts(day_of_week);

CREATE INDEX IF NOT EXISTS idx_stakeholder_metrics_stakeholder ON stakeholder_metrics(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_metrics_date ON stakeholder_metrics(metric_date);

-- ============================================
-- CHAT SYSTEM INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active);

CREATE INDEX IF NOT EXISTS idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(is_active);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);

-- ============================================
-- NOTIFICATION INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_stakeholder ON notifications(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_stakeholder ON notification_preferences(stakeholder_id);

-- ============================================
-- SESSION & SECURITY INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_stakeholder ON password_resets(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);

-- ============================================
-- AI/GAME INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON game_sessions(completed_at);

CREATE INDEX IF NOT EXISTS idx_consent_scenarios_type ON consent_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_consent_scenarios_difficulty ON consent_scenarios(difficulty);
CREATE INDEX IF NOT EXISTS idx_consent_scenarios_active ON consent_scenarios(is_active);

CREATE INDEX IF NOT EXISTS idx_srhr_myths_category ON srhr_myths(category);
CREATE INDEX IF NOT EXISTS idx_srhr_myths_active ON srhr_myths(is_active);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active);

-- ============================================
-- MENTORSHIP INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mentors_stakeholder ON mentors(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON mentors(is_active);
CREATE INDEX IF NOT EXISTS idx_mentors_rating ON mentors(rating);

CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee ON mentorships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);

CREATE INDEX IF NOT EXISTS idx_mentorship_appointments_mentorship ON mentorship_appointments(mentorship_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_appointments_scheduled ON mentorship_appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mentorship_appointments_status ON mentorship_appointments(status);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_approved ON resources(is_approved);
CREATE INDEX IF NOT EXISTS idx_resources_language ON resources(language);

CREATE INDEX IF NOT EXISTS idx_support_groups_focus ON support_groups(focus_area);
CREATE INDEX IF NOT EXISTS idx_support_groups_facilitator ON support_groups(facilitator_id);
CREATE INDEX IF NOT EXISTS idx_support_groups_active ON support_groups(is_active);

CREATE INDEX IF NOT EXISTS idx_support_group_members_group ON support_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_support_group_members_user ON support_group_members(user_id);

-- ============================================
-- WORKFLOW INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger ON workflow_templates(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_name ON scheduled_tasks(task_name);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_active ON scheduled_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks(next_run_at);

-- System tables
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stakeholders_updated_at ON stakeholders;
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinics_updated_at ON clinics;
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Survey triggers
DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_demographics_updated_at ON user_demographics;
CREATE TRIGGER update_user_demographics_updated_at BEFORE UPDATE ON user_demographics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Chat triggers  
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mentorship triggers
DROP TRIGGER IF EXISTS update_mentors_updated_at ON mentors;
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentorships_updated_at ON mentorships;
CREATE TRIGGER update_mentorships_updated_at BEFORE UPDATE ON mentorships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Resource triggers
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Support group triggers
DROP TRIGGER IF EXISTS update_support_groups_updated_at ON support_groups;
CREATE TRIGGER update_support_groups_updated_at BEFORE UPDATE ON support_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Workflow triggers
DROP TRIGGER IF EXISTS update_workflow_templates_updated_at ON workflow_templates;
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Quiz/consent triggers
DROP TRIGGER IF EXISTS update_consent_scenarios_updated_at ON consent_scenarios;
CREATE TRIGGER update_consent_scenarios_updated_at BEFORE UPDATE ON consent_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quiz_questions_updated_at ON quiz_questions;
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notification preferences trigger
DROP TRIGGER IF EXISTS update_notification_prefs_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ECOMMERCE TABLES (Mini Pharmacy Shop)
-- ============================================

-- Products table (medications, test kits, etc.)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'contraception', 'testing', 'pain_relief', 'emergency'
  stock_quantity INTEGER DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT false,
  dosage VARCHAR(100),
  form VARCHAR(50), -- 'tablet', 'kit', 'liquid'
  side_effects JSONB DEFAULT '[]',
  instructions TEXT,
  image_url VARCHAR(500),
  rating DECIMAL(2,1) DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacies (fulfillment centers)
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  coordinates JSONB DEFAULT '{}',
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_time VARCHAR(50),
  is_open BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL,
  delivery_type VARCHAR(20) DEFAULT 'pickup' CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  prescription_url VARCHAR(500),
  requires_prescription BOOLEAN DEFAULT false,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL, -- Price at time of order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items (user's shopping cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- External data connections
CREATE TABLE IF NOT EXISTS external_data_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  connection_type VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- External data sync logs
CREATE TABLE IF NOT EXISTS external_data_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES external_data_connections(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  records_processed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  started_at TIMESTAMP,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ecommerce tables
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_prescription ON products(requires_prescription);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_pharmacies_active ON pharmacies(is_active);
CREATE INDEX IF NOT EXISTS idx_pharmacies_open ON pharmacies(is_open);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

CREATE INDEX IF NOT EXISTS idx_external_data_stakeholder ON external_data_connections(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_external_data_type ON external_data_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_external_data_status ON external_data_connections(status);

CREATE INDEX IF NOT EXISTS idx_external_sync_logs_connection ON external_data_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_external_sync_logs_status ON external_data_sync_logs(status);

-- Triggers for ecommerce tables
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pharmacies_updated_at ON pharmacies;
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_external_data_connections_updated_at ON external_data_connections;
CREATE TRIGGER update_external_data_connections_updated_at BEFORE UPDATE ON external_data_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

export default pool;
