const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

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

async function extractAndSyncPhotosAll() {
  console.log("=== STARTING FULL PHOTO SYNC FOR ALL SHEETS ===");
  const xlsxPath = 'scratch/plaza_full_report.xlsx';
  const extractDir = 'scratch/extracted_full_xlsx';
  
  if (!fs.existsSync(extractDir)) {
    const zip = new AdmZip(xlsxPath);
    zip.extractAllTo(extractDir, true);
  }

  const sharedStringsPath = path.join(extractDir, 'xl', 'sharedStrings.xml');
  let sharedStrings = [];
  if (fs.existsSync(sharedStringsPath)) {
    const ssXml = fs.readFileSync(sharedStringsPath, 'utf8');
    const tMatches = ssXml.match(/<t[^>]*>(.*?)<\/t>/g) || [];
    sharedStrings = tMatches.map(t => t.replace(/<t[^>]*>/, '').replace(/<\/t>/, ''));
  }

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

  let stats = { processed: 0, linked: 0, actNotFound: 0, duplicated: 0 };

  // Loop over all sheets
  const wsDir = path.join(extractDir, 'xl', 'worksheets');
  const relsDir = path.join(wsDir, '_rels');
  
  const sheets = fs.readdirSync(wsDir).filter(f => f.endsWith('.xml'));
  
  for (const sheetFile of sheets) {
    console.log(`\n--- Processing ${sheetFile} ---`);
    const sheetNum = sheetFile.match(/\d+/)[0];
    
    // Check if this sheet has a drawing relationship
    const sheetRelsPath = path.join(relsDir, `${sheetFile}.rels`);
    let drawingFile = null;
    if (fs.existsSync(sheetRelsPath)) {
       const sRelsXml = fs.readFileSync(sheetRelsPath, 'utf8');
       const drawRel = sRelsXml.match(/Target="..\/drawings\/([^"]+)"/);
       if (drawRel) drawingFile = drawRel[1];
    }
    
    if (!drawingFile) {
       console.log(`No drawings found for ${sheetFile}. Skipping.`);
       continue;
    }

    const sheetPath = path.join(wsDir, sheetFile);
    const sheetXml = fs.readFileSync(sheetPath, 'utf8');
    
    const rows = sheetXml.match(/<row r="(\d+)".*?>(.*?)<\/row>/g) || [];
    let rowData = {}; 
    let currentDate = null;

    rows.forEach(r => {
      const rMatch = r.match(/r="(\d+)"/);
      if (!rMatch) return;
      const rowNum = parseInt(rMatch[1]);
      
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

    const drawingRelsPath = path.join(extractDir, 'xl', 'drawings', '_rels', `${drawingFile}.rels`);
    let relMap = {};
    if (fs.existsSync(drawingRelsPath)) {
        const relsXml = fs.readFileSync(drawingRelsPath, 'utf8');
        const relMatches = relsXml.match(/<Relationship Id="([^"]+)" Type="[^"]*image" Target="([^"]+)"/g) || [];
        relMatches.forEach(rel => {
          const rId = rel.match(/Id="([^"]+)"/)[1];
          const target = rel.match(/Target="([^"]+)"/)[1];
          relMap[rId] = path.basename(target);
        });
    }

    const drawingPath = path.join(extractDir, 'xl', 'drawings', drawingFile);
    const drawingXml = fs.readFileSync(drawingPath, 'utf8');
    
    // Google sheets might use oneCellAnchor or twoCellAnchor
    let anchors = [];
    if (drawingXml.includes('<xdr:oneCellAnchor')) anchors = drawingXml.split('<xdr:oneCellAnchor');
    else if (drawingXml.includes('<xdr:twoCellAnchor')) anchors = drawingXml.split('<xdr:twoCellAnchor');
    
    let imagePlacements = [];
    anchors.forEach(anchor => {
      const rowIdx = anchor.indexOf('<xdr:row>');
      if (rowIdx === -1) return;
      const endRowIdx = anchor.indexOf('</xdr:row>', rowIdx);
      const rowNum = parseInt(anchor.substring(rowIdx+9, endRowIdx)) + 1;
      
      const colIdx = anchor.indexOf('<xdr:col>');
      const endColIdx = anchor.indexOf('</xdr:col>', colIdx);
      let colNum = 0;
      if (colIdx !== -1) colNum = parseInt(anchor.substring(colIdx+9, endColIdx));
      
      const embedMatch = anchor.match(/r:embed="([^"]+)"/);
      if (embedMatch) {
        const filename = relMap[embedMatch[1]];
        if (filename) {
          imagePlacements.push({ row: rowNum, col: colNum, filename: filename });
        }
      }
    });

    console.log(`Found ${imagePlacements.length} images in ${drawingFile}.`);

    for (const img of imagePlacements) {
      stats.processed++;
      const rowInfo = rowData[img.row];
      if (!rowInfo || !rowInfo.tenant) continue;

      const unit = findUnit(rowInfo.tenant);
      if (!unit) continue;

      const activity = await prisma.service_activities.findFirst({
        where: { unit_id: unit.id, type: 'Preventive', deleted_at: null },
        orderBy: { service_date: 'desc' }
      });

      if (!activity) {
        stats.actNotFound++;
        continue;
      }

      const srcPath = path.join(extractDir, 'xl', 'media', img.filename);
      if (!fs.existsSync(srcPath)) continue;

      const outputFileName = `photo_1_${unit.tag_number}_${Date.now()}_${img.col}_${sheetNum}.webp`;
      const outputPath = path.join('public', 'uploads', 'preventive', outputFileName);
      const relativeUrl = `/uploads/preventive/${outputFileName}`;

      await sharp(srcPath).resize(1000, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);

      const existing = await prisma.activity_photos.findFirst({
        where: { activity_id: activity.id, photo_url: { contains: img.col.toString() } }
      });

      // Simple heuristic: if this activity already has 3 photos, or already has a photo from the same column index, skip to avoid massive dupes.
      const actPhotos = await prisma.activity_photos.count({ where: { activity_id: activity.id } });
      
      if (actPhotos >= 3) {
         stats.duplicated++;
         continue;
      }

      await prisma.activity_photos.create({
        data: {
          service_activities: { connect: { id: activity.id } },
          photo_url: relativeUrl,
          description: "Maintenance Documentation"
        }
      });

      if (!activity.photo_url) {
        await prisma.service_activities.update({
          where: { id: activity.id },
          data: { photo_url: relativeUrl }
        });
        activity.photo_url = relativeUrl;
      }

      stats.linked++;
      if (stats.linked % 50 === 0) console.log(`Linked ${stats.linked} images globally...`);
    }
  }

  console.log("\n=== ALL SHEETS SYNC COMPLETE ===");
  console.log(`Total Images Processed: ${stats.processed}`);
  console.log(`New Images Linked: ${stats.linked}`);
  console.log(`Skipped (Already Had Photos): ${stats.duplicated}`);
  console.log(`Activities Not Found: ${stats.actNotFound}`);

  await prisma.$disconnect();
}

extractAndSyncPhotosAll().catch(console.error);
