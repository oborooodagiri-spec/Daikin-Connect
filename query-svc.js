
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const allActs = await prisma.service_activities.findMany({ 
    orderBy: { created_at: "desc" },
    take: 10
  });
  console.log("Latest activities:", allActs.map(a => a.created_at));
}
main().finally(() => prisma.$disconnect());

