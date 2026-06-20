const xlsx = require('xlsx');
const { PrismaClient } = require('./src/generated/client_v3');
const crypto = require('crypto');

const prisma = new PrismaClient();
const FILE_PATH = 'C:/Users/D22AGRI-EPL/Desktop/daikin-connect-clean/Data Project/Plaza Indonesia/2026/Mei/Audit/Audit Report - Mei 2026 - no pic.xlsx';

function excelDateToJSDate(serial) {
  if (!serial) return new Date();
  if (typeof serial === 'string') return new Date(serial);
  return new Date(Math.round((serial - 25569) * 86400 * 1000));
}

function cleanValue(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '-' || trimmed === '') return null;
    return trimmed;
  }
  return val;
}

const HEADERS = [
  "NO", "Day Audit", "Date", "No Unit", "Kategori", "Lantai", "Merk", "Tahun", "Type Unit", "Area",
  "Entering Coil DB Temp. (°C)", "Entering Air Humidity (%)", "Leaving Coil DB Temp. (°C)", "Leaving Air Humidity (%)",
  "ΔT (EAT-LAT)", "Entering Air Enthalphy (Btu/Lb)", "Leaving Air Enthalpy (Btu/Lb)", "ΔH (Btu/Lb)",
  "Air Face velocity (m/s)", "Face Area coil (m2)", "Air Flow Rate design (CFM)", "Air Flow Rate actual (CFM)",
  "Total cooling capacity design (btuh)", "Total cooling capacty actual (btuh)", "Selisih capacity design vs actual (btuh)",
  "Status", "Cooling capacity design vs actual (btuh) %", "null27", "Entering Water Temp. (°C)", "Leaving Water Temp. (°C)",
  "ΔT Water (°C)", "Power input (KW)", "null32", "Keterangan", "Tindakan"
];

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

    let stats = { createdUnit: 0, createdAudit: 0, skippedEmpty: 0, skippedDupe: 0 };

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[3]) {
        stats.skippedEmpty++;
        continue;
      }

      const unitNameRaw = String(row[3]).trim();
      const unitKey = unitNameRaw.toLowerCase();

      let unit = unitMap.get(unitKey);
      if (!unit) {
        unit = await prisma.units.create({
          data: {
            code: unitNameRaw,
            tag_number: unitNameRaw,
            project_ref_id: project.id,
            customer_name: "Plaza Indonesia",
            unit_type: cleanValue(row[4]) || 'FCU/AHU',
            building_floor: cleanValue(row[5]),
            brand: cleanValue(row[6]) || "Daikin",
            yoi: row[7] ? Number(row[7]) : null,
            model: cleanValue(row[8]),
            area: cleanValue(row[9]),
          }
        });
        unitMap.set(unitKey, unit);
        stats.createdUnit++;
      }

      let date = excelDateToJSDate(row[2]);
      if (isNaN(date.getTime())) date = new Date(2026, 4, 1);

      let techData = {};
      for (let j = 0; j < HEADERS.length; j++) {
        if (!HEADERS[j].startsWith("null")) {
          techData[HEADERS[j]] = cleanValue(row[j]);
        }
      }

      const techJsonString = JSON.stringify(techData);

      const existingActivities = await prisma.service_activities.findMany({
        where: { unit_id: unit.id, type: 'Audit' }
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
            type: 'Audit',
            service_date: date,
            technical_json: techJsonString,
            status: "Final_Approved"
          }
        });
        stats.createdAudit++;
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
