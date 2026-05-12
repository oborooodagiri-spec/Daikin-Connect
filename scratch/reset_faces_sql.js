const mysql = require('mysql2/promise');

async function resetFaceData() {
    const connection = await mysql.createConnection("mysql://u534185630_EPLConnect:Yw3%219t%23Qp7z2Lk8%40Dq@153.92.15.71:3306/u534185630_DASIConnect");
    try {
        console.log('Resetting face data via SQL...');
        const [result] = await connection.execute(
            'UPDATE users SET face_reference_url = NULL, face_verification_enabled = 1'
        );
        console.log(`Successfully reset face data for ${result.affectedRows} users.`);
    } catch (error) {
        console.error('SQL Error:', error);
    } finally {
        await connection.end();
    }
}

resetFaceData();
