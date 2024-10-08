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
      COUNT(cl.payment_status) AS send_bank,  -- ส่งออมสิน
      COUNT(DISTINCT cl.commit_id) AS count_total_commit,  -- จำนวนประชุมทั้งหมด / ครั้ง
      SUM(CASE WHEN cl.payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments,  -- โอนสำเร็จ
      SUM(CASE WHEN cl.payment_status = 'ปฏิเสธ' THEN 1 ELSE 0 END) AS unsuccessful_payments,  -- โอนไม่สำเร็จ
      COUNT(DISTINCT CASE WHEN cl.payment_date IS NOT NULL THEN CONCAT(cl.payment_date, cl.commit_id) END) AS count_payment_date,
      SUM(CASE WHEN cl.payment_status != 'สำเร็จ' THEN 1 ELSE 0 END) AS count_back_to_province,  -- นับจำนวนจังหวัดที่ยังรอดำเนินการ
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
    0 AS retreat,
        count_back_to_province - outstanding AS send_from_province  -- จังหวัดส่งคืนผลตรวจสอบ (calculated as count_back_to_province - outstanding)
    FROM counts order by p_name;
    `); 

  return result.recordset;
}


const getSub = async (sql: typeof import('mssql'), p_no: number, startDate: any, endDate: any) => {
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
      rq.p_no,
      rq.p_name,
        ch.commit_no, -- จังหวัด
        ch.commit_date, -- จังหวัด
        ch.commit_id,
        COUNT(ch.person_qty) AS person_qty, -- จำนวน ก.ช.ภ.จ
        COUNT(DISTINCT cl.commit_id) AS send,  -- ส่งปกครอง
        SUM(CASE WHEN cl.linkgate_status != 'ปกติ' THEN 1 ELSE 0 END) AS failed_linkage, --ไม่ผ่าน Linkage
        COUNT(cl.payment_status) AS send_bank, --- ส่งออมสิน
        MAX(ch.export_bank_trn_date) AS latest_payment_date, -- วันที่โอนเงินล่าสุด
        DENSE_RANK() OVER (ORDER BY MAX(ch.export_bank_trn_date) ASC) AS payment_sequence,
        COUNT(DISTINCT CASE WHEN cl.payment_date IS NOT NULL THEN cl.payment_date END) AS count_payment_date,
        COUNT(DISTINCT cl.commit_id) AS count_total_commit,  -- จำนวนประชุมทั้งหมด / ครั้ง
        SUM(CASE WHEN cl.payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments,  --โอนสำเร็จ
        SUM(CASE WHEN cl.payment_status = 'ปฏิเสธ' THEN 1 ELSE 0 END) AS unsuccessful_payments,  -- โอนไม่สำเร็จ
        SUM(CASE WHEN cl.payment_status != 'สำเร็จ' THEN 1 ELSE 0 END) AS count_back_to_province,  -- นับจำนวนจังหวัดที่ยังรอดำเนินการ
        isnull((SELECT count(*) FROM sf_commit_line cc 
          WHERE cc.step_id = 'จังหวัด' 
          AND cc.commit_type = 'ตีกลับ' 
          AND cc.step_status = 'รอดำเนินการ' and cc.origin_commit_id = ch.commit_id),0) AS outstanding  -- คงค้าง
    FROM sf_commit_head ch
    LEFT JOIN sf_commit_line cl ON ch.commit_id = cl.commit_id
    LEFT JOIN sf_help_request rq ON rq.req_id = cl.req_id
    WHERE ch.step_id = 'ปภ.' AND cl.is_active = 1 AND rq.p_no = '${p_no}'
    ${where}
    GROUP BY rq.p_no, rq.p_name,  ch.commit_date, ch.commit_no, ch.commit_id
    )
    SELECT *,
    0 AS retreat,
          count_back_to_province - isnull(outstanding,0) AS send_from_province  -- จังหวัดส่งคืนผลตรวจสอบ (calculated as count_back_to_province - outstanding)
    FROM sub_counts;
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