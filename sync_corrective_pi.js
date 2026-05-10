const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

const DATA = [
  { date: "2026-03-01", floor: "L5", tenant: "TERAS BY PLATARAN", brand_model: "TRANE HCCA 24", issue: "Motor Short Body", action: "Bongkar & pasang Motor AC FCU Merk TRANE HCCA 24, Kondisi saat ini unit AC sudah Running", qty: 1, status: "Done" },
  { date: "2026-03-04", floor: "L3", tenant: "MARK & SPENCER", brand_model: "MC QUAY MDB 75", issue: "Motor Short Body", action: "Pasang Motor AC FCU (2 unit); unit running.", status: "Done" },
  { date: "2026-03-06", floor: "L1", tenant: "JADE", brand_model: "TRANE HCCA 24", issue: "Thermostat rusak", action: "Bongkar & pasang Thermostat Analog Honeywell.", status: "Done" },
  { date: "2026-03-18", floor: "L3", tenant: "YANTI", brand_model: "TRANE HCCA 18", issue: "Thermostat rusak", action: "Bongkar & pasang Thermostat Analog Honeywell.", status: "Done" },
  { date: "2026-03-18", floor: "L5", tenant: "TERAS BY PLATARAN", brand_model: "TRANE HCCA 24", issue: "Motor Short Body", action: "Pasang Motor AC FCU; unit running.", status: "Done" },
  { date: "2026-03-30", floor: "L5", tenant: "SUSHI - TEI", brand_model: "MC QUAY MDB 75", issue: "Motor Short Body", action: "Pasang Motor AC FCU; unit running.", status: "Done" },
  { date: "2026-04-02", floor: "L1", tenant: "TORRY BURCH", brand_model: "MC QUAY MCC 60", issue: "Motor Short Body", action: "Bongkar & pasang Motor AC FCU; unit running.", status: "Done" },
  { date: "2026-04-02", floor: "L3", tenant: "MUSIQUE", brand_model: "HONEYWELL ANALOG", issue: "Thermostat rusak", action: "Bongkar & pasang Thermostat Analog Honeywell.", status: "Done" },
  { date: "2026-04-20", floor: "L3", tenant: "ex. MISS MONDIAL", brand_model: "TRANE HCCA 18", issue: "Motor Short Body", action: "Bongkar Fan Motor AC FCU Merk TRANE.", status: "Done" },
  { date: "2026-04-02", floor: "L1", tenant: "ex. MISS MONDIAL", brand_model: "TRANE HCCA 18", issue: "Bak Drain keropos", action: "Bongkar & pasang Bak Drain.", status: "Done" },
  { date: "2026-04-03", floor: "L1", tenant: "FAURE LE FAGE", brand_model: "MC QUAY MCC 40", issue: "Bearing Motor Macet", action: "Bongkar & pasang Fan Motor Merk MC QUAY.", status: "Done" },
  { date: "2026-04-09", floor: "L1", tenant: "VALENTINO", brand_model: "-", issue: "Thermostat rusak", action: "Bongkar & pasang Thermostat Analog Honeywell.", status: "Done" },
  { date: "2026-04-13", floor: "L3", tenant: "MASSHIRO & CO", brand_model: "MC QUAY MCC 40", issue: "Motor Overheat", action: "-", status: "Pending" },
  { date: "2026-04-13", floor: "L3", tenant: "IBOX", brand_model: "MC QUAY MDB 75", issue: "Motor Short Body", action: "Bongkar & Pasang Motor (18 April 2026).", status: "Done" },
  { date: "2026-04-14", floor: "L3", tenant: "BAM SENJU", brand_model: "TRANE HCCA 24", issue: "Motor Terbakar", action: "Bongkar Motor Merk TRANE HCCA 24.", status: "Pending" },
  { date: "2026-04-16", floor: "L3", tenant: "OSIM", brand_model: "MC QUAY MCC 60", issue: "Motor Short Body", action: "-", status: "Pending" },
  { date: "2026-04-17", floor: "L5", tenant: "MO-MO PARADISE", brand_model: "MC QUAY MDB 75", issue: "Bearing Motor Macet", action: "-", status: "Pending" },
  { date: "2026-04-18", floor: "L4", tenant: "D' HEAD LINE", brand_model: "MC QUAY MDB 75", issue: "Bearing Motor Macet", action: "-", status: "Pending" },
  { date: "2026-04-19", floor: "L5", tenant: "SATE KHAS SENAYAN", brand_model: "MC QUAY MCC 60", issue: "Motor Short Body", action: "-", status: "Pending" },
  { date: "2026-04-19", floor: "L2", tenant: "BEBEK BENGIL", brand_model: "YORK SBH 100 DW", issue: "Motor Short Body", action: "-", status: "Pending" },
  { date: "2026-04-21", floor: "L4", tenant: "TALENTA EXIHITION", brand_model: "MC QUAY MDB 75", issue: "Motor Short Body", action: "-", status: "Pending" },
  { date: "2026-04-26", floor: "L4", tenant: "BUTTON SCARVES", brand_model: "MC QUAY MDB 75", issue: "Motor Short Body", action: "-", status: "Pending" },
  { date: "2026-04-26", floor: "LB", tenant: "LOCK & LOCK", brand_model: "TRANE HFCA 12", issue: "Thermostat rusak", action: "Bongkar & pasang Thermostat Analog Honeywell.", status: "Done" },
  { date: "2026-04-28", floor: "L3", tenant: "RR CHOCOLATE", brand_model: "MC QUAY MDB 75", issue: "Motor Short Body", action: "Pasang Motor AC FCU; unit running.", status: "Done" },
  { date: "2026-04-29", floor: "L6", tenant: "CORRIDOR XINEMA XXI", brand_model: "MC QUAY MDB 75", issue: "Motor Short Body", action: "Bongkar & pasang Motor AC FCU; unit running.", status: "Done" },
  { date: "2026-04-29", floor: "L5", tenant: "TERAS BY PLATARAN", brand_model: "TRANE HCCA 24", issue: "Motor Short Body", action: "Bongkar & pasang Motor AC FCU; unit running.", status: "Done" },
  { date: "2026-04-29", floor: "L5", tenant: "TERAS BY PLATARAN", brand_model: "TRANE HCCA 24", issue: "Bak Drain Keropos", action: "Bongkar & pasang Bak Drain TRANE HCCA 24.", status: "Done" }
];

