const { Pool } = require('pg');

// Use environment variable for database URL - NEVER hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const alterPharmaciesSQL = `
-- Add missing columns to pharmacies table
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS hours VARCHAR(255);
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false;
`;

async function updatePharmaciesSchema() {
  const client = await pool.connect();
  try {
    console.log('Connected to Railway database');
    console.log('Adding missing columns to pharmacies table...');
    
    await client.query(alterPharmaciesSQL);
    
    console.log('✅ Pharmacies table schema updated successfully!');
    console.log('\nAdded columns:');
    console.log('  - city VARCHAR(100)');
    console.log('  - region VARCHAR(100)');
    console.log('  - email VARCHAR(255)');
    console.log('  - hours VARCHAR(255)');
    console.log('  - delivery_available BOOLEAN DEFAULT false');
    
  } catch (err) {
    console.error('❌ Error updating pharmacies schema:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePharmaciesSchema();
