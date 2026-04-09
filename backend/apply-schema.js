const { Pool } = require('pg');

// Use environment variable for database URL - NEVER hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const newTablesSQL = `
-- ============================================
-- ACCESSIBILITY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS accessibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  high_contrast BOOLEAN DEFAULT false,
  large_text BOOLEAN DEFAULT false,
  screen_reader BOOLEAN DEFAULT false,
  reduced_motion BOOLEAN DEFAULT false,
  color_blind_mode VARCHAR(20),
  font_size VARCHAR(10) DEFAULT 'medium',
  keyboard_navigation BOOLEAN DEFAULT false,
  focus_indicators BOOLEAN DEFAULT true,
  captions_enabled BOOLEAN DEFAULT false,
  audio_descriptions BOOLEAN DEFAULT false,
  sign_language BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS accessibility_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REPORTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number VARCHAR(100) UNIQUE NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  coordinates JSONB DEFAULT '{}',
  incident_date TIMESTAMP,
  is_anonymous BOOLEAN DEFAULT true,
  reporter_name VARCHAR(255),
  reporter_contact VARCHAR(255),
  reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  consent_to_share BOOLEAN DEFAULT false,
  wants_callback BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'investigating', 'resolved', 'closed', 'archived')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  assigned_role VARCHAR(20),
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  created_by_type VARCHAR(20) DEFAULT 'stakeholder',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ERROR REPORTING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  user_agent TEXT,
  url TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'ignored')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- QR CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_type VARCHAR(50),
  data JSONB DEFAULT '{}',
  qr_image TEXT,
  qr_svg TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_code_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  location JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ALTER EXISTING TABLES
-- ============================================

-- Add columns to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT true;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Add columns to safety_checks table
ALTER TABLE safety_checks ADD COLUMN IF NOT EXISTS alert_contacts BOOLEAN DEFAULT false;
ALTER TABLE safety_checks ADD COLUMN IF NOT EXISTS contact_ids JSONB DEFAULT '[]';
ALTER TABLE safety_checks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed';
ALTER TABLE safety_checks ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES stakeholders(id) ON DELETE SET NULL;
ALTER TABLE safety_checks ADD COLUMN IF NOT EXISTS response_notes TEXT;
ALTER TABLE safety_checks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add columns to support_groups table
ALTER TABLE support_groups ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE support_groups ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE support_groups ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
ALTER TABLE support_groups ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]';

-- Create workflows table if not exists
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  trigger_type VARCHAR(50) NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_accessibility_settings_user ON accessibility_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_profiles_user ON accessibility_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_assigned ON reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);
`;

async function applySchema() {
  const client = await pool.connect();
  try {
    console.log('Connected to Railway database');
    console.log('Applying schema updates...');
    
    await client.query(newTablesSQL);
    
    console.log('✅ Schema applied successfully!');
    console.log('\nNew tables created:');
    console.log('  - accessibility_settings');
    console.log('  - accessibility_profiles');
    console.log('  - reports');
    console.log('  - report_notes');
    console.log('  - error_reports');
    console.log('  - qr_codes');
    console.log('  - qr_code_scans');
    console.log('  - workflows');
    console.log('\nExisting tables updated:');
    console.log('  - stories (added user_id, category, status, is_anonymous, likes_count)');
    console.log('  - safety_checks (added alert_contacts, contact_ids, status, responded_by, response_notes)');
    console.log('  - support_groups (added category, is_private, member_count, rules)');
    
  } catch (err) {
    console.error('❌ Error applying schema:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema();
