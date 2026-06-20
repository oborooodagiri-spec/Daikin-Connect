const xlsx = require('xlsx');
const { PrismaClient } = require('./src/generated/client_v3');

const prisma = new PrismaClient();
const FILE_PATH = 'C:/Users/D22AGRI-EPL/Desktop/daikin-connect-clean/Data Project/Plaza Indonesia/2026/Mei/PM/PM AHU Mei 2026.xlsx';

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

function formatScore(val) {
  if (typeof val === 'number') {
    return Math.round(val * 100) + "%";
  }
  return cleanValue(val);
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
      // Check if "AHU Unit Code No" exists (Col 5)
      if (!row || !row[5]) {
        stats.skippedEmpty++;
        continue;
      }

      const unitNameRaw = cleanValue(row[5]);
      if (!unitNameRaw) {
        stats.skippedEmpty++;
        continue;
      }
      const unitKey = unitNameRaw.toLowerCase();

      let unit = unitMap.get(unitKey);
      if (!unit) {
        unit = await prisma.units.create({
          data: {
            code: unitNameRaw,
            tag_number: unitNameRaw,
            project_ref_id: project.id,
            customer_name: "Plaza Indonesia",
            unit_type: "AHU",
            building_floor: cleanValue(row[4]),
            brand: cleanValue(row[6]),
            model: cleanValue(row[7]),
            area: cleanValue(row[3]),
          }
        });
        unitMap.set(unitKey, unit);
        stats.createdUnit++;
      } else {
        if (unit.unit_type !== "AHU") {
          await prisma.units.update({
            where: { id: unit.id },
            data: { unit_type: "AHU" }
          });
        }
      }

      let date = excelDateToJSDate(row[2]);
      if (isNaN(date.getTime())) date = new Date(2026, 4, 1);

      // Build Scope
      const scope = {
        kw: { before: cleanValue(row[9]) },
        rpm: { before: cleanValue(row[10]) },
        ampere_nameplate: { before: cleanValue(row[11]) },

        ampere_r: { before: cleanValue(row[12]), after: cleanValue(row[15]), remarks: cleanValue(row[18]) },
        ampere_s: { before: cleanValue(row[13]), after: cleanValue(row[16]), remarks: cleanValue(row[19]) },
        ampere_t: { before: cleanValue(row[14]), after: cleanValue(row[17]), remarks: cleanValue(row[20]) },

        supply_air_temp: { before: cleanValue(row[21]), after: cleanValue(row[22]), remarks: cleanValue(row[23]) },
        return_air_temp: { before: cleanValue(row[24]), after: cleanValue(row[25]), remarks: cleanValue(row[26]) },
        room_temp: { before: cleanValue(row[27]), after: cleanValue(row[28]), remarks: cleanValue(row[29]) },
        air_flow: { before: cleanValue(row[30]), after: cleanValue(row[31]), remarks: cleanValue(row[32]) },

        performa_unit: { before: formatScore(row[33]) },
      };

      const techData = {
        header: {
          brand: cleanValue(row[6]),
          date: date,
          floor: cleanValue(row[4]),
          model: cleanValue(row[7]),
          area: cleanValue(row[3]),
          tenant: cleanValue(row[8]),
          unit_number: unitNameRaw,
        },
        scope: scope,
        technicalAdvice: cleanValue(row[34])
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
    console.log("AHU PM Migration Complete!");
    console.log(stats);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
