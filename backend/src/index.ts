import 'dotenv/config';

// Early startup logging
console.log('[STARTUP] Starting REPRO PLAN Server...');
console.log('[STARTUP] NODE_ENV:', process.env.NODE_ENV);
console.log('[STARTUP] PORT:', process.env.PORT);

try {
  // Validate env early - fail fast if critical secrets missing
  if (!process.env.JWT_SECRET) {
    console.error('[STARTUP] CRITICAL: JWT_SECRET environment variable not set');
    console.error('[STARTUP] Set JWT_SECRET in environment before starting server');
    process.exit(1);
  }
} catch (error) {
  console.error('[STARTUP] Env validation error:', error);
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getEnv } from './config/env';
import { logger } from './config/logger';
import { pool, initializeDatabase, checkConnection } from './config/db';
import { isEmailServiceConfigured } from './services/email';
import { isAIConfigured } from './services/ai';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { requireHTTPS, securityHeaders, validateRequest, sanitizeInput } from './middleware/security';
import { apiLimiter, authLimiter, adminLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import adminAuthRoutes from './routes/admin-auth';
import reprobotRoutes from './routes/reprobot';
import transcribeRoutes from './routes/transcribe';
import aiRoutes from './routes/ai';
import userRoutes from './routes/users';
import stakeholderRoutes from './routes/stakeholders';
import alertRoutes from './routes/alerts';
import caseRoutes from './routes/cases';
import messageRoutes from './routes/messages';
import clinicRoutes from './routes/clinics';
import healthRecordRoutes from './routes/health-records';
import adminRoutes from './routes/admin';
import storiesRoutes from './routes/stories';
import auditLogsRoutes from './routes/audit-logs';
import notificationsRoutes from './routes/notifications';
import qrRoutes from './routes/qr';
import biometricsRoutes from './routes/biometrics';
import safetyChecksRoutes from './routes/safety-checks';
import chatRoutes from './routes/chat';
import mentorsRoutes from './routes/mentors';
import resourcesRoutes from './routes/resources';
import supportGroupsRoutes from './routes/support-groups';
import workflowsRoutes from './routes/workflows';
import externalDataRoutes from './routes/external-data';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import pharmaciesRoutes from './routes/pharmacies';
import accessibilityRoutes from './routes/accessibility';
import reportsRoutes from './routes/reports';
import errorsRoutes from './routes/errors';

import { serverDiagnostics, SystemDiagnostics } from './config/diagnostics';
import { verifyDatabase } from './config/verifyDb';

const app = express();
const env = getEnv();

// Fortune 500 Security Stack - Order matters!
// 1. HTTPS enforcement (production only)
app.use(requireHTTPS);

// 2. Security headers
app.use(securityHeaders);

// 3. Helmet for additional security
app.use(helmet({
  contentSecurityPolicy: false, // We set our own CSP in securityHeaders
  crossOriginEmbedderPolicy: false, // Allow embedded resources
}));

// 4. CORS - allow only production domains (Fortune 500 multi-domain support)
const normalizeOrigin = (url: string): string => url.replace(/\/$/, '');
const allowedOrigins = [
  'https://reproplanai.com',
  'https://www.reproplanai.com',
  'https://repro-plan.vercel.app',
].map(normalizeOrigin);

app.use(cors({ 
  origin: (origin, callback) => {
    const requestOrigin = origin ? normalizeOrigin(origin) : '';
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Check if request origin is in allowed list
    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// 5. Request validation
app.use(validateRequest);

// 6. Body parsing with limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 7. Input sanitization
app.use(sanitizeInput);

// 8. Request logging
app.use(requestLogger);

// Rate limiting - different tiers
app.use('/auth', authLimiter); // Strict for auth
app.use('/api/admin', adminLimiter); // Strict for admin
app.use('/api', apiLimiter); // General API rate limiting

app.get('/health', async (_req, res) => {
  const diagnostics = await serverDiagnostics.runDiagnostics();
  const dbConnected = await checkConnection();
  const db = dbConnected ? 'up' : 'down';
  const email = isEmailServiceConfigured() ? 'up' : 'down';
  const ai = isAIConfigured() ? 'up' : 'down';

  const services = { db, email, ai };
  const status = dbConnected && email && ai ? 'healthy' : 'degraded';

  logger.info({ service: 'health', services }, 'Health check');
  res.json({ 
    status, 
    services,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '3.0.0',
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    diagnostics: {
      summary: diagnostics.summary,
      services: diagnostics.services.map(s => ({
        name: s.name,
        status: s.status,
        message: s.message,
      })),
    },
  });
});

// Fortune 500 Full Diagnostics Endpoint
app.get('/status', async (_req, res) => {
  const fullDiagnostics = await serverDiagnostics.runDiagnostics();
  
  logger.info({ 
    endpoint: '/status',
    summary: fullDiagnostics.summary 
  }, 'Full diagnostics requested');
  
  res.json(fullDiagnostics);
});

// Fortune 500 Database Verification Endpoint
app.get('/verify-db', async (_req, res) => {
  try {
    const verification = await verifyDatabase();
    res.json(verification);
  } catch (error) {
    logger.error({ error }, 'Database verification failed');
    res.status(500).json({ error: 'Verification failed', details: error });
  }
});

app.use('/authadmin-auth', adminAuthRoutes);
app.use('/api/', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stakeholders', stakeholderRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/biometrics', biometricsRoutes);
app.use('/api/safety-checks', safetyChecksRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/support-groups', supportGroupsRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/external-data', externalDataRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/accessibility', accessibilityRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/errors', errorsRoutes);
app.use('/reprobot', reprobotRoutes);
app.use('/transcribe', transcribeRoutes);
app.use('/ai', aiRoutes);

app.use(errorHandler);

const port = env.PORT;

// Wrap startup in try-catch to catch initialization errors
const startServer = async () => {
  try {
    const server = app.listen(port, async () => {
      // Initialize database on startup
      try {
        if (env.DATABASE_URL) {
          await initializeDatabase();
          logger.info('Database initialized and tables created');
        }
      } catch (error) {
        logger.error({ error }, 'Database initialization failed - continuing without DB');
      }
      
      // Run and log Fortune 500 diagnostics
      try {
        const diagnostics = await serverDiagnostics.runDiagnostics();
        serverDiagnostics.logStartup(diagnostics);
      } catch (error) {
        logger.error({ error }, 'Diagnostics failed');
      }
      
      logger.info({ port, env: env.NODE_ENV }, 'Server started successfully');
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error({ error }, 'Server error');
      process.exit(1);
    });
  } catch (error) {
    logger.error({ error }, 'Fatal startup error');
    process.exit(1);
  }
};

startServer();
