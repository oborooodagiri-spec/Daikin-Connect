/**
 * COMPREHENSIVE DAILY PLAZA INDONESIA SYNC
 * 
 * Synchronizes service logs and in-cell photos from the Daily List Service spreadsheet.
 */

const { PrismaClient } = require('../src/generated/client_v2');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Configuration
const XLSX_PATH = 'C:\\Users\\D22AGRI-EPL\\Downloads\\daily_sync.xlsx';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'preventive');
const PROJECT_ID = 1n; // Plaza Indonesia

const SHARP_OPTIONS = {
  maxWidth: 1024, maxHeight: 768, jpegQuality: 80, progressive: true, mozjpeg: true
};

// HELPER: Normalize names for matching
const normalize = (name) => {
  return (name || '').toUpperCase()
    .replace(/^(TENANT|AREA)\s+/i, '')
    .replace(/[^A-Z0-9\s]/g, '')
    .trim();
};

// HELPER: Parse Excel Date
function parseExcelDate(val) {
    if (!val) return null;
    if (typeof val === 'number') {
        const date = XLSX.SSF.parse_date_code(val);
        return new Date(date.y, date.m - 1, date.d);
    }
    // Handle string date like "02 Maret 2026"
    const months = {
        'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
        'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    const parts = val.toLowerCase().split(' ');
    if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const month = months[parts[1]];
        const year = parseInt(parts[2]);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    return null;
}

// HELPER: Extract Image Positions from XLSX
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
    const fromColMatch = block.match(/<xdr:from>[\s\S]*?<xdr:col>(\d+)<\/xdr:col>/);
    const embedMatch = block.match(/r:embed="(rId\d+)"/);
    if (fromRowMatch && fromColMatch && embedMatch) {
      const row = parseInt(fromRowMatch[1]);
      const col = parseInt(fromColMatch[1]);
      const imageFile = rIdToImage[embedMatch[1]];
      if (imageFile) imagePositions.push({ row, col, imageFile });
    }
  }
  return imagePositions;
}

async function generateNextUnitTag(customerId) {
    const count = await prisma.units.count({
      where: { projects: { customer_id: customerId } }
    });
    const ccc = String(customerId).padStart(3, '0');
    const uuu = String(count + 1).padStart(3, '0');
    return `DKN${ccc}${uuu}`;
}

