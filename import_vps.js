const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function importExcel() {
  const filePath = 'Data Project/Plaza Indonesia/2026/Agustus/PM/PM FCU Agustus 2026.xlsx';
  if (!fs.existsSync(filePath)) {
     console.log('File not found:', filePath);
     process.exit(1);
  }
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  let count = 0;
  for (let i = 7; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row[5]) continue; 
    
    const tenant = row[5].toString().trim();
    const excelDate = row[1];
    let serviceDate = new Date();
    if (typeof excelDate === 'number') {
      serviceDate = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
    }
    
    const unit = await prisma.units.findFirst({
      where: {
        project_ref_id: 1n,
        room_tenant: tenant
      }
    });
    
    if (unit) {
      const finding = row[32] ? row[32].toString() : 'Pemeriksaan Rutin PM FCU Agustus 2026';
      const performance = row[31] ? row[31].toString() : '';
      
      const fullFinding = performance ? finding + ' (Performance: ' + performance + ')' : finding;
      
      await (prisma.service_activities).create({
        data: {
          units: { connect: { id: unit.id } },
          type: 'Preventive',
          service_date: serviceDate,
          status: 'Final_Approved',
          inspector_name: 'Tim Teknisi PI',
          engineer_note: fullFinding,
          technical_advice: 'Lanjutkan jadwal PM',
          unit_tag: unit.tag_number,
          location: unit.location || tenant,
          created_at: new Date()
        }
      });
      count++;
    }
  }
  console.log('BERHASIL! Total data PM FCU yang diimport ke database server:', count);
  await prisma.$disconnect();
}
importExcel();
