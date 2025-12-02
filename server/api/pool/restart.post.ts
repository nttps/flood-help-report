import { closePool } from '../../config/database';

/**
 * Emergency endpoint to restart a specific database pool
 * POST /api/pool/restart
 * 
 * Query parameters:
 * - database: database name (required)
 * 
 * ⚠️ WARNING: This will close all active connections!
 * Use only in emergency situations when pool is exhausted
 */
export default defineEventHandler(async (event) => {
  const { database } = getQuery(event);
  
  if (!database) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: database'
    });
  }
  
  try {
    console.log(`[Pool Restart] Attempting to restart pool for ${database}`);
    
    // Close the pool (this will disconnect all connections)
    await closePool(database as string);
    
    console.log(`[Pool Restart] Pool for ${database} has been closed. It will be recreated on next request.`);
    
    return {
      success: true,
      message: `Pool for ${database} has been restarted`,
      database: database,
      timestamp: new Date().toISOString(),
      note: 'Pool will be recreated automatically on the next request'
    };
  } catch (error: any) {
    console.error(`[Pool Restart Error] ${error.message}`);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to restart pool: ${error?.message || 'Unknown error'}`
    });
  }
});

