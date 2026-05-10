const { PrismaClient } = require('../src/generated/client_v2');
const xlsx = require('xlsx');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Configuration
const PROJECT_ID = 1n; // Plaza Indonesia
const EXCEL_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\preventive maintenance FCU.xlsx';
const START_ROW = 10; // Data starts at Row 10 (index 9)

async function generateNextUnitTag(customerId) {
  const count = await prisma.units.count({
    where: { projects: { customer_id: customerId } }
  });
  
  const ccc = String(customerId).padStart(3, '0');
  const uuu = String(count + 1).padStart(3, '0');
  
  return `DKN${ccc}${uuu}`;
}

async function main() {
  console.log("Starting Plaza Indonesia Preventive Maintenance Sync (High Fidelity)...");
  
  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  const project = await prisma.projects.findUnique({
    where: { id: PROJECT_ID },
    select: { customer_id: true, name: true }
  });
  
  if (!project) {
    console.error("Project not found!");
    process.exit(1);
  }

  console.log(`Target Project: ${project.name} (ID: ${PROJECT_ID})`);
  
  let imported = 0;
  let updated = 0;
  let unitsCreated = 0;
  let skipped = 0;

  for (let i = START_ROW - 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length < 5) continue; 

    try {
      const dateVal = row[1];
      const category = row[2];
      const floor = row[3];
      const area = row[4];
      const tenant = row[5];
      const brand = row[6];
      const modelRaw = row[7];
      const model = modelRaw ? String(modelRaw) : null;
      
      const ampNP = String(row[8] || "").replace(',', '.');
      
      // Ampere R, S, T mapping
      const ampBR = String(row[9] || "-");
      const ampBS = String(row[10] || "-");
      const ampBT = String(row[11] || "-");
      const ampAR = String(row[12] || "-");
      const ampAS = String(row[13] || "-");
      const ampAT = String(row[14] || "-");

      // Temp Diff, Room Temp
      const tempDiffB = String(row[18] || "-");
      const tempDiffA = String(row[19] || "-");
      const roomTempB = String(row[21] || "-");
      const roomTempA = String(row[22] || "-");

      // Airflow & Volume
      const diffuserCount = row[24] || "-";
      const airflowB = String(row[25] || "-");
      const airflowA = String(row[26] || "-");
      const airVolumeActual = row[28] || "-";
      const airVolumeNP = row[29] || "-";
      const performanceScore = row[30] ? (parseFloat(row[30]) * 100).toFixed(0) : "-";
      
      const remarks = row[31] || "NORMAL";

      if (!tenant) {
        skipped++;
        continue;
      }

      // 1. Find unit
      let unit = await prisma.units.findFirst({
        where: {
          project_ref_id: PROJECT_ID,
          room_tenant: tenant
        }
      });

      if (!unit) {
        // Create unit if not found
        const tag = await generateNextUnitTag(project.customer_id);
        const qrToken = crypto.randomBytes(16).toString('hex');
        
        unit = await prisma.units.create({
          data: {
            project_ref_id: PROJECT_ID,
            tag_number: tag,
            qr_code_token: qrToken,
            room_tenant: tenant,
            building_floor: floor ? String(floor) : null,
            area: area ? String(area) : null,
            brand: brand || "MC QUAY",
            model: model || "Unknown",
            unit_type: "FCU",
            status: remarks.toUpperCase().includes("PROBLEM") || remarks.toUpperCase().includes("RUSAK") ? "Problem" : "Normal"
          }
        });
        unitsCreated++;
      }

      // 2. Parse Date
      let serviceDate = new Date();
      if (dateVal) {
        if (!isNaN(Number(dateVal))) {
          serviceDate = new Date((dateVal - 25569) * 86400 * 1000);
        } else {
          const parsed = new Date(dateVal);
          if (!isNaN(parsed.getTime())) serviceDate = parsed;
        }
      }

      // 3. Prepare Technical JSON
      const technicalData = {
        source: "Spreadsheet Sync Plaza Indonesia FCU",
        parameters: {
          amp: { 
            nameplate: ampNP,
            r: { before: ampBR, after: ampAR },
            s: { before: ampBS, after: ampAS },
            t: { before: ampBT, after: ampAT }
          },
          diff_temp: { before: tempDiffB, after: tempDiffA },
          room_temp: { before: roomTempB, after: roomTempA },
          airflow: { before: airflowB, after: airflowA },
          diffuser_count: diffuserCount,
          air_volume_actual: airVolumeActual,
          air_volume_nameplate: airVolumeNP,
          performa_score: performanceScore
        }
      };

      // 4. Find existing activity to update or create
      const existingActivity = await prisma.service_activities.findFirst({
        where: {
          unit_id: unit.id,
          type: "Preventive",
          service_date: serviceDate,
          deleted_at: null
        }
      });

      if (existingActivity) {
        await prisma.service_activities.update({
          where: { id: existingActivity.id },
          data: {
            engineer_note: remarks,
            technical_json: JSON.stringify(technicalData),
            inspector_name: "Bulk Sync (Plaza Indonesia)"
          }
        });
        updated++;
      } else {
        await prisma.service_activities.create({
          data: {
            unit_id: unit.id,
            type: "Preventive",
            service_date: serviceDate,
            status: "Final_Approved",
            inspector_name: "Bulk Sync (Plaza Indonesia)",
            engineer_note: remarks,
            unit_tag: unit.tag_number,
            location: unit.location || tenant,
            technical_json: JSON.stringify(technicalData)
          }
        });
        imported++;
      }

    } catch (err) {
      console.error(`Error at row ${i + 1}:`, err.message);
      skipped++;
    }
  }

  console.log("\n--- Sync completed successfully! ---");
  console.log(`Total Records Processed: ${rawData.length - (START_ROW - 1)}`);
  console.log(`New Reports Created: ${imported}`);
  console.log(`Existing Reports Updated: ${updated}`);
  console.log(`New Units Created: ${unitsCreated}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
