import { getCacheStats } from '../../utils/cache';

/**
 * API endpoint to get cache statistics
 * GET /api/cache/stats
 */
export default defineEventHandler(async (event) => {
  try {
    const stats = getCacheStats();
    
    return {
      success: true,
      ...stats,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error getting cache stats:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get cache stats: ${error?.message || 'Unknown error'}`
    });
  }
});

