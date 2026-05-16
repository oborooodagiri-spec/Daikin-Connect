const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const PROJECT_ID = 5n; // Heartology Cardiovascular Hospital

const unitsData = [
  // Lantai 1
  { floor: "Lantai 1", type: "Indoor", area: "CT Scan", model: "AC Split Duct VRV", capacity: "3.5 PK", qty: 2 },
  { floor: "Lantai 1", type: "Indoor", area: "Radiologi", model: "AC Split Duct VRV", capacity: "5.5 PK", qty: 2 },
  { floor: "Lantai 1", type: "Indoor", area: "IGD", model: "AC Split Duct VRV", capacity: "10 PK", qty: 1 },
  { floor: "Lantai 1", type: "Indoor", area: "Koridor", model: "AC Split Duct VRV", capacity: "6 PK", qty: 1 },
  { floor: "Lantai 1", type: "Indoor", area: "Lobby", model: "AC Split Duct VRV", capacity: "8.5 PK", qty: 1 },
  { floor: "Lantai 1", type: "Indoor", area: "Farmasi", model: "AC Split Duct VRV", capacity: "3.5 PK", qty: 1 },
  { floor: "Lantai 1", type: "Outdoor", area: "Rooftop", model: "Outdoor VRF", capacity: "18 PK", qty: 1 },
  { floor: "Lantai 1", type: "Outdoor", area: "Rooftop", model: "Outdoor VRF", capacity: "12 PK", qty: 2 },

  // Lantai 2
  { floor: "Lantai 2", type: "Indoor", area: "Koridor", model: "AC Split Duct VRV", capacity: "5.5 PK", qty: 1 },
  { floor: "Lantai 2", type: "Indoor", area: "OPD", model: "AC Split Duct VRV", capacity: "10 PK", qty: 4 },
  { floor: "Lantai 2", type: "Outdoor", area: "Rooftop", model: "Outdoor VRF", capacity: "18 PK", qty: 2 },
  { floor: "Lantai 2", type: "Outdoor", area: "Rooftop", model: "Outdoor VRF", capacity: "14 PK", qty: 1 },

  // Lantai 3
  { floor: "Lantai 3", type: "Indoor", area: "Koridor", model: "AC Split Duct VRF", capacity: "6 PK", qty: 1 },
  { floor: "Lantai 3", type: "Indoor", area: "Pre OP + Post OP", model: "AC Split Duct VRF", capacity: "10 PK", qty: 1 },
  { floor: "Lantai 3", type: "Indoor", area: "CSSD", model: "AC Split Duct VRF", capacity: "5.5 PK", qty: 1 },
  { floor: "Lantai 3", type: "Indoor", area: "Dirty Corridor", model: "AC Split Duct VRF", capacity: "5.5 PK", qty: 1 },
  { floor: "Lantai 3", type: "Indoor", area: "ICU", model: "AC Split Duct VRF", capacity: "10 PK", qty: 1 },
  { floor: "Lantai 3", type: "Indoor", area: "Ruang Isolasi", model: "AC Split Duct VRF", capacity: "5.5 PK", qty: 1 },
  { floor: "Lantai 3", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "14 PK", qty: 1 },
  { floor: "Lantai 3", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "18 PK", qty: 2 },

  // Lantai 4
  { floor: "Lantai 4", type: "Indoor", area: "Koridor", model: "AC Split Duct VRV", capacity: "6 PK", qty: 3 },
  { floor: "Lantai 4", type: "Indoor", area: "Lab", model: "AC Split Duct VRV", capacity: "2 PK", qty: 1 },
  { floor: "Lantai 4", type: "Indoor", area: "Rekam Medik", model: "AC Split Duct VRV", capacity: "3.5 PK", qty: 1 },
  { floor: "Lantai 4", type: "Indoor", area: "Scope Room", model: "AC Split Duct VRV", capacity: "3.5 PK", qty: 1 },
  { floor: "Lantai 4", type: "Indoor", area: "Preecath", model: "AC Split Duct VRV", capacity: "5.5 PK", qty: 1 },
  { floor: "Lantai 4", type: "Indoor", area: "ODC & HCU", model: "AC Split Duct VRV", capacity: "8.5 PK", qty: 2 },
  { floor: "Lantai 4", type: "Indoor", area: "Area Toilet Disable", model: "AC Split Duct VRV", capacity: "5.5 PK", qty: 1 },
  { floor: "Lantai 4", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "18 PK", qty: 1 },
  { floor: "Lantai 4", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "16 PK", qty: 1 },
  { floor: "Lantai 4", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "14 PK", qty: 1 },

  // Lantai 5
  { floor: "Lantai 5", type: "Indoor", area: "Tindakan", model: "AC Split Duct VRF", capacity: "1.5 PK", qty: 1 },
  { floor: "Lantai 5", type: "Indoor", area: "Kelas I", model: "AC Split Duct VRF", capacity: "1.5 PK", qty: 12 },
  { floor: "Lantai 5", type: "Indoor", area: "R Isolasi", model: "AC Split Duct VRF", capacity: "1.5 PK", qty: 1 },
  { floor: "Lantai 5", type: "Indoor", area: "Change Office", model: "AC Split Duct VRF", capacity: "1 PK", qty: 1 },
  { floor: "Lantai 5", type: "Indoor", area: "Koridor", model: "AC Split Duct VRF", capacity: "4 PK", qty: 2 },
  { floor: "Lantai 5", type: "Indoor", area: "Lobby & Koridor", model: "AC Split Duct VRF", capacity: "10 PK", qty: 1 },
  { floor: "Lantai 5", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "18 PK", qty: 1 },
  { floor: "Lantai 5", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "14 PK", qty: 2 },

  // Lantai 6
  { floor: "Lantai 6", type: "Indoor", area: "VVIP", model: "AC Split Duct VRF", capacity: "3.5 PK", qty: 2 },
  { floor: "Lantai 6", type: "Indoor", area: "R Tindakan", model: "AC Split Duct VRF", capacity: "1.5 PK", qty: 1 },
  { floor: "Lantai 6", type: "Indoor", area: "VIP", model: "AC Split Duct VRF", capacity: "1.5 PK", qty: 9 },
  { floor: "Lantai 6", type: "Indoor", area: "R Isolasi", model: "AC Split Duct VRF", capacity: "5.5 PK", qty: 1 },
  { floor: "Lantai 6", type: "Indoor", area: "Change Office", model: "AC Split Duct VRF", capacity: "1 PK", qty: 1 },
  { floor: "Lantai 6", type: "Indoor", area: "Koridor", model: "AC Split Duct VRF", capacity: "4 PK", qty: 1 },
  { floor: "Lantai 6", type: "Indoor", area: "Lobby & Koridor", model: "AC Split Duct VRF", capacity: "10 PK", qty: 1 },
  { floor: "Lantai 6", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "18 PK", qty: 1 },
  { floor: "Lantai 6", type: "Outdoor", area: "Rooftop", model: "Outdoor VRV", capacity: "14 PK", qty: 2 },

  // Lantai 7
  { floor: "Lantai 7", type: "Indoor", area: "Office", model: "AC Split Duct VRF", capacity: "8.5 PK", qty: 2 },
  { floor: "Lantai 7", type: "Indoor", area: "Koridor", model: "AC Split Duct VRF", capacity: "8.5 PK", qty: 1 },
  { floor: "Lantai 7", type: "Indoor", area: "Ruang HD", model: "AC Split Duct VRF", capacity: "3.5 PK", qty: 1 },
  { floor: "Lantai 7", type: "Indoor", area: "Doctor Lounge", model: "AC Split Duct VRF", capacity: "3.5 PK", qty: 1 },
  { floor: "Lantai 7", type: "Indoor", area: "R Rapat Komisaris", model: "AC Split Duct VRF", capacity: "3.5 PK", qty: 1 },
  { floor: "Lantai 7", type: "Outdoor", area: "Rooftop", model: "Outdoor VRF", capacity: "18 PK", qty: 1 },
  { floor: "Lantai 7", type: "Outdoor", area: "Rooftop", model: "Outdoor VRF", capacity: "16 PK", qty: 1 },
  { floor: "Lantai 7", type: "Outdoor", area: "Rooftop", model: "Outdoor VRF", capacity: "14 PK", qty: 1 },
];

async function seedUnits() {
  console.log("🚀 Seeding units for Heartology Cardiovascular Hospital...");
  let count = 0;

  for (const data of unitsData) {
    for (let i = 0; i < data.qty; i++) {
      await prisma.units.create({
        data: {
          project_ref_id: PROJECT_ID,
          unit_type: data.type,
          building_floor: data.floor,
          area: data.area,
          model: data.model,
          capacity: data.capacity,
          brand: "Daikin",
          status: "Normal",
          tag_number: `${data.type.charAt(0)}${data.floor.split(' ')[1]}-${data.area.substring(0, 3).toUpperCase()}-${i + 1}`
        }
      });
      count++;
    }
  }

  console.log(`✅ Total ${count} units seeded successfully.`);
  await prisma.$disconnect();
}

seedUnits().catch(console.error);
