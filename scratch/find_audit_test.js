const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function main() {
  // Find a bulk-synced audit with rich data
  const audits = await prisma.service_activities.findMany({
    where: { 
      type: 'Audit',
      inspector_name: 'Tim Audit PI'
    },
    select: {
      id: true,
      unit_id: true,
      service_date: true,
      location: true,
      design_airflow: true,
      design_cooling_capacity: true,
      entering_db: true,
      leaving_db: true,
      chws_temp: true,
      technical_json: true
    },
    take: 3,
    orderBy: { id: 'asc' }
  });

  audits.forEach(a => {
    const t = JSON.parse(a.technical_json || '{}');
    console.log(`\nAudit ID: ${a.id}`);
    console.log(`  Location: ${a.location}`);
    console.log(`  Date: ${a.service_date?.toISOString().split('T')[0]}`);
    console.log(`  Entering DB: ${a.entering_db}, Leaving DB: ${a.leaving_db}`);
    console.log(`  Design Airflow: ${a.design_airflow}, Actual: ${t.actual_airflow}`);
    console.log(`  Design Capacity: ${a.design_cooling_capacity}, Actual: ${t.actual_cooling_capacity}`);
    console.log(`  Health Score: ${t.health_score} (${t.health_status})`);
    console.log(`  Enthalpy: ${t.entering_enthalpy} → ${t.leaving_enthalpy} (diff: ${t.enthalpy_diff})`);
    console.log(`  Face Velocity: ${t.face_velocity}, Face Area: ${t.face_area}`);
    console.log(`  CHWS: ${a.chws_temp}`);
    console.log(`  URL: http://localhost:3000/reports/Audit/${a.id}`);
  });

  await prisma.$disconnect();
}
main();
