const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [
  // REFRIGERANT PIPE
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1/4" (6.35 mm) TOTAL', price: 134000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '3/8" (9.52 mm) TOTAL', price: 158000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1/2" (12.7 mm) TOTAL', price: 195000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '5/8" (15.88 mm) TOTAL', price: 222000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '3/4" (19.05 mm) TOTAL', price: 260000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '7/8" (22.23 mm) TOTAL', price: 189000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1" (25.4 mm) TOTAL', price: 227000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1 1/8" (28.58 mm) TOTAL', price: 280000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1 1/4" (31.75 mm) TOTAL', price: 294000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1 3/8" (34.93 mm) TOTAL', price: 362000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1 1/2" (38.10 mm) TOTAL', price: 386000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1 5/8" (41.28 mm) TOTAL', price: 482000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '1 3/4" (44.45 mm) TOTAL', price: 603000 },
  { name: 'REFRIGERANT PIPE ASTM B280 INABA DENKO', category: 'Pipe', unit: 'Meter', specification: '2 1/8" (53.98 mm) TOTAL', price: 754000 },

  // DRAIN PIPE UNIT PRICE (Pipa PVC)
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '1/2"', price: 14000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '3/4"', price: 16000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '1"', price: 23000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '1 1/4"', price: 31000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '1 1/2"', price: 41000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '2"', price: 58000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '2 1/2"', price: 74000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '3"', price: 118000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '4"', price: 182000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '5"', price: 228000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '6"', price: 341000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '8"', price: 516000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '10"', price: 785000 },
  { name: 'PIPA PVC (BASE PRICE)', category: 'Pipe', unit: 'Meter', specification: '12"', price: 1115000 },

  // DRAIN PIPE UNIT PRICE (Elbow PVC)
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '1/2"', price: 3000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '3/4"', price: 4000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '1"', price: 6000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '1 1/4"', price: 10000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '1 1/2"', price: 14000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '2"', price: 21000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '2 1/2"', price: 32000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '3"', price: 54000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '4"', price: 99000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '5"', price: 149000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '6"', price: 249000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '8"', price: 564000 },
  { name: 'ELBOW PVC (BASE PRICE)', category: 'Fitting', unit: 'Pcs', specification: '10"', price: 753000 },

  // DUCTING ACCESSORIES & INSULATION (With Empty Prices Included as 0)
  { name: 'BJLS LOKFOM 1', category: 'Ducting', unit: 'M2', specification: 'Ketebalan 1', price: 0 },
  { name: 'BJLS LOKFOM 0.8', category: 'Ducting', unit: 'M2', specification: 'Ketebalan 0.8', price: 0 },
  { name: 'BJLS LOKFOM 0.6', category: 'Ducting', unit: 'M2', specification: 'Ketebalan 0.6', price: 0 },
  { name: 'BJLS LOKFOM 0.5', category: 'Ducting', unit: 'M2', specification: 'Ketebalan 0.5', price: 0 },
  { name: 'OUTER GLASSWOOL DENS 32 KG/M3 2 INCH', category: 'Insulation', unit: 'M2', specification: '', price: 0 },
  { name: 'ALUMINIUM FOIL DS-FR', category: 'Insulation', unit: 'M2', specification: '', price: 0 },
  { name: 'INNER GLASSWOOL DENS 32 KG/M3 1 INCH', category: 'Insulation', unit: 'M2', specification: '', price: 0 },
  { name: 'GLASSCLOTH', category: 'Insulation', unit: 'M2', specification: '', price: 0 },
  { name: 'SPINDLE PIN', category: 'Accessories', unit: 'Pcs', specification: '', price: 4000 },
  { name: 'WIRE MESH', category: 'Accessories', unit: 'M2', specification: '', price: 0 },
  { name: 'MATERIAL BANTU, SUPPORT & HANGER (DUCT)', category: 'Accessories', unit: 'Ls', specification: '', price: 0 },
  
  { name: 'POLYURETHANE DUCT', category: 'Ducting', unit: 'M2', specification: '', price: 0 },
  { name: 'SAMBUNGAN & MAT BANTU (PU DUCT)', category: 'Accessories', unit: 'Ls', specification: '', price: 0 },
  
  { name: 'DIFFUSER', category: 'Air Terminal', unit: 'Pcs', specification: '', price: 24000 },
  { name: 'GRILL', category: 'Air Terminal', unit: 'Pcs', specification: '', price: 20000 },
  { name: 'VD/FD', category: 'Air Terminal', unit: 'Pcs', specification: '', price: 26000 },
  { name: 'SPIGOT 8"', category: 'Accessories', unit: 'Pcs', specification: '8"', price: 125000 },
  { name: 'SPIGOT 10"', category: 'Accessories', unit: 'Pcs', specification: '10"', price: 150000 },
  { name: 'SPIGOT 12"', category: 'Accessories', unit: 'Pcs', specification: '12"', price: 175000 },
  { name: 'FLEX 350 2 8"', category: 'Ducting', unit: 'Meter', specification: '8"', price: 150000 },
  { name: 'FLEX 350 2 10"', category: 'Ducting', unit: 'Meter', specification: '10"', price: 180000 },
  { name: 'FLEX 350 2 12"', category: 'Ducting', unit: 'Meter', specification: '12"', price: 220000 },

  // PIPA SCH 40 (Harga METER)
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '1/2"', price: 31000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '3/4"', price: 42000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '1"', price: 59000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '1 1/4"', price: 81000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '1 1/2"', price: 96000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '2"', price: 128000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '2 1/2"', price: 204000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '3"', price: 266000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '4"', price: 377000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '5"', price: 511000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '6"', price: 660000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '8"', price: 1008000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '10"', price: 1163000 },
  { name: 'PIPA SCH 40', category: 'Pipe', unit: 'Meter', specification: '12"', price: 1537000 },

  // VALVES BRONZE SCREW
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1/2" (Fig.E)', price: 526872.5 },
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '3/4" (Fig.E)', price: 703972.5 },
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1" (Fig.E)', price: 1009067.5 },
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/4" (Fig.E)', price: 1613277.5 },
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/2" (Fig.E)', price: 3237997.5 },
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '2" (Fig.E)', price: 3242885 },
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '2 1/2" (Fig.E)', price: 4709300 },
  { name: 'GATE VALVE BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '3" (Fig.E)', price: 7051650 },
  
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '1/2" (Fig.R)', price: 297677.5 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '3/4" (Fig.R)', price: 401867.5 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '1" (Fig.R)', price: 607200 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/4" (Fig.R)', price: 910800 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/2" (Fig.R)', price: 1181682.5 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '2" (Fig.R)', price: 1837987.5 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '2 1/2" (Fig.R)', price: 3390600 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '3" (Fig.R)', price: 4591550 },
  { name: 'CHECK VALVE BRONZE 125# SCREW', category: 'Valve', unit: 'Pcs', specification: '4" (Fig.R)', price: 9140400 },

  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '1/2" (Fig.T)', price: 389965 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '3/4" (Fig.T)', price: 522387.5 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '1" (Fig.T)', price: 717370 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/4" (Fig.T)', price: 980777.5 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/2" (Fig.T)', price: 1328997.5 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '2" (Fig.T)', price: 2183275 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '2 1/2" (Fig.T)', price: 4752000 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '3" (Fig.T)', price: 7799650 },
  { name: 'BALL VALVE BRASS 400# SCREW', category: 'Valve', unit: 'Pcs', specification: '4" (Fig.T)', price: 120889650 },

  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1/2" (Fig.Y)', price: 345287.5 },
  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '3/4" (Fig.Y)', price: 480700 },
  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1" (Fig.Y)', price: 616170 },
  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/4" (Fig.Y)', price: 1000097.5 },
  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '1 1/2" (Fig.Y)', price: 1342395 },
  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '2" (Fig.Y)', price: 2223467.5 },
  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '2 1/2" (Fig.Y)', price: 6267450 },
  { name: 'Y - STRAINER BRONZE 150# SCREW', category: 'Valve', unit: 'Pcs', specification: '3" (Fig.Y)', price: 8253900 },

  // FCU ACCESSORIES
  { name: 'TFM SERIES ON OFF SWITCH', category: 'Control & Sensor', unit: 'Pcs', specification: 'TFM228KN/U', price: 1246659 },
  { name: 'TFM SERIES MODBUS ON OFF', category: 'Control & Sensor', unit: 'Pcs', specification: 'TFM428KNM/U', price: 2185101 },
  { name: 'TFM SERIES BACNET ON OFF', category: 'Control & Sensor', unit: 'Pcs', specification: 'TFM428KNB/U', price: 3600390 },
  { name: 'TFM SERIES MODULATING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TFM223KN/U', price: 1940079 },
  { name: 'TFM SERIES MODBUS MODULATING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TFM223KNM/U', price: 2223501 },
  { name: 'TFM SERIES BACNET MODULATING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TFM223KNB/U', price: 4003887 },
  { name: 'WATER FLOW SWITCH (UPDATED)', category: 'Control & Sensor', unit: 'Pcs', specification: 'WFS-1001-H', price: 1290816 },
  { name: 'WATER FLOW SWITCH 20 BAR (UPDATED)', category: 'Control & Sensor', unit: 'Pcs', specification: 'WFS-1002-H', price: 2435544 },
  { name: 'AUTOMATIC AIR VENT 1/2" (12 PCS)', category: 'Valve', unit: 'Set', specification: 'E121-1/2A', price: 600000 },
  { name: 'DIFFERENTIAL PRESSURE TRANSMITTER', category: 'Control & Sensor', unit: 'Pcs', specification: 'DPTE100', price: 9258579 },
  { name: 'DIFFERENTIAL PRESSURE SWITCH', category: 'Control & Sensor', unit: 'Pcs', specification: 'DPS200', price: 1591734 },
  { name: 'DIFFERENTIAL PRESSURE SWITCH', category: 'Control & Sensor', unit: 'Pcs', specification: 'DPS400', price: 1644405 },
  { name: 'HIGH TEMP KIT UNTUK VALVE STEAM', category: 'Accessories', unit: 'Pcs', specification: '43196000-001', price: 4188327 },
  { name: '2 WAY CHARACTERIZED CARTRIDGE', category: 'Accessories', unit: 'Pcs', specification: 'VCZZ1100/U', price: 966687 },
  { name: '2 WAY ON OFF SPRING RETURN 3/4"', category: 'Motorized Valve', unit: 'Pcs', specification: 'VS4016AJ1000T', price: 1267785 },
  { name: 'AUX SWITCH 5 & 10 NEWTON', category: 'Accessories', unit: 'Pcs', specification: 'SSW2-CN', price: 1618674 },
  { name: 'VALVE CARTRIDGE 2 WAY STD', category: 'Accessories', unit: 'Pcs', specification: 'VCZZ1000/U', price: 591234 },
  { name: 'VALVE CARTRIDGE 3 WAY STD', category: 'Accessories', unit: 'Pcs', specification: 'VCZZ6000/U', price: 595929 },
  { name: 'AUX SWITCH 20 & 30 NEWTON', category: 'Accessories', unit: 'Pcs', specification: 'SW2-CN', price: 1819494 },
  { name: 'CO SENSOR', category: 'Control & Sensor', unit: 'Pcs', specification: 'GD250W4NB', price: 9835053 },

  // MOTORIZED DAMPER HONEYWELL
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '5 Nm CN4605A1001 230V', price: 2283423 },
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '10 Nm CN4610A1001 230V', price: 1978935 },
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '20 Nm CN4620A1001 230V', price: 4481439 },
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '34 Nm CN4634A1001 230V', price: 5849295 },
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '5 Nm CN6105A1011 24Vac/Vdc', price: 2415423 },
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '10 Nm CN6110A1003 24Vac/Vdc', price: 2110113 },
  { name: 'MOTORIZED DAMPER (W/ AUX SWITCH)', category: 'Motorized Damper', unit: 'Pcs', specification: '10 Nm CN6110A1201 24Vac/Vdc', price: 3642572 },
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '20 Nm CN6120A1002 24Vac/Vdc', price: 4116504 },
  { name: 'MOTORIZED DAMPER', category: 'Motorized Damper', unit: 'Pcs', specification: '34 Nm CN6134A1003 24Vac/Vdc', price: 6069867 },
  { name: 'MOTORIZED DAMPER MODULATING', category: 'Motorized Damper', unit: 'Pcs', specification: '5 Nm CN7505A2001 24Vac/Vdc', price: 2218692 },
  { name: 'MOTORIZED DAMPER MODULATING', category: 'Motorized Damper', unit: 'Pcs', specification: '10 Nm CN7510A2001 24Vac/Vdc', price: 2222460 },
  { name: 'MOTORIZED DAMPER MODULATING', category: 'Motorized Damper', unit: 'Pcs', specification: '20 Nm CN7220A2007 24Vac/Vdc', price: 5338128 },
  { name: 'MOTORIZED DAMPER MODULATING', category: 'Motorized Damper', unit: 'Pcs', specification: '34 Nm CN7234A2008 24Vac/Vdc', price: 5948940 },

  // MOT FIRE / SMOKE DAMPER HONEYWELL
  { name: 'FIRE DAMPER ACTUATOR', category: 'Motorized Damper', unit: 'Pcs', specification: '3.4Nm MS4604F1210/B 230Vac', price: 3638406 },
  { name: 'FIRE DAMPER ACTUATOR', category: 'Motorized Damper', unit: 'Pcs', specification: '9Nm MS4609F1210/B 230Vac', price: 3554301 },
  { name: 'FIRE DAMPER ACTUATOR', category: 'Motorized Damper', unit: 'Pcs', specification: '23Nm MS4620F1203/B 230Vac', price: 5570268 },
];

async function main() {
  console.log(`Inserting ${items.length} items to Master Pricelist...`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const item of items) {
    const existing = await prisma.pricelist_items.findFirst({
      where: {
        name: item.name,
        specification: item.specification
      }
    });
    
    if (existing) {
      await prisma.pricelist_items.update({
        where: { id: existing.id },
        data: { price: item.price }
      });
      skipped++;
    } else {
      await prisma.pricelist_items.create({
        data: item
      });
      inserted++;
    }
  }
  
  console.log(`Finished! Inserted: ${inserted}, Updated (Skipped insert): ${skipped}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
