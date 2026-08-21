
const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function migrate() {
  const tables = ['service_activities', 'ahu_audits', 'daily_ops_logs', 'corrective'];
  for (const table of tables) {
    try {
        const records = await prisma[table].findMany({
          where: {
            reviewer_signature: { not: null },
            engineer_signature: null
          }
        });
        console.log('Found ' + records.length + ' records to migrate in ' + table);
        for (const record of records) {
          await prisma[table].update({
            where: { id: record.id },
            data: {
              engineer_signature: record.reviewer_signature,
              engineer_signature_ip: record.reviewer_signature_ip,
              reviewer_signature: null,
              reviewer_signature_ip: null
            }
          });
        }
    } catch (e) {
        console.log('Error on ' + table + ': ' + e.message);
    }
  }
  console.log('Migration complete');
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

