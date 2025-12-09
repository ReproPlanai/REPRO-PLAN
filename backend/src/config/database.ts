import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Get database URL from environment (DigitalOcean provides DATABASE_URL)
const databaseUrl = process.env.DATABASE_URL;

// If DATABASE_URL is provided (DigitalOcean), use it directly
// Otherwise, construct from individual variables
let sequelize: Sequelize;

if (databaseUrl) {
  // Production database connection (DigitalOcean)
  // DigitalOcean requires SSL for all connections
  const isProduction = process.env.NODE_ENV === 'production';
  const isDigitalOcean = databaseUrl.includes('digitalocean.com') || databaseUrl.includes('ondigitalocean.com');
  
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // DigitalOcean and production environments require SSL
      ssl: (isProduction || isDigitalOcean) ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Local development connection
  const dbName = process.env.DB_NAME || 'reproplan';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST || 'your-db-host.db.ondigitalocean.com';
  const dbPort = parseInt(process.env.DB_PORT || '5432');

  // Validate required environment variables
  if (!dbPassword) {
    console.error('❌ Error: DB_PASSWORD is not set in .env file');
    console.error('Please create a .env file in the backend folder with your PostgreSQL password.');
    console.error('See env.example.txt for the format.');
    throw new Error('DB_PASSWORD environment variable is required');
  }

  sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

export { sequelize };

