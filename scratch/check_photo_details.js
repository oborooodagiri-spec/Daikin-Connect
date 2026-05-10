const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function checkPhotoDetails() {
  const photos = await prisma.activity_photos.findMany({
    where: { activity_id: 253 },
    take: 5
  });
  
  console.log("Photos for activity 253 (SAMSONITE):");
  photos.forEach(p => {
    console.log(`ID: ${p.id} | URL: ${p.photo_url} | Caption: ${p.caption}`);
  });

  await prisma.$disconnect();
}

checkPhotoDetails();
