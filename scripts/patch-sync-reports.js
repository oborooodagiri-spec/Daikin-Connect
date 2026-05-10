const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Patching bulk-synced technical_json fields...");
  
  const activities = await prisma.service_activities.findMany({
    where: {
      technical_json: { contains: "Local Script" }
    },
    include: {
      units: true
    }
  });

  console.log(`Found ${activities.length} records to patch.`);

  let patched = 0;
  for (const act of activities) {
    try {
      const currentTj = JSON.parse(act.technical_json || "{}");
      
      // Reconstruct header and technicalAdvice for the report generator
      const newTj = {
        ...currentTj,
        header: {
          room_tenant: act.units?.room_tenant || "-",
          date: act.service_date ? act.service_date.toISOString() : null,
          model: act.units?.model || "-",
          unit_number: act.units?.tag_number || act.unit_tag || "-",
          location: act.location || act.units?.location || "-",
          team_opt: act.inspector_name || "Local Bulk Sync",
          serial_number: act.units?.serial_number || "-",
          nominal_capacity: act.units?.capacity || "-",
          so_number: "-"
        },
        technicalAdvice: act.technical_advice || "-",
        // We can also initialize an empty scope so it doesn't crash, 
        // though the template handles missing keys with "-"
        scope: {} 
      };

      await prisma.service_activities.update({
        where: { id: act.id },
        data: {
          technical_json: JSON.stringify(newTj)
        }
      });
      patched++;
    } catch (err) {
      console.error(`Error patching record ${act.id}:`, err.message);
    }
  }

  console.log(`Successfully patched ${patched} records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
