/**
 * ENRICH UNITS FOR PLAZA INDONESIA
 * Populates missing unit details for units created during bulk sync or earlier
 */

const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function main() {
  const PROJECT_ID = BigInt(1);
  
  console.log("=== ENRICHING UNITS (OPTIMIZED) - Plaza Indonesia ===");
  
  // 1. Fetch all units
  const units = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID }
  });
  
  console.log(`Found ${units.length} units to check...`);

  // 2. Fetch latest activity dates for ALL units in one go (or chunked)
  const latestActivities = await prisma.service_activities.groupBy({
    by: ['unit_id'],
    _max: { service_date: true },
    where: { units: { project_ref_id: PROJECT_ID }, deleted_at: null }
  });

  const dateMap = {};
  latestActivities.forEach(a => {
    if (a.unit_id) dateMap[a.unit_id] = a._max.service_date;
  });
  
  let updated = 0;
  
  for (const unit of units) {
    let needsUpdate = false;
    const updateData = {};
    
    if (!unit.customer_name) { updateData.customer_name = "Plaza Indonesia"; needsUpdate = true; }
    if (!unit.customer_group) { updateData.customer_group = "RETAIL"; needsUpdate = true; }
    if (!unit.location) { updateData.location = "Jakarta"; needsUpdate = true; }
    if (!unit.unit_type || unit.unit_type === "") { updateData.unit_type = "FCU"; needsUpdate = true; }
    
    const cleanBrand = (unit.brand || "DAIKIN").trim().toUpperCase();
    if (unit.brand !== cleanBrand) { updateData.brand = cleanBrand; needsUpdate = true; }
    
    if (unit.status === "Pending" || !unit.status) { updateData.status = "Normal"; needsUpdate = true; }
    
    // Capacity guessing from model
    if (!unit.capacity || unit.capacity === "") {
      const model = (unit.model || "").toUpperCase();
      let guessedCap = null;
      if (model.includes(" 30")) guessedCap = "30,000 BTU";
      else if (model.includes(" 60")) guessedCap = "60,000 BTU";
      else if (model.includes(" 40")) guessedCap = "40,000 BTU";
      else if (model.includes(" 75")) guessedCap = "75,000 BTU";
      
      if (guessedCap) {
        updateData.capacity = guessedCap;
        needsUpdate = true;
      }
    }

    const latestDate = dateMap[unit.id];
    if (latestDate) {
      const d1 = latestDate.getTime();
      const d2 = unit.last_service_date?.getTime() || 0;
      if (d1 > d2) {
        updateData.last_service_date = latestDate;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      await prisma.units.update({
        where: { id: unit.id },
        data: updateData
      });
      updated++;
    }
  }
  
  console.log(`\nFinished. Updated ${updated} units.`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
