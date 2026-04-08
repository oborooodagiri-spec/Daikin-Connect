const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    const count = await prisma.service_activities.count();
    console.log("Success! Total service_activities:", count);
    
    const sample = await prisma.service_activities.findFirst();
    console.log("Sample record:", sample ? "Found" : "No records found");
    
    const correctiveCount = await prisma.corrective.count();
    console.log("Total corrective(legacy):", correctiveCount);
  } catch (e) {
    console.error("Database connection failed!");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
