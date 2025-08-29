import sql from 'mssql';

// Database configurations
export const dbConfig67 = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP67',
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
};

export const dbConfig68 = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP68',
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
};

// Connection pools for each database
let pool67: sql.ConnectionPool | null = null;
let pool68: sql.ConnectionPool | null = null;

// Helper function to get database connection based on year
export const getDbConfig = (year?: string) => {
  if (year === '2568') {
    return dbConfig68;
  }
  return dbConfig67; // Default to 2567
};

// Helper function to create database connection with separate pools
export const createConnection = async (config: any) => {
  try {
    // Determine which pool to use based on database name
    let pool: sql.ConnectionPool | null = null;
    
    if (config.database === 'DPM_HELP67') {
      if (!pool67) {
        console.log('Creating new connection pool for DPM_HELP67');
        pool67 = await new sql.ConnectionPool(config).connect();
      }
      pool = pool67;
    } else if (config.database === 'DPM_HELP68') {
      if (!pool68) {
        console.log('Creating new connection pool for DPM_HELP68');
        pool68 = await new sql.ConnectionPool(config).connect();
      }
      pool = pool68;
    }
    
    if (!pool) {
      throw new Error(`No pool available for database: ${config.database}`);
    }
    
    console.log(`Using connection pool for database: ${config.database}`);
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Helper function to get the appropriate pool for queries
export const getPool = (year?: string) => {
  if (year === '2568') {
    if (!pool68) {
      throw new Error('Pool for DPM_HELP68 not initialized');
    }
    return pool68;
  }
  if (!pool67) {
    throw new Error('Pool for DPM_HELP67 not initialized');
  }
  return pool67;
};

// Helper function to close all pools (for cleanup)
export const closeAllPools = async () => {
  try {
    if (pool67) {
      await pool67.close();
      pool67 = null;
      console.log('Closed pool for DPM_HELP67');
    }
    if (pool68) {
      await pool68.close();
      pool68 = null;
      console.log('Closed pool for DPM_HELP68');
    }
  } catch (error) {
    console.error('Error closing pools:', error);
  }
};
