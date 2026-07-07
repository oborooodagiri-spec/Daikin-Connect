const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [
  // BALANCING VALVE HONEYWELL (Kombi-2-Plus Threaded)
  { name: 'BALANCING VALVE HONEYWELL DN15', category: 'Valve', unit: 'Pcs', specification: 'V5032Y0015HW Threaded', price: 1931862 },
  { name: 'BALANCING VALVE HONEYWELL DN20', category: 'Valve', unit: 'Pcs', specification: 'V5032Y0020HW Threaded', price: 1550262 },
  { name: 'BALANCING VALVE HONEYWELL DN25', category: 'Valve', unit: 'Pcs', specification: 'V5032Y0025HW Threaded', price: 1838346 },
  { name: 'BALANCING VALVE HONEYWELL DN32', category: 'Valve', unit: 'Pcs', specification: 'V5032Y0032HW Threaded', price: 3207846 },
  { name: 'BALANCING VALVE HONEYWELL DN40', category: 'Valve', unit: 'Pcs', specification: 'V5032Y0040HW Threaded', price: 3970425 },
  { name: 'BALANCING VALVE HONEYWELL DN50', category: 'Valve', unit: 'Pcs', specification: 'V5032Y0050HW Threaded', price: 7082244 },

  // BALANCING VALVE HONEYWELL (V4 & V5 Kombi-F Flanged)
  { name: 'BALANCING VALVE HONEYWELL DN65', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G065 Flanged', price: 4020345 },
  { name: 'BALANCING VALVE HONEYWELL DN80', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G080 Flanged', price: 4493937 },
  { name: 'BALANCING VALVE HONEYWELL DN100', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G100 Flanged', price: 7584600 },
  { name: 'BALANCING VALVE HONEYWELL DN125', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G125 Flanged', price: 8771493 },
  { name: 'BALANCING VALVE HONEYWELL DN150', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G150 Flanged', price: 15503559 },
  { name: 'BALANCING VALVE HONEYWELL DN200', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G200 Flanged', price: 29235267 },
  { name: 'BALANCING VALVE HONEYWELL DN250', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G250 Flanged', price: 45169143 },
  { name: 'BALANCING VALVE HONEYWELL DN300', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G300 Flanged', price: 59094066 },
  { name: 'BALANCING VALVE HONEYWELL DN350', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G350 Flanged', price: 121976859 },
  { name: 'BALANCING VALVE HONEYWELL DN400', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G400 Flanged', price: 202233198 },
  { name: 'BALANCING VALVE HONEYWELL DN450', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G450 Flanged', price: 221121738 },
  { name: 'BALANCING VALVE HONEYWELL DN500', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G500 Flanged', price: 251874333 },
  { name: 'BALANCING VALVE HONEYWELL DN600', category: 'Valve', unit: 'Pcs', specification: 'V4-BLC-GP16-G600 Flanged', price: 311765031 },

  // THREE WAY MOTORIZED VALVE MODULATING
  { name: 'THREE WAY VALVE 1 1/4" SCREW END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5013P1002 Honeywell', price: 4402139 },
  { name: 'THREE WAY VALVE 1 1/2" SCREW END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5013P1010 Honeywell', price: 6114775 },
  { name: 'THREE WAY VALVE 2" SCREW END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5013P1028 Honeywell', price: 7183094 },
  { name: 'THREE WAY VALVE 2 1/2" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5329A2077 Honeywell', price: 15642415 },
  { name: 'THREE WAY VALVE 3" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5329A2085 Honeywell', price: 20111678 },
  { name: 'THREE WAY VALVE 4" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5050A2088 Honeywell', price: 32230753 },
  { name: 'THREE WAY VALVE 5" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5050A2106 Honeywell', price: 45560434 },
  { name: 'THREE WAY VALVE 6" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5050A2114 Honeywell', price: 63133744 },

  // TWO WAY MOTORIZED VALVE MODULATING
  { name: 'TWO WAY VALVE 1 1/4" SCREW END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5011P1012 Honeywell', price: 2942985 },
  { name: 'TWO WAY VALVE 1 1/2" SCREW END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5011P1020 Honeywell', price: 5603478 },
  { name: 'TWO WAY VALVE 2" SCREW END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5011P1038 Honeywell', price: 6459797 },
  { name: 'TWO WAY VALVE 2 1/2" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5328A1179 Honeywell', price: 18519232 },
  { name: 'TWO WAY VALVE 3" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5329A2085 Honeywell (Two Way Price)', price: 23864989 },
  { name: 'TWO WAY VALVE 4" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5050A2088 Honeywell (Two Way Price)', price: 40618212 },
  { name: 'TWO WAY VALVE 5" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5050A2106 Honeywell (Two Way Price)', price: 50298719 },
  { name: 'TWO WAY VALVE 6" FLANGED END', category: 'Motorized Valve', unit: 'Pcs', specification: 'V5050A2114 Honeywell (Two Way Price)', price: 61532620 },

  // VALVE ACTUATOR / CONTROLLER / SENSOR (HONEYWELL)
  { name: 'VALVE ACTUATOR 20MM STEM TRAVEL 600N', category: 'Control & Sensor', unit: 'Pcs', specification: 'ML7420A8088-E Honeywell', price: 7617055 },
  { name: 'VALVE ACTUATOR 20MM STEM TRAVEL 800N', category: 'Control & Sensor', unit: 'Pcs', specification: 'ML7421B8012-E Honeywell', price: 11746044 },
  { name: 'DIGITAL MODULATING TEMP CONTROLLER', category: 'Control & Sensor', unit: 'Pcs', specification: 'TB7980A1006/U Honeywell', price: 1711285 },
  { name: 'REMOTE DUCT TEMPERATURE SENSOR', category: 'Control & Sensor', unit: 'Pcs', specification: '50014157-001/U Honeywell', price: 611223 },

  // AUTOMATIC AIR VENT
  { name: 'AUTOMATIC AIR VENT YOSHITAKE', category: 'Valve', unit: 'Pcs', specification: '1/2" Cast Iron 10K Screw', price: 5054652 },
  { name: 'AUTOMATIC AIR VENT YOSHITAKE', category: 'Valve', unit: 'Pcs', specification: '3/4" Cast Iron 10K Screw', price: 5054652 },
  { name: 'AUTOMATIC AIR VENT YOSHITAKE', category: 'Valve', unit: 'Pcs', specification: '1" Cast Iron 10K Screw', price: 6272215 },
  { name: 'AUTOMATIC AIR VENT YOSHITAKE', category: 'Valve', unit: 'Pcs', specification: '1 1/4" Cast Iron 10K Screw', price: 6272215 },
  { name: 'AUTOMATIC AIR VENT HONEYWELL', category: 'Valve', unit: 'Pcs', specification: '1/2"', price: 575000 },
  { name: 'AUTOMATIC AIR VENT ARITA', category: 'Valve', unit: 'Pcs', specification: '1"', price: 1076500 },
  { name: 'AUTOMATIC AIR VENT ARITA', category: 'Valve', unit: 'Pcs', specification: '1 1/2"', price: 2215000 },

  // THERMOMETER
  { name: 'THERMOMETER SIKA', category: 'Measuring Instrument', unit: 'Pcs', specification: 'Range 0C-50C Straight Compact', price: 971520 },
  { name: 'THERMOMETER SIKA', category: 'Measuring Instrument', unit: 'Pcs', specification: 'Range 0C-100C Straight Compact', price: 971520 },

  // PRESSURE GAUGE
  { name: 'PRESSURE GAUGE INTERNAL BRASS', category: 'Measuring Instrument', unit: 'Pcs', specification: '0 - 10 Kg', price: 740025 },
  { name: 'PRESSURE GAUGE INTERNAL BRASS', category: 'Measuring Instrument', unit: 'Pcs', specification: '0 - 15 Kg', price: 740025 },
  { name: 'PRESSURE GAUGE INTERNAL BRASS', category: 'Measuring Instrument', unit: 'Pcs', specification: '0 - 20 Kg', price: 740025 },
  { name: 'PRESSURE GAUGE INTERNAL BRASS', category: 'Measuring Instrument', unit: 'Pcs', specification: '0 - 25 Kg', price: 740025 },
  { name: 'PRESSURE GAUGE INTERNAL BRASS', category: 'Measuring Instrument', unit: 'Pcs', specification: '0 - 35 Kg', price: 740025 },
  { name: 'PRESSURE GAUGE INTERNAL BRASS', category: 'Measuring Instrument', unit: 'Pcs', specification: '0 - 50 Kg', price: 986700 },
  { name: 'PRESSURE GAUGE INTERNAL BRASS', category: 'Measuring Instrument', unit: 'Pcs', specification: '0 - 75 Kg', price: 986700 },

  // FLOW SWITCH
  { name: 'FLOW SWITCH YOSHITAKE', category: 'Control & Sensor', unit: 'Pcs', specification: 'Model: FG 61 KB - B23', price: 961400 },
  { name: 'FLOW SWITCH HONEYWELL', category: 'Control & Sensor', unit: 'Pcs', specification: 'Model: FG 61 KB - B23', price: 1828779 },

  // BUTTERFLY VALVE 10K
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '2"', price: 1345364 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '2 1/2"', price: 1510558 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '3"', price: 1820111 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '4"', price: 2059717 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '5"', price: 2721982 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '6"', price: 3071717 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '8"', price: 5973776 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '10"', price: 11780870 },
  { name: 'BUTTERFLY VALVE 10K', category: 'Valve', unit: 'Pcs', specification: '12"', price: 14993970 },

  // BUTTERFLY VALVE 16K
  { name: 'BUTTERFLY VALVE 16K', category: 'Valve', unit: 'Pcs', specification: '2"', price: 1912392 },
  { name: 'BUTTERFLY VALVE 16K', category: 'Valve', unit: 'Pcs', specification: '2 1/2"', price: 2077590 },
  { name: 'BUTTERFLY VALVE 16K', category: 'Valve', unit: 'Pcs', specification: '3"', price: 2336570 },
  { name: 'BUTTERFLY VALVE 16K', category: 'Valve', unit: 'Pcs', specification: '4"', price: 2832162 },
  { name: 'BUTTERFLY VALVE 16K', category: 'Valve', unit: 'Pcs', specification: '5"', price: 4342687 },
  { name: 'BUTTERFLY VALVE 16K', category: 'Valve', unit: 'Pcs', specification: '6"', price: 4504895 },
  { name: 'BUTTERFLY VALVE 16K', category: 'Valve', unit: 'Pcs', specification: '8"', price: 8674967 },

  // GATE VALVE CI BODY JIS 10K FLANGE
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '1 1/2"', price: 4943965 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '2"', price: 5772885 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '2 1/2"', price: 6717897 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '3"', price: 8040972 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '4"', price: 11410300 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '5"', price: 16260482 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '6"', price: 21132975 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '8"', price: 33753190 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '10"', price: 56770267 },
  { name: 'GATE VALVE CI BODY JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '12"', price: 74736200 },
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
