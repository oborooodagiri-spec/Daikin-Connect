const { PrismaClient } = require('../src/generated/client_v2');
const xlsx = require('xlsx');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient();

// Configuration
const PROJECT_ID = 1n; // Plaza Indonesia
const CSV_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\preventive maintenance AHU - Actual AHU.csv';

async function generateNextUnitTag(customerId) {
  const count = await prisma.units.count({
    where: { projects: { customer_id: customerId } }
  });
  
  const ccc = String(customerId).padStart(3, '0');
  const uuu = String(count + 1).padStart(3, '0');
  
  return `DKN${ccc}${uuu}`;
}

async function main() {
  console.log("Starting Plaza Indonesia AHU Preventive Maintenance Sync...");
  
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV file not found at ${CSV_PATH}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(CSV_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
  
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

  // Define data ranges based on inspection
  const sections = [
    { start: 10, end: 75 },  // March data
    { start: 95, end: 161 }  // April data
  ];

  for (const section of sections) {
    for (let i = section.start - 1; i < section.end; i++) {
      const row = rawData[i];
      if (!row || row.length < 8) continue;

      try {
        const dateRaw = row[1];
        const area = row[2];
        const floor = row[3];
        const unitCode = row[4];
        const brand = row[5];
        const model = row[6] ? String(row[6]) : null;
        const tenant = row[7];
        const kw = row[8] || "-";
        const rpm = row[9] || "-";

        if (!tenant || !unitCode) {
          skipped++;
          continue;
        }

        // 2. Parse Date
        let serviceDate = null;
        if (dateRaw && String(dateRaw).trim() !== "") {
          if (typeof dateRaw === 'string') {
            // Handle DD-MMM-YY or DD MMM YYYY
            let d = dateRaw.replace(/-/g, ' ').trim();
            serviceDate = new Date(d);
            
            // If still invalid, try custom parse
            if (isNaN(serviceDate.getTime())) {
              const months = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
              const parts = d.split(' ');
              if (parts.length >= 3) {
                const day = parseInt(parts[0]);
                const month = months[parts[1].toLowerCase().substring(0, 3)];
                let year = parseInt(parts[2]);
                if (year < 100) year += 2000;
                serviceDate = new Date(year, month, day);
              }
            }
          }
        }

        if (!serviceDate || isNaN(serviceDate.getTime())) {
          console.log(`Skipping Row ${i+1}: Invalid Date "${dateRaw}"`);
          skipped++;
          continue;
        }

        if (i === section.start - 1) {
          console.log(`Debug Row ${i+1}: RawDate=${dateRaw}, ParsedDate=${serviceDate.toISOString()}, Tenant=${tenant}, Unit=${unitCode}`);
        }

        // Technical Parameters
        // Using raw: false means "7,1" comes as a string "7,1"
        const cleanVal = (v) => String(v || "-").replace(',', '.').trim();
        
        const ampNP = cleanVal(row[10]);
        
        const ampBR = cleanVal(row[11]);
        const ampBS = cleanVal(row[12]);
        const ampBT = cleanVal(row[13]);
        const ampAR = cleanVal(row[14]);
        const ampAS = cleanVal(row[15]);
        const ampAT = cleanVal(row[16]);

        const supplyB = cleanVal(row[20]);
        const supplyA = cleanVal(row[21]);
        const returnB = cleanVal(row[23]);
        const returnA = cleanVal(row[24]);
        const roomB = cleanVal(row[26]);
        const roomA = cleanVal(row[27]);
        const airflowB = cleanVal(row[29]);
        const airflowA = cleanVal(row[30]);

        const performa = row[32] || "-";
        const remarks = row[33] || "NORMAL";

        // 1. Find unit by Tenant and Code
        let unit = await prisma.units.findFirst({
          where: {
            project_ref_id: PROJECT_ID,
            room_tenant: tenant,
            code: unitCode
          }
        });

        // Fallback: match by tenant and unit_type AHU if code mismatch but unique
        if (!unit) {
          unit = await prisma.units.findFirst({
            where: {
              project_ref_id: PROJECT_ID,
              room_tenant: tenant,
              unit_type: "AHU"
            }
          });
          
          if (unit && !unit.code) {
             // Update code if missing
             await prisma.units.update({
               where: { id: unit.id },
               data: { code: unitCode }
             });
          } else if (unit && unit.code !== unitCode) {
             // If code differs, might be a different unit in same tenant
             unit = null; 
          }
        }

        if (!unit) {
          // Create unit if not found
          const tag = await generateNextUnitTag(project.customer_id);
          const qrToken = crypto.randomBytes(16).toString('hex');
          
          unit = await prisma.units.create({
            data: {
              project_ref_id: PROJECT_ID,
              tag_number: tag,
              code: unitCode,
              qr_code_token: qrToken,
              room_tenant: tenant,
              building_floor: floor ? String(floor) : null,
              area: area ? String(area) : null,
              brand: brand || "YORK",
              model: model || "Unknown",
              unit_type: "AHU",
              status: remarks.toUpperCase().includes("PROBLEM") || remarks.toUpperCase().includes("RUSAK") ? "Problem" : "Normal"
            }
          });
          unitsCreated++;
        }

        // 3. Prepare Technical JSON
        const technicalData = {
          source: "Bulk Sync AHU (Plaza Indonesia)",
          parameters: {
            kw: { before: kw, after: kw },
            rpm: { before: rpm, after: rpm },
            amp: { 
              nameplate: ampNP,
              r: { before: ampBR, after: ampAR },
              s: { before: ampBS, after: ampAS },
              t: { before: ampBT, after: ampAT }
            },
            supply_air_temp: { before: supplyB, after: supplyA },
            return_air_temp: { before: returnB, after: returnA },
            room_temp: { before: roomB, after: roomA },
            air_flow: { before: airflowB, after: airflowA },
            performa_unit: { before: performa, after: performa },
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
              inspector_name: "Bulk Sync (AHU)"
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
              inspector_name: "Bulk Sync (AHU)",
              engineer_note: remarks,
              unit_tag: unit.tag_number,
              location: unit.area || area || tenant,
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
  }

  console.log("\n--- AHU Sync completed successfully! ---");
  console.log(`New Reports Created: ${imported}`);
  console.log(`Existing Reports Updated: ${updated}`);
  console.log(`New Units Created: ${unitsCreated}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
