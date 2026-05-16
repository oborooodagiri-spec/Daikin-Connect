const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function simulateDashboard() {
  const projectId = "5";
  const unitWhere = {
    project_ref_id: BigInt(projectId)
  };

  console.log("🚀 Simulating getDashboardData count...");
  const totalUnits = await prisma.units.count({ where: unitWhere });
  console.log(`Result: ${totalUnits}`);

  console.log("\n--- Breakdown by Status ---");
  const stats = await prisma.units.groupBy({
    by: ["status"],
    where: unitWhere,
    _count: true
  });
  console.log(JSON.stringify(stats, null, 2));

  await prisma.$disconnect();
}

simulateDashboard().catch(console.error);
