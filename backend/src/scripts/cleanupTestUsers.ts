import { query } from '../config/db';
import { createServiceLogger } from '../config/logger';

const log = createServiceLogger('cleanup-test-users');

/**
 * Database Cleanup Script - Identify and Delete Test Users
 * 
 * This script identifies and deletes test users based on the following criteria:
 * - Users with "test" patterns in their data (name, email, survey_link)
 * - Users with placeholder/invalid secret codes
 * - Users with incomplete onboarding (no demographics data)
 * - Users created before production launch date
 * - Users who didn't enter codes through proper flow
 */

const PRODUCTION_LAUNCH_DATE = new Date('2025-01-01'); // Adjust as needed

export async function identifyTestUsers() {
  log.info('Starting test user identification...');

  const testUsers: any[] = [];

  try {
    // 1. Users with "test" patterns in their data
    const testPatternUsers = await query(`
      SELECT id, secret_code, survey_link, phone_number, created_at, demographics
      FROM users
      WHERE 
        secret_code ILIKE '%test%' OR
        survey_link ILIKE '%test%' OR
        phone_number ILIKE '%test%' OR
        demographics::text ILIKE '%test%'
    `);
    testUsers.push(...testPatternUsers.map((u: any) => ({ ...u, reason: 'test pattern in data' })));

    // 2. Users with placeholder/invalid secret codes
    const placeholderCodeUsers = await query(`
      SELECT id, secret_code, survey_link, phone_number, created_at, demographics
      FROM users
      WHERE 
        secret_code ILIKE '%placeholder%' OR
        secret_code ILIKE '%sample%' OR
        secret_code ILIKE '%demo%' OR
        LENGTH(secret_code) < 6
    `);
    testUsers.push(...placeholderCodeUsers.map((u: any) => ({ ...u, reason: 'placeholder/invalid secret code' })));

    // 3. Users with incomplete onboarding (no demographics data)
    const incompleteOnboardingUsers = await query(`
      SELECT id, secret_code, survey_link, phone_number, created_at, demographics
      FROM users
      WHERE 
        demographics = '{}' OR
        demographics IS NULL OR
        demographics::text = '{}'
    `);
    testUsers.push(...incompleteOnboardingUsers.map((u: any) => ({ ...u, reason: 'incomplete onboarding' })));

    // 4. Users created before production launch
    const oldUsers = await query(`
      SELECT id, secret_code, survey_link, phone_number, created_at, demographics
      FROM users
      WHERE created_at < $1
    `, [PRODUCTION_LAUNCH_DATE]);
    testUsers.push(...oldUsers.map((u: any) => ({ ...u, reason: 'created before production launch' })));

    // 5. Users who never logged in (no last_login) and are not verified
    const neverLoggedInUsers = await query(`
      SELECT id, secret_code, survey_link, phone_number, created_at, demographics, last_login, is_verified
      FROM users
      WHERE 
        last_login IS NULL AND
        is_verified = false AND
        created_at < NOW() - INTERVAL '7 days'
    `);
    testUsers.push(...neverLoggedInUsers.map((u: any) => ({ ...u, reason: 'never logged in and not verified' })));

    // Remove duplicates (users may match multiple criteria)
    const uniqueTestUsers = Array.from(
      new Map(testUsers.map(user => [user.id, user])).values()
    );

    log.info(`Identified ${uniqueTestUsers.length} test users`);
    return uniqueTestUsers;
  } catch (error) {
    log.error({ error }, 'Error identifying test users');
    throw error;
  }
}

export async function deleteTestUsers(testUsers: any[]) {
  log.info(`Starting deletion of ${testUsers.length} test users...`);

  try {
    let deletedCount = 0;
    const deletedIds: string[] = [];

    for (const user of testUsers) {
      try {
        await query('DELETE FROM users WHERE id = $1', [user.id]);
        deletedIds.push(user.id);
        deletedCount++;
        log.info(`Deleted user ${user.id} - Reason: ${user.reason}`);
      } catch (error) {
        log.error({ error, userId: user.id }, `Failed to delete user ${user.id}`);
      }
    }

    log.info(`Successfully deleted ${deletedCount} test users`);
    return { deletedCount, deletedIds };
  } catch (error) {
    log.error({ error }, 'Error deleting test users');
    throw error;
  }
}

export async function runCleanup() {
  log.info('=== Starting Database Cleanup ===');

  try {
    const testUsers = await identifyTestUsers();
    
    if (testUsers.length === 0) {
      log.info('No test users found. Cleanup complete.');
      return { found: 0, deleted: 0 };
    }

    log.info(`Found ${testUsers.length} test users to delete`);
    testUsers.forEach((user, index) => {
      log.info(`${index + 1}. ID: ${user.id}, Code: ${user.secret_code}, Reason: ${user.reason}`);
    });

    const result = await deleteTestUsers(testUsers);
    
    log.info('=== Database Cleanup Complete ===');
    return { found: testUsers.length, deleted: result.deletedCount };
  } catch (error) {
    log.error({ error }, 'Database cleanup failed');
    throw error;
  }
}

// Run cleanup if executed directly
if (require.main === module) {
  runCleanup()
    .then((result) => {
      console.log(`Cleanup complete: Found ${result.found} users, Deleted ${result.deleted} users`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

export { runCleanup as cleanupTestUsers };
