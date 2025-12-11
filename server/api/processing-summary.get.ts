import { createConnection, getDbConfig, getPool } from '../config/database';
import { getCache, setCache } from '../utils/cache';

// Cache TTL: 60 นาที (เพิ่มเพื่อลดการ query ที่ช้า)
const CACHE_TTL = 60 * 60 * 1000;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const database = (query.database as string) || 'DPM_HELP68_FLOOD_PLUS';
    const pcode = query.pcode as string;
    
    // สร้าง cache key
    const cacheKey = `processing-summary:${database}:${pcode || 'all'}`;
    
    // ตรวจสอบ cache ก่อน
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log(`[Cache HIT] processing-summary for ${database} pcode:${pcode || 'all'}`);
      return cachedData;
    }
    
    console.log(`[Cache MISS] processing-summary for ${database} pcode:${pcode || 'all'} - fetching from DB`);
    
    // สร้าง connection
    const config = getDbConfig(database);
    await createConnection(config);
    const pool = getPool(database);
    
    // สร้าง WHERE clause
    let provinceFilter = '';
    if (pcode && pcode !== 'all') {
      provinceFilter = `AND origin_pcode = '${pcode}'`;
    }
    
    // ปรับช่วงเวลาให้น้อยลงมากเพื่อแก้ timeout (หลายจังหวัด = 5 วัน)
    const daysToQuery = (!pcode || pcode === 'all') ? 5 : 10; // ทั้งหมด = 5 วัน, เฉพาะจังหวัด = 10 วัน
    const dateRangeFilter = `AND req_date >= DATEADD(day, -${daysToQuery}, GETDATE())`;
    const transferDateRangeFilter = `AND export_bank_trn_date >= DATEADD(day, -${daysToQuery}, GETDATE())`;
    
    // Query hints เพื่อเร่งความเร็ว
    const queryHints = 'OPTION (MAXDOP 4, FAST 1000)'; // ใช้ parallel processing + return fast
    
    console.log(`[PERF] Query range: ${daysToQuery} days, province: ${pcode || 'all'}`);
    const startTime = Date.now();
    
    // ขั้นตอนที่ 1: Query ข้อมูลพื้นฐานแบบรวม - SUPER OPTIMIZED!
    // แสดงระดับอำเภอเหมือนเดิม แต่เร็วขึ้นด้วย CASE WHEN และ query hints
    const districtCombinedResult = await pool.request().query(`
      SELECT 
        origin_pcode as province_code,
        origin_pname as province_name,
        origin_acode as district_code,
        origin_aname as district_name,
        COUNT(DISTINCT origin_ttcode) as total_subdistricts,
        COUNT(DISTINCT req_id) as total_households,
        COUNT(DISTINCT CASE 
          WHEN moo_no IS NOT NULL AND moo_no != '' THEN req_id 
          ELSE NULL 
        END) as village_count,
        COUNT(DISTINCT CASE 
          WHEN village IS NOT NULL AND village != '' THEN req_id 
          ELSE NULL 
        END) as community_count
      FROM vw_sf_commit_line WITH (NOLOCK, READUNCOMMITTED)
      WHERE is_active = 1
        ${dateRangeFilter}
        ${provinceFilter}
      GROUP BY origin_pcode, origin_pname, origin_acode, origin_aname
      ${queryHints}
    `);
    
    const districtResult = districtCombinedResult;
    console.log(`[PERF] District query: ${Date.now() - startTime}ms, records: ${districtResult.recordset.length}`);
    
    // ขั้นตอนที่ 2-3: Query ข้อมูลรายวันแบบ Parallel + Hints - SUPER OPTIMIZED!
    const dailyStartTime = Date.now();
    
    const [dailyKeyedResult, dailyTransferredResult] = await Promise.all([
      // Query 2: ข้อมูลคีย์รายวัน (ระดับอำเภอ)
      pool.request().query(`
        SELECT 
          origin_pcode as province_code,
          origin_acode as district_code,
          CAST(req_date AS DATE) as date_value,
          COUNT(DISTINCT req_id) as count_keyed
        FROM vw_sf_commit_line WITH (NOLOCK, READUNCOMMITTED)
        WHERE is_active = 1
          AND req_date IS NOT NULL
          ${dateRangeFilter}
          ${provinceFilter}
        GROUP BY origin_pcode, origin_acode, CAST(req_date AS DATE)
        ${queryHints}
      `),
      
      // Query 3: ข้อมูลโอนเงินรายวัน (ระดับอำเภอ)
      pool.request().query(`
        SELECT 
          origin_pcode as province_code,
          origin_acode as district_code,
          CAST(export_bank_trn_date AS DATE) as date_value,
          COUNT(DISTINCT req_id) as count_transferred
        FROM vw_sf_commit_line WITH (NOLOCK, READUNCOMMITTED)
        WHERE is_active = 1
          AND payment_status = 'สำเร็จ'
          AND step_id = 'ปภ.'
          AND export_bank_trn_date IS NOT NULL
          ${transferDateRangeFilter}
          ${provinceFilter}
        GROUP BY origin_pcode, origin_acode, CAST(export_bank_trn_date AS DATE)
        ${queryHints}
      `)
    ]);
    
    console.log(`[PERF] Daily queries (parallel): ${Date.now() - dailyStartTime}ms`);
    console.log(`[PERF] - Keyed records: ${dailyKeyedResult.recordset.length}`);
    console.log(`[PERF] - Transferred records: ${dailyTransferredResult.recordset.length}`);
    
    // ขั้นตอนที่ 4: รวมวันที่ทั้งหมดและเรียง
    const formatStartTime = Date.now();
    const allDates = new Set<string>();
    
    dailyKeyedResult.recordset.forEach((r: any) => {
      if (r.date_value) {
        allDates.add(r.date_value.toISOString().split('T')[0]);
      }
    });
    
    dailyTransferredResult.recordset.forEach((r: any) => {
      if (r.date_value) {
        allDates.add(r.date_value.toISOString().split('T')[0]);
      }
    });
    
    const dates = Array.from(allDates).sort();
    console.log('[DEBUG] Unique dates:', dates.length);
    
    if (dates.length === 0) {
      return {
        dates: [],
        data: []
      };
    }
    
    // ขั้นตอนที่ 5: สร้างข้อมูลสำหรับ frontend
    const formattedData = formatDataOptimized(
      districtResult.recordset,
      dailyKeyedResult.recordset,
      dailyTransferredResult.recordset,
      dates
    );
    
    console.log(`[PERF] Data formatting: ${Date.now() - formatStartTime}ms`);
    console.log(`[PERF] Total execution time: ${Date.now() - startTime}ms`);
    
    const response = {
      dates: dates,
      data: formattedData
    };
    
    // บันทึกลง cache
    setCache(cacheKey, response);
    
    return response;
    
  } catch (error: any) {
    console.error('[API Error] processing-summary:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch processing summary data'
    });
  }
});

