/**
 * SYNC AUDIT PHOTOS FROM XLSX
 * 
 * Extracts embedded images from the "Report Pengukuran" XLSX file,
 * compresses them with sharp (quality preservation), and links them
 * to the correct audit service_activities via activity_photos.
 * 
 * PIPELINE:
 * 1. Unzip XLSX → extract xl/media/*.jpeg (1207 images)
 * 2. Parse xl/drawings/drawing3.xml + drawing4.xml for image→cell mapping
 * 3. Parse sheet text data for cell→unit mapping
 * 4. Compress images with sharp (resize to max 800px, quality 80)
 * 5. Save to public/uploads/audit/
 * 6. Create activity_photos records linked to audit service_activities
 */

const { PrismaClient } = require('../src/generated/client_v2');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

// Configuration
const XLSX_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\Report Pengukuran day 1 - day 46 Plaza Indonesia.xlsx';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'audit');
const PROJECT_ID = 1n;

// Image compression settings (balance quality vs size)
const SHARP_OPTIONS = {
  maxWidth: 1024,       // Max width in pixels
  maxHeight: 768,       // Max height in pixels  
  jpegQuality: 78,      // JPEG quality (0-100), 78 is visually near-lossless
  progressive: true,    // Progressive JPEG for faster loading
};

/**
 * Parse drawing XML to map image filenames to row positions in the sheet
 * Each <xdr:twoCellAnchor> has a <xdr:from><xdr:row> and links to an image via rId
 */
