import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function importAllUnits() {
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
        console.log("--- MOZAIK DATA: MENGUMPULKAN SELURUH UNIT ---");
        
        let content = fs.readFileSync(path.join(process.cwd(), 'data_produksi.sql'), 'utf8');
        
        // Cari SEMUA blok INSERT INTO `units`
        const regex = /INSERT INTO `units` VALUES[\s\S]*?;/gi;
        const insertBlocks = content.match(regex);

        if (!insertBlocks || insertBlocks.length === 0) {
            console.error("Gagal menemukan data Unit di dalam file!");
            return;
        }

        console.log(`Ditemukan ${insertBlocks.length} gerbong data unit. Memulai pendaratan...`);
        
        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
        
        let blockCount = 0;
        for (const block of insertBlocks) {
            blockCount++;
            await connection.query(block);
            process.stdout.write(`[Gerbong ${blockCount} OK] `);
        }
        
        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

        console.log("\n\n--- SINKRONISASI UNIT SELESAI TOTAL! ---");

        const [units]: any = await connection.query("SELECT COUNT(*) as c FROM units");
        console.log(`✅ TOTAL UNIT RILL DI DASHBOARD: ${units[0].c} Unit`);

        if (units[0].c > 15000) {
             console.log("\nDATA PLAZA INDONESIA, ASTRA, & RIBUAN UNIT LAINNYA SUDAH LIVE!");
        }

    } catch (err) {
        console.error("\nGagal menyuntikkan unit:", err);
    } finally {
        await connection.end();
    }
}

importAllUnits();
