const { PrismaClient } = require('./src/generated/client_v2');
const fs = require('fs');
const prisma = new PrismaClient();

const CSV_PATH = `C:\\Users\\D22AGRI-EPL\\.gemini\\antigravity\\brain\\a4452ed5-a78b-4ab9-89fd-be3cd2531405\\.system_generated\\steps\\2212\\content.md`;

function parseCSV(content) {
  const lines = content.split('\n');
  const results = [];
  
  // Find where data starts (Look for "No,Date,Category...")
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('No,Date,Category')) {
      startIdx = i + 4; // Data rows start 4 lines after header line (skipping sub-headers)
      break;
    }
  }

  if (startIdx === -1) return [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,,') || line.includes('PT. DAIKIN') || line.includes('PERIODE')) continue;

    // Simple CSV split (handling quoted strings for Capacity)
    const regex = /(".*?"|[^,]+|(?<=,)(?=,)|(?<=^)(?=,))/g;
    const parts = line.match(regex) || [];
    
    if (parts.length < 10) continue;

    const no = parts[0];
    const dateStr = parts[1];
    if (!dateStr || dateStr === 'Date' || dateStr === '') continue;

    results.push({
      date: dateStr,
      floor: parts[3],
      tenant: parts[5],
      brand: parts[6],
      capacity: parts[7]?.replace(/"/g, ''),
      amp_nameplate: parts[8] || "-",
      amp_before_r: parseFloat(parts[9]) || 0,
      amp_before_s: parseFloat(parts[10]) || 0,
      amp_before_t: parseFloat(parts[11]) || 0,
      amp_after_r: parseFloat(parts[12]) || 0,
      amp_after_s: parseFloat(parts[13]) || 0,
      amp_after_t: parseFloat(parts[14]) || 0,
      supply_before: parseFloat(parts[18]) || 0,
      supply_after: parseFloat(parts[19]) || 0,
      return_before: parseFloat(parts[21]) || 0,
      return_after: parseFloat(parts[22]) || 0,
      room_before: parseFloat(parts[24]) || 0,
      room_after: parseFloat(parts[25]) || 0,
      airflow_before: parseFloat(parts[27]) || 0,
      airflow_after: parseFloat(parts[28]) || 0,
      performa: parts[30] || '-',
      remarks: parts[31] || ''
    });
  }
  return results;
}

const PROJECT_REF_ID = 1;

async function sync() {
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const data = parseCSV(content);
  
  console.log(`Parsed ${data.length} records. Starting sync...`);
  
  let createdUnits = 0;
  let linkedActivities = 0;

  for (const row of data) {
    try {
      // 1. Find or Create Unit
      let unit = await prisma.units.findFirst({
        where: {
          project_ref_id: BigInt(PROJECT_REF_ID),
          room_tenant: { contains: row.tenant },
          building_floor: row.floor
        }
      });

      if (!unit) {
        unit = await prisma.units.findFirst({
          where: {
            project_ref_id: BigInt(PROJECT_REF_ID),
            room_tenant: { contains: row.tenant }
          }
        });
      }

      if (!unit) {
        unit = await prisma.units.create({
          data: {
            project_ref_id: BigInt(PROJECT_REF_ID),
            customer_name: "Plaza Indonesia",
            room_tenant: row.tenant,
            building_floor: row.floor,
            unit_type: "Split",
            brand: row.brand,
            model: row.capacity,
            status: "Normal",
            location: "Jakarta"
          }
        });
        createdUnits++;
      }

      // 2. Create or Update Preventive Activity
      const serviceDate = new Date(row.date);
      const activityDate = isNaN(serviceDate.getTime()) ? new Date() : serviceDate;
      
      const existingActivity = await prisma.service_activities.findFirst({
        where: {
          unit_id: unit.id,
          type: "Preventive",
          service_date: activityDate,
          deleted_at: null
        }
      });

      const technicalData = {
        parameters: {
          amp: { 
            nameplate: row.amp_nameplate,
            r: { before: row.amp_before_r, after: row.amp_after_r },
            s: { before: row.amp_before_s, after: row.amp_after_s },
            t: { before: row.amp_before_t, after: row.amp_after_t }
          },
          supply_temp: { before: row.supply_before, after: row.supply_after },
          return_temp: { before: row.return_before, after: row.return_after },
          room_temp: { before: row.room_before, after: row.room_after },
          airflow: { before: row.airflow_before, after: row.airflow_after },
          performa_cfm: row.performa
        },
        source: "Bulk Sync Plaza Indonesia Split"
      };

      if (existingActivity) {
        // MERGE LOGIC
        const oldJson = JSON.parse(existingActivity.technical_json || "{}");
        const mergedJson = { ...oldJson, ...technicalData };
        let mergedNote = existingActivity.engineer_note || "";
        if (row.remarks && !mergedNote.includes(row.remarks)) {
          mergedNote += (mergedNote ? " | " : "") + row.remarks;
        }

        await prisma.service_activities.update({
          where: { id: existingActivity.id },
          data: {
            engineer_note: mergedNote,
            technical_json: JSON.stringify(mergedJson)
          }
        });
      } else {
        await prisma.service_activities.create({
          data: {
            units: { connect: { id: unit.id } },
            type: "Preventive",
            service_date: activityDate,
            amp_r: row.amp_after_r,
            leaving_db: row.supply_after,
            entering_db: row.return_after,
            room_db: row.room_after,
            status: "Pending",
            inspector_name: "Tim Teknisi PI",
            engineer_note: row.remarks,
            technical_json: JSON.stringify(technicalData)
          }
        });
      }
      linkedActivities++;

    } catch (err) {
      console.error(`Error syncing ${row.tenant}:`, err.message);
    }
  }

  console.log(`Sync Complete!`);
  console.log(`New Units Created: ${createdUnits}`);
  console.log(`Activities Logged: ${linkedActivities}`);
  await prisma.$disconnect();
}

sync();
