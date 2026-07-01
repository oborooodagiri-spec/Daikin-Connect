import xlsx from "xlsx";

const filePath = "C:\\Users\\D22AGRI-EPL\\OneDrive - DAIKIN\\EPL-CONNECT\\Form\\live data\\2026Pipeline DASI Service.xlsx";
const wb = xlsx.readFile(filePath);

// Deep dive into the DATA sheet (reference/lookup values)
console.log("\n=== SHEET: DATA (Reference Values) ===");
const dataSheet = wb.Sheets["DATA"];
const dataRows = xlsx.utils.sheet_to_json(dataSheet, { header: 1 }) as any[][];
for (let r = 0; r < dataRows.length; r++) {
  const row = dataRows[r];
  if (row && row.some((c: any) => c !== null && c !== undefined && c !== "")) {
    console.log(`Row ${r}: ${JSON.stringify(row)}`);
  }
}

// Deep dive EPL sheet - show row 0-10 with all columns
console.log("\n\n=== SHEET: EPL (Main Pipeline - first 10 rows) ===");
const eplSheet = wb.Sheets["EPL"];
const eplRows = xlsx.utils.sheet_to_json(eplSheet, { header: 1 }) as any[][];
for (let r = 0; r < Math.min(10, eplRows.length); r++) {
  console.log(`Row ${r}: ${JSON.stringify(eplRows[r])}`);
}

// Count statuses in EPL sheet
const statusCount: Record<string, number> = {};
const categoryCount: Record<string, number> = {};
const sectorCount: Record<string, number> = {};
const picCount: Record<string, number> = {};
for (let r = 1; r < eplRows.length; r++) {
  const row = eplRows[r];
  if (!row) continue;
  const status = String(row[10] || "").trim();
  const category = String(row[7] || "").trim();
  const sector = String(row[8] || "").trim();
  const pic = String(row[6] || "").trim();
  if (status) statusCount[status] = (statusCount[status] || 0) + 1;
  if (category) categoryCount[category] = (categoryCount[category] || 0) + 1;
  if (sector) sectorCount[sector] = (sectorCount[sector] || 0) + 1;
  if (pic) picCount[pic] = (picCount[pic] || 0) + 1;
}
console.log("\n--- EPL Status Distribution ---", statusCount);
console.log("--- EPL Category Distribution ---", categoryCount);
console.log("--- EPL Sector Distribution ---", sectorCount);
console.log("--- EPL PIC Distribution ---", picCount);
console.log("--- EPL Total Data Rows ---", eplRows.length - 1);

// Deep dive Project By Status sheet (Pivot Table)
console.log("\n\n=== SHEET: Project By Status (Pivot) ===");
const pivotSheet = wb.Sheets["Project By Status"];
const pivotRows = xlsx.utils.sheet_to_json(pivotSheet, { header: 1 }) as any[][];
for (let r = 0; r < pivotRows.length; r++) {
  console.log(`Row ${r}: ${JSON.stringify(pivotRows[r])}`);
}

// Deep dive Booking FC sheet
console.log("\n\n=== SHEET: Booking FC ===");
const bookingSheet = wb.Sheets["Booking FC"];
const bookingRows = xlsx.utils.sheet_to_json(bookingSheet, { header: 1 }) as any[][];
for (let r = 0; r < Math.min(15, bookingRows.length); r++) {
  console.log(`Row ${r}: ${JSON.stringify(bookingRows[r])}`);
}

// Deep dive Pipeline sheet
console.log("\n\n=== SHEET: Pipeline ===");
const pipelineSheet = wb.Sheets["Pipeline"];
const pipelineRows = xlsx.utils.sheet_to_json(pipelineSheet, { header: 1 }) as any[][];
for (let r = 0; r < Math.min(15, pipelineRows.length); r++) {
  console.log(`Row ${r}: ${JSON.stringify(pipelineRows[r])}`);
}

// Deep dive Pipeline OPS (2) - check statuses
console.log("\n\n=== SHEET: Pipeline OPS (2) - Status Distribution ===");
const opsSheet = wb.Sheets["Pipeline OPS (2)"];
const opsRows = xlsx.utils.sheet_to_json(opsSheet, { header: 1 }) as any[][];
const opsStatusCount: Record<string, number> = {};
for (let r = 2; r < opsRows.length; r++) {
  const status = String(opsRows[r]?.[1] || "").trim();
  if (status) opsStatusCount[status] = (opsStatusCount[status] || 0) + 1;
}
console.log("OPS Status Distribution:", opsStatusCount);
console.log("OPS Total Data Rows:", opsRows.length - 2);

// Show first sheet (PIPELINE FY22-26) structure
console.log("\n\n=== SHEET 1 (first sheet) - More Rows ===");
const firstSheet = wb.Sheets[wb.SheetNames[0]];
const firstRows = xlsx.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
for (let r = 0; r < Math.min(8, firstRows.length); r++) {
  console.log(`Row ${r}: ${JSON.stringify(firstRows[r])}`);
}

// EPL Partnership  
console.log("\n\n=== SHEET: EPL PARTNERSHIP - Full ===");
const partSheet = wb.Sheets["EPL PARTNERSHIP"];
const partRows = xlsx.utils.sheet_to_json(partSheet, { header: 1 }) as any[][];
const partStatusCount: Record<string, number> = {};
const partSectorCount: Record<string, number> = {};
for (let r = 1; r < partRows.length; r++) {
  const status = String(partRows[r]?.[5] || "").trim();
  const sector = String(partRows[r]?.[3] || "").trim();
  if (status) partStatusCount[status] = (partStatusCount[status] || 0) + 1;
  if (sector) partSectorCount[sector] = (partSectorCount[sector] || 0) + 1;
}
console.log("Partnership Status:", partStatusCount);
console.log("Partnership Sector:", partSectorCount);
