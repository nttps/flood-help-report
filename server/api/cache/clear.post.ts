import { deleteCache, deleteCachePattern, clearAllCache } from '../../utils/cache';

/**
 * API endpoint to clear cache
 * POST /api/cache/clear
 * 
 * Query parameters:
 * - type: 'provinces' | 'all' (required)
 * - database: database name (optional, for specific cache)
 */
export default defineEventHandler(async (event) => {
  const { type, database } = getQuery(event);
  
  if (!type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: type (provinces|all)'
    });
  }
  
  try {
    let clearedKeys: string[] = [];
    
    if (type === 'all') {
      // Clear all cache
      const count = clearAllCache();
      return {
        success: true,
        message: `All cache cleared successfully`,
        cleared: {
          count: count,
          keys: ['*'],
          type: 'all'
        },
        timestamp: new Date().toISOString()
      };
    }
    
    if (type === 'provinces') {
      // ถ้าระบุ database ให้ clear เฉพาะ database นั้น
      if (database) {
        const cacheKey = `provinces:${database}`;
        const deleted = deleteCache(cacheKey);
        if (deleted) {
          clearedKeys.push(cacheKey);
        }
      } else {
        // Clear all provinces cache
        clearedKeys = deleteCachePattern('provinces:*');
      }
    }
    
    return {
      success: true,
      message: `Cache cleared successfully`,
      cleared: {
        count: clearedKeys.length,
        keys: clearedKeys,
        type: type
      },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error clearing cache:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to clear cache: ${error?.message || 'Unknown error'}`
    });
  }
});

