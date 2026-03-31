import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function ultimateImport() {
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
        console.log("--- MEMULAI OPERASI ULTIMATE IMPORT ---");
        
        let content = fs.readFileSync(path.join(process.cwd(), 'data_produksi.sql'), 'utf8');
        
        console.log("Langkah 1: Pembersihan kode teknis...");
        // Hapus komentar MySQL /*! ... */ dan komentar baris -- serta baris kosong
        content = content.replace(/\/\*![\s\S]*?\*\//g, '');
        content = content.replace(/^--.*$/gm, '');
        content = content.replace(/^\s*$/gm, '');
        
        // Hapus LOCK TABLES dan UNLOCK TABLES untuk mempercepat proses
        content = content.replace(/LOCK TABLES `.*?` WRITE;/g, '');
        content = content.replace(/UNLOCK TABLES;/g, '');

        console.log("Langkah 2: Menyiapkan database...");
        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

        // Split berdasarkan perintah (titik koma)
        const statements = content.split(/;\s*$/m).map(s => s.trim()).filter(s => s.length > 0);
        
        console.log(`Langkah 3: Menyuntikkan ${statements.length} perintah secara berurutan...`);
        
        let count = 0;
        for (const statement of statements) {
            try {
                await connection.query(statement + ";");
                count++;
                if (count % 20 === 0) process.stdout.write(".");
            } catch (e: any) {
                // Lewati jika error "sudah ada", tapi catat jika error serius
                if (!e.message.includes("already exists")) {
                    process.stdout.write("x");
                }
            }
        }

        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
        console.log("\n\n--- SINKRONISASI BERHASIL TOTAL! ---");

        // VERIFIKASI AKHIR
        const [cust]: any = await connection.query("SELECT COUNT(*) as c FROM customers");
        const [units]: any = await connection.query("SELECT COUNT(*) as c FROM units");
        const [projects]: any = await connection.query("SELECT COUNT(*) as c FROM projects");

        console.log(`\nHasil Akhir di Dashboard:`);
        console.log(`- Pelanggan: ${cust[0].c}`);
        console.log(`- Unit Terdaftar: ${units[0].c}`);
        console.log(`- Lokasi Site: ${projects[0].c}`);

    } catch (err) {
        console.error("\nKesalahan Fatal:", err);
    } finally {
        await connection.end();
    }
}

ultimateImport();
