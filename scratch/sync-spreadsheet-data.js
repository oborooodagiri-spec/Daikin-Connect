const { PrismaClient } = require('../src/generated/client_v3');
const fs = require('fs');

const prisma = new PrismaClient();
const PROJECT_ID = 1n;

const months = { 'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11 };

function parseIndonesianDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.toLowerCase().replace(/,/g, '').split(/[\s-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    
    let month = -1;
    for (const [m, val] of Object.entries(months)) {
      if (m.startsWith(monthStr) || monthStr.startsWith(m.substring(0,3))) {
        month = val;
        break;
      }
    }
    if (day && month !== -1 && year) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  return null;
}

function normalize(str) {
  if (!str) return '';
  return str.toString().toUpperCase()
    .replace(/TENANT/g, '')
    .replace(/UNIT/g, '')
    .replace(/FCU/g, '')
    .replace(/AHU/g, '')
    .replace(/SPLIT/g, '')
    .replace(/DUCT/g, '')
    .replace(/WALL/g, '')
    .replace(/AREA/g, '')
    .replace(/LT\d+/g, '')
    .replace(/FLOOR\d+/g, '')
    .replace(/[^\w\d]/g, '')
    .trim();
}

function parseCSVLine(text) {
  let result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

let allUnits = [];

function findUnitByString(str) {
  if (!str) return null;
  const norm = normalize(str);
  if (!norm || norm.length < 3) return null;

  let unit = allUnits.find(u => normalize(u.tag_number) === norm);
  if (unit) return unit;
  unit = allUnits.find(u => normalize(u.room_tenant) === norm);
  if (unit) return unit;
  unit = allUnits.find(u => normalize(u.room_tenant).includes(norm));
  if (unit) return unit;
  unit = allUnits.find(u => norm.includes(normalize(u.room_tenant)));
  if (unit) return unit;

  // Exact fallback check for stuff like "HOUSE OF ULTIMA 002" missing the "II"
  const strippedNorm = norm.replace(/I/g, ''); 
  unit = allUnits.find(u => normalize(u.room_tenant).replace(/I/g, '') === strippedNorm);
  if (unit) return unit;

  return null;
}

async function main() {
  console.log("=== SPREADSHEET SYNC & MERGE DUPLICATES ===");
  
  allUnits = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID }
  });

  const fileContent = fs.readFileSync('scratch/plaza_report.csv', 'utf8');
  const lines = fileContent.split(/\r?\n/);
  
  let currentDate = null;
  let stats = { unitsUpdated: 0, unitsCreated: 0, actsMerged: 0, actsUpdated: 0, actsCreated: 0 };

  // Skip the first few header lines (start around line 5 or 6)
  for (let i = 4; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = parseCSVLine(line);
    // Expected cols: 0:No, 1:Tanggal, 2:Floor, 3:Tenant, 4:Brand, 5:Model, 6:Jenis Unit, 7:Category Finding, 8:Finding, 9:Rekomendasi
    if (row.length < 10) continue;

    if (row[1] && row[1].match(/\d+\s+[a-zA-Z]+\s+\d+/)) {
      currentDate = parseIndonesianDate(row[1]);
    }

    const tenantName = row[3];
    if (!tenantName || tenantName.toUpperCase() === 'TENANT / AREA') continue;

    let matchedUnit = findUnitByString(tenantName);
    
    const unitTypeMap = {
      'FCU': 'FCU', 'AHU': 'AHU', 'AC SPLIT': 'SPLIT WALL', 'SPLIT': 'SPLIT DUCT'
    };
    let parsedUnitType = 'Unknown';
    for (const [k, v] of Object.entries(unitTypeMap)) {
      if (row[6] && row[6].toUpperCase().includes(k)) {
        parsedUnitType = v; break;
      }
    }

    if (!matchedUnit) {
      console.log(`[NEW UNIT] Creating unit: ${tenantName}`);
      matchedUnit = await prisma.units.create({
        data: {
          project_ref_id: PROJECT_ID,
          room_tenant: tenantName,
          unit_type: parsedUnitType,
          building_floor: row[2] || '',
          brand: row[4] || '',
          model: row[5] || '',
          status: 'Normal'
        }
      });
      allUnits.push(matchedUnit);
      stats.unitsCreated++;
    } else {
      // Update unit info
      await prisma.units.update({
        where: { id: matchedUnit.id },
        data: {
          building_floor: row[2] || matchedUnit.building_floor,
          brand: row[4] || matchedUnit.brand,
          model: row[5] || matchedUnit.model,
          unit_type: parsedUnitType !== 'Unknown' ? parsedUnitType : matchedUnit.unit_type
        }
      });
      stats.unitsUpdated++;
    }

    // Process Activities
    if (currentDate) {
      // Search for Preventive activities for this unit on this date
      const activities = await prisma.service_activities.findMany({
        where: {
          unit_id: matchedUnit.id,
          type: 'Preventive',
          service_date: {
            gte: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000), // Day before just in case
            lte: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)  // Day after
          },
          deleted_at: null
        },
        include: { activity_photos: true },
        orderBy: { created_at: 'asc' }
      });

      const techJson = JSON.stringify({
        finding: row[8] || "-",
        recommendation: row[9] || "-",
        parameters: {}
      });
      const techAdvice = `Finding: ${row[8] || "-"}\nRecommendation: ${row[9] || "-"}`;

      if (activities.length === 0) {
        // Create new
        await prisma.service_activities.create({
          data: {
            unit_id: matchedUnit.id,
            type: 'Preventive',
            service_date: currentDate,
            status: 'Final_Approved',
            inspector_name: 'Daikin Service Team',
            technical_json: techJson,
            technical_advice: techAdvice
          }
        });
        stats.actsCreated++;
      } else {
        // Update the primary activity
        const primaryActivity = activities[0];
        
        await prisma.service_activities.update({
          where: { id: primaryActivity.id },
          data: {
            technical_json: techJson,
            technical_advice: techAdvice,
            service_date: currentDate // Force exact date alignment
          }
        });
        stats.actsUpdated++;

        // Merge and delete duplicates
        if (activities.length > 1) {
          for (let j = 1; j < activities.length; j++) {
            const dup = activities[j];
            // Move photos to primary
            if (dup.activity_photos && dup.activity_photos.length > 0) {
              await prisma.activity_photos.updateMany({
                where: { activity_id: dup.id },
                data: { activity_id: primaryActivity.id }
              });
            }
            // Move primary photo URL if primary doesn't have one
            if (!primaryActivity.photo_url && dup.photo_url) {
              await prisma.service_activities.update({
                where: { id: primaryActivity.id },
                data: { photo_url: dup.photo_url }
              });
              primaryActivity.photo_url = dup.photo_url; // Update local reference
            }
            // Delete duplicate
            await prisma.service_activities.delete({ where: { id: dup.id } });
            stats.actsMerged++;
          }
        }
      }
    }
  }

  console.log("=== SYNC COMPLETE ===");
  console.log(`Units Created: ${stats.unitsCreated}`);
  console.log(`Units Updated: ${stats.unitsUpdated}`);
  console.log(`Activities Created: ${stats.actsCreated}`);
  console.log(`Activities Updated: ${stats.actsUpdated}`);
  console.log(`Activities Merged & Deleted: ${stats.actsMerged}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
