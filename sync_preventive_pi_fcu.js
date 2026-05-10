const { PrismaClient } = require('./src/generated/client_v2');
const prisma = new PrismaClient();

const DATA = [
  { date: "2026-03-02", floor: "L1", area: "Jakarta", tenant: "TED BAKER 001", brand: "MC QUAY", model: "MDB 75", amp_nameplate: "3.5", amp_before_r: "2.3", amp_before_s: "2.2", amp_before_t: "2.3", amp_after_r: "2.5", amp_after_s: "2.4", amp_after_t: "2.5", temp_diff_before: "18.5", temp_diff_after: "17.8", temp_room_before: "24.5", temp_room_after: "24.2", diffuser_count: 2, airflow_before: "1250", airflow_after: "1350", air_volume_nameplate: 2400, performa: "82", remarks: "NORMAL" },
  { date: "2026-03-02", floor: "L1", area: "Jakarta", tenant: "TED BAKER 002", brand: "MC QUAY", model: "MCC 30", amp_nameplate: "1.5", amp_before_r: "1.0", amp_before_s: "0.9", amp_before_t: "1.0", amp_after_r: "1.1", amp_after_s: "1.0", amp_after_t: "1.1", temp_diff_before: "18.2", temp_diff_after: "17.5", temp_room_before: "24.3", temp_room_after: "24.0", diffuser_count: 1, airflow_before: "850", airflow_after: "920", air_volume_nameplate: 1000, performa: "85", remarks: "NORMAL" },
  { date: "2026-03-02", floor: "L1", area: "Jakarta", tenant: "PAPILION DUO", brand: "MC QUAY", model: "MCC 30", amp_nameplate: "1.5", amp_before_r: "0.9", amp_before_s: "0.8", amp_before_t: "0.9", amp_after_r: "1.0", amp_after_s: "0.9", amp_after_t: "1.0", temp_diff_before: "18.1", temp_diff_after: "17.5", temp_room_before: "24.2", temp_room_after: "24.1", diffuser_count: 1, airflow_before: "820", airflow_after: "890", air_volume_nameplate: 1000, performa: "88", remarks: "NORMAL" },
  { date: "2026-03-08", floor: "L1", area: "Jakarta", tenant: "NARS 001", brand: "MC QUAY", model: "MCC 30", amp_nameplate: "1.5", amp_before_r: "1.2", amp_before_s: "1.1", amp_before_t: "1.2", amp_after_r: "1.3", amp_after_s: "1.2", amp_after_t: "1.3", temp_diff_before: "19.8", temp_diff_after: "19.3", temp_room_before: "25.1", temp_room_after: "24.8", diffuser_count: 1, airflow_before: "780", airflow_after: "810", air_volume_nameplate: 1000, performa: "75", remarks: "MEDIUM" },
  { date: "2026-03-08", floor: "L1", area: "Jakarta", tenant: "NARS 002", brand: "MC QUAY", model: "MCC 60", amp_nameplate: "3.0", amp_before_r: "2.2", amp_before_s: "2.1", amp_before_t: "2.2", amp_after_r: "2.4", amp_after_s: "2.3", amp_after_t: "2.4", temp_diff_before: "19.6", temp_diff_after: "19.1", temp_room_before: "24.9", temp_room_after: "24.5", diffuser_count: 2, airflow_before: "1150", airflow_after: "1280", air_volume_nameplate: 2000, performa: "81", remarks: "NORMAL" }
];

const PROJECT_REF_ID = 1;

async function sync() {
  console.log(`Starting FCU Preventive sync for ${DATA.length} records...`);
  let createdUnits = 0;
  let linkedActivities = 0;

  for (const row of DATA) {
    try {
      // 1. Find or Create Unit
      let unit = await prisma.units.findFirst({
        where: {
          project_ref_id: BigInt(PROJECT_REF_ID),
          room_tenant: { contains: row.tenant }
        }
      });

      if (!unit) {
        unit = await prisma.units.create({
          data: {
            project_ref_id: BigInt(PROJECT_REF_ID),
            customer_name: "Plaza Indonesia",
            room_tenant: row.tenant,
            building_floor: row.floor,
            unit_type: "FCU",
            brand: row.brand,
            model: row.model,
            status: "Normal",
            location: "Jakarta"
          }
        });
        createdUnits++;
      }

      // 2. Create or Update Preventive Activity
      const serviceDate = new Date(row.date);
      const activityDate = isNaN(serviceDate.getTime()) ? new Date() : serviceDate;
      
      const existingActivity = await prisma.service_activities.findFirst({
        where: {
          unit_id: unit.id,
          type: "Preventive",
          service_date: activityDate,
          deleted_at: null
        }
      });

      const technicalData = {
        parameters: {
          amp: { 
            nameplate: row.amp_nameplate,
            r: { before: row.amp_before_r || row.amp_before, after: row.amp_after_r || row.amp_after },
            s: { before: row.amp_before_s, after: row.amp_after_s },
            t: { before: row.amp_before_t, after: row.amp_after_t }
          },
          diff_temp: { before: row.temp_diff_before, after: row.temp_diff_after },
          room_temp: { before: row.temp_room_before, after: row.temp_room_after },
          airflow: { before: row.airflow_before, after: row.airflow_after },
          diffuser_count: row.diffuser_count || 1,
          air_volume_actual: row.air_volume_actual || row.performa_cfm,
          air_volume_nameplate: row.air_volume_nameplate,
          performa_score: row.performa
        },
        source: "Bulk Sync Plaza Indonesia FCU"
      };

      if (existingActivity) {
        // MERGE LOGIC
        const oldJson = JSON.parse(existingActivity.technical_json || "{}");
        const mergedJson = { ...oldJson, ...technicalData };
        let mergedNote = existingActivity.engineer_note || "";
        if (row.remarks && !mergedNote.includes(row.remarks)) {
          mergedNote += (mergedNote ? " | " : "") + row.remarks;
        }

        await prisma.service_activities.update({
          where: { id: existingActivity.id },
          data: {
            engineer_note: mergedNote,
            technical_json: JSON.stringify(mergedJson)
          }
        });
      } else {
        await prisma.service_activities.create({
          data: {
            units: { connect: { id: unit.id } },
            type: "Preventive",
            service_date: activityDate,
            amp_r: row.amp_after,
            leaving_db: row.temp_supply_after,
            entering_db: row.temp_supply_after, // Default to discharge for entering if only one temp provided
            room_db: row.temp_room_after,
            status: "Pending",
            inspector_name: "Tim Teknisi PI",
            engineer_note: row.remarks,
            technical_json: JSON.stringify(technicalData)
          }
        });
      }
      linkedActivities++;

    } catch (err) {
      console.error(`Error syncing ${row.tenant}:`, err.message);
    }
  }

  console.log(`Sync Complete!`);
  console.log(`New Units Created: ${createdUnits}`);
  console.log(`Activities Logged: ${linkedActivities}`);
  await prisma.$disconnect();
}

sync();
