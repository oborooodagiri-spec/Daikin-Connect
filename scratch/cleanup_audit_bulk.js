const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function main() {
  // Delete only the bulk-synced audit records (not the manually-entered ones)
  const result = await prisma.service_activities.deleteMany({
    where: {
      type: 'Audit',
      inspector_name: 'Tim Audit PI'
    }
  });
  
  console.log(`Deleted ${result.count} bulk-synced audit records`);
  
  const remaining = await prisma.service_activities.count({ where: { type: 'Audit' } });
  console.log(`Remaining audit records: ${remaining}`);
  
  await prisma.$disconnect();
}
main();
