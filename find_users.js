const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function findUsers() {
  // Find users that might be related to Heartology (customer_id: 5)
  // Note: users table doesn't have customer_id directly, but maybe by email or company_name
  const users = await prisma.users.findMany({
    where: {
      OR: [
        { email: { contains: 'heartology' } },
        { company_name: { contains: 'Heartology' } }
      ]
    }
  });
  console.log(JSON.stringify(users, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  await prisma.$disconnect();
}

findUsers().catch(console.error);
