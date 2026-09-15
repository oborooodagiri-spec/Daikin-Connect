const { PrismaClient } = require('./src/generated/client_v3');
const xlsx = require('xlsx');

const prisma = new PrismaClient();
const filePath = 'C:/Users/D22AGRI-EPL/Desktop/daikin-connect-clean/Data Project/Plaza Indonesia/2026/Agustus/PM/PM FCU Agustus 2026.xlsx';
const PROJECT_REF_ID = 1; // Plaza Indonesia

function excelDateToJSDate(excelDate) {
  if (!excelDate || isNaN(excelDate)) return new Date();
  return new Date((excelDate - (25567 + 2)) * 86400 * 1000);
}

function safeString(val) {
  if (val === undefined || val === null || val === '-') return '';
  return String(val).trim();
}

async function sync() {
  console.log(`Reading Excel file...`);
  const workbook = xlsx.readFile(filePath);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
  
  let createdUnits = 0;
  let linkedActivities = 0;
  let skipped = 0;

  console.log(`Starting FCU Preventive sync from Row 9 to ${data.length}...`);

  for (let i = 9; i < data.length; i++) {
    const row = data[i];
    // Skip empty rows or rows without a tenant name/date
    if (!row || !row[1] || !row[5] || row[1] === 'DATE') {
      skipped++;
      continue;
    }

    try {
      const dateStr = excelDateToJSDate(row[1]);
      const floor = safeString(row[3]);
      const area = safeString(row[4]);
      const tenant = safeString(row[5]);
      const brand = safeString(row[6]);
      const model = safeString(row[7]);
      const ampNameplate = safeString(row[8]);
      const ampBeforeR = safeString(row[9]);
      const ampBeforeS = safeString(row[10]);
      const ampBeforeT = safeString(row[11]);
      const ampAfterR = safeString(row[12]);
      const ampAfterS = safeString(row[13]);
      const ampAfterT = safeString(row[14]);
      
      const tempDiffBefore = safeString(row[16]);
      const tempDiffAfter = safeString(row[17]);
      const tempRoomBefore = safeString(row[19]);
      const tempRoomAfter = safeString(row[20]);
      
      const airflowBefore = safeString(row[23]);
      const airflowAfter = safeString(row[24]);
      const airVolActual = safeString(row[26]);
      const airVolNameplate = safeString(row[27]);
      const performa = safeString(row[28]);
      let remarks = safeString(row[29]);

      // 1. Find or Create Unit
      let unit = await prisma.units.findFirst({
        where: {
          project_ref_id: BigInt(PROJECT_REF_ID),
          room_tenant: { equals: tenant }
        }
      });

      if (!unit) {
        unit = await prisma.units.create({
          data: {
            project_ref_id: BigInt(PROJECT_REF_ID),
            customer_name: "Plaza Indonesia",
            room_tenant: tenant,
            building_floor: floor,
            unit_type: "FCU",
            brand: brand,
            model: model,
            status: "Normal",
            location: area || "Jakarta"
          }
        });
        createdUnits++;
      }

      // 2. Create or Update Preventive Activity
      const activityDate = isNaN(dateStr.getTime()) ? new Date() : dateStr;
      
      const existingActivity = await prisma.service_activities.findFirst({
        where: {
          unit_id: unit.id,
          type: "Preventive",
          service_date: {
            gte: new Date(activityDate.getFullYear(), activityDate.getMonth(), 1),
            lte: new Date(activityDate.getFullYear(), activityDate.getMonth() + 1, 0)
          },
          deleted_at: null
        }
      });

      let performaScore = performa;
      if (typeof performa === 'number' || !isNaN(parseFloat(performa))) {
          performaScore = (parseFloat(performa) * 100).toFixed(0); // Convert e.g. 0.85 to 85
      }

      const technicalData = {
        parameters: {
          amp: { 
            nameplate: ampNameplate,
            r: { before: ampBeforeR, after: ampAfterR },
            s: { before: ampBeforeS, after: ampAfterS },
            t: { before: ampBeforeT, after: ampAfterT }
          },
          diff_temp: { before: tempDiffBefore, after: tempDiffAfter },
          room_temp: { before: tempRoomBefore, after: tempRoomAfter },
          airflow: { before: airflowBefore, after: airflowAfter },
          air_volume_actual: airVolActual,
          air_volume_nameplate: airVolNameplate,
          performa_score: performaScore
        },
        source: "Bulk Sync Plaza Indonesia FCU (August 2026)"
      };

      if (existingActivity) {
        // MERGE LOGIC
        const oldJson = JSON.parse(existingActivity.technical_json || "{}");
        const mergedJson = { ...oldJson, ...technicalData };
        let mergedNote = existingActivity.engineer_note || "";
        if (remarks && !mergedNote.includes(remarks)) {
          mergedNote += (mergedNote ? " | " : "") + remarks;
        }

        await prisma.service_activities.update({
          where: { id: existingActivity.id },
          data: {
            engineer_note: mergedNote,
            technical_json: JSON.stringify(mergedJson),
            amp_r: (parseFloat(ampAfterR) || null),
            room_db: tempRoomAfter || existingActivity.room_db
          }
        });
      } else {
        await prisma.service_activities.create({
          data: {
            units: { connect: { id: unit.id } },
            type: "Preventive",
            service_date: activityDate,
            amp_r: (parseFloat(ampAfterR) || null),
            room_db: (parseFloat(tempRoomAfter) || null),
            status: "Pending", // Usually set to pending or completed based on your flow
            inspector_name: "Tim Teknisi PI",
            engineer_note: remarks,
            technical_json: JSON.stringify(technicalData)
          }
        });
      }
      linkedActivities++;

      if (linkedActivities % 100 === 0) {
        console.log(`Processed ${linkedActivities} records...`);
      }

    } catch (err) {
      console.error(`Error syncing row ${i} (Tenant: ${row[5]}):`, err.message);
    }
  }

  console.log(`\n============================`);
  console.log(`Sync Complete!`);
  console.log(`Total Rows Processed: ${linkedActivities}`);
  console.log(`New Units Created: ${createdUnits}`);
  console.log(`Rows Skipped: ${skipped}`);
  console.log(`============================\n`);
  await prisma.$disconnect();
}

sync().catch(console.error);
