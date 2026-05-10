const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();
const crypto = require('crypto');

const MONTHS = { 'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11 };

function parseIndonesianDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.toLowerCase().replace(/,/g, '').split(/[\s-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    
    let month = -1;
    for (const [m, val] of Object.entries(MONTHS)) {
      if (m.startsWith(monthStr) || monthStr.startsWith(m.substring(0,3))) {
        month = val;
        break;
      }
    }
    if (day && month !== -1 && year) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  return null;
}

function normalize(str) {
  if (!str) return '';
  return str.toString().toUpperCase()
    .replace(/TENANT/g, '')
    .replace(/UNIT/g, '')
    .replace(/FCU/g, '')
    .replace(/AHU/g, '')
    .replace(/SPLIT/g, '')
    .replace(/DUCT/g, '')
    .replace(/WALL/g, '')
    .replace(/AREA/g, '')
    .replace(/LT\d+/g, '')
    .replace(/FLOOR\d+/g, '')
    .replace(/[^\w\d]/g, '')
    .trim();
}

async function extractAndSyncPhotos() {
  console.log("=== STARTING FULL PHOTO SYNC FROM SPREADSHEET ===");
  const xlsxPath = 'scratch/plaza_full_report.xlsx';
  const extractDir = 'scratch/extracted_full_xlsx';
  
  if (fs.existsSync(extractDir)) {
    fs.rmSync(extractDir, { recursive: true, force: true });
  }
  
  const zip = new AdmZip(xlsxPath);
  zip.extractAllTo(extractDir, true);

  const sharedStringsPath = path.join(extractDir, 'xl', 'sharedStrings.xml');
  let sharedStrings = [];
  if (fs.existsSync(sharedStringsPath)) {
    const ssXml = fs.readFileSync(sharedStringsPath, 'utf8');
    const tMatches = ssXml.match(/<t[^>]*>(.*?)<\/t>/g) || [];
    sharedStrings = tMatches.map(t => t.replace(/<t[^>]*>/, '').replace(/<\/t>/, ''));
  }

  const sheet1Path = path.join(extractDir, 'xl', 'worksheets', 'sheet1.xml');
  const sheetXml = fs.readFileSync(sheet1Path, 'utf8');
  
  // Parse rows to get Tenant and Date
  const rows = sheetXml.match(/<row r="(\d+)".*?>(.*?)<\/row>/g) || [];
  
  let rowData = {}; // rowNum -> { date, tenant }
  let currentDate = null;

  rows.forEach(r => {
    const rMatch = r.match(/r="(\d+)"/);
    if (!rMatch) return;
    const rowNum = parseInt(rMatch[1]);
    
    // Find Col B (Tanggal) -> B\d+
    const colBMatch = r.match(/<c r="B\d+"[^>]*>(.*?)<\/c>/);
    if (colBMatch) {
      const vMatch = colBMatch[1].match(/<v>(.*?)<\/v>/);
      if (vMatch) {
        const tType = colBMatch[0].includes('t="s"');
        let val = vMatch[1];
        if (tType) val = sharedStrings[parseInt(val)];
        const d = parseIndonesianDate(val);
        if (d) currentDate = d;
      }
    }

    // Find Col D (Tenant) -> D\d+
    let tenant = null;
    const colDMatch = r.match(/<c r="D\d+"[^>]*>(.*?)<\/c>/);
    if (colDMatch) {
      const vMatch = colDMatch[1].match(/<v>(.*?)<\/v>/);
      if (vMatch) {
         const tType = colDMatch[0].includes('t="s"');
         tenant = vMatch[1];
         if (tType) tenant = sharedStrings[parseInt(tenant)];
      }
    }

    rowData[rowNum] = {
      date: currentDate,
      tenant: tenant || ''
    };
  });

  // Extract drawing mappings
  const relsPath = path.join(extractDir, 'xl', 'drawings', '_rels', 'drawing1.xml.rels');
  const relsXml = fs.readFileSync(relsPath, 'utf8');
  const relMatches = relsXml.match(/<Relationship Id="([^"]+)" Type="[^"]*image" Target="([^"]+)"/g) || [];
  
  const relMap = {};
  relMatches.forEach(rel => {
    const rId = rel.match(/Id="([^"]+)"/)[1];
    const target = rel.match(/Target="([^"]+)"/)[1]; // e.g. ../media/image1.png
    relMap[rId] = path.basename(target);
  });

  const drawingPath = path.join(extractDir, 'xl', 'drawings', 'drawing1.xml');
  const drawingXml = fs.readFileSync(drawingPath, 'utf8');
  
  // <xdr:twoCellAnchor> ... <xdr:from><xdr:col>10</xdr:col>...<xdr:row>251</xdr:row> ... <a:blip r:embed="rId1" ...
  // Note: rows and cols in drawing XML are 0-indexed! So row 251 means spreadsheet Row 252.
  const anchors = drawingXml.split('<xdr:oneCellAnchor');
  
  let imagePlacements = [];
  
  anchors.forEach(anchor => {
    if (!anchor.includes('r:embed')) return;
    
    const rowMatch = anchor.match(/<xdr:from>.*?<xdr:row>(\d+)<\/xdr:row>/);
    const colMatch = anchor.match(/<xdr:from>.*?<xdr:col>(\d+)<\/xdr:col>/);
    const embedMatch = anchor.match(/r:embed="([^"]+)"/);
    
    if (rowMatch && colMatch && embedMatch) {
      const rowNum = parseInt(rowMatch[1]) + 1; // Convert 0-indexed to 1-indexed
      const colNum = parseInt(colMatch[1]); // K=10, L=11, M=12
      const rId = embedMatch[1];
      const filename = relMap[rId];
      
      if (filename) {
        imagePlacements.push({
          row: rowNum,
          col: colNum,
          filename: filename
        });
      }
    }
  });

  console.log(`Found ${imagePlacements.length} images mapped to cells.`);

  // Load all units
  const allUnits = await prisma.units.findMany({ where: { project_ref_id: 1n } });
  
  function findUnit(str) {
    if (!str) return null;
    const norm = normalize(str);
    if (!norm || norm.length < 3) return null;
    let unit = allUnits.find(u => normalize(u.tag_number) === norm);
    if (unit) return unit;
    unit = allUnits.find(u => normalize(u.room_tenant) === norm);
    if (unit) return unit;
    unit = allUnits.find(u => normalize(u.room_tenant).includes(norm));
    if (unit) return unit;
    unit = allUnits.find(u => norm.includes(normalize(u.room_tenant)));
    if (unit) return unit;
    const strippedNorm = norm.replace(/I/g, ''); 
    unit = allUnits.find(u => normalize(u.room_tenant).replace(/I/g, '') === strippedNorm);
    return unit;
  }

  let stats = { processed: 0, linked: 0, actNotFound: 0 };

  for (const img of imagePlacements) {
    const rowInfo = rowData[img.row];
    if (!rowInfo || !rowInfo.tenant || !rowInfo.date) continue;

    const unit = findUnit(rowInfo.tenant);
    if (!unit) continue;

    // Find the preventive activity
    const activity = await prisma.service_activities.findFirst({
      where: {
        unit_id: unit.id,
        type: 'Preventive',
        deleted_at: null
      },
      orderBy: { service_date: 'desc' }
    });

    if (!activity) {
      stats.actNotFound++;
      if (stats.actNotFound <= 20) {
        console.log(`[Missing] Row ${img.row} | Tenant: "${rowInfo.tenant}" | Unit ID: ${unit.id} | Date: ${rowInfo.date ? rowInfo.date.toISOString() : 'null'}`);
      }
      continue;
    }

    const srcPath = path.join(extractDir, 'xl', 'media', img.filename);
    if (!fs.existsSync(srcPath)) continue;

    // We process and save the image
    const outputFileName = `photo_${unit.project_ref_id}_${unit.tag_number}_${Date.now()}_${img.col}.webp`;
    const outputPath = path.join('public', 'uploads', 'preventive', outputFileName);
    const relativeUrl = `/uploads/preventive/${outputFileName}`;

    await sharp(srcPath)
      .resize(1000, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Check if already linked
    const existing = await prisma.activity_photos.findFirst({
      where: { activity_id: activity.id, photo_url: relativeUrl }
    });

    if (!existing) {
      await prisma.activity_photos.create({
        data: {
          service_activities: { connect: { id: activity.id } },
          photo_url: relativeUrl,
          description: "Maintenance Documentation"
        }
      });
    }

    // Set primary if empty
    if (!activity.photo_url) {
      await prisma.service_activities.update({
        where: { id: activity.id },
        data: { photo_url: relativeUrl }
      });
      activity.photo_url = relativeUrl;
    }

    stats.linked++;
    if (stats.linked % 50 === 0) console.log(`Linked ${stats.linked} images...`);
  }

  console.log("=== SYNC COMPLETE ===");
  console.log(`Images Linked: ${stats.linked}`);
  console.log(`Activities Not Found (Missing Match): ${stats.actNotFound}`);

  await prisma.$disconnect();
}

extractAndSyncPhotos().catch(console.error);
