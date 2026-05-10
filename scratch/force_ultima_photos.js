const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('../src/generated/client_v3');
const prisma = new PrismaClient();

async function forceSyncUltima() {
  const xlsxPath = 'scratch/plaza_full_report.xlsx';
  const extractDir = 'scratch/extracted_full_xlsx';
  
  const relMap = {};
  const relsPath = path.join(extractDir, 'xl', 'drawings', '_rels', 'drawing1.xml.rels');
  const relsXml = fs.readFileSync(relsPath, 'utf8');
  const relMatches = relsXml.match(/<Relationship Id="([^"]+)" Type="[^"]*image" Target="([^"]+)"/g) || [];
  relMatches.forEach(rel => {
    const rId = rel.match(/Id="([^"]+)"/)[1];
    const target = rel.match(/Target="([^"]+)"/)[1];
    relMap[rId] = path.basename(target);
  });

  const drawingPath = path.join(extractDir, 'xl', 'drawings', 'drawing1.xml');
  const drawingXml = fs.readFileSync(drawingPath, 'utf8');
  const anchors = drawingXml.split('<xdr:oneCellAnchor');
  
  let targetImages = [];
  
  anchors.forEach(anchor => {
    const rowIdx = anchor.indexOf('<xdr:row>');
    if (rowIdx === -1) return;
    const endRowIdx = anchor.indexOf('</xdr:row>', rowIdx);
    const rowNum = parseInt(anchor.substring(rowIdx+9, endRowIdx)) + 1;
    
    // HOUSE OF ULTIMA II 002 is on Row 252.
    // HOUSE OF ULTIMA II 001 is on Row 251.
    if (rowNum === 252 || rowNum === 251) {
      const colIdx = anchor.indexOf('<xdr:col>');
      const endColIdx = anchor.indexOf('</xdr:col>', colIdx);
      const colNum = parseInt(anchor.substring(colIdx+9, endColIdx));
      
      const embedMatch = anchor.match(/r:embed="([^"]+)"/);
      if (embedMatch) {
        targetImages.push({
          row: rowNum,
          col: colNum,
          filename: relMap[embedMatch[1]]
        });
      }
    }
  });

  console.log("Images found for ULTIMA:", targetImages);

  for (const img of targetImages) {
    let activityId = img.row === 251 ? 1475 : 1474; // Assuming 1475 is ULTIMA 001
    // Actually, let's just query the db for ULTIMA 001 to be safe
    if (img.row === 251) {
       const u1 = await prisma.units.findFirst({ where: { room_tenant: "HOUSE OF ULTIMA II 001" } });
       if (u1) {
          const act1 = await prisma.service_activities.findFirst({ where: { unit_id: u1.id, type: 'Preventive' } });
          if (act1) activityId = act1.id;
       }
    }

    const srcPath = path.join(extractDir, 'xl', 'media', img.filename);
    if (!fs.existsSync(srcPath)) continue;

    const outputFileName = `photo_1_ULTIMA_${activityId}_${Date.now()}_${img.col}.webp`;
    const outputPath = path.join('public', 'uploads', 'preventive', outputFileName);
    const relativeUrl = `/uploads/preventive/${outputFileName}`;

    await sharp(srcPath).resize(1000, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);

    await prisma.activity_photos.create({
      data: {
        service_activities: { connect: { id: activityId } },
        photo_url: relativeUrl,
        description: "Maintenance Documentation"
      }
    });

    const act = await prisma.service_activities.findUnique({ where: { id: activityId } });
    if (act && !act.photo_url) {
      await prisma.service_activities.update({
        where: { id: activityId },
        data: { photo_url: relativeUrl }
      });
    }
    console.log(`Linked image ${img.filename} to Activity ${activityId}`);
  }

  await prisma.$disconnect();
}

forceSyncUltima().catch(console.error);
