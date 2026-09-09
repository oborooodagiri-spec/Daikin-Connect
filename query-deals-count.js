
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const cnt = await prisma.pipeline_deals.count();
  console.log("Total deals:", cnt);
  const nullDates = await prisma.pipeline_deals.count({ where: { target_po_date: null }});
  console.log("Null target_po_date:", nullDates);
}
main().finally(() => prisma.$disconnect());

