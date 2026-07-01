import { PrismaClient } from "../src/generated/client_v3/index.js";
import xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Kabel from Excel...");
  
  const filePath = path.join(process.cwd(), "Data Project/Form/boq/kabel/kabel.xlsx");
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  let insertedCount = 0;
  
  // Track how many variants we've seen for a specific Cable Type + Size to assign "Core" or Variant number
  const variantCounter: Record<string, number> = {};

  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;
    
    // Only process rows that are final prices. "Vendor margin est." or rows with no labels but numbers
    const label = String(row[0] || "").toLowerCase();
    const isVendorMargin = label.includes("vendor margin") || label === "null" || label === "";
    // Wait, if it's "Kenaikan", skip it.
    if (label.includes("kenaikan") || label.includes("bantu") || label.includes("support") || label.includes("total")) {
      continue;
    }

    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      // Looking for a valid price > 1000
      if (typeof cell === "number" && cell > 1000) {
        
        let type = "Kabel";
        for (let up = r - 1; up >= 0; up--) {
          if (data[up] && typeof data[up][c] === "string" && data[up][c].length > 1 && !data[up][c].toLowerCase().includes("margin") && !data[up][c].toLowerCase().includes("total")) {
            type = data[up][c];
            break;
          }
        }

        let size = "Unknown Size";
        for (let up = r; up >= 0; up--) {
          if (data[up] && typeof data[up][2] === "string" && data[up][2].includes("mm²")) {
            size = data[up][2];
            break;
          }
        }

        if (size === "Unknown Size" || type === "Kabel") continue;

        const baseKey = `${type}-${size}`;
        if (!variantCounter[baseKey]) variantCounter[baseKey] = 1;
        else variantCounter[baseKey]++;

        const cores = [1, 2, 3, 4, 5, 7, 10, 12, 16, 19, 24, 30, 37];
        const coreStr = cores[variantCounter[baseKey] - 1] ? `${cores[variantCounter[baseKey] - 1]} Core` : `Varian ${variantCounter[baseKey]}`;

        const itemName = `Kabel ${type} ${coreStr} x ${size}`.replace(/ +/g, ' ').trim();

        const exist = await prisma.pricelist_items.findFirst({ where: { name: itemName } });
        if (!exist) {
          try {
            await prisma.pricelist_items.create({
              data: {
                category: "Electrical Cable",
                name: itemName.substring(0, 250),
                unit: "Meter",
                price: cell,
                specification: "Imported from kabel.xlsx"
              }
            });
            insertedCount++;
          } catch (e) {
            console.error("Error inserting:", itemName);
          }
        }
      }
    }
  }

  console.log(`Successfully seeded ${insertedCount} kabel items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
