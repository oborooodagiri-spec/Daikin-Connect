const { PrismaClient } = require('../src/generated/client_v2');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

// CONFIG
const SOURCE_FILES = [
  {
    path: 'scratch/split_photos_new.xlsx',
    sheets: ['FOTO', 'Foto Foto PI']
  },
  {
    path: 'C:/Users/D22AGRI-EPL/Downloads/Report PI.xlsx',
    useSheetNamesAsTenants: true
  }
];

const UPLOAD_DIR_PM = path.join(process.cwd(), 'public', 'uploads', 'preventive');
const UPLOAD_DIR_CORR = path.join(process.cwd(), 'public', 'uploads', 'corrective');
const PROJECT_ID = 1n;

const SHARP_OPTIONS = {
  maxWidth: 1200, maxHeight: 1200, jpegQuality: 80, progressive: true, mozjpeg: true
};

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

let allUnits = [];

async function main() {
  console.log("=== UNIVERSAL PLAZA PHOTO SYNC (V4.0) ===");

  if (!fs.existsSync(UPLOAD_DIR_PM)) fs.mkdirSync(UPLOAD_DIR_PM, { recursive: true });
  if (!fs.existsSync(UPLOAD_DIR_CORR)) fs.mkdirSync(UPLOAD_DIR_CORR, { recursive: true });

  console.log("1. Loading Database Records...");
  const activities = await prisma.service_activities.findMany({
    where: { units: { project_ref_id: PROJECT_ID }, deleted_at: null },
    include: { units: true }
  });
  const complaints = await prisma.complaints.findMany({
    where: { units: { project_ref_id: PROJECT_ID } },
    include: { units: true }
  });
  allUnits = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID }
  });

  console.log(`   Loaded: ${activities.length} Activities, ${complaints.length} Complaints, ${allUnits.length} Units.`);

  let totalExtracted = 0;
  let totalLinked = 0;

  for (const source of SOURCE_FILES) {
    if (!fs.existsSync(source.path)) {
      console.warn(`   Source file not found: ${source.path}`);
      continue;
    }
    console.log(`\n2. Processing Source: ${path.basename(source.path)}`);

    const zip = new AdmZip(source.path);
    const wb = XLSX.readFile(source.path);

    if (source.useSheetNamesAsTenants) {
      // Logic for Report PI.xlsx where sheets are tenants
      for (const sheetName of wb.SheetNames) {
        if (['Summary', 'Report Plaza Indonesia', 'PIVOT', 'TAHUN', 'DATA', 'Komparasi', 'Sheet1', 'Sheet2', 'Report Grand Hyatt', 'FOTO', 'Foto Foto PI', 'Foto Foto GHT'].includes(sheetName)) continue;

        const matchedUnit = findUnitByString(sheetName);
        if (matchedUnit) {
          console.log(`   Mapped sheet [${sheetName}] to Unit [${matchedUnit.room_tenant}] (ID: ${matchedUnit.id})`);
          const sheetIndex = wb.SheetNames.indexOf(sheetName) + 1;
          const images = extractImagesFromSheet(zip, sheetIndex);
          console.log(`   Found ${images.length} images in sheet.`);

          for (const img of images) {
            const success = await linkPhotoToTarget(matchedUnit.id, img, `Sheet: ${sheetName}`, activities, complaints);
            if (success) totalLinked++;
            totalExtracted++;
          }
        }
      }
    } else {
      // Logic for split_photos_new.xlsx with FOTO/Foto Foto PI sheets
      for (const sheetName of source.sheets) {
        console.log(`   Analyzing Sheet: ${sheetName}`);
        const sheet = wb.Sheets[sheetName];
        if (!sheet) continue;
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const sheetIndex = wb.SheetNames.indexOf(sheetName) + 1;

        const fotoRowLookup = buildFotoRowLookup(data);
        const images = extractImagesFromSheet(zip, sheetIndex);
        console.log(`   Found ${images.length} images in sheet.`);

        for (const img of images) {
          const rowInfo = fotoRowLookup[img.row];
          if (rowInfo) {
            const matchedUnit = findUnitByString(rowInfo.tenant || rowInfo.unit);
            if (matchedUnit) {
              const success = await linkPhotoToTarget(matchedUnit.id, img, `${sheetName} Row ${img.row}`, activities, complaints, rowInfo);
              if (success) totalLinked++;
              totalExtracted++;
            }
          }
        }
      }
    }
  }

  console.log(`\n=== SYNC SUMMARY ===`);
  console.log(`Total Extracted: ${totalExtracted}`);
  console.log(`Total Linked: ${totalLinked}`);
  await prisma.$disconnect();
}

function findUnitByString(str) {
  if (!str) return null;
  const norm = normalize(str);
  if (!norm || norm.length < 3) return null;

  // 1. Exact match on tag
  let unit = allUnits.find(u => normalize(u.tag_number) === norm);
  if (unit) return unit;

  // 2. Exact match on room_tenant
  unit = allUnits.find(u => normalize(u.room_tenant) === norm);
  if (unit) return unit;

  // 3. Fuzzy match: DB includes Spreadsheet string
  unit = allUnits.find(u => normalize(u.room_tenant).includes(norm));
  if (unit) return unit;

  // 4. Fuzzy match: Spreadsheet string includes DB
  unit = allUnits.find(u => norm.includes(normalize(u.room_tenant)));
  if (unit) return unit;

  return null;
}

