const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function updateToPerPK() {
  console.log("🔄 Updating Shopping List to use PER PK pricing...");

  // 1. Find items that should be per PK (typically PM and Chemical Cleaning for Split/VRV)
  const items = await prisma.shopping_list.findMany({
    where: {
      OR: [
        { item_name: { contains: "PM SPLIT" } },
        { item_name: { contains: "PM AC SPLIT" } },
        { item_name: { contains: "CHEMICAL CLEANING" } },
        { item_name: { contains: "PM VRV" } }
      ]
    }
  });

  console.log(`Found ${items.length} items to update.`);

  for (const item of items) {
    await prisma.shopping_list.update({
      where: { id: item.id },
      data: {
        capacity_unit: "PK",
        capacity_range: "Per PK" // Clear the range since it's linear now
      }
    });
  }

  console.log("✅ Shopping list updated to PK units.");
  await prisma.$disconnect();
}

updateToPerPK().catch(console.error);