function parseDrawingXml(drawingXml, relsXml) {
  // Parse the relationships to map rId → image filename
  const rIdToImage = {};
  const relsMatches = relsXml.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g);
  for (const m of relsMatches) {
    const rId = m[1];
    const target = m[2].replace('../media/', '');
    rIdToImage[rId] = target;
  }

  // Parse drawing XML for anchor positions
  // Each anchor maps an image to a cell position (row number)
  const imagePositions = [];

  // Match twoCellAnchor blocks
  const anchorRegex = /<xdr:twoCellAnchor[^>]*>([\s\S]*?)<\/xdr:twoCellAnchor>/g;
  let anchorMatch;
  while ((anchorMatch = anchorRegex.exec(drawingXml)) !== null) {
    const block = anchorMatch[1];
    
    // Get the "from" row (where the image is anchored)
    const fromRowMatch = block.match(/<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
    const fromColMatch = block.match(/<xdr:from>[\s\S]*?<xdr:col>(\d+)<\/xdr:col>/);
    
    // Get the image reference (r:embed)
    const embedMatch = block.match(/r:embed="(rId\d+)"/);
    
    if (fromRowMatch && embedMatch) {
      const row = parseInt(fromRowMatch[1]);
      const col = fromColMatch ? parseInt(fromColMatch[1]) : 0;
      const rId = embedMatch[1];
      const imageFile = rIdToImage[rId];
      
      if (imageFile) {
        imagePositions.push({
          row,
          col,
          imageFile,
          rId
        });
      }
    }
  }

  // Also handle oneCellAnchor
  const oneAnchorRegex = /<xdr:oneCellAnchor[^>]*>([\s\S]*?)<\/xdr:oneCellAnchor>/g;
  while ((anchorMatch = oneAnchorRegex.exec(drawingXml)) !== null) {
    const block = anchorMatch[1];
    const fromRowMatch = block.match(/<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
    const fromColMatch = block.match(/<xdr:from>[\s\S]*?<xdr:col>(\d+)<\/xdr:col>/);
    const embedMatch = block.match(/r:embed="(rId\d+)"/);
    
    if (fromRowMatch && embedMatch) {
      const row = parseInt(fromRowMatch[1]);
      const col = fromColMatch ? parseInt(fromColMatch[1]) : 0;
      const rId = embedMatch[1];
      const imageFile = rIdToImage[rId];
      
      if (imageFile) {
        imagePositions.push({ row, col, imageFile, rId });
      }
    }
  }

  return imagePositions;
}

/**
 * Build a lookup from the FOTO sheet text data: row → { unit, tenant, temuan, tindakan, day }
 * The sheet structure alternates between unit rows and tenant rows in groups.
 * Photos in a group belong to the unit+tenant pair above them.
 */
function buildFotoRowLookup(sheetData) {
  const lookup = {};
  let currentDay = '';
  let currentUnit = '';
  let currentTenant = '';
  let unitCodeNormalized = ''; // e.g., "FCU 01" for matching
  
  for (let i = 0; i < sheetData.length; i++) {
    const row = sheetData[i];
    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim();
    const colE = String(row[4] || '').trim();
    const colF = String(row[5] || '').trim();
    
    // Track current Day
    if (colA.toUpperCase().startsWith('DAY')) {
      currentDay = colA;
    }
    
    // Track current Unit + Tenant
    // Unit lines: "FCU -01 YORK 2023", "AHU LB-07 YORK 2015"
    // Tenant lines: "Tenant TOD'S" or just "TOD'S"
    if (colB && colB !== 'UNIT') {
      if (colB.match(/^(FCU|AHU)\s/i)) {
        currentUnit = colB;
        // Normalize unit code: "FCU -01 YORK 2023" → "FCU 01"
        const unitMatch = colB.match(/^(FCU|AHU)\s*[-]?\s*(\S+)/i);
        if (unitMatch) {
          unitCodeNormalized = `${unitMatch[1].toUpperCase()} ${unitMatch[2].replace(/^0+/, '') || unitMatch[2]}`;
        }
      } else {
        // If it's not a unit header, it's likely a tenant
        currentTenant = colB.replace(/^Tenant\s*/i, '').trim();
      }
    }
    
    lookup[i] = {
      day: currentDay,
      unit: currentUnit,
      unitCode: unitCodeNormalized,
      tenant: currentTenant,
      temuan: colE,
      tindakan: colF
    };
  }
  
  return lookup;
}

async function main() {
  console.log('=== AUDIT PHOTO EXTRACTION & SYNC ===');
  console.log(`Source: ${XLSX_PATH}`);
  
  if (!fs.existsSync(XLSX_PATH)) {
    console.error('XLSX file not found!');
    process.exit(1);
  }

  // Ensure upload directory exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // 1. Open XLSX as ZIP
  const zip = new AdmZip(XLSX_PATH);
  const entries = zip.getEntries();
  
  // Get all media files
  const mediaEntries = entries.filter(e => e.entryName.startsWith('xl/media/'));
  console.log(`Found ${mediaEntries.length} embedded media files`);

  // 2. Parse drawings for both FOTO sheets
  // Sheet 7 = "FOTO" → drawing3, Sheet 8 = "Foto Foto PI" → drawing4
  const drawingFiles = {};
  const relsFiles = {};
  
  entries.forEach(e => {
    if (e.entryName.match(/xl\/drawings\/drawing\d+\.xml$/)) {
      const num = e.entryName.match(/drawing(\d+)\.xml/)[1];
      drawingFiles[num] = e.getData().toString('utf8');
    }
    if (e.entryName.match(/xl\/drawings\/_rels\/drawing\d+\.xml\.rels$/)) {
      const num = e.entryName.match(/drawing(\d+)\.xml\.rels/)[1];
      relsFiles[num] = e.getData().toString('utf8');
    }
  });

  console.log('Drawing files found:', Object.keys(drawingFiles).join(', '));
  console.log('Rels files found:', Object.keys(relsFiles).join(', '));

  // 3. Parse the FOTO sheet text data for unit/tenant mapping
  const workbook = XLSX.readFile(XLSX_PATH);
  
  // Find which drawing corresponds to which sheet
  // Check worksheet rels to find drawing references
  const wsRelsEntries = entries.filter(e => e.entryName.includes('worksheets/_rels'));
  const sheetToDrawing = {};
  wsRelsEntries.forEach(e => {
    const sheetNum = e.entryName.match(/sheet(\d+)\.xml\.rels/)?.[1];
    if (sheetNum) {
      const content = e.getData().toString('utf8');
      const drawingMatch = content.match(/Target="\.\.\/drawings\/drawing(\d+)\.xml"/);
      if (drawingMatch) {
        sheetToDrawing[sheetNum] = drawingMatch[1];
      }
    }
  });
  console.log('Sheet→Drawing mapping:', JSON.stringify(sheetToDrawing));

  // Identify which sheet numbers are the photo sheets
  // Sheets: Summary(1), Report PI(2), PIVOT(3), TAHUN(4), DATA(5), Report GH(6), FOTO(7), Foto Foto PI(8), Foto Foto GHT(9), Komparasi(10)
  const fotoSheetNum = '7';  // FOTO
  const fotoPISheetNum = '8'; // Foto Foto PI

  // Build image position maps for relevant drawings
  const allImagePositions = [];
  
  for (const [sheetNum, drawingNum] of Object.entries(sheetToDrawing)) {
    // Only process photo sheets (7=FOTO, 8=Foto Foto PI)
    if (sheetNum !== fotoSheetNum && sheetNum !== fotoPISheetNum) continue;
    
    if (drawingFiles[drawingNum] && relsFiles[drawingNum]) {
      const positions = parseDrawingXml(drawingFiles[drawingNum], relsFiles[drawingNum]);
      const sheetName = sheetNum === fotoSheetNum ? 'FOTO' : 'Foto Foto PI';
      positions.forEach(p => {
        allImagePositions.push({ ...p, sheetName, sheetNum });
      });
      console.log(`Sheet ${sheetNum} (${sheetName}): ${positions.length} image positions found`);
    }
  }
  
  console.log(`Total image positions mapped: ${allImagePositions.length}`);

  // 4. Build text lookup for FOTO sheet
  const fotoSheet = workbook.Sheets['FOTO'];
  const fotoData = fotoSheet ? XLSX.utils.sheet_to_json(fotoSheet, { header: 1, defval: '' }) : [];
  const fotoLookup = buildFotoRowLookup(fotoData);

  // Also build lookup for Foto Foto PI
  const fotoPISheet = workbook.Sheets['Foto Foto PI'];
  const fotoPIData = fotoPISheet ? XLSX.utils.sheet_to_json(fotoPISheet, { header: 1, defval: '' }) : [];
  const fotoPILookup = buildFotoRowLookup(fotoPIData);

  // 5. Load all audit service_activities for matching
  const audits = await prisma.service_activities.findMany({
    where: { 
      type: 'Audit',
      units: { project_ref_id: PROJECT_ID },
      deleted_at: null
    },
    select: { 
      id: true, 
      unit_id: true, 
      location: true,
      service_date: true,
      technical_json: true,
      units: { select: { room_tenant: true, code: true, tag_number: true } }
    }
  });

  console.log(`Loaded ${audits.length} audit records for matching`);

  // Build tenant→audit lookup AND unitCode→audit lookup
  const auditByTenant = {};
  const auditByUnitCode = {};
  audits.forEach(a => {
    const tenant = (a.location || a.units?.room_tenant || '').toUpperCase().trim();
    if (!auditByTenant[tenant]) auditByTenant[tenant] = [];
    auditByTenant[tenant].push(a);
    
    // Also index by unit code from technical_json
    try {
      const tj = JSON.parse(a.technical_json || '{}');
      if (tj.unit_code) {
        const codeKey = `${tenant}|${tj.unit_code.toUpperCase().trim()}`;
        if (!auditByUnitCode[codeKey]) auditByUnitCode[codeKey] = a;
      }
    } catch (e) {}
  });

  // 6. Process images: Extract, Compress, Upload, Link
  let extracted = 0;
  let compressed = 0;
  let linked = 0;
  let skipped = 0;
  let errors = 0;
  const tenantRoundRobin = {}; // Track round-robin index per tenant

  // Create a map of imageFile → buffer from ZIP
  const imageBuffers = {};
  mediaEntries.forEach(e => {
    const name = e.entryName.replace('xl/media/', '');
    imageBuffers[name] = e.getData();
  });
  
  // Track processed images to avoid duplicates across sheets
  const processedImages = new Set();

  // Process each image position
  for (const imgPos of allImagePositions) {
    const { row, col, imageFile, sheetName } = imgPos;
    
    const sourceBuffer = imageBuffers[imageFile];
    if (!sourceBuffer || sourceBuffer.length < 1000) {
      skipped++;
      continue; // Skip tiny/corrupt files
    }

    // Skip .emf files (vector logos, not photos)
    if (imageFile.endsWith('.emf')) {
      skipped++;
      continue;
    }

    // Skip if already processed (same image referenced from both sheets)
    if (processedImages.has(imageFile)) {
      skipped++;
      continue;
    }
    processedImages.add(imageFile);

    try {
      // Get the text context for this row position
      const lookup = sheetName === 'FOTO' ? fotoLookup : fotoPILookup;
      const context = lookup[row] || {};
      
      // Need a tenant to match
      const tenant = context.tenant;
      if (!tenant) {
        skipped++;
        continue;
      }

      // Find matching audit — try unit code first, then tenant
      const tenantKey = tenant.toUpperCase().trim();
      let targetAudit = null;

      // Strategy 1: Match by tenant + unit code from FOTO sheet
      if (context.unitCode) {
        // The FOTO sheet has "FCU -01" → normalized to "FCU 1"  
        // The audit technical_json has "FCU 01"
        // Try several normalizations
        const fotoCode = context.unitCode.toUpperCase();
        const exactKey = `${tenantKey}|${fotoCode}`;
        
        if (auditByUnitCode[exactKey]) {
          targetAudit = auditByUnitCode[exactKey];
        } else {
          // Try matching with zero-padded number: "FCU 1" → "FCU 01"
          const padded = fotoCode.replace(/(\d+)$/, (m) => m.padStart(2, '0'));
          const paddedKey = `${tenantKey}|${padded}`;
          if (auditByUnitCode[paddedKey]) {
            targetAudit = auditByUnitCode[paddedKey];
          }
        }
      }

      // Strategy 2: Fall back to tenant-level round-robin
      if (!targetAudit) {
        const matchingAudits = auditByTenant[tenantKey];
        if (!matchingAudits || matchingAudits.length === 0) {
          skipped++;
          continue;
        }
        // Round-robin: distribute photos evenly across units for this tenant
        if (!tenantRoundRobin[tenantKey]) tenantRoundRobin[tenantKey] = 0;
        const idx = tenantRoundRobin[tenantKey] % matchingAudits.length;
        targetAudit = matchingAudits[idx];
        tenantRoundRobin[tenantKey]++;
      }

      // Compress image with sharp
      const compressedBuffer = await sharp(sourceBuffer)
        .resize(SHARP_OPTIONS.maxWidth, SHARP_OPTIONS.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: SHARP_OPTIONS.jpegQuality,
          progressive: SHARP_OPTIONS.progressive,
          mozjpeg: true // Use MozJPEG for better compression
        })
        .toBuffer();

      compressed++;

      // Save to uploads directory
      const fileName = `audit_${targetAudit.id}_${Date.now()}_${extracted}.jpg`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      fs.writeFileSync(filePath, compressedBuffer);

      // Calculate compression ratio
      const ratio = ((1 - compressedBuffer.length / sourceBuffer.length) * 100).toFixed(0);

      // Create activity_photos record
      await prisma.activity_photos.create({
        data: {
          activity_id: targetAudit.id,
          type: 'AUDIT',
          photo_url: fileName, // Just filename; reportDataHelper adds the /api/assets/audit/ prefix
          notes: context.temuan || null,
          description: context.tindakan || null,
          caption: `${context.day || ''} - ${tenant}`.trim(),
          media_type: 'image'
        }
      });

      linked++;
      extracted++;

      if (extracted % 100 === 0) {
        console.log(`  Progress: ${extracted} images processed (${ratio}% avg compression)...`);
      }
      
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.error(`  [ERROR] ${imageFile} (row ${row}):`, err.message);
      }
    }
  }

  // 7. Summary
  const uploadDirSize = fs.readdirSync(UPLOAD_DIR)
    .filter(f => f.startsWith('audit_'))
    .reduce((sum, f) => sum + fs.statSync(path.join(UPLOAD_DIR, f)).size, 0);

  console.log('\n=== PHOTO SYNC COMPLETE ===');
  console.log(`📸 Total Images Extracted: ${extracted}`);
  console.log(`🗜️  Images Compressed: ${compressed}`);
  console.log(`🔗 Photos Linked to Reports: ${linked}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`💾 Upload Size: ${(uploadDirSize / 1024 / 1024).toFixed(1)}MB (from ~92MB original)`);

  // Verify a sample
  const samplePhoto = await prisma.activity_photos.findFirst({
    where: { type: 'AUDIT', activity_id: { in: audits.map(a => a.id) } },
    include: { service_activities: { select: { id: true, location: true, type: true } } }
  });
  if (samplePhoto) {
    console.log(`\n✅ Sample verified: Photo "${samplePhoto.photo_url}" linked to Audit #${samplePhoto.service_activities?.id} (${samplePhoto.service_activities?.location})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
