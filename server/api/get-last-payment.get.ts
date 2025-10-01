import { createConnection, getDbConfig, getPool } from '../config/database';

const config = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP68',
  server: '192.168.213.42',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 300000,
  requestTimeout: 300000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};



export default defineEventHandler(async (event) => {

  const config = getDbConfig('2568');
  await createConnection(config);
  const pool = getPool('2568');
  const result = await pool.request().query(`SELECT MAX(export_bank_trn_date) as lastDate from sf_commit_head`)
  return result.recordset[0].lastDate;
})
