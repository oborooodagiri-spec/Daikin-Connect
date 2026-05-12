const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection("mysql://u534185630_EPLConnect:Yw3%219t%23Qp7z2Lk8%40Dq@153.92.15.71:3306/u534185630_DASIConnect");
    try {
        console.log('Adding allowed_users column to knowledge_resources...');
        // Check if column exists first
        const [columns] = await connection.execute("SHOW COLUMNS FROM knowledge_resources LIKE 'allowed_users'");
        if (columns.length === 0) {
            await connection.execute('ALTER TABLE knowledge_resources ADD COLUMN allowed_users TEXT NULL');
            console.log('Successfully added allowed_users column.');
        } else {
            console.log('Column allowed_users already exists.');
        }
    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        await connection.end();
    }
}

migrate();
