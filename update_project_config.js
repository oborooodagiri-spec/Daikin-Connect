const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function updateProjectConfig() {
  const PROJECT_ID = 5n;
  console.log("🛠️ Updating project configuration for Heartology...");

  await prisma.projects.update({
    where: { id: PROJECT_ID },
    data: {
      enabled_unit_types: "Chiller,VRV,VRF,Split Duct,AC Split Duct,Outdoor",
      enabled_forms: "Audit,Preventive,Corrective,DailyLog"
    }
  });

  console.log("✅ Project configuration updated.");
  await prisma.$disconnect();
}

updateProjectConfig().catch(console.error);
