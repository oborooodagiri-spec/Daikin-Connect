const { PrismaClient } = require('../src/generated/client_v3');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

// CONFIG
const SOURCE_FILE = 'scratch/split_photos_new.xlsx';
const SHEETS = ['FOTO', 'Foto Foto PI'];
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
let allActivities = [];
let allComplaints = [];

async function main() {
  console.log("=== PLAZA PHOTO RE-SYNC (V4.2 - AUTO CREATE) ===");

  if (!fs.existsSync(UPLOAD_DIR_PM)) fs.mkdirSync(UPLOAD_DIR_PM, { recursive: true });
  if (!fs.existsSync(UPLOAD_DIR_CORR)) fs.mkdirSync(UPLOAD_DIR_CORR, { recursive: true });

  console.log("1. Loading Database Records...");
  allActivities = await prisma.service_activities.findMany({
    where: { units: { project_ref_id: PROJECT_ID }, deleted_at: null },
    include: { units: true }
  });
  allComplaints = await prisma.complaints.findMany({
    where: { units: { project_ref_id: PROJECT_ID } },
    include: { units: true }
  });
  allUnits = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID }
  });

  console.log(`   Loaded: ${allActivities.length} Activities, ${allComplaints.length} Complaints, ${allUnits.length} Units.`);

  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`   Source file not found: ${SOURCE_FILE}`);
    return;
  }

  const zip = new AdmZip(SOURCE_FILE);
  const wb = XLSX.readFile(SOURCE_FILE);

  let totalExtracted = 0;
  let totalLinked = 0;
  let newUnitsCreated = 0;
  let newActivitiesCreated = 0;

  for (const sheetName of SHEETS) {
    console.log(`\n2. Analyzing Sheet: ${sheetName}`);
    const sheet = wb.Sheets[sheetName];
    if (!sheet) {
        console.warn(`   Sheet [${sheetName}] not found in workbook.`);
        continue;
    }
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const sheetIndex = wb.SheetNames.indexOf(sheetName) + 1;

    const fotoRowLookup = buildFotoRowLookup(data);
    const images = extractImagesFromSheet(zip, sheetIndex);
    console.log(`   Found ${images.length} images in sheet drawings.`);

    for (const img of images) {
      const rowInfo = fotoRowLookup[img.row];
      if (rowInfo) {
        const tenantOrUnitName = rowInfo.tenant || rowInfo.unit;
        if (!tenantOrUnitName) continue;

        let matchedUnit = findUnitByString(tenantOrUnitName);
        
        if (!matchedUnit) {
          console.log(`   [NEW UNIT] Creating unit for: ${tenantOrUnitName}`);
          
          let unitType = 'Unknown';
          const upperName = tenantOrUnitName.toUpperCase();
          if (upperName.includes('FCU')) unitType = 'FCU';
          else if (upperName.includes('AHU')) unitType = 'AHU';
          else if (upperName.includes('SPLIT')) unitType = 'SPLIT DUCT';

          matchedUnit = await prisma.units.create({
            data: {
              project_ref_id: PROJECT_ID,
              room_tenant: tenantOrUnitName,
              unit_type: unitType,
              status: 'Normal',
              brand: 'Daikin'
            }
          });
          allUnits.push(matchedUnit); // Add to local cache
          newUnitsCreated++;
        }

        if (matchedUnit) {
          const result = await linkPhotoToTarget(matchedUnit.id, img, `${sheetName} Row ${img.row}`, rowInfo);
          if (result.linked) totalLinked++;
          if (result.newActivity) newActivitiesCreated++;
          totalExtracted++;
        }
      }
    }
  }

  console.log(`\n=== SYNC SUMMARY ===`);
  console.log(`Total Extracted: ${totalExtracted}`);
  console.log(`Total Linked: ${totalLinked}`);
  console.log(`New Units Created: ${newUnitsCreated}`);
  console.log(`New Activities Created: ${newActivitiesCreated}`);
  await prisma.$disconnect();
}

function findUnitByString(str) {
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

  return null;
}

