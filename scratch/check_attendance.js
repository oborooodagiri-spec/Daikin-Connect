const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.vendor_attendance.findMany({
    take: 10,
    orderBy: { check_in_time: 'desc' },
    include: {
      users: { select: { name: true } },
      projects: { select: { name: true } }
    }
  });
  console.log(JSON.stringify(records, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
