const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

async function seedSpecificPKItems() {
  console.log("🧹 Cleaning up old PM items and seeding specific VRV/VRF items...");

  // 1. Delete old PM items to keep the list clean
  await prisma.shopping_list.deleteMany({
    where: {
      OR: [
        { item_name: { contains: "PM SPLIT" } },
        { item_name: { contains: "PM AC SPLIT" } },
        { item_name: { contains: "PM VRV" } }
      ]
    }
  });

  const specificItems = [
    {
      category: "Split Duct",
      work_type: "Preventive Maintenance",
      item_name: "PM AC Split Duct VRF - Indoor",
      capacity_unit: "PK",
      capacity_range: "Per PK",
      price: 0,
      description: "Pembersihan filter, evaporator, drain tray, dan pengecekan sensor indoor VRF.",
      visibility: "Public"
    },
    {
      category: "Split Duct",
      work_type: "Preventive Maintenance",
      item_name: "PM AC Split Duct VRV - Indoor",
      capacity_unit: "PK",
      capacity_range: "Per PK",
      price: 0,
      description: "Pembersihan filter, evaporator, drain tray, dan pengecekan sensor indoor VRV.",
      visibility: "Public"
    },
    {
      category: "VRV",
      work_type: "Preventive Maintenance",
      item_name: "PM Outdoor VRV",
      capacity_unit: "PK",
      capacity_range: "Per PK",
      price: 0,
      description: "Pembersihan kondensor, pengecekan tekanan refrigerant, arus listrik, dan sistem komunikasi VRV.",
      visibility: "Public"
    },
    {
      category: "VRV",
      work_type: "Preventive Maintenance",
      item_name: "PM Outdoor VRF",
      capacity_unit: "PK",
      capacity_range: "Per PK",
      price: 0,
      description: "Pembersihan kondensor, pengecekan tekanan refrigerant, arus listrik, dan sistem komunikasi VRF.",
      visibility: "Public"
    }
  ];

  for (const item of specificItems) {
    await prisma.shopping_list.create({
      data: item
    });
  }

  console.log("✅ 4 Specific PK-based items seeded successfully.");
  await prisma.$disconnect();
}

seedSpecificPKItems().catch(console.error);
