const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function updateTowerAndPump() {
  console.log("🔄 Updating Cooling Tower and Pump units in Shopping List...");

  // Update Cooling Tower to "Cell"
  const towerUpdate = await prisma.shopping_list.updateMany({
    where: { category: "Cooling Tower" },
    data: { capacity_unit: "Cell", capacity_range: "Per Cell" }
  });
  console.log(`✅ Updated ${towerUpdate.count} Cooling Tower items to 'Cell'.`);

  // Update Pump to "Unit"
  const pumpUpdate = await prisma.shopping_list.updateMany({
    where: { category: "Pump" },
    data: { capacity_unit: "Unit", capacity_range: "Per Unit" }
  });
  console.log(`✅ Updated ${pumpUpdate.count} Pump items to 'Unit'.`);

  await prisma.$disconnect();
}

updateTowerAndPump().catch(console.error);
