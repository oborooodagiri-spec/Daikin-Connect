const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function deleteExtraProject() {
  const result = await prisma.pipeline_deals.deleteMany({
    where: {
      quotation: BigInt(450000000),
      project_name: 'RCFWWVC',
      sector: 'Hospital'
    }
  });

  console.log(`Deleted ${result.count} extra projects.`);
}

deleteExtraProject().catch(console.error).finally(() => prisma.$disconnect());
