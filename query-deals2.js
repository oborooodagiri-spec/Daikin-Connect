
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const latestActs = await prisma.pipeline_deals.findMany({ 
    orderBy: { created_at: "desc" },
    take: 5
  });
  console.log("Latest pipeline_deals (created_at):", latestActs.map(a => a.created_at));
}
main().finally(() => prisma.$disconnect());

