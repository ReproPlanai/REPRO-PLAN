-- =====================================================
-- REPRO PLAN v3.0 - Complete Database Setup Script
-- =====================================================
-- Run this entire script in pgAdmin Query Tool
-- Make sure you're connected to PostgreSQL server first
-- =====================================================

-- Step 1: Create the database (if it doesn't exist)
-- Note: You cannot create a database from within another database
-- Run this separately if needed, or create it manually in pgAdmin
-- CREATE DATABASE reproplan;

-- Connect to the reproplan database first
-- In pgAdmin: Right-click reproplan database → Query Tool

-- =====================================================
-- Step 2: Create ENUM Types
-- =====================================================

-- Create ENUM for stakeholder roles
DO $$ BEGIN
    CREATE TYPE enum_stakeholders_role AS ENUM ('ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for alert types
DO $$ BEGIN
    CREATE TYPE enum_alert_type AS ENUM ('panic', 'medical', 'gbv', 'safety', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for priority levels
DO $$ BEGIN
    CREATE TYPE enum_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for alert status
DO $$ BEGIN
    CREATE TYPE enum_alert_status AS ENUM ('active', 'responding', 'resolved', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for case status
DO $$ BEGIN
    CREATE TYPE enum_case_status AS ENUM ('open', 'investigating', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ENUM for message types
DO $$ BEGIN
    CREATE TYPE enum_message_type AS ENUM ('alert', 'request', 'update', 'notification', 'data_share');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Step 3: Create Tables
-- =====================================================

-- Table 1: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "secretCode" VARCHAR(255) NOT NULL UNIQUE,
    "surveyLink" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(50),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: health_records
CREATE TABLE IF NOT EXISTS health_records (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "recordType" VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_records_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Table 3: stakeholders
CREATE TABLE IF NOT EXISTS stakeholders (
    id SERIAL PRIMARY KEY,
    role enum_stakeholders_role NOT NULL,
    "secretCode" VARCHAR(255) NOT NULL UNIQUE,
    "phoneNumber" VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    organization VARCHAR(255),
    email VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: emergency_alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER,
    "stakeholderId" INTEGER,
    "alertType" enum_alert_type NOT NULL,
    priority enum_priority NOT NULL DEFAULT 'medium',
    status enum_alert_status NOT NULL DEFAULT 'active',
    location JSONB NOT NULL,
    description TEXT NOT NULL,
    "assignedTo" INTEGER,
    "assignedRole" VARCHAR(50),
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "emergency_alerts_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT "emergency_alerts_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") 
        REFERENCES stakeholders(id) ON DELETE SET NULL
);

-- Table 5: cases
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    "caseNumber" VARCHAR(255) NOT NULL UNIQUE,
    "caseType" VARCHAR(255) NOT NULL,
    status enum_case_status NOT NULL DEFAULT 'open',
    priority enum_priority NOT NULL DEFAULT 'medium',
    "assignedTo" INTEGER,
    "assignedRole" VARCHAR(50),
    location JSONB NOT NULL,
    description TEXT NOT NULL,
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    "relatedAlerts" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cases_assignedTo_fkey" FOREIGN KEY ("assignedTo") 
        REFERENCES stakeholders(id) ON DELETE SET NULL
);

-- Table 6: inter_role_messages
CREATE TABLE IF NOT EXISTS inter_role_messages (
    id SERIAL PRIMARY KEY,
    "fromRole" VARCHAR(50) NOT NULL,
    "fromStakeholderId" INTEGER NOT NULL,
    "toRole" VARCHAR(50) NOT NULL,
    "toStakeholderId" INTEGER,
    "messageType" enum_message_type NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    "relatedCaseId" INTEGER,
    "relatedAlertId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    priority enum_priority NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inter_role_messages_fromStakeholderId_fkey" FOREIGN KEY ("fromStakeholderId") 
        REFERENCES stakeholders(id) ON DELETE CASCADE,
    CONSTRAINT "inter_role_messages_toStakeholderId_fkey" FOREIGN KEY ("toStakeholderId") 
        REFERENCES stakeholders(id) ON DELETE SET NULL
);

-- =====================================================
-- Step 4: Create Indexes for Better Performance
-- =====================================================

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_secretCode ON users("secretCode");
CREATE INDEX IF NOT EXISTS idx_users_surveyLink ON users("surveyLink");
CREATE INDEX IF NOT EXISTS idx_users_isUsed ON users("isUsed");

-- Indexes for health_records table
CREATE INDEX IF NOT EXISTS idx_health_records_userId ON health_records("userId");
CREATE INDEX IF NOT EXISTS idx_health_records_recordType ON health_records("recordType");

-- Indexes for stakeholders table
CREATE INDEX IF NOT EXISTS idx_stakeholders_role ON stakeholders(role);
CREATE INDEX IF NOT EXISTS idx_stakeholders_secretCode ON stakeholders("secretCode");
CREATE INDEX IF NOT EXISTS idx_stakeholders_isActive ON stakeholders("isActive");

-- Indexes for emergency_alerts table
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_userId ON emergency_alerts("userId");
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_stakeholderId ON emergency_alerts("stakeholderId");
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_priority ON emergency_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_alertType ON emergency_alerts("alertType");

-- Indexes for cases table
CREATE INDEX IF NOT EXISTS idx_cases_caseNumber ON cases("caseNumber");
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_assignedTo ON cases("assignedTo");

-- Indexes for inter_role_messages table
CREATE INDEX IF NOT EXISTS idx_inter_role_messages_fromStakeholderId ON inter_role_messages("fromStakeholderId");
CREATE INDEX IF NOT EXISTS idx_inter_role_messages_toStakeholderId ON inter_role_messages("toStakeholderId");
CREATE INDEX IF NOT EXISTS idx_inter_role_messages_toRole ON inter_role_messages("toRole");
CREATE INDEX IF NOT EXISTS idx_inter_role_messages_isRead ON inter_role_messages("isRead");
CREATE INDEX IF NOT EXISTS idx_inter_role_messages_priority ON inter_role_messages(priority);

-- =====================================================
-- Step 5: Create Function to Auto-Update updatedAt Timestamp
-- =====================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updatedAt on all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
CREATE TRIGGER update_health_records_updated_at 
    BEFORE UPDATE ON health_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stakeholders_updated_at ON stakeholders;
CREATE TRIGGER update_stakeholders_updated_at 
    BEFORE UPDATE ON stakeholders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_alerts_updated_at ON emergency_alerts;
CREATE TRIGGER update_emergency_alerts_updated_at 
    BEFORE UPDATE ON emergency_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at 
    BEFORE UPDATE ON cases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inter_role_messages_updated_at ON inter_role_messages;
CREATE TRIGGER update_inter_role_messages_updated_at 
    BEFORE UPDATE ON inter_role_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Step 6: Verification Queries
-- =====================================================

-- Check if all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('users', 'health_records', 'stakeholders', 'emergency_alerts', 'cases', 'inter_role_messages')
ORDER BY table_name;

-- Check if all ENUMs were created
SELECT typname as enum_name
FROM pg_type 
WHERE typtype = 'e' 
    AND typname IN ('enum_stakeholders_role', 'enum_alert_type', 'enum_priority', 
                    'enum_alert_status', 'enum_case_status', 'enum_message_type')
ORDER BY typname;

-- =====================================================
-- SUCCESS! Your database is now set up.
-- =====================================================
-- You should see:
-- - 6 tables listed in the first query result
-- - 6 ENUMs listed in the second query result
-- =====================================================

