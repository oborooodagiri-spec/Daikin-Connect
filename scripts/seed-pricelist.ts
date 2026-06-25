import { PrismaClient } from "../src/generated/client_v3/index.js";
import xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Master Pricelist from Excel...");
  
  const filePath = path.join(process.cwd(), "Data Project/Form/Pricelist/Pricelist Juni 2026.xlsx");
  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  
  // Use header: 1 to get a 2D array of cells
  const data: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  let insertedCount = 0;

  // We will scan for horizontal tables that have "Description" and "Pricelist IDR" (or similar)
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;

    // Scan the row for "Description"
    for (let c = 0; c < row.length; c++) {
      const cellVal = String(row[c] || "").trim().toLowerCase();
      
      // Strategy 1: "description" and "pricelist idr"
      if (cellVal === "description") {
        // Let's assume the table goes downwards from here until empty
        const categoryCell = data[Math.max(0, r - 2)][c] || data[Math.max(0, r - 3)][c] || "General";
        const category = String(categoryCell).trim() || "General Equipment";
        
        let priceCol = c + 1;
        if (String(row[c+1] || "").toLowerCase().includes("price")) priceCol = c + 1;
        if (String(row[c+2] || "").toLowerCase().includes("price")) priceCol = c + 2;

        console.log(`Found table: ${category} at col ${c}`);

        // Read downwards
        for (let dr = r + 1; dr < r + 100; dr++) {
          if (dr >= data.length || !data[dr]) break;
          const desc = data[dr][c];
          const price = parseFloat(data[dr][priceCol]);
          
          if (desc && !isNaN(price)) {
            const partNum = data[dr][c-1]; // usually part number is before description
            const name = partNum ? `${desc} (${partNum})` : String(desc);
            
            // Check if exist
            const exist = await prisma.pricelist_items.findFirst({ where: { name } });
            if (!exist) {
              await prisma.pricelist_items.create({
                data: {
                  category: String(category).substring(0, 100),
                  name: String(name).substring(0, 250),
                  unit: "Unit",
                  price: price,
                  specification: "Imported from Excel"
                }
              });
              insertedCount++;
            }
          } else if (!desc && !price) {
            // End of block maybe? Keep going a bit, or break
            if (!data[dr+1]?.[c] && !data[dr+2]?.[c]) break;
          }
        }
      }
    }
  }

  // Strategy 2: Copper Pipes (Hardcoded block reading for the complex matrix)
  // Pipe sizes are usually in row 1
  try {
    const pipeRow = data[1]; // row index 1
    const priceRow = data[2]; // row index 2
    if (pipeRow && priceRow && String(pipeRow[2]).includes("Pipe Size")) {
      console.log("Extracting Copper Pipes...");
      for (let c = 4; c < 18; c++) {
        const size = pipeRow[c];
        const price = parseFloat(priceRow[c]);
        if (size && !isNaN(price)) {
          const name = `Pipa Refrigerant ASTM B88 ${size}`;
          const exist = await prisma.pricelist_items.findFirst({ where: { name } });
          if (!exist) {
            await prisma.pricelist_items.create({
              data: {
                category: "Copper Pipe",
                name: name,
                unit: "Meter",
                price: price,
                specification: "ASTM B88 ex. Inaba Denko"
              }
            });
            insertedCount++;
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse copper pipes", e);
  }

  console.log(`Successfully seeded ${insertedCount} items from Excel.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
