import { getAllowedDatabases } from '../config/database';

/**
 * API endpoint to get list of allowed databases
 * This helps frontend to know which databases are available
 */
export default defineEventHandler(async (event) => {
  try {
    const databases = getAllowedDatabases();
    
    return {
      success: true,
      databases: databases,
      count: databases.length,
      message: 'Available databases retrieved successfully'
    };
  } catch (error: any) {
    console.error('Error getting allowed databases:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get databases: ${error?.message || 'Unknown error'}`
    });
  }
});

