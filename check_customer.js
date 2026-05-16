const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkCustomer() {
  const customer = await prisma.customers.findUnique({
    where: { id: 5 }
  });
  console.log(JSON.stringify(customer, null, 2));
  await prisma.$disconnect();
}

checkCustomer().catch(console.error);
