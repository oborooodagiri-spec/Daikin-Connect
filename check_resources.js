const { PrismaClient } = require('./src/generated/client_v3/index.js');
const prisma = new PrismaClient();
async function main() {
  const all = await prisma.knowledge_resources.findMany();
  console.log(JSON.stringify(all, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
