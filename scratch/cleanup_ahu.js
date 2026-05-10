const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function cleanup() {
  const result = await prisma.service_activities.deleteMany({
    where: { inspector_name: 'Bulk Sync (AHU)' }
  });
  console.log(`Deleted: ${result.count}`);
}

cleanup().finally(() => prisma.$disconnect());
