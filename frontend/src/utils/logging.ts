/**
 * FORTUNE 500 FRONTEND LOGGING - Index
 * 
 * Centralized exports for all logging functionality.
 * Import from this file to access all logging features.
 * 
 * @example
 * ```typescript
 * import { logger, useLogger, LogViewer, withLogging } from './logging';
 * 
 * // Basic logging
 * logger.info('Application started', { userId: '123' });
 * 
 * // React hook
 * const componentLogger = useLogger('MyComponent');
 * componentLogger.info('Component mounted');
 * 
 * // With performance tracking
 * const result = await logger.time('fetchData', () => fetch('/api/data'));
 * 
 * // HOC for functions
 * const loggedFunction = withLogging(myFunction, 'myOperation');
 * 
 * // LogViewer component in JSX
 * <LogViewer maxEntries={50} filterLevel="info" />
 * ```
 */

// Core logger
export {
  Fortune500Logger,
  logger,
  logFatal,
  logError,
  logWarn,
  logInfo,
  logDebug,
  logTrace,
  useLogger,
  withLogging,
} from '../services/logger';

// Types
export type {
  LogLevel,
  LogEntry,
  LoggerConfig,
} from '../services/logger';

// Components
export { LogViewer } from '../components/LogViewer';

// Default export
export { logger as default } from '../services/logger';
