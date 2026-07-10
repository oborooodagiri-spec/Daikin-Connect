import { PrismaClient } from './src/generated/client_v3/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const defaultCategories = [
      { name: "I. PRELIMINARY", order_index: 0 },
      { name: "II. SUPPLY MAIN EQUIPMENT", order_index: 1 },
      { name: "III. SCOPE OF WORK INSTALLATION", order_index: 2 },
      { name: "III.A. Installation Pipe Chiller Water Supply", order_index: 3 },
      { name: "III.B. Installation Pipe Condenser Water Supply", order_index: 4 },
      { name: "III.C. Accesories Chiller", order_index: 5 },
      { name: "III.D. Accesories Primary Chilled Water Pump", order_index: 6 },
      { name: "III.E. Accesories Secondary Chilled Water Pump", order_index: 7 },
      { name: "III.F. Accesories Condenser Water Pump", order_index: 8 },
      { name: "III.G. Accesories Cooling Tower", order_index: 9 },
      { name: "IV. INSTALLATION ELECTRICAL", order_index: 10 },
      { name: "V. LIFTING AND CIVIL INSTALLATION", order_index: 11 },
    ];

    const boq = await prisma.boq_projects.create({
      data: {
        project_name: "Test Project",
        customer_name: "Test Customer",
        created_by: 4, // Valid user ID
        categories: {
          create: defaultCategories
        }
      },
    });
    console.log("Success:", boq);
  } catch (error) {
    console.error("Error creating BOQ:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
