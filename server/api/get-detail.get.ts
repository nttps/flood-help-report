import { createConnection, getDbConfig, getPool } from '../config/database';
import { getCache, setCache } from '../utils/cache';

// Cache TTL: 5 นาที (detail data ค่อนข้างคงที่)
const DETAIL_CACHE_TTL = 5 * 60 * 1000;

const getSub = async (pool: any, p_no: any, startDate: any, endDate: any) => {
  // รับ pool มาจาก parameter แทนการ createConnection ซ้ำ

  
  let where = '';
  if(startDate) {
    where += ` AND CAST(ch.commit_date AS DATE) >= '${startDate}'`
  }

  if(endDate) {
    where += ` AND CAST(ch.commit_date AS DATE) <= '${endDate}'`
  }

  const result = await pool.request().query(`
    WITH sub_counts AS (
        SELECT 
        cl.origin_pcode AS p_no,
        cl.origin_pname AS p_name,
        ch.commit_no,
        ch.commit_date,
        ch.commit_id,
        ch.status_confirm,
        COUNT(ch.person_qty) AS person_qty,  -- จำนวน ก.ช.ภ.จ
        COUNT(DISTINCT cl.commit_id) AS send,  -- ส่งปกครอง
        SUM(CASE WHEN cl.linkgate_status != 'ปกติ' THEN 1 ELSE 0 END) AS failed_linkage,  -- ไม่ผ่าน Linkage
        MAX(ch.export_bank_trn_date) AS latest_payment_date,  -- วันที่โอนเงินล่าสุด
        COUNT(DISTINCT cl.payment_date) AS count_payment_date,  -- วันที่จ่ายเงิน (ไม่ซ้ำ)
        SUM(CASE WHEN cl.payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments,  -- โอนสำเร็จ
        isnull((SELECT DISTINCT count(*) AS person_qty FROM sf_commit_line cco
        WHERE cco.commit_id = CONCAT('99', ch.commit_no) and cco.origin_pcode = cl.origin_pcode GROUP BY cco.commit_id),0) AS send_from_province
    FROM sf_commit_head ch
    LEFT JOIN sf_commit_line cl ON ch.commit_id = cl.commit_id AND cl.is_active = 1
    WHERE ch.step_id = 'ปภ.'
    ${where}
    GROUP BY 
        cl.origin_pcode, 
        cl.origin_pname, 
        ch.commit_no, 
        ch.commit_date, 
        ch.commit_id, 
        ch.status_confirm
  ),
  RankedSequence AS (
      SELECT *,
        person_qty - failed_linkage AS send_bank,  -- ส่งออมสิน
        person_qty - failed_linkage - successful_payments AS unsuccessful_payments,
        failed_linkage + (person_qty - failed_linkage - successful_payments) as count_back_to_province,
      CASE 
        WHEN latest_payment_date IS NULL THEN 0  -- กำหนด "ครั้งที่ 0" หากค่าวันที่ว่าง
        ELSE DENSE_RANK() OVER (ORDER BY latest_payment_date ASC)  -- จัดอันดับเฉพาะแถวที่มีค่าวันที่
      END AS payment_sequence
      FROM sub_counts
  )
  SELECT *,
    0 AS retreat,
          count_back_to_province - isnull(send_from_province,0) AS outstanding 
    FROM RankedSequence 
    WHERE p_no IN (${p_no})
    order by commit_date asc;
    `); 
  return result.recordset;
}


export default defineEventHandler(async (event) => {
    const {startDate, endDate, pcode, database} = getQuery(event)
    const dbName = (database as string) || 'DPM_HELP67'; // Default to DPM_HELP67
    
    // สร้าง cache key
    const cacheKey = `detail:${dbName}:${pcode}:${startDate || 'none'}:${endDate || 'none'}`;
    
    // ตรวจสอบ cache ก่อน
    const cachedData = getCache(cacheKey, DETAIL_CACHE_TTL);
    if (cachedData) {
      console.log(`[Cache HIT] Detail data for ${dbName}, pcode: ${pcode}`);
      setResponseHeaders(event, {
        'Cache-Control': 'public, max-age=300', // 5 นาที
        'X-Cache': 'HIT'
      });
      return cachedData;
    }
    
    console.log(`[Cache MISS] Fetching detail data from database: ${dbName}`);
    
    // สร้าง connection และ get pool ครั้งเดียว
    try {
      const config = getDbConfig(dbName);
      await createConnection(config);
      const pool = getPool(dbName);
      
      // ส่ง pool แทน databaseName
      const childData = await getSub(pool, pcode, startDate, endDate);
      
      // บันทึกลง cache
      setCache(cacheKey, childData);
      
      // ตั้ง cache headers
      setResponseHeaders(event, {
        'Cache-Control': 'public, max-age=300', // 5 นาที
        'X-Cache': 'MISS'
      });
      
      return childData;
      
    } catch (error: any) {
      console.error('Failed to fetch detail data:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Database query failed: ${error?.message || 'Unknown error'}`
      });
    }
})