// ฟังก์ชันจัดรูปแบบข้อมูลแบบเพิ่มประสิทธิภาพ
function formatDataOptimized(
  districts: any[],
  dailyKeyed: any[], 
  dailyTransferred: any[],
  dates: string[]
) {
  const result: any[] = [];
  
  // 1. สร้าง map สำหรับข้อมูลรายวัน
  const keyedMap = new Map<string, Map<string, number>>();
  const transferredMap = new Map<string, Map<string, number>>();
  
  // 2. จัดกลุ่มข้อมูลคีย์ลงระบบตามอำเภอและวันที่
  dailyKeyed.forEach((record: any) => {
    const key = `${record.province_code}-${record.district_code}`;
    const dateStr = record.date_value.toISOString().split('T')[0];
    
    if (!keyedMap.has(key)) {
      keyedMap.set(key, new Map());
    }
    keyedMap.get(key)!.set(dateStr, record.count_keyed);
  });
  
  // 3. จัดกลุ่มข้อมูลโอนเงินตามอำเภอและวันที่
  dailyTransferred.forEach((record: any) => {
    const key = `${record.province_code}-${record.district_code}`;
    const dateStr = record.date_value.toISOString().split('T')[0];
    
    if (!transferredMap.has(key)) {
      transferredMap.set(key, new Map());
    }
    transferredMap.get(key)!.set(dateStr, record.count_transferred);
  });
  
  // 4. จัดกลุ่มตามจังหวัด
  const provinceMap = new Map();
  
  districts.forEach(district => {
    const provinceKey = district.province_code;
    
    if (!provinceMap.has(provinceKey)) {
      provinceMap.set(provinceKey, {
        province: district.province_name,
        districts: []
      });
    }
    
    const key = `${district.province_code}-${district.district_code}`;
    const keyedData = keyedMap.get(key);
    const transferredData = transferredMap.get(key);
    
    // คำนวณ running total สำหรับแต่ละวัน
    const dailyData: any[] = [];
    let cumulativeKeyed = 0;
    let cumulativeTransferred = 0;
    
    dates.forEach(date => {
      // เพิ่มค่าสะสมจากวันนี้
      if (keyedData && keyedData.has(date)) {
        cumulativeKeyed += keyedData.get(date) || 0;
      }
      if (transferredData && transferredData.has(date)) {
        cumulativeTransferred += transferredData.get(date) || 0;
      }
      
      dailyData.push({
        keyed: cumulativeKeyed,
        transferred: cumulativeTransferred
      });
    });
    
    provinceMap.get(provinceKey).districts.push({
      district: district.district_name,
      subdistrict: district.total_subdistricts || 0,
      village: district.village_count || 0,
      community: district.community_count || 0,
      totalDamage: 0,
      totalHouseholds: district.total_households || 0,
      isTotal: false,
      data: dailyData
    });
  });
  
  // สร้างโครงสร้างข้อมูลสุดท้ายพร้อมแถวรวม
  for (const [provinceCode, provinceData] of provinceMap) {
    const districts = provinceData.districts;
    const districtCount = districts.length;
    
    // เพิ่มชื่อจังหวัดในแถวแรก
    if (districts.length > 0) {
      districts[0].province = provinceData.province;
    }
    
    // เพิ่มข้อมูลอำเภอทั้งหมด
    result.push(...districts);
    
    // เพิ่มแถวรวม
    const totalRow = calculateTotal(districts, districtCount, dates.length);
    result.push(totalRow);
  }
  
  return result;
}

// คำนวณยอดรวม
function calculateTotal(districts: any[], districtCount: number, daysCount: number) {
  const total = {
    province: '',
    district: `รวม ${districtCount} อำเภอ`,
    subdistrict: 0,
    village: 0,
    community: 0,
    totalDamage: 0,
    totalHouseholds: 0,
    isTotal: true,
    data: Array(daysCount).fill(null).map(() => ({ keyed: 0, transferred: 0 }))
  };
  
  districts.forEach(district => {
    total.subdistrict += parseInt(district.subdistrict) || 0;
    total.village += parseInt(district.village) || 0;
    total.community += parseInt(district.community) || 0;
    total.totalDamage += district.totalDamage || 0;
    total.totalHouseholds += district.totalHouseholds || 0;
    
    district.data.forEach((day: any, index: number) => {
      total.data[index].keyed += day.keyed || 0;
      total.data[index].transferred += day.transferred || 0;
    });
  });
  
  return total;
}
