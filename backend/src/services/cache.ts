import { createServiceLogger } from '../config/logger';

const log = createServiceLogger('cache');

// In-memory cache storage
const memoryCache = new Map<string, { value: string; expiresAt: number }>();
const memoryOTPStore = new Map<string, { otp: string; expiresAt: number }>();

const OTP_TTL = 600; // 10 minutes in seconds
const OTP_PREFIX = 'otp:';
const CACHE_PREFIX = 'cache:';

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of memoryOTPStore) {
    if (entry.expiresAt < now) {
      memoryOTPStore.delete(key);
      cleaned++;
    }
  }

  for (const [key, entry] of memoryCache) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    log.info({ cleaned }, 'Cleaned expired cache entries');
  }
}, 300000); // 5 minutes

export async function setOTP(key: string, otp: string): Promise<void> {
  const fullKey = `${OTP_PREFIX}${key}`;
  const expiresAt = Date.now() + OTP_TTL * 1000;
  memoryOTPStore.set(fullKey, { otp, expiresAt });
  log.info({ key: fullKey }, 'OTP stored in memory');
}

export async function getOTP(key: string): Promise<string | null> {
  const fullKey = `${OTP_PREFIX}${key}`;
  const entry = memoryOTPStore.get(fullKey);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    memoryOTPStore.delete(fullKey);
    return null;
  }

  return entry.otp;
}

export async function deleteOTP(key: string): Promise<void> {
  const fullKey = `${OTP_PREFIX}${key}`;
  memoryOTPStore.delete(fullKey);
}

export async function getCached<T>(key: string): Promise<T | null> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  const entry = memoryCache.get(fullKey);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(fullKey);
    return null;
  }

  try {
    return JSON.parse(entry.value) as T;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const serialized = JSON.stringify(value);
  memoryCache.set(fullKey, { value: serialized, expiresAt });
}

// Memory usage stats for monitoring
export function getCacheStats(): { otpCount: number; cacheCount: number } {
  return {
    otpCount: memoryOTPStore.size,
    cacheCount: memoryCache.size,
  };
}
