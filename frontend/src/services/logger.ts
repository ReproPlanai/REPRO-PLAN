/**
 * FORTUNE 500 FRONTEND LOGGER
 * Structured, production-grade logging for REPRO PLAN frontend
 * 
 * Features:
 * - Structured JSON logging (like backend Pino)
 * - Log levels: fatal, error, warn, info, debug, trace
 * - Context enrichment (user, session, component)
 * - Production-safe (no sensitive data)
 * - Remote log aggregation support
 * - Performance tracking
 */

import { v4 as uuidv4 } from 'uuid';

// Log levels in order of severity
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

// Standard log levels with numeric values for comparison
const LOG_LEVELS: Record<LogLevel, number> = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

// Log entry structure (matches backend Pino format)
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelValue: number;
  message: string;
  service: string;
  version: string;
  environment: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  browser?: {
    name: string;
    version: string;
    os: string;
    mobile: boolean;
  };
  url?: string;
  userAgent?: string;
}

// Logger configuration
export interface LoggerConfig {
  minLevel: LogLevel;
  service: string;
  version: string;
  environment: string;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  includeBrowserInfo: boolean;
  sampleRate: number; // 0-1, for high-volume logs
  redactFields: string[];
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: (process.env.REACT_APP_LOG_LEVEL as LogLevel) || 'info',
  service: 'repro-plan-frontend',
  version: process.env.REACT_APP_VERSION || '3.0.0',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  enableConsole: true,
  enableRemote: process.env.REACT_APP_ENVIRONMENT === 'production',
  remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT,
  includeBrowserInfo: true,
  sampleRate: 1.0,
  redactFields: ['password', 'secretCode', 'token', 'jwt', 'apiKey', 'creditCard', 'ssn'],
};

// Session/request tracking
let sessionId: string | null = null;
let requestId: string | null = null;
let userId: string | null = null;

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (!sessionId) {
    sessionId = localStorage.getItem('repro_plan_session_id') || uuidv4();
    localStorage.setItem('repro_plan_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get browser information
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let os = 'Unknown';
  let mobile = false;

  // Detect browser
  if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = ua.split('Firefox/')[1].split(' ')[0];
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome';
    browserVersion = ua.split('Chrome/')[1].split(' ')[0];
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || 'Unknown';
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge';
    browserVersion = ua.split('Edg/')[1].split(' ')[0];
  }

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) { os = 'Android'; mobile = true; }
  else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; mobile = true; }

  return { name: browserName, version: browserVersion, os, mobile };
}

/**
 * Redact sensitive fields from an object
 */
function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...obj };
  const fieldsToRedact = defaultConfig.redactFields;
  
  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    if (fieldsToRedact.some(field => lowerKey.includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitive(redacted[key] as Record<string, unknown>);
    }
  }
  
  return redacted;
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    levelValue: LOG_LEVELS[level],
    message,
    service: defaultConfig.service,
    version: defaultConfig.version,
    environment: defaultConfig.environment,
  };

  // Add context
  if (requestId) entry.requestId = requestId;
  if (userId) entry.userId = userId;
  if (defaultConfig.includeBrowserInfo) {
    entry.sessionId = getSessionId();
    entry.browser = getBrowserInfo();
    entry.userAgent = navigator.userAgent;
    entry.url = window.location.href;
  }

  // Add metadata (with redaction)
  if (metadata) {
    entry.metadata = redactSensitive(metadata);
  }

  // Add error details
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      code: (error as any).code,
    };
    
    // Only include stack trace in development
    if (defaultConfig.environment === 'development') {
      entry.error.stack = error.stack;
    }
  }

  return entry;
}

/**
 * Send log to console with Fortune 500 formatting
 */
function sendToConsole(entry: LogEntry): void {
  if (!defaultConfig.enableConsole) return;

  const emoji = {
    fatal: '💀',
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    debug: '🔍',
    trace: '🔬',
  }[entry.level];

  const styles = {
    fatal: 'background: #ff0000; color: white; font-weight: bold;',
    error: 'color: #ff0000; font-weight: bold;',
    warn: 'color: #ff9900; font-weight: bold;',
    info: 'color: #0066ff;',
    debug: 'color: #666;',
    trace: 'color: #999;',
  }[entry.level];

  // Structured log format
  const prefix = `${emoji} [${entry.timestamp}] ${entry.level.toUpperCase()}`;
  
  if (defaultConfig.environment === 'development') {
    // Pretty print in development
    console.log(`%c${prefix}%c ${entry.message}`, styles, 'color: inherit;', 
      entry.metadata ? '\nMetadata:' : '',
      entry.metadata || '',
      entry.error ? '\nError:' : '',
      entry.error || ''
    );
  } else {
    // Structured JSON in production (for log aggregation)
    console.log(JSON.stringify(entry));
  }
}

