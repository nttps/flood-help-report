import { getDbConfig, createConnection, getPool } from '../config/database';
import { getCache, setCache } from '../utils/cache';

// Cache TTL: 10 นาที
const PROVINCES_CACHE_TTL = 10 * 60 * 1000;

export default defineEventHandler(async (event) => {
  const { database } = getQuery(event);
  const config = getDbConfig(database as string); // Default to DPM_HELP67 if not specified
  
  // สร้าง cache key จากชื่อ database
  const cacheKey = `provinces:${config.database}`;
  
  // ตรวจสอบ cache ก่อน
  const cachedData = getCache(cacheKey, PROVINCES_CACHE_TTL);
  if (cachedData) {
    // ตั้ง cache headers
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=600', // 10 นาที
      'X-Cache': 'HIT'
    });
    return cachedData;
  }
  
  try {
    await createConnection(config);
    console.log('Successfully connected to database:', config.database);
  } catch (error: any) {
    console.error('Failed to connect to database:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Database connection failed: ${error?.message || 'Unknown error'}`
    });
  }

  const {phase} = getQuery(event);
  console.log('Query phase:', phase);

  let where = ``;
  // if(phase == '1') {
  //   where += ` and ph  in ('1.0', '1.1') AND people_id not in ('3570500716650', '5550500508247', '3579143363278')`
  // }else {
  //   where += ` and ph  in ('${phase}')`
  // }

  // Get the appropriate pool for this database
  const pool = getPool(config.database);
  try {
    const sqlString = `select pcode, pname from a_province where is_active = 1`
    const result = await pool.request().query(sqlString);
    const modifiedResult = [{ pcode: 'all', pname: 'เลือกทั้งหมด' }, ...result.recordset];
    
    // บันทึกลง cache
    setCache(cacheKey, modifiedResult);
    
    // ตั้ง cache headers
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=600', // 10 นาที
      'X-Cache': 'MISS'
    });
    
    return modifiedResult;
  } catch (err) {
    console.error('Database query error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch provinces: ${err instanceof Error ? err.message : 'Unknown error'}`
    });
  }
})

