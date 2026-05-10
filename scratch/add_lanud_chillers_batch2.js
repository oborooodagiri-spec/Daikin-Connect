const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
const crypto = require('crypto');

const chillers = [
  { no: '6', model: 'UAL450D5', serial: '18PQR000206', tag: 'DKN002074' },
  { no: '7', model: 'UAL450D5', serial: '18PQR000205', tag: 'DKN002075' },
  { no: '8', model: 'UAL450D5', serial: '18PQR000202', tag: 'DKN002076' },
  { no: '9', model: 'UAL450D5', serial: '18PQR000204', tag: 'DKN002077' },
  { no: '10', model: 'UAL450D5', serial: '18PQR000203', tag: 'DKN002078' }
];

async function addChillers() {
  console.log('Adding 5 more Chillers (6-10) to LANUD Rusdin Noerjamin...');
  
  for (const c of chillers) {
    try {
      const unit = await prisma.units.create({
        data: {
          project_ref_id: 4,
          tag_number: c.tag,
          code: `Chiller ${c.no}`,
          room_tenant: `Area Chiller No. ${c.no}`,
          unit_type: 'Chiller',
          brand: 'Daikin',
          model: c.model,
          serial_number: c.serial,
          status: 'Normal',
          qr_code_token: crypto.randomBytes(16).toString('hex'),
          location: 'Pekanbaru - Riau'
        }
      });
      console.log(`✅ Added ${unit.code} - ${unit.tag_number} (Serial: ${unit.serial_number})`);
    } catch (err) {
      console.error(`❌ Error adding Chiller ${c.no}:`, err.message);
    }
  }
}

addChillers().catch(console.error).finally(() => prisma.$disconnect());
