import { createServiceLogger } from '../../config/logger';
import { getEnv } from '../../config/env';

// Try to import Redis, but handle if it's not installed
let createClient: any = null;
let RedisClientType: any = null;
try {
  const redisModule = require('redis');
  createClient = redisModule.createClient;
  RedisClientType = redisModule.RedisClientType;
} catch (error) {
  // Redis not installed, will use in-memory cache only
}

const log = createServiceLogger('redis-cache');

// In-memory fallback cache
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

// Redis client instance
let redisClient: any = null;
let redisConnected = false;

// Initialize Redis client
async function initializeRedis(): Promise<void> {
  const env = getEnv();
  
  if (!env.REDIS_URL) {
    log.warn('REDIS_URL not configured, using in-memory cache only');
    return;
  }

  if (!createClient) {
    log.warn('Redis package not installed, using in-memory cache only');
    return;
  }

  try {
    redisClient = createClient({ url: env.REDIS_URL });
    
    redisClient.on('error', (err: Error) => {
      log.error({ error: err.message }, 'Redis client error');
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      log.info('Redis client connected');
      redisConnected = true;
    });

    await redisClient.connect();
    log.info('Redis client initialized successfully');
  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to initialize Redis client');
    redisClient = null;
    redisConnected = false;
  }
}

// Clean up expired entries from memory cache
function cleanupMemoryCache(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    log.debug({ cleaned }, 'Cleaned up expired memory cache entries');
  }
}

// Get value from cache (Redis with in-memory fallback)
export async function get<T>(key: string): Promise<T | null> {
  // Try Redis first if connected
  if (redisClient && redisConnected) {
    try {
      const value = await redisClient.get(key);
      if (value !== null) {
        log.debug({ key, source: 'redis' }, 'Cache hit');
        return JSON.parse(value) as T;
      }
    } catch (error) {
      log.error({ key, error: error instanceof Error ? error.message : String(error) }, 'Redis get failed, falling back to memory');
    }
  }

  // Fallback to in-memory cache
  cleanupMemoryCache();
  const entry = memoryCache.get(key);
  
  if (entry && entry.expiresAt > Date.now()) {
    log.debug({ key, source: 'memory' }, 'Cache hit');
    return entry.value as T;
  }
  
  log.debug({ key }, 'Cache miss');
  return null;
}

// Set value in cache (Redis with in-memory fallback)
export async function set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  const serialized = JSON.stringify(value);
  const expiresAt = Date.now() + (ttlSeconds * 1000);

  // Try Redis first if connected
  if (redisClient && redisConnected) {
    try {
      await redisClient.setEx(key, ttlSeconds, serialized);
      log.debug({ key, ttlSeconds, source: 'redis' }, 'Cache set');
    } catch (error) {
      log.error({ key, error: error instanceof Error ? error.message : String(error) }, 'Redis set failed, falling back to memory');
      // Fallback to memory cache
      memoryCache.set(key, { value, expiresAt });
      log.debug({ key, ttlSeconds, source: 'memory' }, 'Cache set');
    }
  } else {
    // Use in-memory cache
    memoryCache.set(key, { value, expiresAt });
    log.debug({ key, ttlSeconds, source: 'memory' }, 'Cache set');
  }
}

// Delete value from cache (Redis with in-memory fallback)
export async function del(key: string): Promise<void> {
  // Try Redis first if connected
  if (redisClient && redisConnected) {
    try {
      await redisClient.del(key);
      log.debug({ key, source: 'redis' }, 'Cache deleted');
    } catch (error) {
      log.error({ key, error: error instanceof Error ? error.message : String(error) }, 'Redis delete failed');
    }
  }

  // Always delete from memory cache
  memoryCache.delete(key);
  log.debug({ key, source: 'memory' }, 'Cache deleted');
}

// Clear all cache entries (Redis with in-memory fallback)
export async function clear(): Promise<void> {
  // Try Redis first if connected
  if (redisClient && redisConnected) {
    try {
      await redisClient.flushDb();
      log.info('Redis cache cleared');
    } catch (error) {
      log.error({ error: error instanceof Error ? error.message : String(error) }, 'Redis clear failed');
    }
  }

  // Always clear memory cache
  memoryCache.clear();
  log.info('Memory cache cleared');
}

// Initialize Redis on module load
initializeRedis().catch((error) => {
  log.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to initialize Redis on module load');
});

// Export cache status
export function getCacheStatus(): { redis: boolean; memory: boolean } {
  return {
    redis: redisConnected,
    memory: memoryCache.size > 0
  };
}
