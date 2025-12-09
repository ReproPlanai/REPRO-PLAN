import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { auditLogger } from './middleware/auditLogger';
import { authLimiter, recoveryLimiter } from './middleware/rateLimiters';
import apiRoutes from './routes';
import './models'; // Import all models to ensure they're registered

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security middleware with stricter defaults for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'https://your-frontend-app.netlify.app'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  // Keep this disabled to avoid breakage with third-party embeds
  crossOriginEmbedderPolicy: false
}));
// HSTS for HTTPS-only in production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({
    maxAge: 15552000, // 180 days
    includeSubDomains: true,
    preload: false
  }));
}
app.use(compression());

// Request tracing and audit logging
app.use(requestId);
app.use(auditLogger);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-app.netlify.app',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Stricter rate limits for sensitive routes
app.use('/api/auth/', authLimiter);
app.use('/api/auth/forget-code', recoveryLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'REPRO PLAN API v3.0 is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database models (use with caution in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized.');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 REPRO PLAN API v3.0 server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: /health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

startServer();

export default app;

