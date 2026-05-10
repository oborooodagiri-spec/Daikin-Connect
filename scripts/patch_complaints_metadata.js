const { PrismaClient } = require("../src/generated/client_v2");
const prisma = new PrismaClient();

async function patchComplaints() {
  console.log("🚀 Starting Complaint Metadata Patch...");

  try {
    // 1. Find all activities from the complaint sync
    const activities = await prisma.service_activities.findMany({
      where: {
        OR: [
          { technical_json: { contains: "Complaint Spreadsheet Sync" } },
          { technical_json: { contains: "complaint_no" } }
        ]
      }
    });

    console.log(`🔍 Found ${activities.length} activities to audit.`);

    let patchedCount = 0;
    for (const activity of activities) {
      let tj = {};
      try {
        tj = typeof activity.technical_json === 'string' 
          ? JSON.parse(activity.technical_json) 
          : (activity.technical_json || {});
      } catch (e) {
        console.warn(`⚠️ Failed to parse technical_json for activity ${activity.id}`);
        continue;
      }

      // Add is_complaint flag
      tj.is_complaint = true;
      
      // Fix attribution if legacy
      let inspector = activity.inspector_name;
      if (inspector && (inspector.includes("Tim Teknisi") || inspector.includes("Plaza Indonesia"))) {
        inspector = "Bulk Synchronized";
      }

      await prisma.service_activities.update({
        where: { id: activity.id },
        data: {
          technical_json: JSON.stringify(tj),
          inspector_name: inspector,
          type: "Corrective" // Ensure they stay as Corrective but with is_complaint flag
        }
      });

      patchedCount++;
    }

    console.log(`✅ Patched ${patchedCount} activities with complaint metadata.`);

    // 2. Fix Legacy Corrective table too
    const legacy = await prisma.corrective.updateMany({
      where: {
        OR: [
          { technician_name: { contains: "Tim Teknisi" } },
          { technician_name: { contains: "Plaza Indonesia" } }
        ]
      },
      data: {
        technician_name: "Bulk Synchronized"
      }
    });
    console.log(`✅ Updated ${legacy.count} legacy corrective records.`);

  } catch (error) {
    console.error("❌ Patch Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

patchComplaints();
