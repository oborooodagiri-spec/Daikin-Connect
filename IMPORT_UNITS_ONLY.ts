import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function importUnitsOnly() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) return;

    const matches = connectionString.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!matches) return;

    const [, user, password, host, port, database] = matches;
    
    const connection = await mysql.createConnection({
        host,
        port: parseInt(port),
        user,
        password: decodeURIComponent(password),
        database,
        multipleStatements: true
    });

    try {
        console.log("--- FOKUS: MENYUNTIKKAN 17.480 UNIT ---");
        
        let content = fs.readFileSync(path.join(process.cwd(), 'data_produksi.sql'), 'utf8');
        
        // Ekstrak hanya blok INSERT INTO `units`
        const regex = /INSERT INTO `units` VALUES[\s\S]*?;/gi;
        const match = content.match(regex);

        if (!match) {
            console.error("Gagal menemukan data Unit di dalam file!");
            return;
        }

        console.log("Data Unit ditemukan! Memulai penyuntikan...");
        
        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
        
        // Jalankan perintah INSERT murni
        await connection.query(match[0]);
        
        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

        console.log("\n--- SINKRONISASI UNIT BERHASIL TOTAL! ---");

        const [units]: any = await connection.query("SELECT COUNT(*) as c FROM units");
        console.log(`✅ TOTAL UNIT SEKARANG: ${units[0].c} Unit`);

    } catch (err) {
        console.error("\nGagal menyuntikkan unit:", err);
    } finally {
        await connection.end();
    }
}

importUnitsOnly();
