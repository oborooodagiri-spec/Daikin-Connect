/**
 * FIX COMPLAINT CATEGORY AND TECHNICIAN NAME
 * 1. Changes "Tim Teknisi PI" to "Bulk Synchronized"
 * 2. Labels them as Complaint clearly in technical_json
 */

const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function main() {
  console.log("=== FIXING COMPLAINT METADATA AND TECHNICIAN NAME ===");
  
  // 1. Identify all synced complaints
  const syncedActivities = await prisma.service_activities.findMany({
    where: {
      technical_json: { contains: "Complaint Spreadsheet Sync" }
    }
  });
  
  console.log(`Found ${syncedActivities.length} activities to fix.`);
  
  let updatedCount = 0;
  
  for (const act of syncedActivities) {
    let tj = {};
    try {
      tj = JSON.parse(act.technical_json);
    } catch (e) {}
    
    // Set explicit complaint flag
    tj.is_complaint = true;
    tj.category_override = "Complaint";
    
    await prisma.service_activities.update({
      where: { id: act.id },
      data: {
        inspector_name: "Bulk Synchronized",
        technical_json: JSON.stringify(tj)
      }
    });
    
    // Also update the corrective table if it exists
    await prisma.corrective.updateMany({
      where: {
        unit_id: act.unit_id,
        service_date: act.service_date,
        technician_name: "Tim Teknisi PI"
      },
      data: {
        technician_name: "Bulk Synchronized"
      }
    });
    
    updatedCount++;
    if (updatedCount % 50 === 0) console.log(`  Fixed ${updatedCount} records...`);
  }
  
  console.log(`\nSuccess. Fixed ${updatedCount} service activities.`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
