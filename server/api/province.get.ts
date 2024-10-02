import sql from 'mssql';

const config = {
  user: 'dalert',
  password: '@min#DSS',
  database: 'DPM_HELP67',
  server: '122.154.29.20',
  options: {
    encrypt: true, // ถ้าเชื่อมต่อแบบ SSL
    trustServerCertificate: true, // ถ้าไม่ใช้ SSL
  }
};

export default defineEventHandler(async (event) => {
    try {
        const sqlString = `select pcode, pname from a_province where is_active = 1`
        await sql.connect(config);
        const result = await sql.query(sqlString);


        const modifiedResult = [{ pcode: 'all', pname: 'เลือกทั้งหมด' }, ...result.recordset];
        return modifiedResult;
    } catch (err) {
      console.error(err);
    }
  })

