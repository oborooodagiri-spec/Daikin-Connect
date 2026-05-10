/**
 * SYNC AUDIT PENGUKURAN (Measurement) DATA
 * Source: Report Pengukuran day 1 - day 46 Plaza Indonesia.xlsx
 * Sheet: "Report Plaza Indonesia"
 * 
 * Maps 305 rows of AHU/FCU measurement data into service_activities (type: Audit)
 * with full technical_json including enthalpy, airflow, and capacity data.
 */

const { PrismaClient } = require('../src/generated/client_v2');
const xlsx = require('xlsx');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient();

// Configuration
const PROJECT_ID = 1n; // Plaza Indonesia
const XLSX_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\Report Pengukuran day 1 - day 46 Plaza Indonesia.xlsx';
const SHEET_NAME = 'Report Plaza Indonesia';
const DATA_START_ROW = 6; // Row 6 (0-indexed: 5) is where data starts

async function generateNextUnitTag(customerId) {
  const count = await prisma.units.count({
    where: { projects: { customer_id: customerId } }
  });
  
  const ccc = String(customerId).padStart(3, '0');
  const uuu = String(count + 1).padStart(3, '0');
  
  return `DKN${ccc}${uuu}`;
}

function excelDateToJS(serial) {
  if (!serial || isNaN(serial)) return null;
  // Excel epoch is Jan 1, 1900 (with the 1900 leap year bug)
  const utcDays = Math.floor(serial) - 25569;
  return new Date(utcDays * 86400 * 1000);
}

