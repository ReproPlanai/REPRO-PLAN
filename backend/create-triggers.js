const { Pool } = require('pg');

// Use environment variable for database URL - NEVER hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const triggersSQL = `
-- First ensure the function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Secret codes trigger
DROP TRIGGER IF EXISTS update_secret_codes_updated_at ON secret_codes;
CREATE TRIGGER update_secret_codes_updated_at BEFORE UPDATE ON secret_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stakeholder departments trigger
DROP TRIGGER IF EXISTS update_stakeholder_departments_updated_at ON stakeholder_departments;
CREATE TRIGGER update_stakeholder_departments_updated_at BEFORE UPDATE ON stakeholder_departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

console.log('Creating missing triggers for Fortune 500 compliance...\n');

pool.query(triggersSQL)
  .then(() => {
    console.log('✅ All triggers created successfully!');
    return pool.query(`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table
    `);
  })
  .then(result => {
    console.log(`\n⚡ TOTAL TRIGGERS: ${result.rows.length}`);
    result.rows.forEach(t => {
      console.log(`   • ${t.trigger_name} on ${t.event_object_table}`);
    });
    console.log('\n🎉 ALL TRIGGERS INSTALLED!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
