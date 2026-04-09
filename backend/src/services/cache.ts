import { createServiceLogger } from '../config/logger';
import { get, set, del, getCacheStatus } from './cache/redisCache';

const log = createServiceLogger('cache');

// In-memory cache storage for OTP (not stored in Redis for security)
const memoryOTPStore = new Map<string, { otp: string; expiresAt: number }>();

const OTP_TTL = 600; // 10 minutes in seconds
const OTP_PREFIX = 'otp:';
const CACHE_PREFIX = 'cache:';

// Cleanup expired OTP entries every 5 minutes (general cache uses Redis with its own TTL)
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of memoryOTPStore) {
    if (entry.expiresAt < now) {
      memoryOTPStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    log.info({ cleaned }, 'Cleaned expired OTP entries');
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
  try {
    return await get<T>(fullKey);
  } catch (error) {
    log.error({ key: fullKey, error: error instanceof Error ? error.message : String(error) }, 'Cache get failed');
    return null;
  }
}

export async function setCached(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  try {
    await set(fullKey, value, ttlSeconds);
    log.debug({ key: fullKey, ttlSeconds }, 'Cache set');
  } catch (error) {
    log.error({ key: fullKey, error: error instanceof Error ? error.message : String(error) }, 'Cache set failed');
  }
}

// Memory usage stats for monitoring
export function getCacheStats(): { otpCount: number; redisConnected: boolean } {
  const redisStatus = getCacheStatus();
  return {
    otpCount: memoryOTPStore.size,
    redisConnected: redisStatus.redis,
  };
}
