
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const roles = await prisma.roles.findMany({
      select: { id: true, role_name: true }
    });
    console.log('--- REGISTERED ROLES ---');
    roles.forEach(r => console.log(`- ${r.role_name} (ID: ${r.id})`));
  } catch (err) {
    console.error('Error fetching roles:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
