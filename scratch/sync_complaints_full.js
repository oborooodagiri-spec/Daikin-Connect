/**
 * FULL BULK COMPLAINT SYNC SCRIPT - ALL 281 ROWS
 * Parses the CSV data directly from the spreadsheet export
 * Project: Plaza Indonesia (ID: 1)
 */

const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, '');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const monthMap = {
  'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
  'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
  'september': '09', 'oktober': '10', 'november': '11', 'desember': '12',
  'january': '01', 'february': '02', 'march': '03'
};

function parseDateStr(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const s = dateStr.trim();
  // "01 Maret 2026" or "4 Maret 2026"
  const m = s.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = monthMap[m[2].toLowerCase()];
    if (month) return new Date(`${m[3]}-${month}-${day}T00:00:00`);
  }
  // ISO format
  if (s.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(s);
  return null;
}

async function main() {
  const PROJECT_ID = BigInt(1);
  
  // Read the CSV content from the downloaded file
  const csvPath = path.join(__dirname, 'complaints_raw.csv');
  
  let rawContent;
  try {
    rawContent = fs.readFileSync(csvPath, 'utf8');
  } catch (e) {
    console.error("Cannot read CSV file:", e.message);
    return;
  }
  
  // Extract CSV portion (skip the markdown header)
  const csvStart = rawContent.indexOf('Control+A');
  if (csvStart === -1) {
    console.error("Cannot find CSV data in file");
    return;
  }
  
  const csvData = rawContent.substring(csvStart);
  const allLines = csvData.split('\n').map(l => l.replace(/\r$/, ''));
  
  // Parse header - find "No" column
  // The CSV has these columns (from the header line):
  // [empty], No, Tanggal, Jam Complaint, Lantai, Jenis Unit, Tag No., Brand, Model, 
  // Nama Teknisi, Nama Supervisor, Kategori, Root Cause Analysis, Corrective Action,
  // Rekomendasi, Last PM, Status, [empty], Tenant / Area, ...
  
  console.log("=== FULL BULK COMPLAINT SYNC - Plaza Indonesia ===");
  console.log(`Total CSV lines: ${allLines.length}\n`);
  
  // Skip header (line 0 = Control+A, line 1 = headers)
  // Data starts at line 2
  
  let imported = 0;
  let created_units = 0;
  let skipped = 0;
  let already_exists = 0;
  const errors = [];
  
  // We need to handle multi-line CSV rows (when fields contain newlines)
  // Strategy: Concatenate lines that don't start with a valid row pattern
  const dataLines = [];
  let currentLine = '';
  
  for (let i = 2; i < allLines.length; i++) {
    const line = allLines[i];
    // A new data row starts with either ",<number>," or "<number>,<number>,"
    // Check if line starts with a valid row pattern
    const isNewRow = /^(\d*),(\d+),\d{1,2}\s+\w+\s+\d{4}/.test(line) || 
                     /^,(\d+),\d{1,2}\s+\w+\s+\d{4}/.test(line) ||
                     /^(\d*),(\d+),(\d{1,2}\s+\w+\s+\d{4})/.test(line) ||
                     /^,(\d+),,,/.test(line); // Empty date rows
    
    if (isNewRow && currentLine) {
      dataLines.push(currentLine);
      currentLine = line;
    } else if (isNewRow && !currentLine) {
      currentLine = line;
    } else {
      // Continuation of previous line (multi-line cell)
      currentLine += ' ' + line;
    }
  }
  if (currentLine) dataLines.push(currentLine);
  
  console.log(`Parsed ${dataLines.length} data rows\n`);
  
  // Track unit count for tag generation
  let unitCount = await prisma.units.count({ where: { project_ref_id: PROJECT_ID } });
  
  for (const line of dataLines) {
    const cols = parseCSVLine(line);
    
    // Extract fields by position
    // cols[0] = annotation/empty, cols[1] = No, cols[2] = Tanggal, cols[3] = Jam,
    // cols[4] = Lantai, cols[5] = Jenis Unit, cols[6] = Tag No., cols[7] = Brand,
    // cols[8] = Model, cols[9] = Nama Teknisi, cols[10] = Nama Supervisor,
    // cols[11] = Kategori, cols[12] = Root Cause Analysis, cols[13] = Corrective Action,
    // cols[14] = Rekomendasi, cols[15] = Last PM, cols[16] = Status,
    // cols[17] = annotation2, cols[18] = Tenant / Area
    
    const no = parseInt(cols[1]);
    const tanggal = cols[2];
    const lantai = cols[4];
    const jenisUnit = cols[5];
    const tagNo = cols[6];
    const brand = cols[7];
    const model = cols[8];
    const teknisi = cols[9];
    const supervisor = cols[10];
    const kategori = cols[11];
    const rca = cols[12];
    const ca = cols[13];
    const rekomendasi = cols[14];
    const lastPM = cols[15];
    const status = cols[16];
    const tenant = cols[18];
    
    // Skip invalid rows
    if (!no || isNaN(no)) { skipped++; continue; }
    if (!tenant || tenant.trim() === '') { skipped++; continue; }
    
    const serviceDate = parseDateStr(tanggal);
    if (!serviceDate) { skipped++; continue; }
    
    // Skip if complaint already imported (check by complaint number)
    const existingCheck = await prisma.service_activities.findFirst({
      where: {
        type: "Corrective",
        technical_json: { contains: `"complaint_no":${no}` }
      }
    });
    
    if (existingCheck) {
      already_exists++;
      continue;
    }
    
    try {
      const cleanTenant = tenant.trim();
      const cleanFloor = (lantai || '').trim();
      const cleanUnitType = (jenisUnit || 'FCU').trim().toUpperCase()
        .replace('SPLIT DUCT', 'Split').replace('SPLIT', 'Split').replace('SPLIT', 'Split');
      const finalUnitType = cleanUnitType === 'SPLIT' ? 'Split' : cleanUnitType;
      
      // ===== FIND OR CREATE UNIT =====
      let unit = null;
      
      // Strategy 1: Exact room_tenant match
      unit = await prisma.units.findFirst({
        where: {
          project_ref_id: PROJECT_ID,
          room_tenant: cleanTenant
        }
      });
      
      // Strategy 2: Case-insensitive partial match
      if (!unit) {
        const candidates = await prisma.units.findMany({
          where: {
            project_ref_id: PROJECT_ID,
            room_tenant: { contains: cleanTenant.substring(0, Math.min(8, cleanTenant.length)) }
          }
        });
        
        unit = candidates.find(u => {
          const a = norm(u.room_tenant);
          const b = norm(cleanTenant);
          return a === b || a.includes(b) || b.includes(a);
        });
      }
      
      // Strategy 3: Create new unit
      if (!unit) {
        const p = await prisma.projects.findUnique({
          where: { id: PROJECT_ID },
          select: { customer_id: true }
        });
        
        unitCount++;
        const ccc = String(p?.customer_id || 1).padStart(3, '0');
        const uuu = String(unitCount).padStart(3, '0');
        const newTag = `DKN${ccc}${uuu}`;
        const qrToken = crypto.randomBytes(16).toString('hex');
        
        unit = await prisma.units.create({
          data: {
            project_ref_id: PROJECT_ID,
            qr_code_token: qrToken,
            tag_number: newTag,
            brand: (brand || "Daikin").trim(),
            model: model?.trim() || null,
            unit_type: finalUnitType || "FCU",
            building_floor: cleanFloor || null,
            room_tenant: cleanTenant,
            status: "Normal"
          }
        });
        created_units++;
        console.log(`  🆕 Unit: ${newTag} | ${cleanTenant} (${cleanFloor})`);
      }
      
      // ===== CREATE CORRECTIVE REPORT =====
      const cleanKategori = (kategori || "Lainnya").trim();
      const cleanRca = (rca || "").trim();
      const cleanCa = (ca || "").trim();
      const cleanRekom = (rekomendasi || "").trim();
      const cleanTeknisi = (teknisi || supervisor || "Bulk Synchronized").trim();
      
      let actStatus = "Final_Approved";
      const rawStatus = (status || "").toLowerCase().trim();
      if (rawStatus === "pending") actStatus = "Pending";
      else if (rawStatus === "cross check") actStatus = "Pending";
      
      await prisma.service_activities.create({
        data: {
          unit_id: unit.id,
          type: "Corrective",
          service_date: serviceDate,
          status: actStatus,
          inspector_name: cleanTeknisi,
          engineer_note: `[${cleanKategori}] ${cleanRca || 'Complaint dari tenant'}`,
          technical_advice: cleanRekom || cleanCa || "-",
          unit_tag: unit.tag_number,
          location: `${cleanFloor} - ${cleanTenant}`,
          technical_json: JSON.stringify({
            import_source: "Complaint Spreadsheet Sync",
            complaint_no: no,
            kategori: cleanKategori,
            root_cause: cleanRca,
            corrective_action: cleanCa,
            rekomendasi: cleanRekom,
            original_status: status || "Unknown"
          })
        }
      });
      
      await prisma.corrective.create({
        data: {
          unit_id: unit.id,
          service_date: serviceDate,
          technician_name: cleanTeknisi,
          case_complain: `[${cleanKategori}] ${cleanRca || 'Complaint dari tenant'}`,
          root_cause: cleanRca || "-",
          temp_action: cleanCa || "-",
          perm_action: cleanRekom || "-",
          recommendation: cleanRekom || cleanCa || "-",
          status: actStatus === "Final_Approved" ? "Final Approved" : "Pending"
        }
      });
      
      imported++;
      if (imported % 25 === 0) console.log(`  ✅ ${imported} complaints synced...`);
      
    } catch (err) {
      skipped++;
      errors.push(`#${no} ${tenant}: ${err.message?.substring(0, 80)}`);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Imported: ${imported} complaints`);
  console.log(`🆕 New units created: ${created_units}`);
  console.log(`📋 Already existed (skipped dupes): ${already_exists}`);
  console.log(`⏭️  Skipped (invalid/empty): ${skipped}`);
  if (errors.length > 0) {
    console.log(`\n❌ Errors (first 15):`);
    errors.slice(0, 15).forEach(e => console.log(`   - ${e}`));
  }
  console.log(`${'='.repeat(50)}\n`);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error("FATAL:", e);
  prisma.$disconnect();
});
