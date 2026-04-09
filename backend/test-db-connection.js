const { Pool } = require('pg');

// Use environment variable for database URL - NEVER hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error details:', err);
    process.exit(1);
  }
}

testConnection();
