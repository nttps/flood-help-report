import sql from 'mssql';

const config = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP67',
  server: '192.168.213.42',
  port: 1433,
  options: {
    encrypt: false, // ถ้าเชื่อมต่อแบบ SSL
    trustServerCertificate: true, // ถ้าไม่ใช้ SSL
  },
  connectionTimeout: 300000 , // 30 seconds for connection timeout
  requestTimeout: 300000 , // 60 seconds for query request timeout
};



export default defineEventHandler(async (event) => {
  const result = await sql.query(`SELECT MAX(export_bank_trn_date) as lastDate from sf_commit_head`)
  return result.recordset[0].lastDate;
})