function cleanNum(val) {
  if (val === '' || val === null || val === undefined || val === '-') return 0;
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

async function main() {
  console.log("=== AUDIT PENGUKURAN BULK SYNC ===");
  console.log(`Source: ${XLSX_PATH}`);
  
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`XLSX file not found at ${XLSX_PATH}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(XLSX_PATH);
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    console.error(`Sheet "${SHEET_NAME}" not found. Available: ${workbook.SheetNames.join(', ')}`);
    process.exit(1);
  }

  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  console.log(`Total rows in sheet: ${rawData.length}`);

  const project = await prisma.projects.findUnique({
    where: { id: PROJECT_ID },
    select: { customer_id: true, name: true }
  });

  if (!project) {
    console.error("Project not found!");
    process.exit(1);
  }

  console.log(`Target Project: ${project.name} (ID: ${PROJECT_ID})`);

  // Load all existing units for this project for matching
  const existingUnits = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID },
    select: { id: true, tag_number: true, room_tenant: true, unit_type: true, code: true, building_floor: true }
  });

  console.log(`Existing units in project: ${existingUnits.length}`);

  // Build lookup maps
  // Key: "TENANT|CODE" → unit (for exact code+tenant match)
  const unitByTenantAndCode = {};
  const unitByTenantAndType = {};
  const unitByCode = {};
  existingUnits.forEach(u => {
    if (u.code && u.room_tenant) {
      const key = `${u.room_tenant.toUpperCase().trim()}|${u.code.toUpperCase().trim()}`;
      unitByTenantAndCode[key] = u;
    }
    const typeKey = `${(u.room_tenant || '').toUpperCase().trim()}|${(u.unit_type || '').toUpperCase().trim()}`;
    if (!unitByTenantAndType[typeKey]) unitByTenantAndType[typeKey] = u;
    if (u.code) {
      unitByCode[u.code.toUpperCase().trim()] = u;
    }
  });

  let imported = 0;
  let skipped = 0;
  let unitsCreated = 0;
  let duplicatesSkipped = 0;
  let errors = 0;

  // Headers are at row 4 (index 3), data starts at row 6 (index 5)
  for (let i = DATA_START_ROW - 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length < 10) continue;

    // Skip rows without a unit identifier
    const unitCode = String(row[4] || '').trim();  // Column E: No Unit (FCU 01, AHU B1-08)
    const tenant = String(row[10] || '').trim();    // Column K: Area/Tenant
    
    if (!unitCode || !tenant) {
      continue; // Skip empty rows
    }

    // Skip summary/formula rows
    const kategori = String(row[5] || '').trim().toUpperCase();
    if (kategori !== 'FCU' && kategori !== 'AHU') {
      continue;
    }

    try {
      // Parse dates
      const dateSerial = row[3]; // Column D: Date (end date / service date)
      let serviceDate = null;
      
      if (typeof dateSerial === 'number') {
        serviceDate = excelDateToJS(dateSerial);
      } else if (dateSerial) {
        serviceDate = new Date(dateSerial);
      }

      if (!serviceDate || isNaN(serviceDate.getTime())) {
        console.log(`  [SKIP] Row ${i+1}: Invalid date "${dateSerial}" for ${unitCode}`);
        skipped++;
        continue;
      }

      // Parse all measurement fields
      const floor = String(row[6] || '').trim();       // Column G: Lantai
      const brand = String(row[7] || '').trim();       // Column H: Merk
      const tahun = row[8] ? parseInt(row[8]) : null;  // Column I: Tahun
      const model = String(row[9] || '').trim();       // Column J: Type Unit
      
      const enteringDB = cleanNum(row[11]);    // Column L: EAT Entering DB
      const enteringRH = cleanNum(row[12]);    // Column M: Entering RH
      const leavingDB = cleanNum(row[13]);     // Column N: LAT Leaving DB
      const leavingRH = cleanNum(row[14]);     // Column O: Leaving RH
      const deltaT = cleanNum(row[15]);        // Column P: ΔT (calculated)
      const enteringEnthalpy = cleanNum(row[16]); // Column Q: Entering Enthalpy
      const leavingEnthalpy = cleanNum(row[17]);  // Column R: Leaving Enthalpy
      const enthalpyDiff = cleanNum(row[18]);     // Column S: ΔH
      const faceVelocity = cleanNum(row[19]);     // Column T: Face Velocity
      const faceArea = cleanNum(row[20]);          // Column U: Face Area
      const designAirflow = cleanNum(row[21]);     // Column V: Design Airflow (CFM)
      const actualAirflow = cleanNum(row[22]);     // Column W: Actual Airflow (CFM)
      const designCapacity = cleanNum(row[23]);    // Column X: Design Capacity (BTU/h)
      const actualCapacity = cleanNum(row[24]);    // Column Y: Actual Capacity (BTU/h)
      const capacityDelta = cleanNum(row[25]);     // Column Z: Selisih
      const healthStatus = String(row[26] || '').trim(); // Column AA: Status
      const healthScore = cleanNum(row[27]);       // Column AB: Efficiency %
      
      const chwsTemp = cleanNum(row[29]);     // Column AD: CHWS Temp
      const chwrTemp = cleanNum(row[30]);     // Column AE: CHWR Temp
      const deltaTWater = cleanNum(row[31]);  // Column AF: ΔT Water
      const powerKW = cleanNum(row[32]);      // Column AG: Power Input (KW)
      
      const keterangan = String(row[34] || '').trim();  // Column AI: Keterangan
      const tindakan = String(row[35] || '').trim();    // Column AJ: Tindakan

      // 1. Find matching unit — each spreadsheet row is a unique unitCode within a tenant
      let unit = null;

      // Strategy A: Match by tenant + code (most precise)
      const tenantCodeKey = `${tenant.toUpperCase()}|${unitCode.toUpperCase()}`;
      if (unitByTenantAndCode[tenantCodeKey]) {
        unit = unitByTenantAndCode[tenantCodeKey];
      }

      // Strategy B: Match by code only (if code is globally unique like "AHU B1-08")
      if (!unit) {
        const codeKey = unitCode.toUpperCase();
        if (unitByCode[codeKey]) {
          unit = unitByCode[codeKey];
        }
      }

      // Strategy C: For single-unit tenants, match by tenant name + unit type
      if (!unit) {
        const unitType = kategori === 'AHU' ? 'AHU' : 'FCU';
        const tenantKey = `${tenant.toUpperCase()}|${unitType}`;
        if (unitByTenantAndType[tenantKey]) {
          unit = unitByTenantAndType[tenantKey];
          // Mark this tenant as used so subsequent units create new records
          delete unitByTenantAndType[tenantKey];
        }
      }

      // Strategy D: Create new unit for each unique code+tenant
      if (!unit) {
        const tag = await generateNextUnitTag(project.customer_id);
        const qrToken = crypto.randomBytes(16).toString('hex');
        
        unit = await prisma.units.create({
          data: {
            project_ref_id: PROJECT_ID,
            tag_number: tag,
            code: unitCode,
            qr_code_token: qrToken,
            room_tenant: tenant,
            building_floor: floor || null,
            brand: brand || "Unknown",
            model: model || "Unknown",
            unit_type: kategori === 'AHU' ? 'AHU' : 'FCU',
            yoi: tahun || null,
            status: "Normal"
          }
        });
        
        // Add to lookup maps for subsequent rows
        existingUnits.push(unit);
        unitByTenantAndCode[tenantCodeKey] = unit;
        if (unitCode) unitByCode[unitCode.toUpperCase()] = unit;
        
        unitsCreated++;
        console.log(`  [NEW UNIT] ${tag} → ${tenant} (${unitCode}, ${kategori})`);
      }

      // 2. Check for duplicate
      const existingAudit = await prisma.service_activities.findFirst({
        where: {
          unit_id: unit.id,
          type: 'Audit',
          service_date: serviceDate,
          deleted_at: null
        }
      });

      if (existingAudit) {
        duplicatesSkipped++;
        continue;
      }

      // 3. Build technical_json
      const technicalData = {
        is_bulk_sync: true,
        import_source: "Bulk Audit Pengukuran (Plaza Indonesia)",
        unit_code: unitCode,
        
        // Enthalpy data
        entering_enthalpy: enteringEnthalpy,
        leaving_enthalpy: leavingEnthalpy,
        enthalpy_diff: enthalpyDiff,
        
        // Airflow data
        face_velocity: faceVelocity,
        face_area: faceArea,
        actual_airflow: actualAirflow,
        actual_cooling_capacity: actualCapacity,
        capacity_delta: capacityDelta,
        
        // Health assessment
        health_status: healthStatus,
        health_score: healthScore,
        
        // Water side
        delta_t: deltaT,
        delta_t_water: deltaTWater,
        power_kw: powerKW,
        
        // Remarks
        keterangan: keterangan,
        tindakan: tindakan,
        
        // Component conditions (default for bulk sync)
        fincoil_cond: healthScore >= 0.8 ? 'GOOD' : healthScore >= 0.5 ? 'GOOD' : 'BAD',
        drain_pan_cond: 'GOOD',
        blower_fan_cond: healthScore >= 0.5 ? 'GOOD' : 'BAD',
      };

      // 4. Create Audit service_activity
      await prisma.service_activities.create({
        data: {
          unit_id: unit.id,
          type: 'Audit',
          service_date: serviceDate,
          status: 'Final_Approved',
          inspector_name: 'Tim Audit PI',
          unit_tag: unit.tag_number,
          location: tenant,
          
          // Direct measurement columns
          entering_db: enteringDB,
          entering_rh: enteringRH,
          entering_wb: 0,
          leaving_db: leavingDB,
          leaving_rh: leavingRH,
          leaving_wb: 0,
          design_airflow: designAirflow,
          design_cooling_capacity: designCapacity,
          chws_temp: chwsTemp,
          chwr_temp: chwrTemp,
          
          // Power data
          amp_r: powerKW > 0 ? powerKW : 0,
          
          // Technical JSON with all computed values
          technical_json: JSON.stringify(technicalData),
          technical_advice: tindakan || keterangan || null,
          engineer_note: keterangan || healthStatus || null,
        }
      });

      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  Progress: ${imported} records imported...`);
      }
      
    } catch (err) {
      console.error(`  [ERROR] Row ${i+1} (${unitCode} - ${tenant}):`, err.message);
      errors++;
    }
  }

  console.log("\n=== AUDIT PENGUKURAN SYNC COMPLETE ===");
  console.log(`✅ New Audit Reports Created: ${imported}`);
  console.log(`⏭️  Duplicates Skipped: ${duplicatesSkipped}`);
  console.log(`🏗️  New Units Created: ${unitsCreated}`);
  console.log(`⚠️  Rows Skipped (invalid): ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  
  // Final count verification
  const totalAudits = await prisma.service_activities.count({ where: { type: 'Audit' } });
  console.log(`\n📊 Total Audit Reports in DB: ${totalAudits}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
