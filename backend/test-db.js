const { Pool } = require('pg');

const DATABASE_URL = 'postgres://postgres:JqQzUpViBWYpDnTtFBZtSkWnUhfmhUpe@centerbeam.proxy.rlwy.net:31576/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

console.log('Testing database connection...\n');

pool.query('SELECT version(), current_database(), current_user')
  .then(result => {
    console.log('✅ Connection successful!');
    console.log('PostgreSQL Version:', result.rows[0].version.split(' ')[0]);
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    
    // List all tables
    return pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as columns
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
  })
  .then(result => {
    console.log('\n📊 TABLES FOUND:', result.rows.length);
    result.rows.forEach(row => {
      console.log(`   • ${row.table_name} (${row.columns} columns)`);
    });
    
    // Show verification summary
    const expectedTables = [
      'users', 'stakeholders', 'alerts', 'cases', 'messages', 'clinics', 
      'health_records', 'stories', 'system_settings', 'audit_logs',
      'surveys', 'survey_responses', 'user_demographics',
      'secret_codes', 'secret_code_usage',
      'stakeholder_departments', 'stakeholder_shifts', 'stakeholder_metrics',
      'chat_rooms', 'chat_participants', 'chat_messages',
      'notifications', 'notification_preferences',
      'user_sessions', 'password_resets',
      'game_sessions', 'consent_scenarios', 'srhr_myths', 'quiz_questions',
      'mentors', 'mentorships', 'mentorship_appointments', 'resources',
      'support_groups', 'support_group_members',
      'workflow_templates', 'workflow_executions', 'scheduled_tasks'
    ];
    
    const foundTables = result.rows.map(r => r.table_name);
    const missing = expectedTables.filter(t => !foundTables.includes(t));
    const extra = foundTables.filter(t => !expectedTables.includes(t));
    
    console.log('\n✅ EXPECTED TABLES:', expectedTables.length);
    console.log('✅ FOUND TABLES:', foundTables.length);
    console.log('❌ MISSING TABLES:', missing.length);
    if (missing.length > 0) {
      missing.forEach(t => console.log(`   • ${t}`));
    }
    
    if (extra.length > 0) {
      console.log('\n⚠️  EXTRA TABLES:', extra.length);
      extra.forEach(t => console.log(`   • ${t}`));
    }
    
    const healthScore = Math.round(((expectedTables.length - missing.length) / expectedTables.length) * 100);
    console.log(`\n📈 DATABASE HEALTH: ${healthScore}%`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
