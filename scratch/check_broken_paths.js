const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function checkUndefinedPaths() {
  console.log("Checking for 'undefined' in photo_url paths...");
  
  const activityPhotos = await prisma.activity_photos.findMany({
    where: {
      photo_url: { contains: 'undefined' }
    }
  });

  const activities = await prisma.service_activities.findMany({
    where: {
      photo_url: { contains: 'undefined' }
    }
  });

  const complaints = await prisma.complaints.findMany({
    where: {
      photo_url: { contains: 'undefined' }
    }
  });

  console.log(`Found ${activityPhotos.length} activity_photos with 'undefined' path.`);
  console.log(`Found ${activities.length} service_activities with 'undefined' path.`);
  console.log(`Found ${complaints.length} complaints with 'undefined' path.`);

  if (activityPhotos.length > 0) {
    console.log("\nSample Broken Path (activity_photos):");
    console.log(activityPhotos[0].photo_url);
  }

  await prisma.$disconnect();
}

checkUndefinedPaths();
