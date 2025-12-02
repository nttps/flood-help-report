/**
 * Centralized cache manager for the application
 * Supports in-memory caching with TTL
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

// Global cache storage
const cacheStore: Map<string, CacheEntry> = new Map();

// Default TTL: 10 minutes
const DEFAULT_TTL = 10 * 60 * 1000;

/**
 * ตรวจสอบว่า cache entry ยังใช้ได้อยู่หรือไม่
 */
const isCacheValid = (entry: CacheEntry, ttl: number): boolean => {
  return Date.now() - entry.timestamp < ttl;
};

/**
 * ดึงข้อมูลจาก cache
 * @param key - Cache key
 * @param ttl - Time to live in milliseconds (default: 10 minutes)
 * @returns Cached data or null if not found/expired
 */
export const getCache = (key: string, ttl: number = DEFAULT_TTL): any | null => {
  const cached = cacheStore.get(key);
  
  if (cached && isCacheValid(cached, ttl)) {
    const age = Math.floor((Date.now() - cached.timestamp) / 1000);
    console.log(`[Cache HIT] ${key} (age: ${age}s, ttl: ${ttl/1000}s)`);
    return cached.data;
  }
  
  // ลบ cache ที่หมดอายุ
  if (cached) {
    console.log(`[Cache EXPIRED] ${key}`);
    cacheStore.delete(key);
  } else {
    console.log(`[Cache MISS] ${key}`);
  }
  
  return null;
};

/**
 * บันทึกข้อมูลลง cache
 * @param key - Cache key
 * @param data - Data to cache
 */
export const setCache = (key: string, data: any): void => {
  cacheStore.set(key, {
    data,
    timestamp: Date.now()
  });
  
  const size = typeof data === 'object' ? JSON.stringify(data).length : 0;
  console.log(`[Cache SAVE] ${key} (size: ${size} bytes)`);
};

/**
 * ลบ cache entry ตาม key
 * @param key - Cache key
 * @returns true if deleted, false if not found
 */
export const deleteCache = (key: string): boolean => {
  const deleted = cacheStore.delete(key);
  if (deleted) {
    console.log(`[Cache DELETE] ${key}`);
  }
  return deleted;
};

/**
 * ลบ cache entries ที่ match กับ pattern
 * @param pattern - Pattern to match (supports * wildcard)
 * @returns Array of deleted keys
 */
export const deleteCachePattern = (pattern: string): string[] => {
  const deletedKeys: string[] = [];
  
  // Convert pattern to regex (simple wildcard support)
  const regexPattern = pattern.replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  
  for (const key of cacheStore.keys()) {
    if (regex.test(key)) {
      cacheStore.delete(key);
      deletedKeys.push(key);
    }
  }
  
  if (deletedKeys.length > 0) {
    console.log(`[Cache DELETE PATTERN] ${pattern} - deleted ${deletedKeys.length} keys`);
  }
  
  return deletedKeys;
};

/**
 * ลบ cache ทั้งหมด
 * @returns Number of deleted entries
 */
export const clearAllCache = (): number => {
  const size = cacheStore.size;
  cacheStore.clear();
  console.log(`[Cache CLEAR ALL] Deleted ${size} entries`);
  return size;
};

/**
 * ดูสถานะของ cache
 * @returns Cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  const entries: any[] = [];
  let totalSize = 0;
  
  for (const [key, entry] of cacheStore.entries()) {
    const age = Math.floor((now - entry.timestamp) / 1000);
    const size = JSON.stringify(entry.data).length;
    totalSize += size;
    
    entries.push({
      key,
      age: `${age}s`,
      size: `${size} bytes`,
      timestamp: new Date(entry.timestamp).toISOString()
    });
  }
  
  return {
    totalEntries: cacheStore.size,
    totalSize: `${totalSize} bytes`,
    entries: entries.sort((a, b) => a.key.localeCompare(b.key))
  };
};

/**
 * ทำความสะอาด cache entries ที่หมดอายุ
 * @param ttl - Time to live in milliseconds
 * @returns Number of cleaned entries
 */
export const cleanExpiredCache = (ttl: number = DEFAULT_TTL): number => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, entry] of cacheStore.entries()) {
    if (now - entry.timestamp >= ttl) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => cacheStore.delete(key));
  
  if (keysToDelete.length > 0) {
    console.log(`[Cache CLEAN] Removed ${keysToDelete.length} expired entries`);
  }
  
  return keysToDelete.length;
};

// Auto-clean expired cache every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanExpiredCache();
  }, 5 * 60 * 1000);
}

