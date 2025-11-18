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
  connectionTimeout: 300000,
  requestTimeout: 300000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
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
    
    // Check if pool already exists
    if (!pools.has(dbName)) {
      console.log(`Creating new connection pool for ${dbName}`);
      const newPool = await new sql.ConnectionPool(config).connect();
      pools.set(dbName, newPool);
    }
    
    const pool = pools.get(dbName);
    if (!pool) {
      throw new Error(`Failed to get pool for database: ${dbName}`);
    }
    
    console.log(`Using connection pool for database: ${dbName}`);
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
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
  
  return pool;
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
