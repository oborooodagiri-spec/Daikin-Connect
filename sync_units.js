const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function syncFields() {
  console.log("🔄 Syncing project_id string and fixing tag numbers...");
  
  const units = await prisma.units.findMany({
    where: { project_ref_id: 5n }
  });

  for (const unit of units) {
    let newTag = unit.tag_number;
    if (newTag.includes("CT ")) {
      newTag = newTag.replace("CT ", "CTS");
    }

    await prisma.units.update({
      where: { id: unit.id },
      data: {
        project_id: "5", // Sync string ID
        tag_number: newTag
      }
    });
  }

  console.log("✅ Sync complete.");
  await prisma.$disconnect();
}

syncFields().catch(console.error);
