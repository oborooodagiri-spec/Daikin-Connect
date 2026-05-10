const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Running bulk update for is_bulk_sync...');
    const result = await prisma.$executeRawUnsafe(
        "UPDATE service_activities SET technical_json = JSON_SET(technical_json, '$.is_bulk_sync', true) WHERE created_at >= '2026-05-06 00:00:00'"
    );
    console.log('Update complete. Rows affected:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
