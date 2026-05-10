const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe("UPDATE projects SET enabled_unit_types = 'Chiller,AC SPLIT,AC STANDING,AHU,FCU,Split,SPLIT DUCT,VRV' WHERE id = 1");
    console.log("Successfully updated Plaza Indonesia configuration.");
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
