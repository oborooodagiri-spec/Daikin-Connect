import { PrismaClient } from './src/generated/client_v3/index.js';

const prisma = new PrismaClient();

async function run() {
  try {
    const deal = await prisma.pipeline_deals.findFirst({
      where: { project_name: { contains: "RC-Chiller" } }
    });
    console.log("Deal id:", deal?.id);

    const user = await prisma.users.findFirst({ where: { name: "Aris Prasetyo" } });
    console.log("User id:", user?.id);

    // Mimic the exact update
    const updateData = {
      pic: "Aris Prasetyo",
      pic_id: user?.id,
      region: undefined
    };

    const res = await prisma.pipeline_deals.update({
      where: { id: deal.id },
      data: updateData
    });
    console.log("Updated deal:", res.id);

    // Test history
    await prisma.pipeline_history.create({
      data: {
        deal_id: deal.id,
        changed_by_id: user.id,
        field_changed: "pic",
        old_value: "pic project mockup",
        new_value: "Aris Prasetyo",
        remark: "PIC updated"
      }
    });
    console.log("History created!");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