function buildFotoRowLookup(data) {
  const lookup = {};
  let currentTenant = "";
  let currentUnit = "";
  let currentDay = "";

  data.forEach((row, i) => {
    const rowIdx = i; // Drawing XML uses 0-indexed row for anchors in some versions, but build it relative
    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim();
    const colE = String(row[4] || '').trim();
    const colF = String(row[5] || '').trim();

    if (colA.toUpperCase().startsWith('DAY')) currentDay = colA;

    if (colB && colB !== 'UNIT') {
      if (colB.match(/^(FCU|AHU|SPLIT|AC SPLIT|VRV|SD|SW)\s/i)) {
        currentUnit = colB;
        currentTenant = "";
      } else {
        currentTenant = colB.replace(/^Tenant\s*/i, '').trim();
      }
    }

    if (currentTenant || currentUnit) {
      lookup[rowIdx] = { 
        tenant: currentTenant, 
        unit: currentUnit, 
        day: currentDay,
        temuan: colE,
        tindakan: colF,
        isCorrective: (colE && colE.length > 5) || (colF && colF.length > 5)
      };
    }
  });
  return lookup;
}

function extractImagesFromSheet(zip, sheetIndex) {
  const drawingRelPath = `xl/drawings/_rels/drawing${sheetIndex}.xml.rels`;
  const drawingPath = `xl/drawings/drawing${sheetIndex}.xml`;

  const relEntry = zip.getEntry(drawingRelPath);
  const drawEntry = zip.getEntry(drawingPath);
  if (!relEntry || !drawEntry) return [];

  const rels = relEntry.getData().toString('utf8');
  const draw = drawEntry.getData().toString('utf8');

  const rIdToImage = {};
  const relsMatches = rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g);
  for (const m of relsMatches) rIdToImage[m[1]] = m[2].replace('../media/', '');

  const results = [];
  const anchorRegex = /<(xdr:twoCellAnchor|xdr:oneCellAnchor)[^>]*>([\s\S]*?)<\/(xdr:twoCellAnchor|xdr:oneCellAnchor)>/g;
  let match;
  while ((match = anchorRegex.exec(draw)) !== null) {
    const block = match[2];
    const fromRowMatch = block.match(/<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
    const embedMatch = block.match(/r:embed="(rId\d+)"/);
    if (fromRowMatch && embedMatch) {
      const row = parseInt(fromRowMatch[1]);
      const imageFile = rIdToImage[embedMatch[1]];
      if (imageFile) {
        const imgEntry = zip.getEntry(`xl/media/${imageFile}`);
        if (imgEntry) {
          results.push({ row, fileName: imageFile, binary: imgEntry.getData() });
        }
      }
    }
  }
  return results;
}

async function linkPhotoToTarget(unitId, img, sourceDesc, activities, complaints, context = {}) {
  const isCorrective = context.isCorrective || false;
  
  // 1. Find Activity or Complaint
  let target = null;
  let type = 'activity';

  if (isCorrective) {
    target = complaints.find(c => c.unit_id === unitId);
    if (target) type = 'complaint';
    else target = activities.find(a => a.unit_id === unitId && a.type === 'Corrective');
  } else {
    target = activities.find(a => a.unit_id === unitId && a.type === 'Preventive');
  }

  // Fallback to any activity if not found
  if (!target) target = activities.find(a => a.unit_id === unitId);
  if (!target) target = complaints.find(c => c.unit_id === unitId);

  if (!target) return false;

  // 2. Save Image
  const prefix = (target.type || 'SYNC').toLowerCase();
  const dir = (type === 'complaint' || target.type === 'Corrective') ? UPLOAD_DIR_CORR : UPLOAD_DIR_PM;
  const fileName = `plaza_${unitId}_${Date.now()}_${img.fileName.replace(/\.[^/.]+$/, "")}.jpg`;
  const fullPath = path.join(dir, fileName);

  try {
    await sharp(img.binary)
      .resize(SHARP_OPTIONS.maxWidth, SHARP_OPTIONS.maxHeight, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: SHARP_OPTIONS.jpegQuality, progressive: true, mozjpeg: true })
      .toFile(fullPath);

    if (type === 'activity') {
      await prisma.activity_photos.create({
        data: {
          activity_id: target.id,
          photo_url: `/api/assets/${folder}/${fileName}`,
          description: context.tindakan || null,
          notes: context.temuan || null,
          caption: `${sourceDesc} - ${context.day || ''}`.trim(),
          type: (target.type || 'PREVENTIVE').toUpperCase()
        }
      });
      // Also update main photo_url if empty
      if (!target.photo_url) {
        await prisma.service_activities.update({ where: { id: target.id }, data: { photo_url: `/api/assets/${folder}/${fileName}` } });
      }
    } else {
      await prisma.complaints.update({
        where: { id: target.id },
        data: { photo_url: `/api/assets/complaints/${fileName}` }
      });
    }
    console.log(`      Linked to ${type} ${target.id} (${target.type || 'Complaint'})`);
    return true;
  } catch (err) {
    console.error(`      Error saving image: ${err.message}`);
    return false;
  }
}

main().catch(console.error);
