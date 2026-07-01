import { PrismaClient } from "../src/generated/client_v3/index.js";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding from excel dump...");
  
  const dumpRaw = fs.readFileSync("excel_dump.json", "utf-8");
  const dump = JSON.parse(dumpRaw);
  
  let insertedCount = 0;
  
  for (const item of dump) {
    const desc = item.desc.trim();
    const price = Number(item.price);
    
    // Filter out headers, empty desc, invalid prices
    if (!desc || desc.length <= 2) continue;
    if (isNaN(price) || price < 1000) continue; // Items under Rp 1000 usually invalid or headers
    
    const ignoreList = ["harga", "vendor margin", "description", "pricelist", "size", "merk", "after discount", "include ppn", "type", "model", "diameter"];
    if (ignoreList.some(ig => desc.toLowerCase().includes(ig))) continue;
    
    // Check if it's just a size like "3/4\"" or "10\"" without any other text.
    // Usually sizes alone shouldn't be added without their parent category, but the Excel is messy.
    // Let's attach context. If desc is just a size, we skip it unless we know the context.
    // Actually, let's just insert it. The user wants *all* lists and data.
    
    const exist = await prisma.pricelist_items.findFirst({ where: { name: desc } });
    if (!exist) {
      // Determine category roughly based on context
      let cat = "General Equipment";
      const ctx = item.context.toLowerCase();
      if (ctx.includes("copper") || ctx.includes("tembaga") || ctx.includes("pipa") || ctx.includes("astm")) cat = "Copper Pipe & Accessories";
      else if (ctx.includes("valve") || ctx.includes("yoshitake") || ctx.includes("flange")) cat = "Valves & Flanges";
      else if (ctx.includes("kabel") || ctx.includes("cable") || ctx.includes("nyy") || ctx.includes("nya")) cat = "Electrical Cable";
      else if (ctx.includes("honeywell") || ctx.includes("actuator") || ctx.includes("sensor")) cat = "Controls & Sensors";
      else if (ctx.includes("isolasi") || ctx.includes("armaflex")) cat = "Insulation";
      else if (ctx.includes("bjls") || ctx.includes("ducting")) cat = "Ducting Materials";
      
      try {
        await prisma.pricelist_items.create({
          data: {
            category: cat,
            name: desc.substring(0, 250),
            unit: "Unit", // Generic unit
            price: price,
            specification: "Extracted from Excel"
          }
        });
        insertedCount++;
      } catch (e) {
        console.error("Error inserting:", desc);
      }
    }
  }

  console.log(`Successfully seeded ${insertedCount} items from excel dump.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
