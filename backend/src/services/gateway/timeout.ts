import { createServiceLogger } from '../../config/logger';

const log = createServiceLogger('timeout-handler');

// Default timeout: 8 seconds as per plan
const DEFAULT_TIMEOUT_MS = 8000;

// Timeout error class
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Wrap a promise with timeout using AbortController
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const result = await promise;
    clearTimeout(timeoutId);
    log.info({ timeoutMs }, 'Request completed within timeout');
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      log.error({ timeoutMs }, 'Request timed out');
      throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
    }

    // Re-throw other errors
    throw error;
  }
}

// Wrap a promise with timeout and custom error message
export async function withTimeoutMessage<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  errorMessage: string = 'Request timed out'
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const result = await promise;
    clearTimeout(timeoutId);
    log.info({ timeoutMs }, 'Request completed within timeout');
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      log.error({ timeoutMs }, 'Request timed out');
      throw new TimeoutError(errorMessage);
    }

    // Re-throw other errors
    throw error;
  }
}
