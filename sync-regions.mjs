import { PrismaClient } from './src/generated/client_v3/index.js';

const prisma = new PrismaClient();

async function run() {
  try {
    const record = await prisma.pipeline_settings.findUnique({
      where: { key: "PIC_AREAS" }
    });
    
    if (record?.value) {
      const mapping = record.value;
      let count = 0;
      for (const [picName, region] of Object.entries(mapping)) {
        if (picName && region) {
          const res = await prisma.pipeline_deals.updateMany({
            where: { pic: picName },
            data: { region: region }
          });
          console.log(`Updated ${res.count} deals for ${picName} to region ${region}`);
          count += res.count;
        }
      }
      console.log(`Total deals updated: ${count}`);
    } else {
      console.log("No PIC_AREAS mapping found in database.");
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
