import { PrismaClient } from "../src/generated/client_v3/index.js";
import xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Cable Ladder/Tray from Excel...");
  
  const filePath = path.join(process.cwd(), "Data Project/Form/boq/Cable ladder, tray, underfloor duct (brand three start)/CABLE LADDER , CABLE TRAY , UNDERFLOOR DUCT MERK (THREE START).xlsx");
  const wb = xlsx.readFile(filePath);
  
  let insertedCount = 0;

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    let currentType = "";
    let currentHeight = "";
    let currentLength = "";
    let headers: string[] = [];

    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;

      const col0 = String(row[0] || "").trim();

      // Detect Table Title (e.g. "I.", "II.", "III.", "IV.")
      if (col0.match(/^[IVX]+\.$/)) {
        currentType = String(row[1] || "").trim();
        // Sometimes Height/Length is at col 4, 5 or 3, 4
        currentHeight = "";
        currentLength = "";
        for (let c = 2; c < row.length; c++) {
          const val = String(row[c] || "").trim();
          if (val.startsWith("H:")) currentHeight = val;
          if (val.startsWith("L :") || val.startsWith("L:")) currentLength = val;
        }
        headers = []; // reset headers
        continue;
      }

      // Detect Headers
      if (col0 === "No.") {
        headers = row.map(h => String(h || "").trim());
        continue;
      }

      // Parse Data rows
      if (headers.length > 0 && typeof row[0] === "number") {
        const width = row[1];
        
        // Loop through all price columns
        for (let c = 2; c < headers.length; c++) {
          const partType = headers[c];
          const priceStr = row[c];
          
          if (!partType || !priceStr || priceStr === "-") continue;
          
          const price = Number(priceStr);
          if (isNaN(price) || price <= 0) continue;

          // Assemble the name
          // e.g. "THREE START - CABLE LADDER TYPE SLU - STRAIGHT W:100 H: 100 mm L : 3000 mm"
          let name = `THREE START - ${currentType} - ${partType} W:${width}`;
          if (currentHeight) name += ` ${currentHeight}`;
          if (currentLength) name += ` ${currentLength}`;

          // Clean up multiple spaces
          name = name.replace(/\s+/g, ' ').trim();

          const exist = await prisma.pricelist_items.findFirst({ where: { name } });
          if (!exist) {
            try {
              await prisma.pricelist_items.create({
                data: {
                  category: "Cable Ladder & Tray",
                  name: name.substring(0, 250),
                  unit: partType.toLowerCase() === "straight" || partType.toLowerCase() === "cover" ? "Batang" : "Pcs",
                  price: price,
                  specification: "Merk THREE START"
                }
              });
              insertedCount++;
            } catch (e) {
              console.error("Error inserting:", name);
            }
          }
        }
      }
    }
  }

  console.log(`Successfully seeded ${insertedCount} Cable Ladder/Tray items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