async function main() {
    console.log('=== STARTING DAILY PLAZA INDONESIA SYNC ===');
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const zip = new AdmZip(XLSX_PATH);
    const entries = zip.getEntries();
    const mediaEntries = entries.filter(e => e.entryName.startsWith('xl/media/'));
    const imageBuffers = {};
    mediaEntries.forEach(e => imageBuffers[e.entryName.replace('xl/media/', '')] = e.getData());

    const drawingFiles = {}, relsFiles = {};
    entries.forEach(e => {
        if (e.entryName.match(/xl\/drawings\/drawing(\d+)\.xml$/)) drawingFiles[RegExp.$1] = e.getData().toString('utf8');
        if (e.entryName.match(/xl\/drawings\/_rels\/drawing(\d+)\.xml\.rels$/)) relsFiles[RegExp.$1] = e.getData().toString('utf8');
    });

    const workbook = XLSX.readFile(XLSX_PATH);
    const project = await prisma.projects.findUnique({ where: { id: PROJECT_ID } });

    const sheets = [
        { 
            name: 'Daily List Service HVAC FCU', 
            drawingId: '1', 
            headerRow: 4, 
            mapping: { date: 1, floor: 2, tenant: 3, brand: 4, model: 5, type: 6, finding: 8, rec: 9, photoStart: 10 },
            defaultType: 'FCU'
        },
        { 
            name: 'Daily List Service HVAC AHU & A', 
            drawingId: '2', 
            headerRow: 4, 
            mapping: { date: 1, type: 2, brand: 3, model: 4, tenant: 5, finding: 6, rec: 7, photoStart: 8 },
            defaultType: 'AHU'
        }
    ];

    let totalImported = 0;
    let totalPhotosLinked = 0;

    for (const sheetConfig of sheets) {
        console.log(`\nProcessing sheet: ${sheetConfig.name}`);
        const sheet = workbook.Sheets[sheetConfig.name];
        if (!sheet) { console.warn(`Sheet ${sheetConfig.name} not found!`); continue; }

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        
        // Map images for this sheet
        let rowToImages = {};
        if (sheetConfig.drawingId && drawingFiles[sheetConfig.drawingId] && relsFiles[sheetConfig.drawingId]) {
            const imagePositions = parseDrawingXml(drawingFiles[sheetConfig.drawingId], relsFiles[sheetConfig.drawingId]);
            imagePositions.forEach(img => {
                if (!rowToImages[img.row]) rowToImages[img.row] = [];
                rowToImages[img.row].push(img.imageFile);
            });
        }

        let currentDayDate = null;

        for (let i = sheetConfig.headerRow + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 5) continue;

            const m = sheetConfig.mapping;
            const dateVal = row[m.date];
            if (dateVal) currentDayDate = parseExcelDate(dateVal);
            if (!currentDayDate) continue;

            const tenantRaw = String(row[m.tenant] || '').trim();
            if (!tenantRaw || tenantRaw === 'No.') continue;

            const typeRaw = String(row[m.type] || sheetConfig.defaultType).trim();
            const brand = String(row[m.brand] || '').trim();
            const model = String(row[m.model] || '').trim();
            const floor = m.floor ? String(row[m.floor] || '').trim() : null;
            const finding = String(row[m.finding] || '').trim();
            const recommendation = String(row[m.rec] || '').trim();

            // 1. Find or Create Unit
            let unit = await prisma.units.findFirst({
                where: {
                    project_ref_id: PROJECT_ID,
                    room_tenant: { contains: tenantRaw },
                    unit_type: typeRaw === 'SPLIT' ? 'SPLIT DUCT' : typeRaw // Normalize type
                }
            });

            if (!unit) {
                const tag = await generateNextUnitTag(project.customer_id);
                unit = await prisma.units.create({
                    data: {
                        project_ref_id: PROJECT_ID,
                        tag_number: tag,
                        room_tenant: tenantRaw,
                        unit_type: typeRaw === 'SPLIT' ? 'SPLIT DUCT' : typeRaw,
                        brand: brand || 'Daikin',
                        model: model || '-',
                        building_floor: floor,
                        status: 'Normal',
                        qr_code_token: crypto.randomBytes(16).toString('hex')
                    }
                });
                console.log(`  Created new unit: ${tenantRaw} (${unit.tag_number})`);
            }

            // 2. Create Preventive Activity
            // Check for existing to avoid duplicates on same day
            let activity = await prisma.service_activities.findFirst({
                where: {
                    unit_id: unit.id,
                    service_date: currentDayDate,
                    type: 'Preventive',
                    deleted_at: null
                }
            });

            if (!activity) {
                activity = await prisma.service_activities.create({
                    data: {
                        unit_id: unit.id,
                        type: 'Preventive',
                        service_date: currentDayDate,
                        status: 'Final_Approved',
                        inspector_name: 'Daikin Service Team',
                        technical_json: JSON.stringify({ finding, recommendation, is_bulk_sync: true }),
                        technical_advice: recommendation,
                        engineer_note: finding
                    }
                });
                totalImported++;
            }

            // 3. Extract and Link Photos
            // In Excel rows index is 0-based, in drawing XML it might be different.
            // Usually Row 5 in Excel is Row 4 in drawing XML if header starts at 0.
            // Let's check Row 5 (Excel) which is index 5. The drawing XML row would be i - 1?
            // Actually drawing XML row is exactly the row index in the sheet.
            const images = rowToImages[i]; 
            if (images && images.length > 0) {
                for (const imgFile of images) {
                    const buffer = imageBuffers[imgFile];
                    if (!buffer) continue;

                    try {
                        const compressed = await sharp(buffer)
                            .resize(SHARP_OPTIONS.maxWidth, SHARP_OPTIONS.maxHeight, { fit: 'inside', withoutEnlargement: true })
                            .jpeg({ quality: SHARP_OPTIONS.jpegQuality })
                            .toBuffer();

                        const fileName = `daily_${unit.id}_${Date.now()}_${Math.floor(Math.random()*1000)}.jpg`;
                        fs.writeFileSync(path.join(UPLOAD_DIR, fileName), compressed);

                        await prisma.activity_photos.create({
                            data: {
                                activity_id: activity.id,
                                type: 'PREVENTIVE',
                                photo_url: fileName,
                                caption: `${tenantRaw} - ${finding}`.substring(0, 255),
                                media_type: 'image'
                            }
                        });
                        totalPhotosLinked++;
                    } catch (err) {
                        console.error(`  Error processing photo for ${tenantRaw}:`, err.message);
                    }
                }
            }
        }
    }

    console.log('\n=== SYNC COMPLETED ===');
    console.log(`Total Reports Synced: ${totalImported}`);
    console.log(`Total Photos Linked: ${totalPhotosLinked}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
