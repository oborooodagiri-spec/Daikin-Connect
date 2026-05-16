const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function deepCheck() {
  const PROJECT_ID = 5n;
  
  console.log("--- Detailed Distribution ---");
  const units = await prisma.units.findMany({
    where: { project_ref_id: PROJECT_ID },
    select: { id: true, building_floor: true, project_id: true, project_ref_id: true }
  });

  const floors = {};
  units.forEach(u => {
    const f = u.building_floor || 'Unknown';
    if (!floors[f]) floors[f] = { count: 0, project_id_vals: new Set(), project_ref_id_vals: new Set() };
    floors[f].count++;
    floors[f].project_id_vals.add(u.project_id);
    floors[f].project_ref_id_vals.add(u.project_ref_id.toString());
  });

  for (const f in floors) {
    console.log(`${f}: ${floors[f].count} units | project_id: [${Array.from(floors[f].project_id_vals).join(', ')}] | project_ref_id: [${Array.from(floors[f].project_ref_id_vals).join(', ')}]`);
  }

  await prisma.$disconnect();
}

deepCheck().catch(console.error);
