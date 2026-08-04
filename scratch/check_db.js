const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const records = await prisma.vendor_attendance.findMany({
        orderBy: { check_in_time: 'asc' }
    });
    console.log(records.map(r => ({
        id: r.id,
        check_in_time: r.check_in_time.toISOString(),
        user_id: r.user_id
    })));
}
main().then(() => prisma.$disconnect());
