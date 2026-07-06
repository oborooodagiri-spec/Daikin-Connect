const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function importData() {
  const dataPath = './public/uploads/corrective/plaza_indonesia_mei_2026/extracted_data.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  let inserted = 0;
  let skipped = 0;

  for (const item of data) {
    if (item.no === 'TANGGAL' || item.no === 'Lantai' || item.no === 'NO' || !item.tanggal) {
        skipped++;
        continue;
    }

    const tenantArea = item.tenant_area || '';
    const lantai = item.lantai || '';
    const model = item.model || '';
    const brand = item.brand || 'DAIKIN';
    const kodeUnit = item.kode_unit || '';
    
    // Determine unit type
    let unitType = item.tab === 'FCU' ? 'FCU' : 'AHU';
    if (item.tab === 'AHU & AC SPLIT') {
        if (model.toLowerCase().includes('ftc') || model.toLowerCase().includes('split')) {
            unitType = 'Split';
        }
    }

    // Try to find unit
    let unit = await prisma.units.findFirst({
        where: {
            project_id: '1',
            room_tenant: tenantArea,
            model: model
        }
    });

    if (!unit) {
        // Create unit
        unit = await prisma.units.create({
            data: {
                project_id: '1',
                customer_name: 'Plaza Indonesia',
                building_floor: lantai,
                room_tenant: tenantArea,
                brand: brand,
                model: model,
                code: kodeUnit,
                unit_type: unitType,
                status: 'Normal'
            }
        });
        console.log(`Created new unit: ${tenantArea} - ${model}`);
    }

    // Process photos
    const photoUrls = item.photos.map(p => `/uploads/corrective/plaza_indonesia_mei_2026/${p}`).join(',');
    
    // Parse date safely
    let serviceDate = new Date();
    try {
        if (item.tanggal) {
            const parsed = new Date(item.tanggal);
            if (!isNaN(parsed.getTime())) {
                serviceDate = parsed;
            }
        }
    } catch (e) {}

    // Insert into service_activities
    await prisma.service_activities.create({
        data: {
            unit_id: unit.id,
            type: 'Corrective',
            service_date: serviceDate,
            engineer_note: item.corrective_action || item.remarks,
            status: 'Final_Approved',
            photo_url: photoUrls,
            location: lantai,
            unit_tag: kodeUnit
        }
    });

    // Insert into corrective
    await prisma.corrective.create({
        data: {
            unit_id: unit.id,
            service_date: serviceDate,
            case_complain: item.remarks || '',
            perm_action: item.corrective_action || '',
            photo_url: photoUrls,
            status: item.status || 'Done'
        }
    });

    inserted++;
  }
  
  console.log(`Import completed. Inserted: ${inserted}, Skipped headers: ${skipped}`);
}

importData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
