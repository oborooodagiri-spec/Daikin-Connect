const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function fixPicIds() {
  try {
    const users = await prisma.users.findMany();
    const deals = await prisma.pipeline_deals.findMany({
      where: { pic_id: null, pic: { not: null } }
    });
    
    console.log(`Found ${deals.length} deals with null pic_id but has pic.`);
    
    let updatedCount = 0;
    for (const deal of deals) {
      if (!deal.pic || deal.pic.trim() === '') continue;
      
      const matchedUser = users.find(u => u.name.toLowerCase() === deal.pic.trim().toLowerCase());
      if (matchedUser) {
        await prisma.pipeline_deals.update({
          where: { id: deal.id },
          data: { pic_id: matchedUser.id }
        });
        updatedCount++;
      }
    }
    console.log(`Successfully updated ${updatedCount} deals with correct pic_id.`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
fixPicIds();
