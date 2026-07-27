import { PrismaClient } from "../src/generated/client_v3/index.js";
import xlsx from "xlsx";

const prisma = new PrismaClient();

function excelDateToJSDate(excelDate: number): Date | null {
  if (!excelDate || isNaN(excelDate)) return null;
  const d = new Date((excelDate - 25569) * 86400 * 1000);
  return isNaN(d.getTime()) ? null : d;
}

function parseDateAny(val: any): Date | null {
  if (!val) return null;
  if (typeof val === "number") return excelDateToJSDate(val);
  if (typeof val === "string") {
    const str = val.trim();
    const parts = str.split('-');
    if (parts.length === 2) {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const mIdx = monthNames.findIndex(m => parts[0].toLowerCase().startsWith(m));
      if (mIdx >= 0) {
        let y = parseInt(parts[1], 10);
        if (y < 100) y += 2000;
        return new Date(y, mIdx, 1);
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

async function main() {
  console.log("Emptying old pipeline data...");
  await prisma.pipeline_deals.deleteMany({});
  await prisma.pipeline_ops.deleteMany({});

  console.log("Importing Pipeline Data from Excel...");
  
  const filePath = "C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx";
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
    const targetPoDate = parseDateAny(row[11]);

    let isClosed = false;
    let estBooking = null;
    let bookingFcVal: string | null = null;

    if (row[12]) {
      if (typeof row[12] === "string" && row[12].trim().toUpperCase() === "OK") {
        // booking_fc = "OK" means this deal is confirmed for booking forecast
        // It does NOT mean the project is closed - that's a separate action by sales
        bookingFcVal = "OK";
      } else {
        const parsed = parseDateAny(row[12]);
        if (parsed) {
          estBooking = parsed;
        } else {
          bookingFcVal = String(row[12]).trim().substring(0, 50);
        }
      }
    }

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
          target_po_date: targetPoDate,
          est_booking_month: estBooking,
          booking_fc: bookingFcVal,
          is_closed: false,
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
  console.log(`Total: ${eplCount}`);
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
