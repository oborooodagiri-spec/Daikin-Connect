const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting cleanup of duplicate reports...");

  // Find all service_activities grouped by unit_id, service_date, type
  // Note: For Preventive, we also want to differentiate by unit_type if possible
  const duplicates = await prisma.$queryRaw`
    SELECT a.unit_id, a.service_date, a.type, u.unit_type, COUNT(*) as count
    FROM service_activities a
    JOIN units u ON a.unit_id = u.id
    WHERE a.deleted_at IS NULL
    GROUP BY a.unit_id, a.service_date, a.type, u.unit_type
    HAVING COUNT(*) > 1
  `;

  console.log(`Found ${duplicates.length} sets of duplicates.`);

  for (const group of duplicates) {
    const activities = await prisma.service_activities.findMany({
      where: {
        unit_id: group.unit_id,
        service_date: group.service_date,
        type: group.type,
        deleted_at: null,
        units: {
          unit_type: group.unit_type
        }
      },
      orderBy: { id: 'asc' }
    });

    if (activities.length <= 1) continue;
    
    // For Corrective vs Complaint, we should check technical_json
    // But for now, let's just handle the Preventive separation which is the main concern
    
    const primary = activities[0];
    const others = activities.slice(1);

    console.log(`Merging ${activities.length} reports for Unit ${group.unit_id} (${group.unit_type}) on ${group.service_date} (${group.type})...`);

    let mergedNote = primary.engineer_note || "";
    let mergedAdvice = primary.technical_advice || "";
    let mergedJson = JSON.parse(primary.technical_json || "{}");

    for (const other of others) {
      if (other.engineer_note && !mergedNote.includes(other.engineer_note)) {
        mergedNote += " | " + other.engineer_note;
      }
      if (other.technical_advice && !mergedAdvice.includes(other.technical_advice)) {
        mergedAdvice += " | " + other.technical_advice;
      }
      
      // Basic JSON merging
      const otherJson = JSON.parse(other.technical_json || "{}");
      mergedJson = { ...mergedJson, ...otherJson };
      
      // Soft delete the other record
      await prisma.service_activities.update({
        where: { id: other.id },
        data: { deleted_at: new Date() }
      });
    }

    // Update primary record
    await prisma.service_activities.update({
      where: { id: primary.id },
      data: {
        engineer_note: mergedNote,
        technical_advice: mergedAdvice,
        technical_json: JSON.stringify(mergedJson)
      }
    });
  }

  console.log("Cleanup complete!");
  await prisma.$disconnect();
}

cleanup();
