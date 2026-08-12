require('dotenv').config();
const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function run() {
  const targets = await prisma.pipeline_settings.findUnique({ where: { key: 'TARGETS' } });
  console.log('TARGETS:', JSON.stringify(targets, null, 2));

  const areas = await prisma.pipeline_settings.findUnique({ where: { key: 'PIC_AREAS' } });
  console.log('PIC_AREAS:', JSON.stringify(areas, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
