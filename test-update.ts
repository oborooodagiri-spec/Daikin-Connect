import { prisma } from './src/lib/prisma';

async function run() {
  try {
    // Find a deal
    const deal = await prisma.pipeline_deals.findFirst({
      where: { project_name: { contains: "RC-Chiller" } }
    });
    if (!deal) {
      console.log("Deal not found");
      return;
    }

    console.log("Found deal:", deal.id);

    // Test updating the pic_id
    const user = await prisma.users.findFirst({ where: { name: "Aris Prasetyo" } });
    console.log("Found user:", user?.id);

    const updateData: any = { pic: "Aris Prasetyo" };
    if (user) {
      updateData.pic_id = user.id;
    }

    const res = await prisma.pipeline_deals.update({
      where: { id: deal.id },
      data: updateData,
    });
    console.log("Update success!", res.id);
  } catch (e: any) {
    console.error("Update error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
