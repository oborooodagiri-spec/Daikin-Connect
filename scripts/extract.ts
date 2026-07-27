import xlsx from "xlsx";
import fs from "fs";

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
  const filePath = "C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\Data Project\\live data\\2\\2026Pipeline DASI Service.xlsx";
  const workbook = xlsx.readFile(filePath);
  
  const sheetName = workbook.SheetNames.find(s => s.trim().toUpperCase() === "EPL");
  if (!sheetName) throw new Error("EPL sheet not found");

  const worksheet = workbook.Sheets[sheetName];
  const rows: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  const extracted = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[0]) continue; // Skip empty rows
    const clientName = row[0] ? String(row[0]).trim() : "Unknown Client";
    if (!clientName) continue;

    let targetPoDate = parseDateAny(row[11]);
    
    let isClosed = false;
    let estBooking = null;
    let bookingFcVal: string | null = null;

    if (row[12]) {
      if (typeof row[12] === "string" && row[12].trim().toUpperCase() === "OK") {
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

    extracted.push({
      client_name: clientName,
      area: row[1] ? String(row[1]).trim() : null,
      project_name: row[2] ? String(row[2]).trim() : "Unknown Project",
      bill_material: null,
      type: row[3] ? String(row[3]).trim() : null,
      region: row[4] ? String(row[4]).trim() : null,
      sales_planner: row[5] ? String(row[5]).trim() : null,
      pic: row[6] ? String(row[6]).trim() : null,
      category: row[7] ? String(row[7]).trim() : null,
      sector: row[8] ? String(row[8]).trim() : null,
      quotation: Math.round(Number(row[9]) || 0),
      status: row[10] ? String(row[10]).trim().substring(0, 1) : "E",
      target_po_date: targetPoDate ? targetPoDate.toISOString() : null,
      est_booking_month: estBooking ? estBooking.toISOString() : null,
      booking_fc: bookingFcVal,
      is_closed: isClosed,
      remarks: row[13] ? String(row[13]).trim() : null,
      source: "EPL",
      priority: null
    });
  }

  fs.writeFileSync("C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\scripts\\prod-seed-data.json", JSON.stringify(extracted, null, 2));
  console.log(`Saved ${extracted.length} records to prod-seed-data.json`);
}

main().catch(console.error);
