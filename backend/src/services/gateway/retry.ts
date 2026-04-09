import { createServiceLogger } from '../../config/logger';

const log = createServiceLogger('retry-handler');

// Default retry attempts: 2 as per plan
const DEFAULT_MAX_ATTEMPTS = 2;

// Retry error class
export class RetryError extends Error {
  constructor(message: string, public readonly attempts: number) {
    super(message);
    this.name = 'RetryError';
  }
}

// Sleep function for exponential backoff
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Wrap a function with retry logic and exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      log.info({ attempt, maxAttempts }, `Attempt ${attempt}/${maxAttempts}`);
      const result = await fn();
      
      if (attempt > 1) {
        log.info({ attempt, maxAttempts }, 'Retry successful');
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      log.error({ attempt, maxAttempts, error: lastError.message }, `Attempt ${attempt}/${maxAttempts} failed`);

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        log.error({ maxAttempts }, 'All retry attempts exhausted');
        throw new RetryError(
          `All ${maxAttempts} retry attempts failed. Last error: ${lastError.message}`,
          maxAttempts
        );
      }

      // Calculate exponential backoff: 100ms, 200ms, 400ms, etc.
      const backoffMs = 100 * Math.pow(2, attempt - 1);
      log.info({ attempt, backoffMs }, `Waiting ${backoffMs}ms before retry`);
      await sleep(backoffMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new RetryError('Retry logic exhausted without result', maxAttempts);
}

// Wrap a function with retry logic and custom backoff
export async function withRetryCustom<T>(
  fn: () => Promise<T>,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  getBackoffMs: (attempt: number) => number = (attempt) => 100 * Math.pow(2, attempt - 1)
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      log.info({ attempt, maxAttempts }, `Attempt ${attempt}/${maxAttempts}`);
      const result = await fn();
      
      if (attempt > 1) {
        log.info({ attempt, maxAttempts }, 'Retry successful');
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      log.error({ attempt, maxAttempts, error: lastError.message }, `Attempt ${attempt}/${maxAttempts} failed`);

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        log.error({ maxAttempts }, 'All retry attempts exhausted');
        throw new RetryError(
          `All ${maxAttempts} retry attempts failed. Last error: ${lastError.message}`,
          maxAttempts
        );
      }

      // Use custom backoff function
      const backoffMs = getBackoffMs(attempt);
      log.info({ attempt, backoffMs }, `Waiting ${backoffMs}ms before retry`);
      await sleep(backoffMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new RetryError('Retry logic exhausted without result', maxAttempts);
}