function buildFotoRowLookup(data) {
  const lookup = {};
  let currentTenant = "";
  let currentUnit = "";
  let currentDay = "";

  data.forEach((row, i) => {
    const rowIdx = i; 
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

function getServiceDateFromDay(dayStr) {
  if (!dayStr) return new Date(); // Fallback to today
  // Assuming DAY 1 is March 1, 2026 based on previous analysis
  const match = dayStr.match(/DAY\s*(\d+)/i);
  if (match && match[1]) {
    const dayNum = parseInt(match[1], 10);
    // Base date: Feb 28, 2026 so DAY 1 = Mar 1
    const d = new Date('2026-02-28T00:00:00Z');
    d.setDate(d.getDate() + dayNum);
    return d;
  }
  return new Date();
}

async function linkPhotoToTarget(unitId, img, sourceDesc, context = {}) {
  const isCorrective = context.isCorrective || false;
  let newActivity = false;
  
  let target = null;
  let type = 'activity';

  if (isCorrective) {
    target = allComplaints.find(c => c.unit_id === unitId);
    if (target) type = 'complaint';
    else target = allActivities.find(a => a.unit_id === unitId && a.type === 'Corrective');
  } else {
    target = allActivities.find(a => a.unit_id === unitId && a.type === 'Preventive');
  }

  if (!target) target = allActivities.find(a => a.unit_id === unitId);
  if (!target) target = allComplaints.find(c => c.unit_id === unitId);

  // If STILL no target, CREATE ONE!
  if (!target) {
    const serviceDate = getServiceDateFromDay(context.day);
    console.log(`   [NEW ACTIVITY] Creating Preventive activity for unit ${unitId} on ${serviceDate.toISOString().split('T')[0]}`);
    target = await prisma.service_activities.create({
      data: {
        unit_id: unitId,
        type: 'Preventive',
        service_date: serviceDate,
        status: 'Final_Approved',
        inspector_name: 'Daikin Service Team',
        technical_json: JSON.stringify({
          finding: context.temuan || "-",
          recommendation: context.tindakan || "-",
          parameters: {}
        }),
        technical_advice: `Finding: ${context.temuan || "-"}\nRecommendation: ${context.tindakan || "-"}`
      }
    });
    allActivities.push(target); // Cache it
    newActivity = true;
    type = 'activity';
  }

  const folder = (type === 'complaint' || target.type === 'Corrective') ? 'corrective' : 'preventive';
  const dir = folder === 'corrective' ? UPLOAD_DIR_CORR : UPLOAD_DIR_PM;
  const fileName = `plaza_${unitId}_${Date.now()}_${img.fileName.replace(/\.[^/.]+$/, "")}.jpg`;
  const fullPath = path.join(dir, fileName);

  try {
    await sharp(img.binary)
      .resize(SHARP_OPTIONS.maxWidth, SHARP_OPTIONS.maxHeight, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: SHARP_OPTIONS.jpegQuality, progressive: true, mozjpeg: true })
      .toFile(fullPath);

    const photoUrl = `/api/assets/${folder}/${fileName}`;

    if (type === 'activity') {
      await prisma.activity_photos.create({
        data: {
          activity_id: target.id,
          photo_url: photoUrl,
          description: context.tindakan || null,
          notes: context.temuan || null,
          caption: `${sourceDesc} - ${context.day || ''}`.trim(),
          type: (target.type || 'PREVENTIVE').toUpperCase()
        }
      });
      if (!target.photo_url) {
        await prisma.service_activities.update({ where: { id: target.id }, data: { photo_url: photoUrl } });
        // update local cache
        target.photo_url = photoUrl;
      }
    } else {
      await prisma.complaints.update({
        where: { id: target.id },
        data: { photo_url: photoUrl }
      });
      target.photo_url = photoUrl;
    }
    return { linked: true, newActivity };
  } catch (err) {
    console.error(`      Error saving image: ${err.message}`);
    return { linked: false, newActivity: false };
  }
}

main().catch(console.error);
