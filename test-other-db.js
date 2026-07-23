
const mysql = require('mysql2/promise');
async function run() {
  try {
    const conn = await mysql.createConnection('mysql://u534185630_EPLConnect:Yw3%219t%23Qp7z2Lk8%40Dq@153.92.15.71:3306/u534185630_EPLConnect');
    const [rows] = await conn.execute('SHOW COLUMNS FROM pipeline_deals LIKE \'target_po_date\'');
    console.log('Columns found:', rows);
    await conn.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();

