import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function importAllUnitsClean() {
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
        console.log("--- PEMBERSIHAN & IMPORT TOTAL UNIT ---");
        
        let content = fs.readFileSync(path.join(process.cwd(), 'data_produksi.sql'), 'utf8');
        
        const regex = /INSERT INTO `units` VALUES[\s\S]*?;/gi;
        const insertBlocks = content.match(regex);

        if (!insertBlocks || insertBlocks.length === 0) {
            console.error("Gagal menemukan data Unit!");
            return;
        }

        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
        
        console.log("Mengosongkan tempat parkir...");
        await connection.query("TRUNCATE TABLE units;");

        console.log(`Ditemukan ${insertBlocks.length} gerbong data. Memulai penyuntikan total...`);
        
        let blockCount = 0;
        for (const block of insertBlocks) {
            blockCount++;
            await connection.query(block);
            if (blockCount % 5 === 0) process.stdout.write(`[G${blockCount} OK] `);
        }
        
        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

        console.log("\n\n--- SINKRONISASI UNIT BERHASIL TOTAL! ---");

        const [units]: any = await connection.query("SELECT COUNT(*) as c FROM units");
        console.log(`✅ TOTAL UNIT RILL DI DASHBOARD: ${units[0].c} Unit`);

    } catch (err) {
        console.error("\nGagal total:", err);
    } finally {
        await connection.end();
    }
}

importAllUnitsClean();
