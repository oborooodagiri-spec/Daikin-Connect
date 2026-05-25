const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.knowledge_resources.findUnique({where: {id: 'roesmin-logsheet-resource'}});
  console.log(res);
}
main().finally(() => prisma.$disconnect());
