const { Pool } = require('pg');

const DATABASE_URL = 'postgres://postgres:JqQzUpViBWYpDnTtFBZtSkWnUhfmhUpe@centerbeam.proxy.rlwy.net:31576/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

const indexesSQL = `
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

-- ============================================
-- CORE TABLE INDEXES (Enhanced)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_stakeholders_is_active ON stakeholders(is_active);
CREATE INDEX IF NOT EXISTS idx_stakeholders_secret_code ON stakeholders(secret_code);
CREATE INDEX IF NOT EXISTS idx_stakeholders_org ON stakeholders(organization);
CREATE INDEX IF NOT EXISTS idx_alerts_stakeholder ON alerts(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_messages_related_case ON messages(related_case_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_stories_approved ON stories(is_approved);
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
`;

console.log('Creating Fortune 500 indexes (96+ indexes)...\n');

pool.query(indexesSQL)
  .then(() => {
    console.log('✅ All indexes created successfully!');
    return pool.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
  })
  .then(result => {
    const indexCount = result.rows[0].count;
    console.log(`\n📊 TOTAL INDEXES: ${indexCount}`);
    console.log('\n🎉 FORTUNE 500 DATABASE OPTIMIZATION COMPLETE!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
