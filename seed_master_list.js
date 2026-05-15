const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const MASTER_ITEMS = [
  // ===== CHILLER =====
  { category: "Chiller", work_type: "Preventive Maintenance", item_name: "PM Chiller Air Cooled", capacity_unit: "Unit", capacity_range: "5 - 30 TR", description: "Inspeksi, pembersihan condenser, cek refrigerant, cek oli, cek electrical" },
  { category: "Chiller", work_type: "Preventive Maintenance", item_name: "PM Chiller Air Cooled", capacity_unit: "Unit", capacity_range: "30 - 60 TR", description: "Inspeksi, pembersihan condenser, cek refrigerant, cek oli, cek electrical" },
  { category: "Chiller", work_type: "Preventive Maintenance", item_name: "PM Chiller Water Cooled", capacity_unit: "Unit", capacity_range: "50 - 150 TR", description: "Inspeksi, tube cleaning, cek refrigerant, cek oli, cek electrical" },
  { category: "Chiller", work_type: "Preventive Maintenance", item_name: "PM Chiller Water Cooled", capacity_unit: "Unit", capacity_range: "150 - 500 TR", description: "Inspeksi, tube cleaning, cek refrigerant, cek oli, cek electrical" },
  { category: "Chiller", work_type: "Chemical Cleaning", item_name: "Chemical Cleaning Condenser Chiller", capacity_unit: "Unit", capacity_range: "All", description: "Pembersihan kimiawi condenser tube" },
  { category: "Chiller", work_type: "Chemical Cleaning", item_name: "Chemical Cleaning Evaporator Chiller", capacity_unit: "Unit", capacity_range: "All", description: "Pembersihan kimiawi evaporator tube" },
  { category: "Chiller", work_type: "Overhaul", item_name: "Overhaul Compressor Chiller", capacity_unit: "Unit", capacity_range: "50 - 150 TR", description: "Bongkar pasang, ganti gasket, bearing, cek valve plate" },
  { category: "Chiller", work_type: "Overhaul", item_name: "Overhaul Compressor Chiller", capacity_unit: "Unit", capacity_range: "150 - 500 TR", description: "Bongkar pasang, ganti gasket, bearing, cek valve plate" },

  // ===== VRV =====
  { category: "VRV", work_type: "Preventive Maintenance", item_name: "PM Outdoor Unit VRV", capacity_unit: "Unit", capacity_range: "8 - 16 HP", description: "Inspeksi, cuci condenser, cek refrigerant, cek electrical" },
  { category: "VRV", work_type: "Preventive Maintenance", item_name: "PM Outdoor Unit VRV", capacity_unit: "Unit", capacity_range: "16 - 28 HP", description: "Inspeksi, cuci condenser, cek refrigerant, cek electrical" },
  { category: "VRV", work_type: "Preventive Maintenance", item_name: "PM Indoor Unit VRV (Cassette/Ducted)", capacity_unit: "Unit", capacity_range: "All", description: "Cuci filter, cuci evaporator, cek drain, cek electrical" },
  { category: "VRV", work_type: "Chemical Cleaning", item_name: "Chemical Cleaning Indoor VRV", capacity_unit: "Unit", capacity_range: "All", description: "Pembersihan kimiawi evaporator coil indoor" },
  { category: "VRV", work_type: "Freon Charging", item_name: "Charging Refrigerant VRV (R410A)", capacity_unit: "Kg", capacity_range: "Per Kg", description: "Pengisian refrigerant R410A termasuk nitrogen test" },

  // ===== SPLIT DUCT =====
  { category: "Split Duct", work_type: "Preventive Maintenance", item_name: "PM Split Duct", capacity_unit: "Unit", capacity_range: "2 - 5 PK", description: "Cuci filter, cuci evaporator & condenser, cek refrigerant" },
  { category: "Split Duct", work_type: "Preventive Maintenance", item_name: "PM Split Duct", capacity_unit: "Unit", capacity_range: "5 - 8 PK", description: "Cuci filter, cuci evaporator & condenser, cek refrigerant" },
  { category: "Split Duct", work_type: "Preventive Maintenance", item_name: "PM AC Split Wall", capacity_unit: "Unit", capacity_range: "0.5 - 2 PK", description: "Cuci filter, cuci evaporator & condenser, cek electrical" },
  { category: "Split Duct", work_type: "Chemical Cleaning", item_name: "Chemical Cleaning Split Duct", capacity_unit: "Unit", capacity_range: "All", description: "Pembersihan kimiawi evaporator & condenser coil" },
  { category: "Split Duct", work_type: "Freon Charging", item_name: "Charging Refrigerant Split (R32/R410A)", capacity_unit: "Kg", capacity_range: "Per Kg", description: "Pengisian refrigerant termasuk nitrogen test dan leak test" },

  // ===== AHU =====
  { category: "AHU", work_type: "Preventive Maintenance", item_name: "PM AHU (Air Handling Unit)", capacity_unit: "Unit", capacity_range: "5000 - 15000 CFM", description: "Cuci filter, cuci coil, cek bearing, cek belt, cek motor fan" },
  { category: "AHU", work_type: "Preventive Maintenance", item_name: "PM AHU (Air Handling Unit)", capacity_unit: "Unit", capacity_range: "15000 - 30000 CFM", description: "Cuci filter, cuci coil, cek bearing, cek belt, cek motor fan" },
  { category: "AHU", work_type: "Chemical Cleaning", item_name: "Chemical Cleaning Coil AHU", capacity_unit: "Unit", capacity_range: "All", description: "Pembersihan kimiawi cooling coil AHU" },

  // ===== FCU =====
  { category: "FCU", work_type: "Preventive Maintenance", item_name: "PM FCU (Fan Coil Unit)", capacity_unit: "Unit", capacity_range: "200 - 600 CFM", description: "Cuci filter, cuci coil, cek drain, cek motor fan" },
  { category: "FCU", work_type: "Preventive Maintenance", item_name: "PM FCU (Fan Coil Unit)", capacity_unit: "Unit", capacity_range: "600 - 1200 CFM", description: "Cuci filter, cuci coil, cek drain, cek motor fan" },
  { category: "FCU", work_type: "Chemical Cleaning", item_name: "Chemical Cleaning Coil FCU", capacity_unit: "Unit", capacity_range: "All", description: "Pembersihan kimiawi cooling coil FCU" },

  // ===== COOLING TOWER =====
  { category: "Cooling Tower", work_type: "Preventive Maintenance", item_name: "PM Cooling Tower", capacity_unit: "Unit", capacity_range: "50 - 200 TR", description: "Cuci basin, cek fill, cek motor fan, cek nozzle, water treatment" },
  { category: "Cooling Tower", work_type: "Preventive Maintenance", item_name: "PM Cooling Tower", capacity_unit: "Unit", capacity_range: "200 - 500 TR", description: "Cuci basin, cek fill, cek motor fan, cek nozzle, water treatment" },
  { category: "Cooling Tower", work_type: "Chemical Cleaning", item_name: "Chemical Cleaning Basin & Fill Cooling Tower", capacity_unit: "Unit", capacity_range: "All", description: "Pembersihan kimiawi basin, fill pack, dan distribusi nozzle" },

  // ===== PUMP =====
  { category: "Pump", work_type: "Preventive Maintenance", item_name: "PM Chilled Water Pump (CHWP)", capacity_unit: "Unit", capacity_range: "All", description: "Cek bearing, mechanical seal, alignment, cek electrical" },
  { category: "Pump", work_type: "Preventive Maintenance", item_name: "PM Condenser Water Pump (CWP)", capacity_unit: "Unit", capacity_range: "All", description: "Cek bearing, mechanical seal, alignment, cek electrical" },

  // ===== ACCESSORIES =====
  { category: "Accessories", work_type: "Preventive Maintenance", item_name: "PM BAS / BMS Panel", capacity_unit: "Unit", capacity_range: "All", description: "Inspeksi panel kontrol, kalibrasi sensor, cek wiring" },
  { category: "Accessories", work_type: "Preventive Maintenance", item_name: "PM Ducting & Insulation", capacity_unit: "Meter", capacity_range: "Per Meter", description: "Inspeksi ducting, perbaikan insulation, cek joint" },

  // ===== MATERIAL TAMBAHAN =====
  { category: "Material Tambahan", work_type: "Others", item_name: "Refrigerant R410A", capacity_unit: "Kg", capacity_range: "Per Kg", description: "Supply material refrigerant R410A" },
  { category: "Material Tambahan", work_type: "Others", item_name: "Refrigerant R32", capacity_unit: "Kg", capacity_range: "Per Kg", description: "Supply material refrigerant R32" },
  { category: "Material Tambahan", work_type: "Others", item_name: "Refrigerant R22", capacity_unit: "Kg", capacity_range: "Per Kg", description: "Supply material refrigerant R22" },
  { category: "Material Tambahan", work_type: "Others", item_name: "Compressor Oil", capacity_unit: "Liter", capacity_range: "Per Liter", description: "Supply oli kompresor sesuai spesifikasi" },
  { category: "Material Tambahan", work_type: "Others", item_name: "V-Belt Set", capacity_unit: "Lot", capacity_range: "Per Set", description: "Supply V-Belt untuk AHU / Cooling Tower" },
  { category: "Material Tambahan", work_type: "Others", item_name: "Filter Udara (Panel/Bag)", capacity_unit: "Unit", capacity_range: "Per Unit", description: "Supply filter udara AHU / FCU" },
];

