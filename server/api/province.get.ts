

import { getDbConfig, createConnection, getPool } from '../config/database';


export default defineEventHandler(async (event) => {
  const { database } = getQuery(event);
  const config = getDbConfig(database as string); // Default to DPM_HELP67 if not specified
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
  // if(phase == '1') {
  //   where += ` and ph  in ('1.0', '1.1') AND people_id not in ('3570500716650', '5550500508247', '3579143363278')`
  // }else {
  //   where += ` and ph  in ('${phase}')`
  // }

  // Get the appropriate pool for this database
  const pool = getPool(config.database);
  try {
      const sqlString = `select pcode, pname from a_province where is_active = 1`
      const result = await pool.request().query(sqlString);
      const modifiedResult = [{ pcode: 'all', pname: 'เลือกทั้งหมด' }, ...result.recordset];
      return modifiedResult;
  } catch (err) {
    console.error(err);
  }
})

