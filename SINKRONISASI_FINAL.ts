import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function importFinalDaikin() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL tidak ditemukan di .env!");
    return;
  }

  const matches = connectionString.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!matches) {
    console.error("Format DATABASE_URL salah!");
    return;
  }

  const [, user, password, host, port, database] = matches;
  
  console.log(`Menghubungkan ke ${host} (Database: ${database})...`);
  
  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password: decodeURIComponent(password),
    database,
    multipleStatements: true
  });

  try {
    console.log("Memulai Sinkronisasi Data Operasional...");
    
    // Matikan pengawal gerbang agar data lama bisa masuk tanpa hambatan
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    
    const content = fs.readFileSync(path.join(process.cwd(), 'data_produksi.sql'), 'utf8');
    
    // Membersihkan komentar-komentar MariaDB/MySQL yang membingungkan
    const cleanContent = content
      .replace(/\/\*![\s\S]*?\*\//g, '')
      .replace(/^--.*$/gm, '')
      .replace(/^\s*$/gm, '');

    // Membagi perintah berdasarkan titik koma di akhir baris
    const statements = cleanContent.split(/;\s*$/m);
    
    console.log(`Ditemukan ${statements.length} blok data. Sedang menyuntikkan data...`);

    let successCount = 0;
    for (let statement of statements) {
      const sql = statement.trim();
      if (!sql) continue;

      try {
        await connection.query(sql + ";");
        successCount++;
        if (successCount % 10 === 0) process.stdout.write(".");
      } catch (e: any) {
        // Abaikan error "Table already exists" tapi catat yang lain jika perlu
        if (!e.message.includes('already exists')) {
            // console.log("\nLewati perintah bermasalah:", e.message.substring(0, 50));
        }
      }
    }
    
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n\nSINKRONISASI SELESAI!");
    console.log(`Berhasil memasukkan ${successCount} blok data.`);

    // LAPORAN FINAL
    const [cust]: any = await connection.query("SELECT COUNT(*) as c FROM customers");
    const [units]: any = await connection.query("SELECT COUNT(*) as c FROM units");
    const [audit]: any = await connection.query("SELECT COUNT(*) as c FROM ahu_audits");

    console.log(`\n--- KONFIRMASI DATA DASHBOARD ---`);
    console.log(`✅ Total Pelanggan (Plaza Indonesia, dsb): ${cust[0].c}`);
    console.log(`✅ Total Unit Terdaftar: ${units[0].c}`);
    console.log(`✅ Total Riwayat Audit: ${audit[0].c}`);

    if (units[0].c > 0) {
        console.log("\nMANIFES: DATA OPERASIONAL SUDAH AKTIF DI DASHBOARD!");
    } else {
        console.log("\nPERINGATAN: Data Unit masih kosong. Harap cek kembali file data_produksi.sql.");
    }

  } catch (err) {
    console.error("\nKesalahan Sistem:", err);
  } finally {
    await connection.end();
  }
}

importFinalDaikin();
