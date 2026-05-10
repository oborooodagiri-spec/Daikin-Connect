const { PrismaClient } = require('../src/generated/client_v2');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  // Count activity_photos for audit reports
  const totalPhotos = await prisma.activity_photos.count({
    where: { type: 'AUDIT' }
  });
  console.log('Total AUDIT photos in DB:', totalPhotos);

  // How many audits have photos?
  const auditsWithPhotos = await prisma.service_activities.findMany({
    where: { 
      type: 'Audit',
      activity_photos: { some: {} },
      deleted_at: null
    },
    select: { id: true, location: true },
  });
  console.log('Audits with at least 1 photo:', auditsWithPhotos.length);

  // Top 5 audits by photo count
  const topAudits = await prisma.service_activities.findMany({
    where: { type: 'Audit', deleted_at: null },
    include: { 
      _count: { select: { activity_photos: true } },
      units: { select: { room_tenant: true } }
    },
    orderBy: { activity_photos: { _count: 'desc' } },
    take: 10
  });

  console.log('\nTop 10 audits by photo count:');
  topAudits.forEach(a => {
    console.log(`  ID: ${a.id} | ${a.location || a.units?.room_tenant} | Photos: ${a._count.activity_photos}`);
  });

  // Check upload directory
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audit');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter(f => f.startsWith('audit_'));
    const totalSize = files.reduce((sum, f) => sum + fs.statSync(path.join(uploadDir, f)).size, 0);
    console.log(`\nUpload directory: ${files.length} files, ${(totalSize/1024/1024).toFixed(1)}MB`);
    
    // Sample file sizes
    const sample = files.slice(0, 3);
    sample.forEach(f => {
      const size = fs.statSync(path.join(uploadDir, f)).size;
      console.log(`  ${f} - ${(size/1024).toFixed(0)}KB`);
    });
  }

  // Verify a photo URL works
  const samplePhoto = await prisma.activity_photos.findFirst({
    where: { type: 'AUDIT' },
    select: { photo_url: true, caption: true, notes: true, activity_id: true }
  });
  if (samplePhoto) {
    const fullPath = path.join(uploadDir, samplePhoto.photo_url);
    const exists = fs.existsSync(fullPath);
    console.log(`\n✅ Sample photo: "${samplePhoto.photo_url}"`);
    console.log(`   Caption: ${samplePhoto.caption}`);
    console.log(`   Notes: ${samplePhoto.notes}`);
    console.log(`   File exists: ${exists}`);
    console.log(`   API URL: /api/assets/audit/${samplePhoto.photo_url}`);
  }

  await prisma.$disconnect();
}
main();
