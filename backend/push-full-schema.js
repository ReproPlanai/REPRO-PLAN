const { Pool } = require('pg');
const fs = require('fs');

// Use environment variable for database URL - NEVER hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Read the schema from db.ts
const dbTsPath = './src/config/db.ts';
const dbTsContent = fs.readFileSync(dbTsPath, 'utf8');

// Extract the schema SQL between the backticks
const schemaMatch = dbTsContent.match(/const schemaSQL = `([\s\S]+?)`;/);
if (!schemaMatch) {
  console.error('Could not extract schema SQL from db.ts');
  process.exit(1);
}

let schemaSQL = schemaMatch[1];

// Clean up the schema SQL - remove TypeScript comments and clean up
schemaSQL = schemaSQL
  .split('\n')
  .filter(line => !line.trim().startsWith('//') && line.trim() !== '')
  .join('\n');

async function pushFullSchema() {
  const client = await pool.connect();
  try {
    console.log('Connected to Railway database');
    console.log('Pushing full schema...');
    
    // Split schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await client.query(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (err) {
        // Ignore errors for tables that already exist
        if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
          console.log(`⏭️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
        } else {
          console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Full schema pushed successfully!');
  } catch (err) {
    console.error('❌ Error pushing schema:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

pushFullSchema();
