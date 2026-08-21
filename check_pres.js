const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
prisma.knowledge_resources.findMany({ where: { category: 'Presentation' } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
