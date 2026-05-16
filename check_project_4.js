const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function checkProject() {
  const p = await prisma.projects.findUnique({
    where: { id: 4n },
    select: { id: true, name: true, latitude: true, longitude: true, radius_meters: true }
  });
  console.log("Project 4 Data:", JSON.stringify(p, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  await prisma.$disconnect();
}

checkProject();
