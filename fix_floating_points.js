const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

function fixNumberString(str) {
  if (typeof str !== 'string') return str;
  // If it's a number-like string that has more than 4 decimal places
  if (/^-?\d+\.\d{4,}$/.test(str)) {
    const num = parseFloat(str);
    if (!isNaN(num)) {
      // Round to 2 decimal places and remove trailing zeros
      let rounded = num.toFixed(2);
      // Strip trailing zeros after decimal
      rounded = rounded.replace(/\.?0+$/, '');
      if (rounded === '') return '0';
      return rounded;
    }
  }
  return str;
}

function traverseAndFix(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = fixNumberString(obj[i]);
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        traverseAndFix(obj[i]);
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = fixNumberString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverseAndFix(obj[key]);
      }
    }
  }
}

async function run() {
  try {
    const projects = await prisma.projects.findMany({ where: { name: { contains: 'plaza indonesia' } } });
    const project = projects[0];

    const acts = await prisma.service_activities.findMany({
      where: { 
        units: { project_ref_id: project.id }, 
        type: 'Preventive', 
        service_date: { gte: new Date('2026-05-01') } 
      },
      include: { units: true }
    });

    let updatedCount = 0;

    for (const act of acts) {
      if (!act.technical_json) continue;
      try {
        const parsed = JSON.parse(act.technical_json);
        let changed = false;

        // Fix floating point numbers recursively
        const originalJson = JSON.stringify(parsed);
        traverseAndFix(parsed);
        
        // Fix AHU performa_unit bug
        if (act.units.unit_type === 'AHU' && parsed.scope && parsed.scope.performa_unit && parsed.scope.performa_unit.before) {
          const pu = parsed.scope.performa_unit.before;
          if (typeof pu === 'string' && pu.endsWith('%')) {
             const rawNum = parseFloat(pu.replace('%', ''));
             if (!isNaN(rawNum)) {
                // Since my script did Math.round(val * 100), to revert we divide by 100
                const restored = rawNum / 100;
                parsed.scope.performa_unit.before = restored.toString();
             }
          }
        }

        const newJson = JSON.stringify(parsed);
        if (originalJson !== newJson) {
          await prisma.service_activities.update({
            where: { id: act.id },
            data: { technical_json: newJson }
          });
          updatedCount++;
        }
      } catch (e) {
        console.error("Failed to parse act id", act.id, e);
      }
    }

    console.log(`Successfully fixed floating points and performa for ${updatedCount} records.`);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
