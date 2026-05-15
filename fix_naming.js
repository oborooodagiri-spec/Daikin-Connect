const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function fixNaming() {
  const PROJECT_ID = 5n;
  console.log("🏷️ Syncing room_tenant with area for better display...");

  const units = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID }
  });

  for (const unit of units) {
    if (unit.area) {
      await prisma.units.update({
        where: { id: unit.id },
        data: {
          room_tenant: unit.area // Use area as the primary name
        }
      });
    }
  }

  console.log("✅ Naming sync complete.");
  await prisma.$disconnect();
}

fixNaming().catch(console.error);
