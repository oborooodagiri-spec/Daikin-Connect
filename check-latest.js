
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const latestDeal = await prisma.pipeline_deals.findFirst({ orderBy: { updated_at: "desc" } });
  console.log("Latest deal updated at:", latestDeal?.updated_at);
  const latestLogsheet = await prisma.logsheets.findFirst({ orderBy: { created_at: "desc" } });
  console.log("Latest logsheet created at:", latestLogsheet?.created_at);
}
main().finally(() => prisma.$disconnect());

