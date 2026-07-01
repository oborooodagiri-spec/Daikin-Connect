import { PrismaClient } from "../src/generated/client_v3/index.js";
import xlsx from "xlsx";

const prisma = new PrismaClient();

function excelDateToJSDate(excelDate: number): Date | null {
  if (!excelDate || isNaN(excelDate)) return null;
  const d = new Date((excelDate - 25569) * 86400 * 1000);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  console.log("Importing Pipeline Data from Excel...");
  
  const filePath = "C:\\Users\\D22AGRI-EPL\\OneDrive - DAIKIN\\EPL-CONNECT\\Form\\live data\\2026Pipeline DASI Service.xlsx";
  const wb = xlsx.readFile(filePath);

  // ========================================
  // 1. IMPORT EPL SHEET (Main pipeline deals)
  // ========================================
  console.log("\n--- Importing EPL Sheet ---");
  const eplSheet = wb.Sheets["EPL"];
  const eplRows = xlsx.utils.sheet_to_json(eplSheet, { header: 1 }) as any[][];
  let eplCount = 0;

  // Headers: [0]Klien Name, [1]Area, [2]Project & Bill Material, [3]Tipe, [4]Area2, 
  // [5]Sales Planner, [6]PIC, [7]Category, [8]Sector, [9]Quotation, [10]Status, 
  // [11]Est Booking Month, [12]booking fc, [13]keterangan
  for (let r = 1; r < eplRows.length; r++) {
    const row = eplRows[r];
    if (!row || !row[0]) continue; // Skip empty rows

    const clientName = String(row[0] || "").trim();
    if (!clientName) continue;

    const quotation = parseInt(row[9]) || 0;
    const estBooking = typeof row[11] === "number" ? excelDateToJSDate(row[11]) : null;

    try {
      await (prisma.pipeline_deals as any).create({
        data: {
          client_name: clientName.substring(0, 255),
          area: row[1] ? String(row[1]).trim().substring(0, 100) : null,
          project_name: String(row[2] || clientName).trim().substring(0, 500),
          bill_material: null,
          type: row[3] ? String(row[3]).trim().substring(0, 100) : null,
          region: row[4] ? String(row[4]).trim().substring(0, 50) : null,
          sales_planner: row[5] ? String(row[5]).trim().substring(0, 100) : null,
          pic: row[6] ? String(row[6]).trim().substring(0, 100) : null,
          category: row[7] ? String(row[7]).trim().substring(0, 50) : null,
          sector: row[8] ? String(row[8]).trim().substring(0, 50) : null,
          quotation: BigInt(quotation),
          status: row[10] ? String(row[10]).trim().substring(0, 5) : "E",
          est_booking_month: estBooking,
          booking_fc: row[12] ? String(row[12]).trim().substring(0, 50) : null,
          remarks: row[13] ? String(row[13]).trim() : null,
          source: "EPL",
          priority: null
        }
      });
      eplCount++;
    } catch (e: any) {
      console.error(`EPL row ${r} error:`, e.message?.substring(0, 100));
    }
  }
  console.log(`EPL: Imported ${eplCount} deals`);

  // ========================================
  // 2. IMPORT EPL PARTNERSHIP SHEET
  // ========================================
  console.log("\n--- Importing EPL PARTNERSHIP Sheet ---");
  const partSheet = wb.Sheets["EPL PARTNERSHIP"];
  const partRows = xlsx.utils.sheet_to_json(partSheet, { header: 1 }) as any[][];
  let partCount = 0;

  // Headers: [0]null, [1]Klien Name, [2]Project, [3]Sector, [4]Quotation, [5]Status, [6]Column1, [7]Sales
  for (let r = 1; r < partRows.length; r++) {
    const row = partRows[r];
    if (!row || !row[1]) continue;

    const clientName = String(row[1] || "").trim();
    if (!clientName) continue;

    const quotation = parseInt(row[4]) || 0;

    // Extract PIC from client name (usually "Name - David" format)
    let pic = row[7] ? String(row[7]).trim() : null;
    if (!pic) {
      const match = clientName.match(/-\s*(\w+)\s*$/);
      if (match) pic = match[1];
    }

    try {
      await (prisma.pipeline_deals as any).create({
        data: {
          client_name: clientName.substring(0, 255),
          project_name: String(row[2] || clientName).trim().substring(0, 500),
          sector: row[3] ? String(row[3]).trim().substring(0, 50) : null,
          quotation: BigInt(quotation),
          status: row[5] ? String(row[5]).trim().substring(0, 5) : "E",
          remarks: row[6] ? String(row[6]).trim() : null,
          pic: pic?.substring(0, 100) || null,
          source: "Partnership",
          category: "EPL"
        }
      });
      partCount++;
    } catch (e: any) {
      console.error(`Partnership row ${r} error:`, e.message?.substring(0, 100));
    }
  }
  console.log(`Partnership: Imported ${partCount} deals`);

  // ========================================
  // 3. IMPORT PIPELINE OPS (2) SHEET
  // ========================================
  console.log("\n--- Importing Pipeline OPS (2) Sheet ---");
  const opsSheet = wb.Sheets["Pipeline OPS (2)"];
  const opsRows = xlsx.utils.sheet_to_json(opsSheet, { header: 1 }) as any[][];
  let opsCount = 0;

  // Row 0 = totals, Row 1 = headers
  // Headers: [0]NO, [1]STATUS, [2]CUSTOMER, [3]PROJECT NAME, [4..31]=months, [32-35]=more months/remark
  // The month columns contain Excel serial dates in row 1
  const headerRow = opsRows[1];
  const monthCols: { col: number; date: string }[] = [];
  
  if (headerRow) {
    for (let c = 4; c < headerRow.length; c++) {
      const val = headerRow[c];
      if (typeof val === "number" && val > 40000 && val < 50000) {
        const dt = excelDateToJSDate(val);
        if (dt) {
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          monthCols.push({ col: c, date: key });
        }
      }
    }
  }

  for (let r = 2; r < opsRows.length; r++) {
    const row = opsRows[r];
    if (!row || row[0] === null || row[0] === undefined) continue;

    const customer = String(row[2] || "").trim();
    const projectName = String(row[3] || "").trim();
    if (!customer && !projectName) continue;

    // Build monthly values
    const valuesByMonth: Record<string, number> = {};
    let totalValue = 0;
    for (const mc of monthCols) {
      const val = parseFloat(row[mc.col]);
      if (!isNaN(val) && val > 0) {
        valuesByMonth[mc.date] = val;
        totalValue += val;
      }
    }

    // Find remark - usually last column with text
    let remark = "";
    for (let c = row.length - 1; c >= 4; c--) {
      if (typeof row[c] === "string" && row[c].trim().length > 0) {
        remark = row[c].trim();
        break;
      }
    }

    try {
      await (prisma.pipeline_ops as any).create({
        data: {
          status: row[1] ? String(row[1]).trim().substring(0, 5) : "E",
          customer: customer.substring(0, 255) || "Unknown",
          project_name: projectName.substring(0, 500) || "Unknown",
          total_value: BigInt(Math.round(totalValue)),
          values_by_month: Object.keys(valuesByMonth).length > 0 ? valuesByMonth : undefined,
          remark: remark || null
        }
      });
      opsCount++;
    } catch (e: any) {
      console.error(`OPS row ${r} error:`, e.message?.substring(0, 100));
    }
  }
  console.log(`OPS: Imported ${opsCount} records`);

  // ========================================
  // 4. SEED PIPELINE SETTINGS
  // ========================================
  console.log("\n--- Seeding Pipeline Settings ---");
  
  const settings = [
    {
      key: "statuses",
      value: JSON.stringify([
        { code: "A", label: "Approved/Won", color: "#00c875" },
        { code: "B", label: "Budgeted/Confirmed", color: "#0073ea" },
        { code: "C", label: "Contracted", color: "#7b2cbf" },
        { code: "D", label: "Development/Planning", color: "#fdab3d" },
        { code: "E", label: "Estimated/Submitted", color: "#66ccff" },
        { code: "H", label: "Hold", color: "#676879" },
        { code: "L", label: "Lost", color: "#e44258" },
        { code: "T", label: "Tender", color: "#ff9f43" },
        { code: "S", label: "Service Done", color: "#00c875" },
        { code: "N", label: "No Response", color: "#c4c4c4" }
      ]),
      description: "Pipeline status definitions"
    },
    {
      key: "categories",
      value: JSON.stringify(["RC", "EPL", "IAQ", "VES", "Cont IPM", "Cont Inst", "Cont Device", "Cont Others"]),
      description: "Product/service categories"
    },
    {
      key: "sectors",
      value: JSON.stringify(["Hospital", "Komersial", "Government", "Industri", "Heavy Industri"]),
      description: "Industry sectors"
    },
    {
      key: "regions",
      value: JSON.stringify(["West", "East", "Bali"]),
      description: "Sales regions"
    },
    {
      key: "pic_list",
      value: JSON.stringify(["Dea", "Iik", "Zaqi", "Fian", "Setyo", "Erik", "Rangga", "Aris", "Azrul", "Danis", "Faiz", "Mira", "Samuel"]),
      description: "Person In Charge list"
    },
    {
      key: "rc_legends",
      value: JSON.stringify([
        { code: "WC CSD", desc: "Water Cooled Centrifugal Constant Speed Drive" },
        { code: "WC VSD", desc: "Water Cooled Centrifugal Variable Speed Drive" },
        { code: "WC MB", desc: "Water Cooled Centrifugal Magnetic Bearing (R134a)" },
        { code: "WC HFO", desc: "Water Cooled Centrifugal HFO" },
        { code: "WS CSD", desc: "Water Cooled Screw Constant Speed Drive" },
        { code: "WS VSD", desc: "Water Cooled Screw Variable Speed Drive" },
        { code: "WS HP", desc: "Water Cooled Screw Heat Pump" },
        { code: "WS HFO", desc: "Water Cooled Screw HFO" },
        { code: "AS CSD", desc: "Air Cooled Screw Constant Speed Drive" },
        { code: "AS MB", desc: "Air Cooled Magnetic Bearing" },
        { code: "AS VSD", desc: "Air Cooled Screw Variable Speed Drive" },
        { code: "AL", desc: "Air Cooled Scroll/Water Cooled Scroll" },
        { code: "AHU STD", desc: "Air Handling Unit Standard" },
        { code: "AHU TB", desc: "Air Handling Unit TB-1, TB-2" },
        { code: "FCU DC", desc: "Fan Coil Unit Decorative" },
        { code: "FCU DUC", desc: "Fan Coil Unit Ducted" }
      ]),
      description: "RC product code legends"
    }
  ];

  for (const s of settings) {
    try {
      await (prisma.pipeline_settings as any).upsert({
        where: { key: s.key },
        update: { value: s.value, description: s.description },
        create: { key: s.key, value: s.value, description: s.description }
      });
    } catch (e: any) {
      console.error(`Setting ${s.key} error:`, e.message?.substring(0, 100));
    }
  }
  console.log("Settings seeded.");

  // ========================================
  // SUMMARY
  // ========================================
  console.log("\n========================================");
  console.log(`IMPORT COMPLETE`);
  console.log(`EPL Deals: ${eplCount}`);
  console.log(`Partnership Deals: ${partCount}`);
  console.log(`OPS Records: ${opsCount}`);
  console.log(`Total: ${eplCount + partCount + opsCount}`);
  console.log("========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
