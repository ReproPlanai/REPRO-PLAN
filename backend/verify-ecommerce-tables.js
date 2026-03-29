const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:JqQzUpViBWYpDnTtFBZtSkWnUhfmhUpe@centerbeam.proxy.rlwy.net:31576/railway',
  ssl: { rejectUnauthorized: false }
});

async function verifyEcommerceTables() {
  console.log('\n========================================');
  console.log('  ECOMMERCE TABLES VERIFICATION');
  console.log('========================================\n');
  
  const tables = [
    'products',
    'orders', 
    'cart_items',
    'order_items',
    'pharmacies',
    'product_reviews',
    'external_data_connections',
    'external_data_sync_logs'
  ];
  
  let found = 0;
  let missing = 0;
  
  for (const table of tables) {
    try {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        ) as exists`,
        [table]
      );
      
      if (result.rows[0].exists) {
        console.log(`  ✅ ${table}`);
        found++;
      } else {
        console.log(`  ❌ ${table} (missing)`);
        missing++;
      }
    } catch (err) {
      console.log(`  ❌ ${table} (error: ${err.message})`);
      missing++;
    }
  }
  
  console.log('\n----------------------------------------');
  console.log(`  Total: ${found}/${tables.length} tables found`);
  
  if (missing > 0) {
    console.log('\n  ⚠️  Some tables are missing!');
    console.log('     Run the backend to auto-create tables.');
  } else {
    console.log('\n  ✅ All ecommerce tables exist!');
  }
  
  console.log('\n========================================\n');
  
  await pool.end();
}

verifyEcommerceTables().catch(err => {
  console.error('Verification failed:', err);
  pool.end();
  process.exit(1);
});
