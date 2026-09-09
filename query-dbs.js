
const mysql = require("mysql2/promise");
async function main() {
  const connection = await mysql.createConnection("mysql://u534185630_EPLConnect:Yw3%219t%23Qp7z2Lk8%40Dq@153.92.15.71:3306");
  const [rows] = await connection.query("SHOW DATABASES");
  console.log("Databases:", rows);
  await connection.end();
}
main().catch(console.error);

