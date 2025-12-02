/**
 * Health check endpoint to monitor database connection pools
 * GET /api/health
 */
export default defineEventHandler(async (event) => {
  try {
    // Import database utilities
    const { getAllowedDatabases, getAllPoolStates } = await import('../config/database');
    const { getCacheStats } = await import('../utils/cache');
    
    const databases = getAllowedDatabases();
    const poolStates = getAllPoolStates();
    const cacheStats = getCacheStats();
    
    // Calculate pool statistics
    const poolStats = {
      totalPools: Object.keys(poolStates).length,
      activePools: Object.values(poolStates).filter((p: any) => p.connected).length,
      totalConnections: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.size || 0), 0),
      availableConnections: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.available || 0), 0),
      borrowedConnections: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.borrowed || 0), 0),
      pendingRequests: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.pending || 0), 0)
    };
    
    // Check for pool health issues
    const warnings: string[] = [];
    const criticalIssues: string[] = [];
    
    // Check cache effectiveness
    if (poolStats.borrowedConnections > 100 && cacheStats.totalEntries < 10) {
      warnings.push(
        `High connection usage (${poolStats.borrowedConnections}) but low cache entries (${cacheStats.totalEntries}). Cache may not be working effectively.`
      );
    }
    
    for (const [dbName, state] of Object.entries(poolStates) as [string, any][]) {
      // Critical: Pool exhaustion with many pending requests
      if (state.available === 0 && state.pending > 10) {
        criticalIssues.push(
          `${dbName}: Pool exhausted! ${state.pending} requests waiting, 0 connections available`
        );
      }
      // Warning: Too many borrowed connections (possible connection leak)
      else if (state.borrowed > 100) {
        warnings.push(
          `${dbName}: Very high borrowed connections (${state.borrowed}) - check for connection leaks or missing cache`
        );
      }
      // Warning: High utilization
      else if (state.available <= 2 && state.pending > 0) {
        warnings.push(
          `${dbName}: High pool utilization - ${state.available} available, ${state.pending} pending`
        );
      }
      // Warning: High pending count
      else if (state.pending > 50) {
        warnings.push(
          `${dbName}: High pending requests - ${state.pending} requests waiting`
        );
      }
      // Warning: All connections borrowed
      else if (state.available === 0 && state.borrowed === state.size) {
        warnings.push(
          `${dbName}: All connections in use - ${state.borrowed}/${state.size}`
        );
      }
    }
    
    // Determine overall health status
    let healthStatus = 'healthy';
    let statusCode = 200;
    
    if (criticalIssues.length > 0) {
      healthStatus = 'critical';
      statusCode = 503; // Service Unavailable
    } else if (warnings.length > 0) {
      healthStatus = 'degraded';
    }
    
    // Set appropriate status code
    setResponseStatus(event, statusCode);
    
    return {
      success: healthStatus !== 'critical',
      status: healthStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: Math.floor(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.floor(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        external: Math.floor(process.memoryUsage().external / 1024 / 1024) + ' MB'
      },
      databases: {
        allowed: databases,
        count: databases.length
      },
      cache: cacheStats,
      pools: poolStates,
      poolStats: poolStats,
      warnings: warnings.length > 0 ? warnings : undefined,
      criticalIssues: criticalIssues.length > 0 ? criticalIssues : undefined,
      message: healthStatus === 'healthy' 
        ? 'Service is healthy' 
        : healthStatus === 'degraded'
        ? 'Service is operational but experiencing high load'
        : 'Service is experiencing critical issues',
      recommendations: criticalIssues.length > 0 ? [
        'Increase pool size if database server can handle more connections',
        'Optimize slow queries to release connections faster',
        'Implement request queuing or rate limiting',
        'Check for connection leaks in application code',
        'Consider scaling horizontally with load balancing'
      ] : warnings.length > 0 ? [
        'Monitor pool utilization closely',
        'Add cache to APIs that are frequently called',
        'Check cache hit rate - if low, increase cache TTL',
        'Review and optimize database queries',
        `Current cache entries: ${cacheStats.totalEntries}, borrowed connections: ${poolStats.borrowedConnections}`
      ] : undefined
    };
  } catch (error: any) {
    console.error('Health check error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Health check failed: ${error?.message || 'Unknown error'}`
    });
  }
});

