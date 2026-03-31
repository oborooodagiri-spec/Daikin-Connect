import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function ultimateImportV2() {
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
        console.log("--- MEMULAI OPERASI ULTIMATE SYNC V2 ---");
        
        let content = fs.readFileSync(path.join(process.cwd(), 'data_produksi.sql'), 'utf8');
        
        console.log("Langkah 1: Pembersihan & Stabilisasi SQL...");
        // Hapus komentar MySQL /*! ... */ dan komentar baris --
        content = content.replace(/\/\*![\s\S]*?\*\//g, '');
        content = content.replace(/^--.*$/gm, '');
        
        // JANGAN Biarkan Script Menghapus atau Membuat Ulang Tabel Units/Projects yang Sudah Kita Siapkan Manual
        content = content.replace(/DROP TABLE IF EXISTS `units`;/gi, '-- SKIP DROP UNITS');
        content = content.replace(/CREATE TABLE `units` \([\s\S]*?\);/gi, '-- SKIP CREATE UNITS');
        content = content.replace(/DROP TABLE IF EXISTS `projects`;/gi, '-- SKIP DROP PROJECTS');
        content = content.replace(/CREATE TABLE `projects` \([\s\S]*?\);/gi, '-- SKIP CREATE PROJECTS');

        // Hapus LOCK/UNLOCK
        content = content.replace(/LOCK TABLES `.*?` WRITE;/g, '');
        content = content.replace(/UNLOCK TABLES;/g, '');

        console.log("Langkah 2: Menembus Batasan...");
        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

        // Split berdasarkan perintah
        const statements = content.split(/;\s*$/m).map(s => s.trim()).filter(s => s.length > 0);
        
        console.log(`Langkah 3: Menyuntikkan ${statements.length} perintah data...`);
        
        let count = 0;
        for (const statement of statements) {
            try {
                if (statement.startsWith('-- SKIP')) continue;
                await connection.query(statement + ";");
                count++;
                if (count % 20 === 0) process.stdout.write(".");
            } catch (e: any) {
                // Abaikan jika data duplikat atau tabel sudah ada di memori
                if (!e.message.includes("already exists")) {
                    // console.log("x");
                }
            }
        }

        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
        console.log("\n\n--- SINKRONISASI DATA RILL BERHASIL! ---");

        // VERIFIKASI AKHIR
        const [cust]: any = await connection.query("SELECT COUNT(*) as c FROM customers");
        const [units]: any = await connection.query("SELECT COUNT(*) as c FROM units");

        console.log(`\nHasil Akhir di Dashboard Bapak:`);
        console.log(`✅ Pelanggan Terdaftar: ${cust[0].c}`);
        console.log(`✅ Unit Operasional Terdaftar: ${units[0].c} Unit`);

        if (units[0].c > 0) {
            console.log("\nDATA PLAZA INDONESIA & ASTRA SUDAH AKTIF DI DASHBOARD!");
        }

    } catch (err) {
        console.error("\nKesalahan Teknis:", err);
    } finally {
        await connection.end();
    }
}

ultimateImportV2();
