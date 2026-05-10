const { PrismaClient } = require('../src/generated/client_v2');
const p = new PrismaClient();

async function main() {
  const project = await p.projects.findUnique({ where: { id: 1n }, select: { customer_id: true, name: true } });
  console.log('Project:', project);

  const unitCount = await p.units.count({ where: { project_ref_id: 1n } });
  console.log('Total units:', unitCount);

  // Show units that match spreadsheet tag format
  const fcuUnits = await p.units.findMany({
    where: { project_ref_id: 1n, code: { startsWith: 'FCU' } },
    select: { id: true, tag_number: true, room_tenant: true, unit_type: true, code: true },
    take: 5
  });
  console.log('FCU units with code:', JSON.stringify(fcuUnits, null, 2));

  const ahuUnits = await p.units.findMany({
    where: { project_ref_id: 1n, code: { startsWith: 'AHU' } },
    select: { id: true, tag_number: true, room_tenant: true, unit_type: true, code: true },
    take: 5
  });
  console.log('AHU units with code:', JSON.stringify(ahuUnits, null, 2));

  // Check for existing audits with unit_ids
  const auditWithUnit = await p.service_activities.findMany({
    where: { type: 'Audit', unit_id: { not: null } },
    select: { id: true, unit_id: true, service_date: true, unit_tag: true },
    take: 5
  });
  console.log('Audits with unit_id:', JSON.stringify(auditWithUnit, null, 2));

  // Check audits without unit_id
  const auditNoUnit = await p.service_activities.count({ where: { type: 'Audit', unit_id: null } });
  console.log('Audits without unit_id:', auditNoUnit);

  await p.$disconnect();
}
main();
