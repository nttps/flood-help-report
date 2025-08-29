
import sql from 'mssql';
import { getDbConfig, createConnection, getPool } from '../config/database';

export default defineEventHandler(async (event) => {
  const config = getDbConfig(); // Default to 2567
  console.log('=== onepage API Debug ===');
  console.log('Using database config:', config.database);
  
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
  if(phase == '1') {
    where += ` and ph  in ('1.0', '1.1') AND people_id not in ('3570500716650', '5550500508247', '3579143363278')`
  }else {
    where += ` and ph  in ('${phase}')`
  }

  try {
    // Get the appropriate pool for 2567
    const pool = getPool();
    console.log('Using pool for database:', config.database);
    
    const queryCountRequestString = `SELECT COUNT(*) as total from sf_help_request WHERE 
    t_step_status != 'ปฏิเสธคำขอ' ${where} AND
    (p_name is not null or p_name != '') ;`
  
    console.log('Executing query on database:', config.database);
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
      year: '2567',
      database: config.database,
      countRequest: countRequest.recordset[0]['total'],
      topRequest: topRequest.recordset[0],
      allRequest: allRequest.recordset.filter(a => a.p_name !== ''),
      allTransfer: allTransfer.recordset[0]['total'],
      provinceRequest: provinceRequest.recordset[0]['total'],
      provinceRetrieveMoney: provinceRetrieveMoney.recordset[0]['total'],
      allMoneyTransfer: allMoneyTransfer.recordset[0]['total']
    };

    console.log('=== Query Results (2567) ===');
    console.log('Database used:', config.database);
    console.log('Count request:', result.countRequest);
    console.log('All transfer:', result.allTransfer);
    console.log('Top province:', result.topRequest?.p_name);
    console.log('=== End Debug ===');
  
    return result;
  }catch(e: any) {
    console.error('Database query error:', e);
    throw createError({
      statusCode: 500,
      statusMessage: `Database query failed: ${e?.message || 'Unknown error'}`
    });
  }
})
