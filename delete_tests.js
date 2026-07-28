const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function deleteTestProjects() {
  const deleted = await prisma.pipeline_deals.deleteMany({
    where: {
      id: { in: [2307, 2406, 2620] }
    }
  });

  console.log(`Deleted ${deleted.count} test projects successfully.`);
}

deleteTestProjects().catch(console.error).finally(() => prisma.$disconnect());
