
require('dotenv').config();
const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

async function checkSyncStats() {
  console.log("=== COMPLAINT SYNC AUDIT ===");
  
  try {
    const totalCorrective = await prisma.service_activities.count({
      where: { type: "Corrective" }
    });
    
    const bulkSynced = await prisma.service_activities.findMany({
      where: {
        technical_json: { contains: "Complaint Spreadsheet Sync" }
      }
    });

    const complaintNos = new Set();
    bulkSynced.forEach(act => {
      try {
        const tj = JSON.parse(act.technical_json);
        if (tj.complaint_no) complaintNos.add(tj.complaint_no);
      } catch (e) {}
    });

    console.log(`Total Corrective Reports: ${totalCorrective}`);
    console.log(`Total Bulk Synced Complaints (records): ${bulkSynced.length}`);
    console.log(`Unique Complaint Numbers found: ${complaintNos.size}`);
    
    // Check for units created by sync
    const syncedUnits = await prisma.units.findMany({
      where: {
        tag_number: { startsWith: "DKN" }
      },
      include: {
        _count: {
          select: { service_activities: { where: { technical_json: { contains: "Complaint Spreadsheet Sync" } } } }
        }
      }
    });

    const unitsWithComplaints = syncedUnits.filter(u => u._count.service_activities > 0);
    console.log(`Units involved in sync: ${unitsWithComplaints.length}`);

    // Check for "Tim Teknisi PI" leftovers
    const leftoverTechnicians = await prisma.service_activities.count({
      where: {
        inspector_name: { contains: "Tim Teknisi PI" }
      }
    });
    console.log(`Records still labeled 'Tim Teknisi PI': ${leftoverTechnicians}`);

  } catch (err) {
    console.error("Database Query Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSyncStats();
