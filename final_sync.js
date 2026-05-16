const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function finalSync() {
  const PROJECT_ID = 5n;
  console.log("🛠️ Final unit type and floor sync...");

  // Force all units to have 'Normal' status and ensure project IDs are synced
  const result = await prisma.units.updateMany({
    where: { project_ref_id: PROJECT_ID },
    data: {
      status: "Normal",
      project_id: "5"
    }
  });

  console.log(`✅ Updated ${result.count} units.`);
  
  // Update project settings to be very broad
  await prisma.projects.update({
    where: { id: PROJECT_ID },
    data: {
      enabled_unit_types: "Chiller,VRV,VRF,Split Duct,AC Split Duct,Outdoor,AC Split Duct VRV,AC Split Duct VRF",
      enabled_forms: "Audit,Preventive,Corrective,DailyLog"
    }
  });
  console.log("✅ Project settings broadened.");

  await prisma.$disconnect();
}

finalSync().catch(console.error);
