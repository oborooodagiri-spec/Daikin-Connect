import { PrismaClient } from "../src/generated/client_v3/index.js";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Emptying old pipeline data...");
  await prisma.pipeline_deals.deleteMany({});
  await prisma.pipeline_ops.deleteMany({});

  console.log("Importing Pipeline Data from JSON...");
  
  const jsonPath = path.join(process.cwd(), "scripts", "prod-seed-data.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Could not find ${jsonPath}`);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const extracted = JSON.parse(rawData);
  let eplCount = 0;

  for (let r = 0; r < extracted.length; r++) {
    const data = extracted[r];
    try {
      await prisma.pipeline_deals.create({
        data: {
          client_name: data.client_name,
          area: data.area,
          project_name: data.project_name,
          bill_material: data.bill_material,
          type: data.type,
          region: data.region,
          pic: data.pic,
          category: data.category,
          sector: data.sector,
          quotation: data.quotation,
          status: data.status,
          target_po_date: data.target_po_date ? new Date(data.target_po_date) : null,
          est_booking_month: data.est_booking_month ? new Date(data.est_booking_month) : null,
          booking_fc: data.booking_fc,
          is_closed: data.is_closed,
          remarks: data.remarks,
          source: data.source,
          priority: data.priority
        }
      });
      eplCount++;
    } catch (e: any) {
      console.error(`EPL row ${r} error:`, e.message);
    }
  }
  console.log(`EPL: Imported ${eplCount} deals`);

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
      description: "Pipeline category list"
    },
    {
      key: "regions",
      value: JSON.stringify(["Sumatera", "Jakarta", "West Java", "Central Java", "East Java", "Bali Nusra", "Kalimantan", "Sulawesi", "Maluku", "Papua"]),
      description: "Pipeline regions list"
    },
    {
      key: "sectors",
      value: JSON.stringify(["High Rise", "Government", "Komersial", "Industri", "Hospital", "Heavy Industri", "Residensial"]),
      description: "Pipeline sectors list"
    }
  ];

  for (const s of settings) {
    await prisma.pipeline_settings.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: { key: s.key, value: s.value, description: s.description }
    });
  }

  // Update sync timestamp
  console.log("\n--- Seeding Pipeline Settings ---");
  await prisma.pipeline_settings.upsert({
    where: { key: "last_sync" },
    update: { value: new Date().toISOString() },
    create: {
      key: "last_sync",
      value: new Date().toISOString(),
      description: "Timestamp of last Excel data sync",
    },
  });

  console.log("Settings seeded.");

  console.log("\n========================================");
  console.log("IMPORT COMPLETE");
  console.log(`EPL Deals: ${eplCount}`);
  console.log(`Total: ${eplCount}`);
  console.log("========================================");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
