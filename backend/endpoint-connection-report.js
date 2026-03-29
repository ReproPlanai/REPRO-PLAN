const { Pool } = require('pg');

const DATABASE_URL = 'postgres://postgres:JqQzUpViBWYpDnTtFBZtSkWnUhfmhUpe@centerbeam.proxy.rlwy.net:31576/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function endpointConnectionReport() {
  console.log('\n' + '='.repeat(80));
  console.log('  3-TIER ENDPOINT CONNECTION REPORT');
  console.log('='.repeat(80));
  
  // Check database
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  
  console.log('\n📊 DATABASE STATUS');
  console.log(`   ✅ ${tables.rows.length} tables ready`);
  console.log(`   ✅ PostgreSQL connected`);
  
  // Endpoint mapping
  console.log('\n🔗 ENDPOINT CONNECTION MAP');
  console.log('='.repeat(80));
  
  const endpoints = [
    { method: 'GET', path: '/api/users', frontend: ['UserManagement', 'AdminDashboard'], backend: 'users.ts', db: 'users table', status: '⚠️' },
    { method: 'POST', path: '/api/users/register', frontend: ['UserManagement'], backend: 'users.ts', db: 'users table', status: '✅' },
    { method: 'POST', path: '/api/users/login', frontend: ['LoginForm'], backend: 'users.ts', db: 'users table', status: '⚠️' },
    { method: 'PUT', path: '/api/users/:id', frontend: ['UserManagement'], backend: 'users.ts', db: 'users table', status: '⚠️' },
    { method: 'DELETE', path: '/api/users/:id', frontend: ['UserManagement'], backend: 'users.ts', db: 'users table', status: '⚠️' },
    { method: 'GET', path: '/api/stakeholders', frontend: ['AdminDashboard', 'StakeholderManagement'], backend: 'stakeholders.ts', db: 'stakeholders table', status: '⚠️' },
    { method: 'POST', path: '/api/stakeholders/login', frontend: ['PortalLogin'], backend: 'stakeholders.ts', db: 'stakeholders table', status: '⚠️' },
    { method: 'GET', path: '/api/alerts', frontend: ['AdminDashboard', 'NGODashboard', 'SafeHouseDashboard'], backend: 'alerts.ts', db: 'alerts table', status: '⚠️' },
    { method: 'POST', path: '/api/alerts', frontend: ['SafeHouseDashboard'], backend: 'alerts.ts', db: 'alerts table', status: '⚠️' },
    { method: 'PUT', path: '/api/alerts/:id', frontend: ['AdminDashboard'], backend: 'alerts.ts', db: 'alerts table', status: '⚠️' },
    { method: 'GET', path: '/api/cases', frontend: ['AdminDashboard', 'PoliceDashboard'], backend: 'cases.ts', db: 'cases table', status: '⚠️' },
    { method: 'POST', path: '/api/cases', frontend: ['PoliceDashboard'], backend: 'cases.ts', db: 'cases table', status: '⚠️' },
    { method: 'GET', path: '/api/messages', frontend: ['AdminDashboard', 'InterRoleMessaging'], backend: 'messages.ts', db: 'messages table', status: '⚠️' },
    { method: 'POST', path: '/api/messages', frontend: ['InterRoleMessaging'], backend: 'messages.ts', db: 'messages table', status: '⚠️' },
    { method: 'GET', path: '/api/clinics', frontend: ['ClinicFinder', 'MedicalDashboard'], backend: 'clinics.ts', db: 'clinics table', status: '⚠️' },
    { method: 'GET', path: '/api/health-records', frontend: ['PatientRecords', 'HealthTracker'], backend: 'health-records.ts', db: 'health_records table', status: '⚠️' },
    { method: 'GET', path: '/api/admin/dashboard-stats', frontend: ['AdminDashboard'], backend: 'admin.ts', db: 'all tables', status: '⚠️' },
    { method: 'GET', path: '/api/admin/analytics', frontend: ['AdminDashboard'], backend: 'admin.ts', db: 'all tables', status: '⚠️' },
    { method: 'GET', path: '/health', frontend: ['SystemCheck'], backend: 'index.ts', db: 'connection test', status: '✅' },
    { method: 'GET', path: '/status', frontend: ['SystemDiagnostics'], backend: 'index.ts', db: 'connection test', status: '✅' },
  ];
  
  console.log('\n   LEGEND: ✅ = DB Connected | ⚠️ = In-Memory Only | ❌ = Missing');
  console.log('\n   Frontend → Backend → Database:');
  
  endpoints.forEach(ep => {
    const status = ep.status === '✅' ? '✅ FULL' : ep.status === '⚠️' ? '⚠️ PARTIAL' : '❌ BROKEN';
    console.log(`\n   ${status}`);
    console.log(`      ${ep.method} ${ep.path}`);
    console.log(`      Frontend: ${ep.frontend.join(', ')}`);
    console.log(`      Backend: ${ep.backend}`);
    console.log(`      Database: ${ep.db}`);
  });
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('  SUMMARY');
  console.log('='.repeat(80));
  
  const connected = endpoints.filter(e => e.status === '✅').length;
  const partial = endpoints.filter(e => e.status === '⚠️').length;
  const broken = endpoints.filter(e => e.status === '❌').length;
  
  console.log(`\n   Total Endpoints: ${endpoints.length}`);
  console.log(`   ✅ Fully Connected (Frontend→Backend→DB): ${connected}`);
  console.log(`   ⚠️  Partial (Frontend→Backend→Memory): ${partial}`);
  console.log(`   ❌ Broken: ${broken}`);
  
  console.log('\n   3-TIER STATUS:');
  console.log('   Tier 1 (Frontend): ✅ CONNECTED to Backend');
  console.log('   Tier 2 (Backend): ⚠️  NOT using Database (using memory)');
  console.log('   Tier 3 (Database): ✅ TABLES EXIST but unused');
  
  console.log('\n   FIX REQUIRED:');
  console.log('   Update all route files to use:');
  console.log('   import { query } from "../config/db";');
  console.log('   const result = await query("SELECT * FROM table");');
  
  console.log('\n   FILES NEEDING UPDATES:');
  const filesToUpdate = [
    'src/routes/users.ts',
    'src/routes/stakeholders.ts',
    'src/routes/alerts.ts',
    'src/routes/cases.ts',
    'src/routes/messages.ts',
    'src/routes/clinics.ts',
    'src/routes/health-records.ts',
    'src/routes/admin.ts'
  ];
  filesToUpdate.forEach(f => console.log(`   - ${f}`));
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  pool.end();
}

endpointConnectionReport().catch(err => {
  console.error('Audit failed:', err);
  pool.end();
});