async function main() {
  console.log("🔄 Seeding Master Rate Card Items...");
  
  // Clear existing items (optional - remove if you want to keep existing data)
  await prisma.$executeRaw`DELETE FROM shopping_list`;
  console.log("🧹 Cleared existing items.");

  let count = 0;
  for (const item of MASTER_ITEMS) {
    await (prisma).shopping_list.create({
      data: {
        category: item.category,
        work_type: item.work_type,
        item_name: item.item_name,
        capacity_unit: item.capacity_unit,
        capacity_range: item.capacity_range,
        price: 0, // Price is 0 because it's the master list - vendor prices stored separately
        description: item.description,
        visibility: "Internal",
        vendor_name: null, // Universal - not tied to any vendor
      }
    });
    count++;
  }
  console.log(`✅ ${count} master items seeded successfully.`);

  // Update settings: period to year-based, clear selected_vendor
  await prisma.$executeRaw`INSERT INTO rate_card_settings (setting_key, setting_value) VALUES ('period_year', '"2026"') ON DUPLICATE KEY UPDATE setting_value = '"2026"'`;
  await prisma.$executeRaw`INSERT INTO rate_card_settings (setting_key, setting_value) VALUES ('selected_vendor', '""') ON DUPLICATE KEY UPDATE setting_value = '""'`;
  await prisma.$executeRaw`INSERT INTO rate_card_settings (setting_key, setting_value) VALUES ('vendor_prices', '{}') ON DUPLICATE KEY UPDATE setting_value = COALESCE(setting_value, '{}')`;
  console.log("✅ Settings updated (period=year, vendor_prices initialized).");

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
