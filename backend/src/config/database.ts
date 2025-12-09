import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Get database URL from environment (DigitalOcean provides DATABASE_URL)
const databaseUrl = process.env.DATABASE_URL;

// If DATABASE_URL is provided (DigitalOcean), use it directly
// Otherwise, construct from individual variables
let sequelize: Sequelize;

if (databaseUrl) {
  // DigitalOcean managed Postgres uses self-signed certificates; force allow them
  // Remove any existing SSL parameters from DATABASE_URL and add our own
  const cleanUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/, '').replace(/[?&]sslcert=[^&]*/, '').replace(/[?&]sslkey=[^&]*/, '').replace(/[?&]sslrootcert=[^&]*/, '');

  sequelize = new Sequelize(`${cleanUrl}?sslmode=require`, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Production deployment - DATABASE_URL should be provided by DigitalOcean
  console.error('❌ Error: DATABASE_URL environment variable is required');
  console.error('This should be automatically provided by DigitalOcean App Platform');
  throw new Error('DATABASE_URL environment variable is required for production deployment');
}

export { sequelize };

