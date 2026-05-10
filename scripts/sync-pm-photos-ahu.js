/**
 * SYNC PREVENTIVE MAINTENANCE PHOTOS (AHU)
 * 
 * Extracts photos from the Plaza Indonesia cumulative report and links them 
 * to AHU Preventive Maintenance records in the database.
 */

const { PrismaClient } = require('../src/generated/client_v2');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

const XLSX_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\Report Pengukuran day 1 - day 46 Plaza Indonesia.xlsx';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'preventive');
const PROJECT_ID = 1n;

const SHARP_OPTIONS = {
  maxWidth: 1024, maxHeight: 768, jpegQuality: 80, progressive: true, mozjpeg: true
};

function buildFotoRowLookup(sheetData) {
  const lookup = {};
  let currentDay = '', currentUnit = '', currentTenant = '', unitCodeNormalized = '';
  
  for (let i = 0; i < sheetData.length; i++) {
    const row = sheetData[i];
    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim();
    const colE = String(row[4] || '').trim();
    const colF = String(row[5] || '').trim();
    
    if (colA.toUpperCase().startsWith('DAY')) currentDay = colA;
    
    if (colB && colB !== 'UNIT') {
      if (colB.match(/^(FCU|AHU|PAU)\s/i)) {
        currentUnit = colB;
        // Normalize unit code: e.g. "AHU B1-04" -> "AHU B1-04"
        const unitMatch = colB.match(/^(FCU|AHU|PAU)\s*[-]?\s*(\S+)/i);
        if (unitMatch) {
          unitCodeNormalized = `${unitMatch[1].toUpperCase()} ${unitMatch[2]}`;
        }
      } else {
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

function parseDrawingXml(drawingXml, relsXml) {
  const rIdToImage = {};
  const relsMatches = relsXml.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g);
  for (const m of relsMatches) rIdToImage[m[1]] = m[2].replace('../media/', '');

  const imagePositions = [];
  const anchorRegex = /<(xdr:twoCellAnchor|xdr:oneCellAnchor)[^>]*>([\s\S]*?)<\/(xdr:twoCellAnchor|xdr:oneCellAnchor)>/g;
  let match;
  while ((match = anchorRegex.exec(drawingXml)) !== null) {
    const block = match[2];
    const fromRowMatch = block.match(/<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
    const embedMatch = block.match(/r:embed="(rId\d+)"/);
    if (fromRowMatch && embedMatch) {
      const row = parseInt(fromRowMatch[1]);
      const imageFile = rIdToImage[embedMatch[1]];
      if (imageFile) imagePositions.push({ row, imageFile });
    }
  }
  return imagePositions;
}

const normalize = (name) => {
  return (name || '').toUpperCase()
    .replace(/^(TENANT|AREA)\s+/i, '')
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s*0+\d+$/, '')
    .trim();
};

async function main() {
  console.log('=== PREVENTIVE AHU PHOTO SYNC ===');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const zip = new AdmZip(XLSX_PATH);
  const entries = zip.getEntries();
  const mediaEntries = entries.filter(e => e.entryName.startsWith('xl/media/'));
  
  const drawingFiles = {}, relsFiles = {};
  entries.forEach(e => {
    if (e.entryName.match(/xl\/drawings\/drawing(\d+)\.xml$/)) drawingFiles[RegExp.$1] = e.getData().toString('utf8');
    if (e.entryName.match(/xl\/drawings\/_rels\/drawing(\d+)\.xml\.rels$/)) relsFiles[RegExp.$1] = e.getData().toString('utf8');
  });

  const workbook = XLSX.readFile(XLSX_PATH);
  const allImagePositions = [];
  const sheetToDrawing = { '7': '3', '8': '4' };
  for (const [sheetNum, drawingNum] of Object.entries(sheetToDrawing)) {
    if (drawingFiles[drawingNum]) {
      const positions = parseDrawingXml(drawingFiles[drawingNum], relsFiles[drawingNum]);
      positions.forEach(p => allImagePositions.push({ ...p, sheetName: sheetNum === '7' ? 'FOTO' : 'Foto Foto PI' }));
    }
  }

  const fotoLookup = buildFotoRowLookup(XLSX.utils.sheet_to_json(workbook.Sheets['FOTO'], { header: 1, defval: '' }));
  const fotoPILookup = buildFotoRowLookup(XLSX.utils.sheet_to_json(workbook.Sheets['Foto Foto PI'], { header: 1, defval: '' }));

  const pmRecords = await prisma.service_activities.findMany({
    where: { type: 'Preventive', units: { project_ref_id: PROJECT_ID, unit_type: 'AHU' }, deleted_at: null },
    include: { units: { select: { room_tenant: true, code: true, unit_type: true } } }
  });
  console.log(`Loaded ${pmRecords.length} PM AHU records`);

  const pmByCode = {};
  const pmByTenant = {};
  pmRecords.forEach(r => {
    if (r.units?.code) {
      const c = r.units.code.toUpperCase().trim();
      if (!pmByCode[c]) pmByCode[c] = [];
      pmByCode[c].push(r);
    }
    const t = normalize(r.units?.room_tenant);
    if (!pmByTenant[t]) pmByTenant[t] = [];
    pmByTenant[t].push(r);
  });

  const imageBuffers = {};
  mediaEntries.forEach(e => imageBuffers[e.entryName.replace('xl/media/', '')] = e.getData());

  const processedImages = new Set(), tenantRoundRobin = {};
  let extracted = 0, linked = 0, skipped = 0;

  for (const imgPos of allImagePositions) {
    const { row, imageFile, sheetName } = imgPos;
    const sourceBuffer = imageBuffers[imageFile];
    if (!sourceBuffer || sourceBuffer.length < 1000 || imageFile.endsWith('.emf') || processedImages.has(imageFile)) { skipped++; continue; }
    processedImages.add(imageFile);

    const context = (sheetName === 'FOTO' ? fotoLookup : fotoPILookup)[row] || {};
    
    // 1. Match by Code
    let targetPMs = [];
    if (context.unitCode) {
      targetPMs = pmByCode[context.unitCode.toUpperCase().trim()] || [];
    }
    
    // 2. Fallback to Tenant match
    if (targetPMs.length === 0 && context.tenant) {
      const normTenant = normalize(context.tenant);
      targetPMs = pmByTenant[normTenant] || [];
    }

    if (targetPMs.length === 0) { skipped++; continue; }

    try {
      const matchKey = context.unitCode || context.tenant;
      const targetPM = targetPMs[ (tenantRoundRobin[matchKey] || 0) % targetPMs.length ];
      tenantRoundRobin[matchKey] = (tenantRoundRobin[matchKey] || 0) + 1;

      const compressedBuffer = await sharp(sourceBuffer)
        .resize(SHARP_OPTIONS.maxWidth, SHARP_OPTIONS.maxHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: SHARP_OPTIONS.jpegQuality, progressive: true, mozjpeg: true })
        .toBuffer();

      const fileName = `pm_ahu_${targetPM.id}_${Date.now()}_${extracted}.jpg`;
      fs.writeFileSync(path.join(UPLOAD_DIR, fileName), compressedBuffer);

      await prisma.activity_photos.create({
        data: {
          activity_id: targetPM.id, type: 'PREVENTIVE', photo_url: fileName,
          notes: context.temuan || null, description: context.tindakan || null,
          caption: `${context.day || ''} - ${context.unit || context.tenant} (AHU)`.trim(),
          media_type: 'image'
        }
      });
      extracted++; linked++;
      if (extracted % 50 === 0) console.log(`  Progress: ${extracted} images linked...`);
    } catch (err) { console.error(`  Error at ${imageFile}:`, err.message); }
  }
  console.log(`\n=== SYNC COMPLETE ===\nExtracted: ${extracted}\nLinked: ${linked}\nSkipped: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
