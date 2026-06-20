const xlsx = require('xlsx');
const { PrismaClient } = require('./src/generated/client_v3');

const prisma = new PrismaClient();
const FILE_PATH = 'C:/Users/D22AGRI-EPL/Desktop/daikin-connect-clean/Data Project/Plaza Indonesia/2026/Mei/PM/PM Split Mei 2026.xlsx';

function excelDateToJSDate(serial) {
  if (!serial) return new Date();
  if (typeof serial === 'string') return new Date(serial);
  return new Date(Math.round((serial - 25569) * 86400 * 1000));
}

function cleanValue(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') val = val.toString();
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '-' || trimmed === '') return null;
    return trimmed;
  }
  return val;
}

async function run() {
  try {
    const projects = await prisma.projects.findMany({ where: { name: { contains: 'plaza indonesia' } } });
    if (!projects.length) throw new Error("Project Plaza Indonesia not found");
    const project = projects[0];

    const wb = xlsx.readFile(FILE_PATH);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const existingUnits = await prisma.units.findMany({ where: { project_ref_id: project.id } });
    const unitMap = new Map();
    existingUnits.forEach(u => {
      if (u.code) unitMap.set(u.code.toLowerCase().trim(), u);
      if (u.tag_number) unitMap.set(u.tag_number.toLowerCase().trim(), u);
    });

    let stats = { createdUnit: 0, createdPM: 0, skippedEmpty: 0 };

    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      // Check if "Tenant" exists (Col 6)
      if (!row || !row[6]) {
        stats.skippedEmpty++;
        continue;
      }

      const area = cleanValue(row[5]) || "Area";
      const tenant = cleanValue(row[6]) || "Unknown Tenant";
      const unitNameRaw = `SPLIT - ${area} - ${tenant}`;
      const unitKey = unitNameRaw.toLowerCase();
      
      // Determine Unit Type (SPLIT DUCT if it has 3 phase S/T values, otherwise SPLIT WALL)
      const hasSOrT = cleanValue(row[11]) || cleanValue(row[12]) || cleanValue(row[14]) || cleanValue(row[15]);
      const unitTypeStr = hasSOrT ? "SPLIT DUCT" : "SPLIT WALL";

      let unit = unitMap.get(unitKey);
      if (!unit) {
        unit = await prisma.units.create({
          data: {
            code: unitNameRaw,
            tag_number: unitNameRaw,
            project_ref_id: project.id,
            customer_name: "Plaza Indonesia",
            unit_type: unitTypeStr,
            building_floor: cleanValue(row[4]),
            brand: cleanValue(row[7]),
            area: cleanValue(row[5]),
          }
        });
        unitMap.set(unitKey, unit);
        stats.createdUnit++;
      } else {
        // Update unit_type if necessary
        if (!unit.unit_type || !unit.unit_type.includes("SPLIT")) {
            await prisma.units.update({
                where: { id: unit.id },
                data: { unit_type: unitTypeStr }
            });
        }
      }

      let date = excelDateToJSDate(row[2]);
      if (isNaN(date.getTime())) date = new Date(2026, 4, 1);

      // Build Scope
      const scope = {
        ampere_nameplate: { before: cleanValue(row[9]) },
        ampere_r: { before: cleanValue(row[10]), after: cleanValue(row[13]), remarks: cleanValue(row[16]) },
        ampere_s: { before: cleanValue(row[11]), after: cleanValue(row[14]), remarks: cleanValue(row[17]) },
        ampere_t: { before: cleanValue(row[12]), after: cleanValue(row[15]), remarks: cleanValue(row[18]) },

        supply_air_temp: { before: cleanValue(row[19]), after: cleanValue(row[20]), remarks: cleanValue(row[21]) },
        return_air_temp: { before: cleanValue(row[22]), after: cleanValue(row[23]), remarks: cleanValue(row[24]) },
        room_temp: { before: cleanValue(row[25]), after: cleanValue(row[26]), remarks: cleanValue(row[27]) },
        air_flow_rate: { before: cleanValue(row[28]), after: cleanValue(row[29]), remarks: cleanValue(row[30]) },
        air_volume: { before: cleanValue(row[31]) }, // Performa CFM

        clean_air_filter: { done: "-" },
        clean_coil: { done: "-" },
        clean_drainage: { done: "-" },
        clean_body: { done: "-" },
      };

      const techData = {
        header: {
          brand: cleanValue(row[7]),
          date: date,
          floor: cleanValue(row[4]),
          area: cleanValue(row[5]),
          tenant: cleanValue(row[6]),
          unit_number: unitNameRaw,
          capacity_pk: cleanValue(row[8])
        },
        scope: scope,
        technicalAdvice: cleanValue(row[32])
      };

      const techJsonString = JSON.stringify(techData);

      await prisma.service_activities.create({
        data: {
          units: { connect: { id: unit.id } },
          type: 'Preventive',
          service_date: date,
          technical_json: techJsonString,
          status: "Final_Approved"
        }
      });
      stats.createdPM++;
    }
    console.log("Split PM Migration Complete!");
    console.log(stats);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
