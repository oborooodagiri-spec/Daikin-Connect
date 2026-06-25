const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function main() {
  console.log("Removing internal-rate-card from Knowledge Resources...");
  await prisma.$executeRawUnsafe(`DELETE FROM knowledge_resources WHERE id = 'internal-rate-card'`);
  await prisma.$executeRawUnsafe(`
    INSERT INTO rate_card_settings (setting_key, setting_value, updated_at)
    VALUES ('rate_card_resource_deleted', 'true', NOW())
    ON DUPLICATE KEY UPDATE setting_value = 'true', updated_at = NOW()
  `);
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
