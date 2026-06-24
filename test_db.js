const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();
async function run() {
  const data = await prisma.$queryRawUnsafe('SELECT customer_signature FROM service_activities WHERE id = 7144');
  console.log("SIGNATURE:", data[0].customer_signature ? data[0].customer_signature.substring(0, 50) : "NULL");
}
run();
