import { createConnection, getDbConfig, getPool } from '../config/database';

export default defineEventHandler(async (event) => {
  const { database } = getQuery(event);
  const dbName = (database as string) || 'DPM_HELP68'; // Default to DPM_HELP68
  
  const config = getDbConfig(dbName);
  await createConnection(config);
  const pool = getPool(dbName);
  const result = await pool.request().query(`SELECT MAX(export_bank_trn_date) as lastDate from sf_commit_head`)
  return result.recordset[0].lastDate;
})
