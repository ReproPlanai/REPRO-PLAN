import { query } from './db';
import { logger } from './logger';

interface TableInfo {
  table_name: string;
  column_count: number;
  has_indexes: boolean;
  row_count: number;
}

interface VerificationResult {
  totalTables: number;
  expectedTables: string[];
  foundTables: string[];
  missingTables: string[];
  extraTables: string[];
  tableDetails: TableInfo[];
  issues: string[];
}

const EXPECTED_TABLES = [
  // Core tables
  'users',
  'stakeholders',
  'alerts',
  'cases',
  'messages',
  'clinics',
  'health_records',
  'stories',
  'system_settings',
  'audit_logs',
  
  // Survey tables
  'surveys',
  'survey_responses',
  'user_demographics',
  
  // Secret code tables
  'secret_codes',
  'secret_code_usage',
  
  // Stakeholder enhancement
  'stakeholder_departments',
  'stakeholder_shifts',
  'stakeholder_metrics',
  
  // Chat system
  'chat_rooms',
  'chat_participants',
  'chat_messages',
  
  // Notifications
  'notifications',
  'notification_preferences',
  
  // Session & security
  'user_sessions',
  'password_resets',
  
  // AI/Games
  'game_sessions',
  'consent_scenarios',
  'srhr_myths',
  'quiz_questions',
  
  // Mentorship
  'mentors',
  'mentorships',
  'mentorship_appointments',
  'resources',
  'support_groups',
  'support_group_members',
  
  // Workflows
  'workflow_templates',
  'workflow_executions',
  'scheduled_tasks',
];

export async function verifyDatabase(): Promise<VerificationResult> {
  logger.info('Starting Fortune 500 database verification...');
  
  const issues: string[] = [];
  
  try {
    // Get all tables in the database
    const tablesResult = await query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const foundTables = tablesResult.map(t => t.table_name);
    
    // Find missing tables
    const missingTables = EXPECTED_TABLES.filter(
      expected => !foundTables.includes(expected)
    );
    
    // Find extra tables
    const extraTables = foundTables.filter(
      found => !EXPECTED_TABLES.includes(found)
    );
    
    // Get detailed info for each found table
    const tableDetails: TableInfo[] = [];
    
    for (const tableName of foundTables) {
      try {
        // Get column count
        const columnResult = await query<{ count: string }>(`
          SELECT COUNT(*) as count 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
        `, [tableName]);
        
        const columnCount = parseInt(columnResult[0]?.count || '0');
        
        // Check for indexes
        const indexResult = await query<{ has_indexes: boolean }>(`
          SELECT EXISTS(
            SELECT 1 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = $1
          ) as has_indexes
        `, [tableName]);
        
        const hasIndexes = indexResult[0]?.has_indexes || false;
        
        // Get row count (approximate for performance)
        const countResult = await query<{ count: string }>(`
          SELECT COUNT(*) as count FROM "${tableName}"
        `);
        
        const rowCount = parseInt(countResult[0]?.count || '0');
        
        tableDetails.push({
          table_name: tableName,
          column_count: columnCount,
          has_indexes: hasIndexes,
          row_count: rowCount,
        });
      } catch (error) {
        issues.push(`Failed to get details for table ${tableName}: ${error}`);
      }
    }
    
    // Check for foreign key constraints
    const fkResult = await query<{ table_name: string; constraint_name: string }>(`
      SELECT 
        tc.table_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);
    
    // Check for triggers
    const triggerResult = await query<{ trigger_name: string; event_object_table: string }>(`
      SELECT 
        trigger_name,
        event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table
    `);
    
    const result: VerificationResult = {
      totalTables: foundTables.length,
      expectedTables: EXPECTED_TABLES,
      foundTables,
      missingTables,
      extraTables,
      tableDetails,
      issues,
    };
    
    // Log Fortune 500 report
    logVerificationReport(result, fkResult, triggerResult);
    
    return result;
    
  } catch (error) {
    logger.error({ error }, 'Database verification failed');
    throw error;
  }
}

function logVerificationReport(
  result: VerificationResult,
  foreignKeys: { table_name: string; constraint_name: string }[],
  triggers: { trigger_name: string; event_object_table: string }[]
): void {
  console.log('\n' + '='.repeat(80));
  console.log('  FORTUNE 500 DATABASE VERIFICATION REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n  📊 SUMMARY:`);
  console.log(`     Expected Tables: ${result.expectedTables.length}`);
  console.log(`     Found Tables:    ${result.foundTables.length}`);
  console.log(`     Missing Tables:  ${result.missingTables.length}`);
  console.log(`     Extra Tables:    ${result.extraTables.length}`);
  
  if (result.missingTables.length > 0) {
    console.log(`\n  ❌ MISSING TABLES:`);
    result.missingTables.forEach(table => {
      console.log(`     • ${table}`);
    });
  }
  
  if (result.extraTables.length > 0) {
    console.log(`\n  ⚠️  EXTRA TABLES (not in schema):`);
    result.extraTables.forEach(table => {
      console.log(`     • ${table}`);
    });
  }
  
  console.log(`\n  ✅ TABLES VERIFIED (${result.tableDetails.length}):`);
  result.tableDetails.forEach(table => {
    const status = table.has_indexes ? '✅' : '⚠️';
    console.log(`     ${status} ${table.table_name}`);
    console.log(`        Columns: ${table.column_count} | Indexes: ${table.has_indexes ? 'Yes' : 'No'} | Rows: ${table.row_count}`);
  });
  
  console.log(`\n  🔗 FOREIGN KEY CONSTRAINTS: ${foreignKeys.length}`);
  
  console.log(`\n  ⚡ TRIGGERS: ${triggers.length}`);
  
  if (result.issues.length > 0) {
    console.log(`\n  ❌ ISSUES FOUND:`);
    result.issues.forEach(issue => {
      console.log(`     • ${issue}`);
    });
  }
  
  const healthScore = Math.round(
    ((result.expectedTables.length - result.missingTables.length) / result.expectedTables.length) * 100
  );
  
  console.log(`\n  📈 DATABASE HEALTH SCORE: ${healthScore}%`);
  console.log('='.repeat(80) + '\n');
}

export default verifyDatabase;
