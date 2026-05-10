const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function find() {
  try {
    const units = await prisma.units.findMany({
      take: 5
    });
    console.log("UNITS_FOUND:", JSON.stringify(units, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

find();
