require('dotenv').config();
const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function run() {
  console.log("Starting data cleanup for renamed users...");

  // 1. Sync pipeline_deals pic names with current users.name based on pic_id
  const deals = await prisma.pipeline_deals.findMany({
    where: { pic_id: { not: null } },
    select: { id: true, pic: true, pic_id: true }
  });

  const users = await prisma.users.findMany({
    select: { id: true, name: true }
  });

  const userMap = {};
  users.forEach(u => userMap[u.id] = u.name);

  let updatedDeals = 0;
  for (const deal of deals) {
    const currentUserName = userMap[deal.pic_id];
    if (currentUserName && currentUserName !== deal.pic) {
      console.log(`Fixing deal ${deal.id}: ${deal.pic} -> ${currentUserName}`);
      await prisma.pipeline_deals.update({
        where: { id: deal.id },
        data: { pic: currentUserName }
      });
      updatedDeals++;
    }
  }
  console.log(`Updated ${updatedDeals} deals.`);

  // 2. Clean up TARGETS and PIC_AREAS
  // Remove keys that do NOT match any active user name (and don't have closed deals maybe?)
  // Actually, if a name doesn't exist in users table, it's either an old name or a deleted user.
  // If the admin already set the target for the NEW name, the OLD name's target is a duplicate and should be removed.
  
  const activeNames = users.map(u => u.name);
  
  const targetSettings = await prisma.pipeline_settings.findUnique({ where: { key: "TARGETS" } });
  if (targetSettings && targetSettings.value) {
    const val = typeof targetSettings.value === 'string' ? JSON.parse(targetSettings.value) : targetSettings.value;
    if (val.byPic) {
      let changed = false;
      for (const name of Object.keys(val.byPic)) {
        if (!activeNames.includes(name)) {
          console.log(`Removing old/invalid name from TARGETS: ${name}`);
          delete val.byPic[name];
          changed = true;
        }
      }
      if (changed) {
        await prisma.pipeline_settings.update({
          where: { key: "TARGETS" },
          data: { value: val }
        });
        console.log("Updated TARGETS in pipeline_settings.");
      }
    }
  }

  const picAreas = await prisma.pipeline_settings.findUnique({ where: { key: "PIC_AREAS" } });
  if (picAreas && picAreas.value) {
    const val = typeof picAreas.value === 'string' ? JSON.parse(picAreas.value) : picAreas.value;
    let changed = false;
    for (const name of Object.keys(val)) {
      if (!activeNames.includes(name)) {
        console.log(`Removing old/invalid name from PIC_AREAS: ${name}`);
        delete val[name];
        changed = true;
      }
    }
    if (changed) {
      await prisma.pipeline_settings.update({
        where: { key: "PIC_AREAS" },
        data: { value: val }
      });
      console.log("Updated PIC_AREAS in pipeline_settings.");
    }
  }

  console.log("Cleanup complete!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
