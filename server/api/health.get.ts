/**
 * Health check endpoint to monitor database connection pools
 * GET /api/health
 */
export default defineEventHandler(async (event) => {
  try {
    // Import database utilities
    const { getAllowedDatabases, getAllPoolStates } = await import('../config/database');
    
    const databases = getAllowedDatabases();
    const poolStates = getAllPoolStates();
    
    // Calculate pool statistics
    const poolStats = {
      totalPools: Object.keys(poolStates).length,
      activePools: Object.values(poolStates).filter((p: any) => p.connected).length,
      totalConnections: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.size || 0), 0),
      availableConnections: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.available || 0), 0),
      borrowedConnections: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.borrowed || 0), 0),
      pendingRequests: Object.values(poolStates).reduce((sum: number, p: any) => sum + (p.pending || 0), 0)
    };
    
    return {
      success: true,
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
      pools: poolStates,
      poolStats: poolStats,
      message: 'Service is healthy'
    };
  } catch (error: any) {
    console.error('Health check error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Health check failed: ${error?.message || 'Unknown error'}`
    });
  }
});

