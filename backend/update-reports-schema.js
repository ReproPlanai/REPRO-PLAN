const { Pool } = require('pg');

// Use environment variable for database URL - NEVER hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const alterReportsSQL = `
-- Add missing columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS evidence_urls JSONB;
`;

async function updateReportsSchema() {
  const client = await pool.connect();
  try {
    console.log('Connected to Railway database');
    console.log('Adding missing columns to reports table...');

    await client.query(alterReportsSQL);

    console.log('✅ Reports table schema updated successfully!');
    console.log('\nAdded columns:');
    console.log('  - type VARCHAR(50)');
    console.log('  - user_id UUID REFERENCES users(id)');
    console.log('  - contact_info TEXT');
    console.log('  - evidence_urls JSONB');

  } catch (err) {
    console.error('❌ Error updating reports schema:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateReportsSchema();
