
const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();
async function main() {
  const latest1 = await prisma.logsheet_entries.findFirst({ orderBy: { created_at: "desc" } }).catch(()=>null);
  console.log("Latest logsheet_entries created at:", latest1?.created_at);
  const latest2 = await prisma.daily_ops_logs.findFirst({ orderBy: { created_at: "desc" } }).catch(()=>null);
  console.log("Latest daily_ops_logs created at:", latest2?.created_at);
}
main().finally(() => prisma.$disconnect());

