const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const matches = connectionString.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  const [, user, password, host, port, database] = matches;
  
  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password: decodeURIComponent(password),
    database
  });

  const [rows] = await connection.query('SELECT photo_url, media_type FROM activity_photos ORDER BY id DESC LIMIT 10');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

main().catch(console.error);
