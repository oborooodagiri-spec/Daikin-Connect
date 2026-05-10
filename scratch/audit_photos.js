const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function audit() {
  const projectRefId = 1; // Plaza Indonesia

  console.log('--- Photo Audit: Plaza Indonesia ---');

  // 1. Preventive (FCU, AHU, Split)
  const pmActivities = await prisma.service_activities.findMany({
    where: { 
      type: 'Preventive',
      units: { project_ref_id: projectRefId }
    },
    include: { activity_photos: true, units: true }
  });

  const pmWithPhotos = pmActivities.filter(a => a.activity_photos.length > 0);
  console.log(`Preventive: ${pmWithPhotos.length} / ${pmActivities.length} activities have photos.`);
  
  const pmByUnitType = {};
  pmActivities.forEach(a => {
    const type = a.units.unit_type || 'Unknown';
    if (!pmByUnitType[type]) pmByUnitType[type] = { total: 0, withPhotos: 0 };
    pmByUnitType[type].total++;
    if (a.activity_photos.length > 0) pmByUnitType[type].withPhotos++;
  });
  console.log('By Unit Type:', pmByUnitType);

  // 2. Corrective (Service Activities)
  const corrActivities = await prisma.service_activities.findMany({
    where: { 
      type: 'Corrective',
      units: { project_ref_id: projectRefId }
    },
    include: { activity_photos: true }
  });
  const corrWithPhotos = corrActivities.filter(a => a.activity_photos.length > 0);
  console.log(`Corrective (Activities): ${corrWithPhotos.length} / ${corrActivities.length} activities have photos.`);

  // 3. Corrective (Corrective Table)
  const corrRecords = await prisma.corrective.findMany({
    where: { units: { project_ref_id: projectRefId } }
  });
  const corrRecWithPhotos = corrRecords.filter(r => r.photo_url);
  console.log(`Corrective (Table): ${corrRecWithPhotos.length} / ${corrRecords.length} records have photos.`);

  // 4. Complaints
  const complaints = await prisma.complaints.findMany({
    where: { units: { project_ref_id: projectRefId } }
  });
  const complaintsWithPhotos = complaints.filter(c => c.photo_url);
  console.log(`Complaints: ${complaintsWithPhotos.length} / ${complaints.length} records have photos.`);

  await prisma.$disconnect();
}

audit().catch(console.error);
