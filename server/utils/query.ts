import type { ConnectionPool } from 'mssql';

/**
 * Execute query with timeout and error handling
 * @param pool - Database connection pool
 * @param queryString - SQL query string
 * @param timeout - Query timeout in milliseconds (default: 25 seconds)
 * @returns Query result
 */
export const executeQuery = async (
  pool: ConnectionPool,
  queryString: string,
  timeout: number = 25000
) => {
  try {
    const request = pool.request();
    request.timeout = timeout;
    
    const startTime = Date.now();
    const result = await request.query(queryString);
    const duration = Date.now() - startTime;
    
    // Log slow queries
    if (duration > 5000) {
      console.warn(`[Slow Query] ${duration}ms - ${queryString.substring(0, 100)}...`);
    }
    
    return result;
  } catch (error: any) {
    // Log query errors with context
    console.error(`[Query Error] ${error.message}`);
    console.error(`[Query] ${queryString.substring(0, 200)}...`);
    throw error;
  }
};

/**
 * Execute multiple queries in parallel with Promise.allSettled
 * Returns results and continues even if some queries fail
 * @param pool - Database connection pool
 * @param queries - Array of query objects {name, sql}
 * @param timeout - Query timeout in milliseconds
 * @returns Object with results and errors
 */
export const executeQueriesParallel = async (
  pool: ConnectionPool,
  queries: Array<{ name: string; sql: string }>,
  timeout: number = 25000
) => {
  const startTime = Date.now();
  
  const promises = queries.map(async (q) => {
    try {
      const result = await executeQuery(pool, q.sql, timeout);
      return { name: q.name, success: true, data: result.recordset };
    } catch (error: any) {
      console.error(`[Query Failed] ${q.name}: ${error.message}`);
      return { name: q.name, success: false, error: error.message };
    }
  });
  
  const results = await Promise.allSettled(promises);
  const duration = Date.now() - startTime;
  
  console.log(`[Parallel Queries] ${queries.length} queries completed in ${duration}ms`);
  
  // Convert results to object
  const output: any = {
    _meta: {
      totalQueries: queries.length,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }
  };
  
  results.forEach((result, index) => {
    const queryName = queries[index].name;
    if (result.status === 'fulfilled' && result.value.success) {
      output[queryName] = result.value.data;
    } else {
      output[queryName] = null;
      output._meta[`${queryName}_error`] = 
        result.status === 'fulfilled' ? result.value.error : 'Query rejected';
    }
  });
  
  return output;
};

/**
 * Check if pool has available connections
 * @param pool - Database connection pool
 * @returns boolean
 */
export const hasAvailableConnections = (pool: ConnectionPool): boolean => {
  try {
    return pool.available > 0;
  } catch {
    return false;
  }
};

/**
 * Log pool state for debugging
 * @param pool - Database connection pool
 * @param context - Context string for logging
 */
export const logPoolState = (pool: ConnectionPool, context: string = '') => {
  try {
    const state = {
      size: pool.size,
      available: pool.available,
      borrowed: pool.borrowed,
      pending: pool.pending
    };
    
    const prefix = context ? `[Pool State - ${context}]` : '[Pool State]';
    console.log(`${prefix}`, JSON.stringify(state));
    
    // Warn if pool is getting exhausted
    if (state.available === 0 && state.pending > 0) {
      console.warn(`⚠️ Pool Exhaustion Warning: ${state.pending} requests waiting, 0 connections available`);
    }
  } catch (error) {
    // Ignore logging errors
  }
};

