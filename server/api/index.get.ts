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
  connectionTimeout: 300000 , // 30 seconds for connection timeout
  requestTimeout: 300000 , // 60 seconds for query request timeout
};

const getHeader = async (sql: typeof import('mssql'), startDate: any, endDate: any, pcode: any, paymentDateStart: any, paymentDateEnd: any) => {
  await sql.connect(config);

  let where = '';
  if(startDate && !paymentDateStart) {
    where += ` AND CAST(ch.commit_date AS DATE) >= '${startDate}' `
  }

  if(endDate  && !paymentDateEnd) {
    where += ` AND CAST(ch.commit_date AS DATE) <= '${endDate}' `
  }

  if(paymentDateStart ) {
    where += ` AND CAST(ch.export_bank_trn_date AS DATE) >= '${paymentDateStart}' `
  }

  if(paymentDateEnd ) {
    where += ` AND CAST(ch.export_bank_trn_date AS DATE) <= '${paymentDateEnd}' `
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


const getSub = async (sql: typeof import('mssql'), p_no: [], startDate: any, endDate: any, paymentDateStart: any, paymentDateEnd: any) => {
  await sql.connect(config);

  
  let where = '';

  if(startDate && !paymentDateStart) {
    where += ` AND CAST(ch.commit_date AS DATE) >= '${startDate}'`
  }

  if(endDate && !paymentDateEnd) {
    where += ` AND CAST(ch.commit_date AS DATE) <= '${endDate}'`
  }

  if(paymentDateStart) {
    where += ` AND CAST(ch.export_bank_trn_date AS DATE) >= '${paymentDateStart}' `
  }

  if(paymentDateEnd) {
    where += ` AND CAST(ch.export_bank_trn_date AS DATE) <= '${paymentDateEnd}' `
  }

  
  const result = await sql.query(`
WITH all_dates AS (
    SELECT DISTINCT 
        export_bank_trn_date
    FROM sf_commit_head
),
ranked_dates AS (
    SELECT 
        export_bank_trn_date,
        DENSE_RANK() OVER (ORDER BY export_bank_trn_date ASC) AS payment_sequence
    FROM all_dates
),
pre_filtered_head AS (
    SELECT 
        ch.commit_id, 
        ch.commit_no, 
        ch.commit_date, 
        ch.status_confirm, 
        ch.export_bank_trn_date,
        ch.person_qty
    FROM sf_commit_head  ch
    WHERE step_id = 'ปภ.' 
    ${where}
),
payment_counts AS (
    SELECT 
        commit_id,
        COUNT(DISTINCT payment_date) AS count_payment_date,
        SUM(CASE WHEN payment_status = 'สำเร็จ' THEN 1 ELSE 0 END) AS successful_payments
    FROM sf_commit_line
    WHERE is_active = 1
    GROUP BY commit_id
),
linkage_failed AS (
    SELECT 
        commit_id,
        SUM(CASE WHEN linkgate_status != 'ปกติ' THEN 1 ELSE 0 END) AS failed_linkage
    FROM sf_commit_line
    WHERE is_active = 1
    GROUP BY commit_id
),
send_from_province_counts AS (
    SELECT 
        cco.origin_pcode AS p_no,
        SUM(DISTINCT ccl.person_qty) AS send_from_province,
        ccl.commit_no
    FROM sf_commit_head ccl 
    LEFT JOIN sf_commit_line cco ON ccl.commit_id = cco.commit_id 
    WHERE ccl.commit_no LIKE '99%' 
    GROUP BY cco.origin_pcode, ccl.commit_no
),
sub_counts AS (
    SELECT 
        cl.origin_pcode AS p_no,
        cl.origin_pname AS p_name,
        ch.commit_no,
        ch.commit_date,
        ch.commit_id,
        ch.status_confirm,
        COUNT(ch.person_qty) AS person_qty,
        COALESCE(lf.failed_linkage, 0) AS failed_linkage,
        MAX(ch.export_bank_trn_date) AS latest_payment_date,
        COALESCE(pc.count_payment_date, 0) AS count_payment_date,
        COALESCE(pc.successful_payments, 0) AS successful_payments,
        COALESCE(sp.send_from_province, 0) AS send_from_province
    FROM pre_filtered_head ch
    LEFT JOIN sf_commit_line cl ON ch.commit_id = cl.commit_id AND cl.is_active = 1
    LEFT JOIN payment_counts pc ON ch.commit_id = pc.commit_id
    LEFT JOIN linkage_failed lf ON ch.commit_id = lf.commit_id
    LEFT JOIN send_from_province_counts sp ON cl.origin_pcode = sp.p_no AND sp.commit_no = CONCAT('99', ch.commit_no)
    GROUP BY 
        cl.origin_pcode, 
        cl.origin_pname, 
        ch.commit_no, 
        ch.commit_date, 
        ch.commit_id, 
        ch.status_confirm, 
        lf.failed_linkage, 
        pc.count_payment_date, 
        pc.successful_payments, 
        sp.send_from_province
),
RankedSequence AS (
    SELECT sc.*,
        (person_qty - failed_linkage) AS send_bank,
        (person_qty - failed_linkage - successful_payments) AS unsuccessful_payments,
        (failed_linkage + (person_qty - failed_linkage - successful_payments)) AS count_back_to_province,
        COALESCE(rd.payment_sequence, 0) AS payment_sequence
    FROM sub_counts sc
    LEFT JOIN ranked_dates rd ON sc.latest_payment_date = rd.export_bank_trn_date
)
SELECT *,
    0 AS retreat,
    (count_back_to_province - send_from_province) AS outstanding
FROM RankedSequence
WHERE p_no IN (${p_no})
ORDER BY commit_date,commit_no ASC;
`); 
  return result.recordset;
}


export default defineEventHandler(async (event) => {
   
    const {startDate, endDate, pcode, paymentDateStart, paymentDateEnd} = getQuery(event)

    const results = []
  const resultHead = await getHeader(sql, startDate, endDate, pcode, paymentDateStart, paymentDateEnd);

  const pNoArray = resultHead.map(item => item.p_no);
  
  if (pNoArray.length === 0) {
    return resultHead;
  }

    const childData = await getSub(sql, pNoArray, startDate, endDate, paymentDateStart, paymentDateEnd);

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