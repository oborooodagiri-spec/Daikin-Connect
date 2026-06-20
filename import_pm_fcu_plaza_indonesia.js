const xlsx = require('xlsx');
const { PrismaClient } = require('./src/generated/client_v3');

const prisma = new PrismaClient();
const FILE_PATH = 'C:/Users/D22AGRI-EPL/Desktop/daikin-connect-clean/Data Project/Plaza Indonesia/2026/Mei/PM/PM FCU Mei 2026.xlsx';

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

    let stats = { createdUnit: 0, createdPM: 0, skippedEmpty: 0, skippedDupe: 0 };

    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      // Check if "Nama Tenant" exists (Col 5)
      if (!row || !row[5]) {
        stats.skippedEmpty++;
        continue;
      }

      const area = cleanValue(row[4]) || "Area";
      const tenant = cleanValue(row[5]) || "Unknown Tenant";
      const unitNameRaw = `FCU - ${area} - ${tenant}`;
      const unitKey = unitNameRaw.toLowerCase();

      let unit = unitMap.get(unitKey);
      if (!unit) {
        unit = await prisma.units.create({
          data: {
            code: unitNameRaw,
            tag_number: unitNameRaw,
            project_ref_id: project.id,
            customer_name: "Plaza Indonesia",
            unit_type: "FCU",
            building_floor: cleanValue(row[3]),
            brand: cleanValue(row[6]) || "Daikin",
            model: cleanValue(row[7]),
            area: cleanValue(row[4]),
          }
        });
        unitMap.set(unitKey, unit);
        stats.createdUnit++;
      }

      let date = excelDateToJSDate(row[1]);
      if (isNaN(date.getTime())) date = new Date(2026, 4, 1);

      // Build Scope
      const scope = {
        ampere_nameplate: { before: cleanValue(row[8]) },
        ampere_r: { before: cleanValue(row[9]), after: cleanValue(row[12]), remarks: cleanValue(row[15]) },
        ampere_s: { before: cleanValue(row[10]), after: cleanValue(row[13]), remarks: cleanValue(row[16]) },
        ampere_t: { before: cleanValue(row[11]), after: cleanValue(row[14]), remarks: cleanValue(row[17]) },

        diff_temp: { before: cleanValue(row[18]), after: cleanValue(row[19]), remarks: cleanValue(row[20]) },
        room_temp: { before: cleanValue(row[21]), after: cleanValue(row[22]), remarks: cleanValue(row[23]) },
        air_flow: { before: cleanValue(row[25]), after: cleanValue(row[26]), remarks: cleanValue(row[27]) },

        diffuser_count: { before: cleanValue(row[24]) },
        air_volume_actual: { before: cleanValue(row[28]) },
        air_volume_nameplate: { before: cleanValue(row[29]) },
        performa_score: { before: formatScore(row[30]) },

        clean_air_filter: { before: "-" },
        clean_coil: { before: "-" },
        clean_drainage: { before: "-" },
        clean_body: { before: "-" },
        check_motor: { before: "-" },
      };

      const techData = {
        header: {
          brand: cleanValue(row[6]),
          date: date,
          floor: cleanValue(row[3]),
          model: cleanValue(row[7]),
          area: cleanValue(row[4]),
          tenant: cleanValue(row[5]),
          unit_number: unitNameRaw,
        },
        scope: scope,
        technicalAdvice: cleanValue(row[31])
      };

      const techJsonString = JSON.stringify(techData);

      const existingActivities = await prisma.service_activities.findMany({
        where: { unit_id: unit.id, type: 'Preventive' }
      });

      let isDupe = false;
      for (const act of existingActivities) {
        if (act.technical_json && act.technical_json === techJsonString) {
          isDupe = true; break;
        }
      }

      if (isDupe) {
        stats.skippedDupe++;
      } else {
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
    }
    console.log("Migration Complete!");
    console.log(stats);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
