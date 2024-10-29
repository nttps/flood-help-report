
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


export default defineEventHandler(async (event) => {

  await sql.connect(config);


  const queryCountRequestString = `SELECT COUNT(*) as total from sf_help_request WHERE 
  t_step_status != 'ปฏิเสธคำขอ' AND
  (p_name is not null or p_name != '');`
  const countRequest = await sql.query(queryCountRequestString);

  const queryTopRequestString = `SELECT TOP 1 COUNT(*) AS top_count , p_name from sf_help_request where t_step_status != 'ปฏิเสธคำขอ' GROUP BY p_name ORDER BY top_count DESC;`
  const topRequest = await sql.query(queryTopRequestString);

  const queryAllRequestString = `SELECT 
    COUNT(*) AS top_count, 
    SUM(case when current_status = 'โอนเงินแล้ว'  then 1 ELSE 0 end) AS total, 
    p_name 
  from vw_sf_help_request 
  WHERE 
    t_step_status != 'ปฏิเสธคำขอ'
    AND (p_name is not null or p_name != '')  
  GROUP BY p_name 
  ORDER BY top_count DESC`
  const allRequest = await sql.query(queryAllRequestString);

  const queryAllTransferString = `SELECT COUNT(*) AS total from sf_help_request WHERE current_status ='โอนเงินแล้ว' and t_step_status != 'ปฏิเสธคำขอ';`
  const allTransfer = await sql.query(queryAllTransferString);

  const queryProvinceRetrieveMoneyString = `SELECT COUNT(*) AS total
    FROM (
        SELECT COUNT(p_no) AS total
        FROM sf_help_request
        WHERE current_status = 'โอนเงินแล้ว' 
        GROUP BY p_no
    ) AS grouped_result`

  const provinceRetrieveMoney = await sql.query(queryProvinceRetrieveMoneyString);

  const queryProvinceRequestString = `SELECT COUNT(*) AS total
    FROM (
        SELECT COUNT(p_no) AS total
        FROM sf_help_request
        GROUP BY p_no
    ) AS grouped_result`

  const provinceRequest = await sql.query(queryProvinceRequestString);

  const queryallMoneyTransfer = ` SELECT SUM(help_amt) AS total
        FROM vw_sf_help_request
        WHERE current_status = 'โอนเงินแล้ว'`

  const allMoneyTransfer = await sql.query(queryallMoneyTransfer);

  return { 
    countRequest: countRequest.recordset[0]['total'],
    topRequest: topRequest.recordset[0],
    allRequest: allRequest.recordset.filter(a => a.p_name !== ''),
    allTransfer: allTransfer.recordset[0]['total'],
    provinceRequest: provinceRequest.recordset[0]['total'],
    provinceRetrieveMoney: provinceRetrieveMoney.recordset[0]['total'],
    allMoneyTransfer: allMoneyTransfer.recordset[0]['total']
  }
})