/**
 * Send log to remote endpoint (for production monitoring)
 */
async function sendToRemote(entry: LogEntry): Promise<void> {
  if (!defaultConfig.enableRemote || !defaultConfig.remoteEndpoint) return;
  
  // Sampling for high-volume logs
  if (Math.random() > defaultConfig.sampleRate) return;

  // Use sendBeacon if available (non-blocking, works on page unload)
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(entry)], { type: 'application/json' });
    navigator.sendBeacon(defaultConfig.remoteEndpoint, blob);
  } else {
    // Fallback to fetch
    try {
      await fetch(defaultConfig.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
      });
    } catch {
      // Silent fail - don't create infinite error loops
    }
  }
}

/**
 * Main logger class
 */
export class Fortune500Logger {
  private static instance: Fortune500Logger;
  
  private constructor() {}
  
  static getInstance(): Fortune500Logger {
    if (!Fortune500Logger.instance) {
      Fortune500Logger.instance = new Fortune500Logger();
    }
    return Fortune500Logger.instance;
  }

  /**
   * Set user context for all subsequent logs
   */
  setUser(id: string): void {
    userId = id;
    this.info('User context set', { userId: id });
  }

  /**
   * Set request ID for request tracing
   */
  setRequestId(id: string): void {
    requestId = id;
  }

  /**
   * Clear request ID after request completes
   */
  clearRequestId(): void {
    requestId = null;
  }

  /**
   * Get current request ID or create new one
   */
  getRequestId(): string {
    if (!requestId) {
      requestId = uuidv4();
    }
    return requestId;
  }

  /**
   * Log methods by level
   */
  fatal(message: string, metadata?: Record<string, unknown>, error?: Error): void {
    this.log('fatal', message, metadata, error);
  }

  error(message: string, metadata?: Record<string, unknown>, error?: Error): void {
    this.log('error', message, metadata, error);
  }

  warn(message: string, metadata?: Record<string, unknown>, error?: Error): void {
    this.log('warn', message, metadata, error);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  trace(message: string, metadata?: Record<string, unknown>): void {
    this.log('trace', message, metadata);
  }

  /**
   * Time a function execution and log performance
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      this.info(`${label} completed`, { ...metadata, duration, unit: 'ms' });
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      this.error(`${label} failed`, { ...metadata, duration, unit: 'ms' }, error as Error);
      throw error;
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Record<string, unknown>): Fortune500Logger {
    const childLogger = new Fortune500Logger();
    const baseLog = this.log.bind(this);
    
    childLogger.log = (level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error) => {
      baseLog(level, message, { ...additionalContext, ...metadata }, error);
    };
    
    return childLogger;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
    // Check level threshold
    if (LOG_LEVELS[level] < LOG_LEVELS[defaultConfig.minLevel]) {
      return;
    }

    const entry = createLogEntry(level, message, metadata, error);
    
    sendToConsole(entry);
    sendToRemote(entry);

    // Track errors for analytics/monitoring
    if (level === 'error' || level === 'fatal') {
      this.reportErrorToAnalytics(entry);
    }
  }

  /**
   * Report errors to analytics (if configured)
   */
  private reportErrorToAnalytics(entry: LogEntry): void {
    // Could integrate with Sentry, DataDog, etc.
    if ((window as any).Sentry) {
      (window as any).Sentry.captureMessage(entry.message, {
        level: entry.level,
        extra: entry.metadata,
      });
    }
  }
}

// Export singleton instance
export const logger = Fortune500Logger.getInstance();

// Export individual methods for convenience
export const logFatal = (message: string, meta?: Record<string, unknown>, err?: Error) => logger.fatal(message, meta, err);
export const logError = (message: string, meta?: Record<string, unknown>, err?: Error) => logger.error(message, meta, err);
export const logWarn = (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta);
export const logInfo = (message: string, meta?: Record<string, unknown>) => logger.info(message, meta);
export const logDebug = (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta);
export const logTrace = (message: string, meta?: Record<string, unknown>) => logger.trace(message, meta);

// React Hook for component-level logging
export function useLogger(componentName: string) {
  return logger.child({ component: componentName });
}

// Performance monitoring decorator
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const metadata = { operation: operationName, args: args.map(a => typeof a) };
    return logger.time(operationName, () => fn(...args), metadata);
  }) as T;
}

export default logger;
