const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [
  // PIPA PVC RUCIKA (AW) - 4 M/Batang
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '1/2" (22mm)', price: 26600 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '3/4" (26mm)', price: 36300 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '1" (32mm)', price: 49700 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '1 1/4" (42mm)', price: 74200 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '1 1/2" (48mm)', price: 85200 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '2" (60mm)', price: 108900 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '2 1/2" (76mm)', price: 158700 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '3" (89mm)', price: 229500 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '4" (114mm)', price: 370300 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '5" (140mm)', price: 596500 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '6" (165mm)', price: 822500 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '8" (216mm)', price: 1390000 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '10" (267mm)', price: 2133700 },
  { name: 'PIPA PVC RUCIKA STANDARD AW', category: 'Pipa PVC', unit: 'Batang', specification: '12" (318mm)', price: 3008500 },

  // PIPA PVC RUCIKA (D) - 4 M/Batang
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '1 1/4" (42mm)', price: 45600 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '1 1/2" (48mm)', price: 52700 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '2" (60mm)', price: 67500 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '2 1/2" (76mm)', price: 91200 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '3" (89mm)', price: 121000 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '4" (114mm)', price: 190300 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '5" (140mm)', price: 292900 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '6" (165mm)', price: 386200 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '8" (216mm)', price: 679000 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '10" (267mm)', price: 1118400 },
  { name: 'PIPA PVC RUCIKA STANDARD D', category: 'Pipa PVC', unit: 'Batang', specification: '12" (318mm)', price: 1569700 },

  // PIPA PVC JIS (VP) - 4 M/Batang
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '1/2" (22mm)', price: 40500 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '3/4" (26mm)', price: 58000 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '1" (32mm)', price: 84200 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '1 1/4" (42mm)', price: 113600 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '1 1/2" (48mm)', price: 147500 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '2" (60mm)', price: 209400 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '2 1/2" (76mm)', price: 269300 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '3" (89mm)', price: 429000 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '4" (114mm)', price: 662800 },
  { name: 'PIPA PVC JIS K-6741 VP', category: 'Pipa PVC', unit: 'Batang', specification: '5" (140mm)', price: 829600 },

  // PIPA PVC JIS (VU) - 4 M/Batang
  { name: 'PIPA PVC JIS K-6741 VU', category: 'Pipa PVC', unit: 'Batang', specification: '1 1/2" (48mm)', price: 77400 },
  { name: 'PIPA PVC JIS K-6741 VU', category: 'Pipa PVC', unit: 'Batang', specification: '2" (60mm)', price: 97600 },
  { name: 'PIPA PVC JIS K-6741 VU', category: 'Pipa PVC', unit: 'Batang', specification: '2 1/2" (76mm)', price: 154300 },
  { name: 'PIPA PVC JIS K-6741 VU', category: 'Pipa PVC', unit: 'Batang', specification: '3" (89mm)', price: 225500 },
  { name: 'PIPA PVC JIS K-6741 VU', category: 'Pipa PVC', unit: 'Batang', specification: '4" (114mm)', price: 338300 },
  { name: 'PIPA PVC JIS K-6741 VU', category: 'Pipa PVC', unit: 'Batang', specification: '5" (140mm)', price: 509400 },
  { name: 'PIPA PVC JIS K-6741 VU', category: 'Pipa PVC', unit: 'Batang', specification: '6" (165mm)', price: 732200 },

  // REDUCED ELBOW PPR
  { name: 'REDUCED ELBOW PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x20 mm', price: 6036 },
  { name: 'REDUCED ELBOW PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x20 mm', price: 6216 },
  { name: 'REDUCED ELBOW PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x25 mm', price: 7027 },

  // REDUCER TEE PPR
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x20x25', price: 8829 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x20x32', price: 10000 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x25x32', price: 10811 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x20x40', price: 21622 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x25x40', price: 22072 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x32x40', price: 27658 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x20x50', price: 40450 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x25x50', price: 44955 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x32x50', price: 46396 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x40x50', price: 56577 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x20x63', price: 71441 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x25x63', price: 72613 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x32x63', price: 73694 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x40x63', price: 75495 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x50x63', price: 78649 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x25x75', price: 90180 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x32x75', price: 95315 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x40x75', price: 101532 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x50x75', price: 142883 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x63x75', price: 142883 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x32x90', price: 151622 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x40x90', price: 162523 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x50x90', price: 178378 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x63x90', price: 185405 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x75x90', price: 232072 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x50x110', price: 266667 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x63x110', price: 287838 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x75x110', price: 328468 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x90x110', price: 361351 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '160x90x160', price: 776757 },
  { name: 'REDUCER TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '160x110x160', price: 870180 },

  // FLANGE PVC
  { name: 'FLANGE PVC', category: 'Fitting PVC', unit: 'Pcs', specification: '2" (50mm)', price: 33500 },
  { name: 'FLANGE PVC', category: 'Fitting PVC', unit: 'Pcs', specification: '2 1/2" (65mm)', price: 43700 },
  { name: 'FLANGE PVC', category: 'Fitting PVC', unit: 'Pcs', specification: '3" (75mm)', price: 51800 },
  { name: 'FLANGE PVC', category: 'Fitting PVC', unit: 'Pcs', specification: '4" (100mm)', price: 85500 },
  { name: 'FLANGE PVC', category: 'Fitting PVC', unit: 'Pcs', specification: '6" (150mm)', price: 195000 },

  // ELBOW PVC (AW)
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1/2" (16mm)', price: 2500 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '3/4" (20mm)', price: 3200 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1" (25mm)', price: 4700 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1 1/4" (35mm)', price: 8100 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1 1/2" (40mm)', price: 11200 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '2" (50mm)', price: 16900 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '2 1/2" (65mm)', price: 26700 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '3" (75mm)', price: 44400 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '4" (100mm)', price: 82100 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '5" (125mm)', price: 124200 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '6" (150mm)', price: 207500 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '8" (200mm)', price: 469800 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '10" (250mm)', price: 627900 },
  { name: 'ELBOW PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '12" (300mm)', price: 932700 },

  // SOCKET (AW)
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1/2" (16mm)', price: 2200 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '3/4" (20mm)', price: 2600 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1" (25mm)', price: 3800 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1 1/4" (35mm)', price: 6300 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1 1/2" (40mm)', price: 9100 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '2" (50mm)', price: 14000 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '2 1/2" (65mm)', price: 23300 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '3" (75mm)', price: 33500 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '4" (100mm)', price: 66100 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '6" (150mm)', price: 139100 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '8" (200mm)', price: 280800 },
  { name: 'SOCKET PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '10" (250mm)', price: 444700 },

  // ELBOW 45 PVC AW
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1 1/4" (35mm)', price: 3200 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '1 1/2" (40mm)', price: 3700 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '2" (50mm)', price: 7300 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '2 1/2" (65mm)', price: 9800 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '3" (75mm)', price: 15900 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '4" (100mm)', price: 26900 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '5" (125mm)', price: 51200 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '6" (150mm)', price: 99100 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '8" (200mm)', price: 218600 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '10" (250mm)', price: 304300 },
  { name: 'ELBOW 45 PVC AW', category: 'Fitting PVC', unit: 'Pcs', specification: '12" (300mm)', price: 478200 },

  // SPINDO WELDED MEDIUM SNI HITAM
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1/2"', price: 241000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '3/4"', price: 310000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1"', price: 464200 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/4"', price: 612500 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/2"', price: 704000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '2"', price: 960000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '2 1/2"', price: 1225000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '3"', price: 1582000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '4"', price: 2290000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '5"', price: 3083000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '6"', price: 3670000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '8"', price: 6500000 },

  // SPINDO WELDED MEDIUM SNI GALVANIZED
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1/2"', price: 309000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '3/4"', price: 397000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1"', price: 597500 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/4"', price: 788500 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/2"', price: 906000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '2"', price: 1236000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '2 1/2"', price: 1576000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '3"', price: 2036000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '4"', price: 2947000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '5"', price: 3965000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '6"', price: 4722000 },
  { name: 'PIPA BAJA SPINDO WELDED MEDIUM SNI GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '8"', price: 8355000 },

  // SPINDO WELDED ASTM A53 A SCH 40 HITAM
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1/2"', price: 251200 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '3/4"', price: 333400 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1"', price: 482200 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/4"', price: 658000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/2"', price: 782500 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '2"', price: 1045000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '2 1/2"', price: 1665000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '3"', price: 2172000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '4"', price: 2780000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '5"', price: 4178000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '6"', price: 5402000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 HITAM', category: 'Pipa Baja', unit: 'Batang', specification: '8"', price: 8245000 },

  // SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1/2"', price: 320000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '3/4"', price: 425000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1"', price: 617500 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/4"', price: 843000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '1 1/2"', price: 1002000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '2"', price: 1338000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '2 1/2"', price: 2132000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '3"', price: 3197000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '4"', price: 4547100 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '5"', price: 5350000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '6"', price: 6915000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '8"', price: 10597000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '12"', price: 11037128 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '14"', price: 12940000 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '16"', price: 16039115 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '18"', price: 21877600 },
  { name: 'PIPA BAJA SPINDO WELDED ASTM A53 A SCH 40 GALVANIZED', category: 'Pipa Baja', unit: 'Batang', specification: '20"', price: 26107500 },
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
