import sql from 'mssql';

const config = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP67',
  server: '122.154.29.20',
  options: {
    encrypt: false, // ถ้าเชื่อมต่อแบบ SSL
    trustServerCertificate: true, // ถ้าไม่ใช้ SSL
  }
};

const getHeader = async (sql: typeof import('mssql'), startDate: any, endDate: any, pcode: any) => {
  await sql.connect(config);

  let where = '';
  if(startDate) {
    where += ` AND CAST(ch.commit_date AS DATE) >= '${startDate}' `
  }

  if(endDate ) {
    where += ` AND CAST(ch.commit_date AS DATE) <= '${endDate}' `
  }

  if(pcode != 'all') {
    where += ` AND rq.p_no = '${pcode}' `
  }

  const result = await sql.query(`
    WITH counts AS (
    SELECT 
      rq.p_no,  -- จังหวัด
      rq.p_name,  -- จังหวัด
      COUNT(ch.person_qty) AS person_qty,  -- จำนวน ก.ช.ภ.จ
      COUNT(DISTINCT cl.commit_id) AS send,  -- ส่งปกครอง
      SUM(CASE WHEN cl.linkgate_status != 'ปกติ' THEN 1 ELSE 0 END) AS failed_linkage,  -- ไม่ผ่าน Linkage
      COUNT(DISTINCT cl.commit_id) AS count_total_commit,  -- จำนวนประชุมทั้งหมด / ครั้ง
      SUM(CASE WHEN cl.payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments,  -- โอนสำเร็จ
      COUNT(DISTINCT CASE WHEN ch.export_bank_trn_date IS NOT NULL THEN ch.export_bank_trn_date END) AS count_payment_date,
      isnull((SELECT count(*) FROM sf_commit_line cc 
          WHERE cc.step_id = 'จังหวัด' 
          AND cc.commit_type = 'ตีกลับ' 
          AND cc.step_status = 'รอดำเนินการ' AND rq.p_no = cc.origin_pcode),0) AS outstanding 
    FROM sf_commit_line cl
    LEFT JOIN sf_commit_head ch ON ch.commit_id = cl.commit_id
    LEFT JOIN sf_help_request rq ON rq.req_id = cl.req_id
      WHERE ch.step_id = 'ปภ.' 
      ${where}
      AND cl.is_active = 1
      GROUP BY rq.p_name, rq.p_no
    )

    SELECT *,
      person_qty - failed_linkage AS send_bank,  -- ส่งออมสิน
      person_qty - failed_linkage - successful_payments AS unsuccessful_payments,
      failed_linkage + (person_qty - failed_linkage - successful_payments) as count_back_to_province,
      0 AS retreat
    FROM counts order by p_name;
    `); 

  return result.recordset;
}


const getSub = async (sql: typeof import('mssql'), p_no: number, startDate: any, endDate: any) => {
  await sql.connect(config);

  
  let where = '';
  if(startDate) {
    where += ` AND CAST(commit_date AS DATE) >= '${startDate}'`
  }

  if(endDate) {
    where += ` AND CAST(commit_date AS DATE) <= '${endDate}'`
  }

  const result = await sql.query(`
    WITH sub_counts AS (

    SELECT 
      rq.p_no,
      rq.p_name,
        ch.commit_no, -- จังหวัด
        ch.commit_date, -- จังหวัด
        ch.commit_id,
        ch.status_confirm,
        COUNT(ch.person_qty) AS person_qty, -- จำนวน ก.ช.ภ.จ
        COUNT(DISTINCT cl.commit_id) AS send,  -- ส่งปกครอง
        SUM(CASE WHEN cl.linkgate_status != 'ปกติ' THEN 1 ELSE 0 END) AS failed_linkage, --ไม่ผ่าน Linkage
        MAX(ch.export_bank_trn_date) AS latest_payment_date, -- วันที่โอนเงินล่าสุด
        COUNT(DISTINCT CASE WHEN cl.payment_date IS NOT NULL THEN cl.payment_date END) AS count_payment_date,
        COUNT(DISTINCT cl.commit_id) AS count_total_commit,  -- จำนวนประชุมทั้งหมด / ครั้ง
        SUM(CASE WHEN cl.payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments,  --โอนสำเร็จ
        isnull((SELECT COUNT(*) AS person_qty FROM sf_commit_head ccl
        LEFT join  sf_commit_line cco on ccl.commit_id =  cco.commit_id
        WHERE ccl.commit_no = CONCAT('99', ch.commit_no) and cco.origin_pcode = rq.p_no),0) AS send_from_province
    FROM sf_commit_head ch
    LEFT JOIN sf_commit_line cl ON ch.commit_id = cl.commit_id
    LEFT JOIN sf_help_request rq ON rq.req_id = cl.req_id
    WHERE ch.step_id = 'ปภ.' AND cl.is_active = 1
    GROUP BY rq.p_no, rq.p_name, ch.commit_date, ch.commit_no, ch.commit_id, ch.status_confirm
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
    WHERE p_no = '${p_no}' ${where}
    order by commit_date asc;
    `); 
  return result.recordset;
}


export default defineEventHandler(async (event) => {
  try {
   
    const {startDate, endDate, pcode} = getQuery(event)

    const results = []
    const resultHead = await getHeader(sql, startDate, endDate, pcode);

    // Loop ผ่านแต่ละ Head และเพิ่ม Sub เข้าไปในแต่ละ Head
    for (const head of resultHead) {
      const sub = await getSub(sql, head.p_no, startDate, endDate); // รับข้อมูล Sub โดยใช้ head.p_no เป็นตัวกำหนด

      // เพิ่ม sub เข้าไปใน object head โดยตรง
      head.sub = sub;
      head.showSub = true

      // เพิ่ม head (ที่มี sub) เข้าไปใน results
      results.push(head);
    }
    return results;
  } catch (err) {
    console.error(err);
  }
})