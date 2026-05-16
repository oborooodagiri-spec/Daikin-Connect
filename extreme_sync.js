const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function extremeSync() {
  const PROJECT_ID = 5n;
  console.log("🚀 Performing extreme sync for Heartology units...");

  // 1. Get all units for this project
  const units = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID }
  });

  console.log(`Found ${units.length} units in DB.`);

  // 2. Update each unit to have a very standard unit_type
  for (const unit of units) {
    let type = "VRV";
    if (unit.model.toLowerCase().includes("outdoor")) type = "Outdoor";
    if (unit.model.toLowerCase().includes("split duct")) type = "Split Duct";
    
    await prisma.units.update({
      where: { id: unit.id },
      data: {
        unit_type: type,
        project_id: "5",
        status: "Normal"
      }
    });
  }

  // 3. Update project to enable these exact types
  await prisma.projects.update({
    where: { id: PROJECT_ID },
    data: {
      enabled_unit_types: "VRV,Outdoor,Split Duct,Chiller,AHU,FCU",
      enabled_forms: "Audit,Preventive,Corrective,DailyLog"
    }
  });

  console.log("✅ Extreme sync complete. All units normalized.");
  await prisma.$disconnect();
}

extremeSync().catch(console.error);