const PROJECT_REF_ID = 1;

async function sync() {
  console.log(`Starting sync for ${DATA.length} records...`);
  let createdUnits = 0;
  let linkedActivities = 0;

  for (const row of DATA) {
    try {
      // 1. Find or Create Unit
      let unit = await prisma.units.findFirst({
        where: {
          project_ref_id: BigInt(PROJECT_REF_ID),
          room_tenant: { contains: row.tenant },
          building_floor: row.floor
        }
      });

      if (!unit) {
        // Double check by just room_tenant if floor is inconsistent
        unit = await prisma.units.findFirst({
           where: {
             project_ref_id: BigInt(PROJECT_REF_ID),
             room_tenant: { contains: row.tenant }
           }
        });
      }

      if (!unit) {
        unit = await prisma.units.create({
          data: {
            project_ref_id: BigInt(PROJECT_REF_ID),
            customer_name: "Plaza Indonesia",
            room_tenant: row.tenant,
            building_floor: row.floor,
            unit_type: "FCU",
            brand: row.brand_model.split(' ')[0],
            model: row.brand_model,
            status: "Normal",
            location: "Jakarta"
          }
        });
        createdUnits++;
      }

      // 2. Create or Update Corrective Activity
      const activityDate = new Date(row.date);
      const isComplaint = row.type?.toLowerCase().includes("complaint") || false;
      
      const existingActivity = await prisma.service_activities.findFirst({
        where: {
          unit_id: unit.id,
          type: "Corrective",
          service_date: activityDate,
          deleted_at: null,
          // Differentiate by source/json content
          technical_json: isComplaint ? { contains: "Complaint" } : { not: { contains: "Complaint" } }
        }
      });

      const technicalData = {
        brand_model: row.brand_model,
        corrective_action: row.action,
        qty: row.qty || 1,
        kategori: row.issue,
        rekomendasi: row.action,
        source: "Bulk Sync Plaza Indonesia"
      };

      if (existingActivity) {
        // MERGE LOGIC
        const oldJson = JSON.parse(existingActivity.technical_json || "{}");
        const mergedJson = { ...oldJson, ...technicalData };
        
        let mergedNote = existingActivity.engineer_note || "";
        if (row.issue && !mergedNote.includes(row.issue)) {
          mergedNote += (mergedNote ? " | " : "") + row.issue;
        }

        let mergedAdvice = existingActivity.technical_advice || "";
        if (row.action && !mergedAdvice.includes(row.action)) {
          mergedAdvice += (mergedAdvice ? " | " : "") + row.action;
        }

        await prisma.service_activities.update({
          where: { id: existingActivity.id },
          data: {
            engineer_note: mergedNote,
            technical_advice: mergedAdvice,
            technical_json: JSON.stringify(mergedJson)
          }
        });
      } else {
        await prisma.service_activities.create({
          data: {
            unit_id: unit.id,
            type: "Corrective",
            service_date: activityDate,
            engineer_note: row.issue,
            technical_advice: row.action,
            status: row.status === "Done" ? "Final_Approved" : "Pending",
            technical_json: JSON.stringify(technicalData)
          }
        });
      }
      linkedActivities++;

    } catch (error) {
      console.error(`Error syncing row ${row.tenant}:`, error.message);
    }
  }

  console.log(`Sync Complete!`);
  console.log(`New Units Created: ${createdUnits}`);
  console.log(`Activities Logged: ${linkedActivities}`);
  await prisma.$disconnect();
}

sync();
