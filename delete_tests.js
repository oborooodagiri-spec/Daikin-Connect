const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function deleteTestProjects() {
  const targets = [
    { name: 'EPL-Installasi Chiller', val: BigInt(315000000) },
    { name: 'EPL', val: BigInt(135000000) },
    { name: 'RCDDB100BW', val: BigInt(12200000) }
  ];

  let totalDeleted = 0;
  for (const t of targets) {
    const res = await prisma.pipeline_deals.deleteMany({
      where: {
        project_name: t.name,
        quotation: t.val,
        status: 'E'
      }
    });
    totalDeleted += res.count;
  }

  console.log(`Deleted ${totalDeleted} test projects successfully.`);
}

deleteTestProjects().catch(console.error).finally(() => prisma.$disconnect());
