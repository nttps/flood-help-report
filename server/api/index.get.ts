import sql from 'mssql';

const config = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP67',
  server: '122.154.29.20',
  options: {
    encrypt: false, // ถ้าเชื่อมต่อแบบ SSL
    trustServerCertificate: true, // ถ้าไม่ใช้ SSL
  },
  connectionTimeout: 30000, // 30 seconds for connection timeout
  requestTimeout: 60000, // 60 seconds for query request timeout
};

const getHeader = async (sql: typeof import('mssql'), startDate: any, endDate: any, pcode: any, paymentDate: any) => {
  await sql.connect(config);

  let where = '';
  if(startDate) {
    where += ` AND CAST(ch.commit_date AS DATE) >= '${startDate}' `
  }

  if(endDate ) {
    where += ` AND CAST(ch.commit_date AS DATE) <= '${endDate}' `
  }

  if(paymentDate ) {
    where += ` AND CAST(cl.payment_date AS DATE) = '${paymentDate}' `
  }

  if(pcode != 'all') {
    where += ` AND cl.origin_pcode = '${pcode}' `
  }

  const result = await sql.query(`
    WITH counts AS (
    SELECT 
      cl.origin_pcode AS p_no,
      cl.origin_pname AS p_name,
      COUNT(ch.person_qty) AS person_qty,  -- จำนวน ก.ช.ภ.จ
      SUM(CASE WHEN cl.linkgate_status != 'ปกติ' THEN 1 ELSE 0 END) AS failed_linkage,  -- ไม่ผ่าน Linkage
      COUNT(*) AS count_total_commit,  -- จำนวนประชุมทั้งหมด / ครั้ง
      SUM(CASE WHEN cl.payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments,  -- โอนสำเร็จ
      COUNT(DISTINCT CASE WHEN ch.export_bank_trn_date IS NOT NULL THEN ch.export_bank_trn_date END) AS count_payment_date
    FROM sf_commit_line cl
    LEFT JOIN sf_commit_head ch ON ch.commit_id = cl.commit_id
      WHERE ch.step_id = 'ปภ.' 
      ${where}
      AND cl.is_active = 1
      GROUP BY cl.origin_pname, cl.origin_pcode
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


const getSub = async (sql: typeof import('mssql'), p_no: [], startDate: any, endDate: any, paymentDate: any) => {
  await sql.connect(config);

  
  let where = '';
  if(startDate) {
    where += ` AND CAST(ch.commit_date AS DATE) >= '${startDate}'`
  }

  if(endDate) {
    where += ` AND CAST(ch.commit_date AS DATE) <= '${endDate}'`
  }

  if(paymentDate ) {
    where += ` AND CAST(cl.payment_date AS DATE) = '${paymentDate}' `
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
        SUM(CASE WHEN cl.linkgate_status != 'ปกติ' THEN 1 ELSE 0 END) AS failed_linkage,  -- ไม่ผ่าน Linkage
        MAX(ch.export_bank_trn_date) AS latest_payment_date,  -- วันที่โอนเงินล่าสุด
        COUNT(DISTINCT cl.payment_date) AS count_payment_date,  -- วันที่จ่ายเงิน (ไม่ซ้ำ)
        SUM(CASE WHEN cl.payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments,  -- โอนสำเร็จ
        isnull((SELECT DISTINCT count(ccl.person_qty) AS person_qty FROM sf_commit_head ccl
        LEFT join  sf_commit_line cco on ccl.commit_id =  cco.commit_id
        WHERE ccl.commit_no = CONCAT('99', ch.commit_no) and cco.origin_pcode = cl.origin_pcode GROUP BY ccl.commit_id),0) AS send_from_province
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
   
    const {startDate, endDate, pcode, paymentDate} = getQuery(event)

    const results = []
    const resultHead = await getHeader(sql, startDate, endDate, pcode, paymentDate);

    const pNoArray = resultHead.map(item => item.p_no);

    const childData = await getSub(sql, pNoArray, startDate, endDate, paymentDate);

    // Group child data by p_no
    const groupedChildren = childData.reduce((acc, child) => {
      const { p_no } = child;
      if (!acc[p_no]) acc[p_no] = [];
      acc[p_no].push(child);
      return acc;
    }, {});

    // Map parent data and attach children
    const result = resultHead.map(parent => {
      return {
        ...parent,
        showSub: true,
        sub: groupedChildren[parent.p_no] || [] // Attach children or an empty array
      };
    });
    return result;
})