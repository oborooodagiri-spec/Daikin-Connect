const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
const crypto = require('crypto');

const chillers = [
  { no: '1', model: 'UAL1000D5', serial: '18WBJ000063', tag: 'DKN002069' },
  { no: '2', model: 'UAL1000D5', serial: '18WBJ000064', tag: 'DKN002070' },
  { no: '3', model: 'UAL1000D5', serial: '18WBJ000071', tag: 'DKN002071' },
  { no: '4', model: 'UAL450D5', serial: '18PQR000198', tag: 'DKN002072' },
  { no: '5', model: 'UAL450D5', serial: '18PQR000195', tag: 'DKN002073' }
];

async function addChillers() {
  console.log('Adding 5 Chillers to LANUD Rusdin Noerjamin...');
  
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
