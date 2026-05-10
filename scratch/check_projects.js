const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const projects = await prisma.projects.findMany({
      include: { customers: true }
    });
    console.log(`Found ${projects.length} projects`);
    if (projects.length > 0) {
      console.log('Sample project:', projects[0].name);
    }

    const customers = await prisma.customers.count();
    console.log(`Found ${customers} customers`);
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
