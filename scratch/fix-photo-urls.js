const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== BULK FIXING PLAZA PHOTO URLS (OPTIMIZED) ===");

  const mapping = [
    { model: 'activity_photos', type: 'PREVENTIVE', folder: 'preventive' },
    { model: 'activity_photos', type: 'CORRECTIVE', folder: 'corrective' },
    { model: 'activity_photos', type: 'AUDIT', folder: 'audit' },
    { model: 'activity_photos', type: 'COMPLAINT', folder: 'complaints' },
  ];

  for (const m of mapping) {
    console.log(`Processing ${m.model} [${m.type}]...`);
    const items = await prisma[m.model].findMany({
        where: {
            type: m.type,
            photo_url: { not: { startsWith: '/' } }
        },
        select: { id: true, photo_url: true }
    });
    
    console.log(`  Updating ${items.length} items...`);
    // Unfortunately, SQLite/Prisma doesn't support bulk update with computed values easily
    // But we can do it in chunks to avoid blocking
    for (let i = 0; i < items.length; i += 100) {
        const chunk = items.slice(i, i + 100);
        await Promise.all(chunk.map(item => 
            prisma[m.model].update({
                where: { id: item.id },
                data: { photo_url: `/api/assets/${m.folder}/${item.photo_url}` }
            })
        ));
        process.stdout.write('.');
    }
    console.log('\nDone.');
  }

  // 2. Service Activities
  console.log("Processing Service Activities...");
  const acts = await prisma.service_activities.findMany({
      where: { photo_url: { not: { startsWith: '/' }, not: null } },
      select: { id: true, photo_url: true, type: true }
  });
  for (const act of acts) {
      let folder = 'preventive';
      if (act.type === 'Corrective') folder = 'corrective';
      if (act.type === 'Audit') folder = 'audit';
      await prisma.service_activities.update({
          where: { id: act.id },
          data: { photo_url: `/api/assets/${folder}/${act.photo_url}` }
      });
  }

  console.log("=== FIX COMPLETE ===");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
