import { PrismaClient } from './src/generated/client_v3';
const prisma = new PrismaClient();

async function main() {
  const deal = await prisma.pipeline_deals.findFirst();
  console.log("Keys:");
  console.log(Object.keys(deal || {}));
}

main().catch(console.error).finally(() => prisma.$disconnect());
