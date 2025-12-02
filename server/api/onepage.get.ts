import { getDbConfig, createConnection, getPool } from '../config/database';
import { getCache, setCache } from '../utils/cache';

// Cache TTL: 1 นาที (dashboard data - อัพเดทบ่อยพอสมควร)
const ONEPAGE_CACHE_TTL = 1 * 60 * 1000;

export default defineEventHandler(async (event) => {
  const { database, phase } = getQuery(event);
  const config = getDbConfig(database as string); // Default to DPM_HELP67 if not specified

  // สร้าง cache key
  const cacheKey = `onepage:${config.database}:${phase || 'all'}`;
  
  // ตรวจสอบ cache ก่อน
  const cachedData = getCache(cacheKey, ONEPAGE_CACHE_TTL);
  if (cachedData) {
    console.log(`[Cache HIT] Onepage data for ${config.database}`);
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=60', // 1 นาที
      'X-Cache': 'HIT'
    });
    return cachedData;
  }
  
  console.log(`[Cache MISS] Fetching onepage data from database: ${config.database}`);
  
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

  let where = ``;
  if(phase) {
    where += ` and ph  in ('${phase}')`
  }
  try {
    // Get the appropriate pool for this database
    const pool = getPool(config.database);
    console.log('Using pool for database:', config.database);
    
    const queryCountRequestString = `SELECT COUNT(*) as total from sf_help_request WHERE 
    t_step_status != 'ปฏิเสธคำขอ' ${where} AND
    (p_name is not null or p_name != '') ;`
  
    const countRequest = await pool.request().query(queryCountRequestString);
  
    const queryTopRequestString = `SELECT TOP 1 COUNT(*) AS top_count , p_name from sf_help_request where t_step_status != 'ปฏิเสธคำขอ' ${where} GROUP BY p_name ORDER BY top_count DESC;`
    const topRequest = await pool.request().query(queryTopRequestString);
  
    const queryAllRequestString = `SELECT 
      COUNT(*) AS top_count, 
      SUM(case when current_status = 'โอนเงินแล้ว'  then 1 ELSE 0 end) AS total, 
      p_name 
    from vw_sf_help_request 
    WHERE 
      t_step_status != 'ปฏิเสธคำขอ'
      AND (p_name is not null or p_name != '')  
      ${where}
    GROUP BY p_name 
    ORDER BY top_count DESC`
    const allRequest = await pool.request().query(queryAllRequestString);
  
    const queryAllTransferString = `SELECT COUNT(*) AS total from sf_help_request WHERE current_status ='โอนเงินแล้ว' and t_step_status != 'ปฏิเสธคำขอ' ${where};`
    const allTransfer = await pool.request().query(queryAllTransferString);
  
    const queryProvinceRetrieveMoneyString = `SELECT COUNT(*) AS total
      FROM (
          SELECT COUNT(p_no) AS total
          FROM sf_help_request
          WHERE current_status = 'โอนเงินแล้ว' ${where}
          GROUP BY p_no
      ) AS grouped_result`
  
    const provinceRetrieveMoney = await pool.request().query(queryProvinceRetrieveMoneyString);
  
    const queryProvinceRequestString = `SELECT COUNT(*) AS total
      FROM (
          SELECT COUNT(p_no) AS total
          FROM sf_help_request
          GROUP BY p_no
      ) AS grouped_result`
  
    const provinceRequest = await pool.request().query(queryProvinceRequestString);
  
    const queryallMoneyTransfer = ` SELECT SUM(help_amt) AS total
          FROM vw_sf_help_request
          WHERE current_status = 'โอนเงินแล้ว' ${where}`
          
  
    const allMoneyTransfer = await pool.request().query(queryallMoneyTransfer);

    const result = { 
      database: config.database,
      countRequest: countRequest.recordset[0]['total'],
      topRequest: topRequest.recordset[0],
      allRequest: allRequest.recordset.filter(a => a.p_name !== ''),
      allTransfer: allTransfer.recordset[0]['total'],
      provinceRequest: provinceRequest.recordset[0]['total'],
      provinceRetrieveMoney: provinceRetrieveMoney.recordset[0]['total'],
      allMoneyTransfer: allMoneyTransfer.recordset[0]['total']
    };
    
    // บันทึกลง cache
    setCache(cacheKey, result);
    
    // ตั้ง cache headers
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=60', // 1 นาที
      'X-Cache': 'MISS'
    });
    
    return result;
  }catch(e: any) {
    console.error('Database query error:', e);
    throw createError({
      statusCode: 500,
      statusMessage: `Database query failed: ${e?.message || 'Unknown error'}`
    });
  }
})
