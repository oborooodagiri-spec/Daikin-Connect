const { PrismaClient } = require("./src/generated/client_v3");
const prisma = new PrismaClient();

async function seed() {
  const data = [
    // AC Split
    { category: "AC Split", item_name: "PM AC Split Wall/Cassette (0.5 - 2 PK)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "0.5 - 2 PK", price: 75000, description: "Cuci indoor & outdoor, cek tekanan freon, cek ampere kompresor, pembersihan filter & drainase." },
    { category: "AC Split", item_name: "PM AC Split Wall/Cassette (2.5 - 5 PK)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "2.5 - 5 PK", price: 120000, description: "Sama dengan di atas." },
    
    // FCU
    { category: "FCU", item_name: "PM Fan Coil Unit (All Capacity)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "All", price: 150000, description: "Pembersihan koil (chemical ringan), strainer, filter udara, cek motor fan & valve, flushing drain." },
    
    // AHU
    { category: "AHU", item_name: "PM Air Handling Unit (< 5000 CFM)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "< 5000 CFM", price: 350000, description: "Cuci koil, cek V-belt, pelumasan bearing, pembersihan filter medium/pocket, cek panel kontrol." },
    { category: "AHU", item_name: "PM Air Handling Unit (> 5000 CFM)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "> 5000 CFM", price: 500000, description: "Sama dengan di atas." },
    
    // Pompa
    { category: "Pump", item_name: "PM Pompa Chilled/Condenser Water", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "All", price: 250000, description: "Cek vibrasi, pelumasan/greasing bearing, cek alignment minor, cek kebocoran mechanical seal/gland packing, pembersihan base plate." },
    
    // Cooling Tower
    { category: "Cooling Tower", item_name: "PM Cooling Tower (< 200 RT)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "< 200 RT", price: 600000, description: "Pembersihan basin, pengecekan sprinkler/nozzle, cek V-belt & motor fan, flushing lumpur ringan." },
    { category: "Cooling Tower", item_name: "PM Cooling Tower (> 200 RT)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "> 200 RT", price: 850000, description: "Sama dengan di atas." },
    
    // Material Tambahan (As per user request)
    { category: "Material Tambahan", item_name: "Penambahan Freon R32 / R410a", work_type: "Material", capacity_unit: "Kg", capacity_range: "All", price: 150000, description: "Hanya ditagihkan jika ada kekurangan tekanan akibat kebocoran minor (setelah persetujuan)." },
    { category: "Material Tambahan", item_name: "Penambahan Freon R22", work_type: "Material", capacity_unit: "Kg", capacity_range: "All", price: 120000, description: "Sama dengan di atas." },
    { category: "Material Tambahan", item_name: "Chemical Pembersih Koil (Alkaline)", work_type: "Material", capacity_unit: "Liter", capacity_range: "All", price: 35000, description: "Digunakan untuk kotoran membandel di AHU/FCU." },

    // PENYEMPURNAAN (Standard Indonesia Market)
    { category: "AC Split", item_name: "Chemical Cleaning / Overhaul (0.5 - 2 PK)", work_type: "Corrective Maintenance", capacity_unit: "Unit", capacity_range: "0.5 - 2 PK", price: 350000, description: "Pembersihan total unit dengan kimia khusus, termasuk pembongkaran casing & evaporator." },
    { category: "VRV", item_name: "PM Outdoor VRV / VRF (8 - 20 PK)", work_type: "Preventive Maintenance", capacity_unit: "Unit / Visit", capacity_range: "8 - 20 PK", price: 450000, description: "Cuci koil kondensor, cek parameter sistem (Proshop Standard), cek koneksi kelistrikan." },
    { category: "Accessories", item_name: "Jasa Ganti V-Belt AHU/Cooling Tower", work_type: "Corrective Maintenance", capacity_unit: "Lot", capacity_range: "All", price: 100000, description: "Jasa bongkar pasang V-Belt (Material V-belt disediakan klien atau penawaran terpisah)." },
    { category: "Accessories", item_name: "Jasa Ganti Kapasitor Fan/Kompresor", work_type: "Corrective Maintenance", capacity_unit: "Unit", capacity_range: "All", price: 75000, description: "Jasa penggantian kapasitor (Jasa saja)." },
    { category: "Accessories", item_name: "Bongkar Pasang AC Split (Pindah Lokasi)", work_type: "Installation", capacity_unit: "Unit", capacity_range: "0.5 - 2 PK", price: 450000, description: "Bongkar di lokasi lama, pasang di lokasi baru (Maks. 5 meter pipa standar)." }
  ];

  console.log("Seeding Rate Card data...");
  
  for (const item of data) {
    await prisma.shopping_list.create({
      data: {
        ...item,
        visibility: "Internal"
      }
    });
  }

  console.log("Seed successful!");
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
