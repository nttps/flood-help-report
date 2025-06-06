import sql from 'mssql';

const config = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP67',
  server: '192.168.213.42',
  port: 1433,
  options: {
    encrypt: true, // ถ้าเชื่อมต่อแบบ SSL
    trustServerCertificate: true, // ถ้าไม่ใช้ SSL
  },
  connectionTimeout: 300000 , // 30 seconds for connection timeout
  requestTimeout: 300000 , // 60 seconds for query request timeout
};


const getSub = async (sql: typeof import('mssql'), p_no: any, startDate: any, endDate: any) => {
  await sql.connect(config);

  
  let where = '';
  if(startDate) {
    where += ` AND CAST(ch.commit_date AS DATE) >= '${startDate}'`
  }

  if(endDate) {
    where += ` AND CAST(ch.commit_date AS DATE) <= '${endDate}'`
  }

  const result = await sql.query(`
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

    const {startDate, endDate, pcode} = getQuery(event)

    const childData = await getSub(sql, pcode, startDate, endDate);

    return childData;

})