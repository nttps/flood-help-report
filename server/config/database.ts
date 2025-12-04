import sql from 'mssql';

// Base database configuration template
const getBaseConfig = (databaseName: string) => ({
  user: 'dalert',
  password: '@min#DSS',
  database: databaseName,
  server: '192.168.213.42',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 25000,  // 25 seconds (ลดลง)
  requestTimeout: 35000,     // 35 seconds (ลดจาก 45s) - force queries to complete faster
  pool: {
    max: 1000,                    // 1000 connections max (OK กับ RAM 128GB!)
    min: 20,                      // 20 warm connections (ลดลงเพราะมี cache แล้ว)
    idleTimeoutMillis: 30000,     // 30s - คืน idle connections เร็วขึ้น (มี cache แล้วไม่ต้องเก็บนาน)
    acquireTimeoutMillis: 15000,  // 15s - ลดเวลารอ connection
    createTimeoutMillis: 10000,   // 10s - สร้าง connection เร็วขึ้น
    destroyTimeoutMillis: 5000,   // 5s timeout for destroying
    reapIntervalMillis: 5000,     // 5s - cleanup บ่อยขึ้นเพื่อคืน connections เร็ว
    createRetryIntervalMillis: 100, // 100ms retry
    propagateCreateError: true,
    // Connection validation - ช่วยให้ connections ที่เสียถูกทำลายและสร้างใหม่=
  }
});

// Dynamic connection pools storage
const pools: Map<string, sql.ConnectionPool> = new Map();

// Whitelist of allowed database names (for security)
// เพิ่มชื่อ database ที่อนุญาตที่นี่
const ALLOWED_DATABASES = [
  'DPM_HELP67',
  'DPM_HELP68',
  'DPM_HELP68_FLOOD',
  'DPM_HELP68_FLOOD_PLUS'
];

// Helper function to validate database name
export const validateDatabaseName = (dbName: string): boolean => {
  // ตรวจสอบว่าชื่อ database อยู่ใน whitelist
  if (!ALLOWED_DATABASES.includes(dbName)) {
    throw new Error(`Database "${dbName}" is not allowed. Allowed databases: ${ALLOWED_DATABASES.join(', ')}`);
  }
  return true;
};

// Helper function to get database configuration dynamically
export const getDbConfig = (databaseName?: string) => {
  // Default to DPM_HELP67 if no database specified
  const dbName = databaseName || 'DPM_HELP67';
  
  // Validate database name
  validateDatabaseName(dbName);
  
  return getBaseConfig(dbName);
};

// Helper function to create database connection with dynamic pool management
export const createConnection = async (config: any) => {
  try {
    const dbName = config.database;
    
    // Validate database name
    validateDatabaseName(dbName);
    
    // Check if pool already exists and is connected
    const existingPool = pools.get(dbName);
    if (existingPool) {
      // Check if pool is still connected
      if (existingPool.connected) {
        console.log(`[Pool] Reusing existing pool for ${dbName}`);
        return existingPool;
      } else {
        // Pool exists but not connected, remove it
        console.log(`[Pool] Removing disconnected pool for ${dbName}`);
        pools.delete(dbName);
      }
    }
    
    // Create new pool
    console.log(`[Pool] Creating new connection pool for ${dbName}`);
    const newPool = new sql.ConnectionPool(config);
    
    // Add error handler before connecting
    newPool.on('error', (err) => {
      console.error(`[Pool Error] ${dbName}:`, err.message);
    });
    
    // Connect with timeout handling
    await newPool.connect();
    pools.set(dbName, newPool);
    
    console.log(`[Pool] Successfully created pool for ${dbName}`);
    return newPool;
  } catch (error: any) {
    console.error(`[Pool Error] Failed to create connection for ${config.database}:`, error.message);
    
    // Remove failed pool from map
    if (pools.has(config.database)) {
      pools.delete(config.database);
    }
    
    throw new Error(`Database connection failed for ${config.database}: ${error.message}`);
  }
};

// Helper function to get the appropriate pool for queries
export const getPool = (databaseName?: string) => {
  // Default to DPM_HELP67 if no database specified
  const dbName = databaseName || 'DPM_HELP67';
  
  // Validate database name
  validateDatabaseName(dbName);
  
  const pool = pools.get(dbName);
  if (!pool) {
    throw new Error(`Pool for ${dbName} not initialized. Please call createConnection first.`);
  }
  
  // Log pool state for debugging
  logPoolState(dbName, pool);
  
  return pool;
};

// Helper function to log pool state
const logPoolState = (dbName: string, pool: sql.ConnectionPool) => {
  try {
    const poolInfo = {
      database: dbName,
      size: pool.size,
      available: pool.available,
      pending: pool.pending,
      borrowed: pool.borrowed,
      connected: pool.connected
    };
    console.log(`[Pool State] ${dbName}:`, JSON.stringify(poolInfo));
  } catch (error) {
    // Ignore logging errors
  }
};

// Helper function to close all pools (for cleanup)
export const closeAllPools = async () => {
  try {
    for (const [dbName, pool] of pools.entries()) {
      await pool.close();
      console.log(`Closed pool for ${dbName}`);
    }
    pools.clear();
  } catch (error) {
    console.error('Error closing pools:', error);
  }
};

// Helper function to close specific pool
export const closePool = async (databaseName: string) => {
  try {
    const pool = pools.get(databaseName);
    if (pool) {
      await pool.close();
      pools.delete(databaseName);
      console.log(`Closed pool for ${databaseName}`);
    }
  } catch (error) {
    console.error(`Error closing pool for ${databaseName}:`, error);
  }
};

// Helper function to get list of allowed databases
export const getAllowedDatabases = () => {
  return [...ALLOWED_DATABASES];
};

// Helper function to get all pool states for monitoring
export const getAllPoolStates = () => {
  const states: any = {};
  
  for (const [dbName, pool] of pools.entries()) {
    try {
      states[dbName] = {
        connected: pool.connected,
        size: pool.size,
        available: pool.available,
        pending: pool.pending,
        borrowed: pool.borrowed
      };
    } catch (error) {
      states[dbName] = {
        error: 'Unable to get pool state'
      };
    }
  }
  
  return states;
};

// Helper function to check if pool exists
export const hasPool = (databaseName: string): boolean => {
  return pools.has(databaseName);
};
