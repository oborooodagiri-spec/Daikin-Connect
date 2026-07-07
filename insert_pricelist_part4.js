const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [
  // INSULFLEX LEMBAR
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '3mm (1/8") 1.22 x 0.914 m', price: 80000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '6mm (1/4") 1.22 x 0.914 m', price: 120000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '9mm (3/8") 1.22 x 0.914 m', price: 160000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '13mm (1/2") 1.22 x 0.914 m', price: 200000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '15mm (5/8") 1.22 x 0.914 m', price: 275000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '19mm (3/4") 1.22 x 0.914 m', price: 318000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '25mm (1") 1.22 x 0.914 m', price: 397000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '32mm (1 1/4") 1.22 x 0.914 m', price: 553200 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '38mm (1 1/2") 1.22 x 0.914 m', price: 867000 },
  { name: 'INSULFLEX LEMBAR', category: 'Insulation', unit: 'Lembar', specification: '50mm (2") 1.22 x 0.914 m', price: 997000 },

  // INSULFLEX ROLL
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '3mm (1/8") 1.22 x 9.14 m', price: 800000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '6mm (1/4") 1.22 x 9.14 m', price: 1200000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '9mm (3/8") 1.22 x 9.14 m', price: 1600000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '13mm (1/2") 1.22 x 9.14 m', price: 2000000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '15mm (5/8") 1.22 x 9.14 m', price: 2750000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '19mm (3/4") 1.22 x 9.14 m', price: 3180000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '25mm (1") 1.22 x 9.14 m', price: 3970000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '32mm (1 1/4") 1.22 x 9.14 m', price: 5532800 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '38mm (1 1/2") 1.22 x 9.14 m', price: 8675000 },
  { name: 'INSULFLEX ROLL', category: 'Insulation', unit: 'Roll', specification: '50mm (2") 1 x 2.5 m', price: 2237500 },

  // INSULFLEX TAPE & ADHESIVE
  { name: 'INSULFLEX TAPE 1"', category: 'Insulation Accessories', unit: 'Roll', specification: '25 mm x 3 mm x 9.14 mtr', price: 85000 },
  { name: 'INSULFLEX TAPE 2"', category: 'Insulation Accessories', unit: 'Roll', specification: '50 mm x 3 mm x 9.14 mtr', price: 170000 },
  { name: 'INSULFLEX ADHESIVE', category: 'Insulation Accessories', unit: 'Kaleng', specification: '800 ml', price: 241000 },
  { name: 'INSULFLEX CORK TAPE', category: 'Insulation Accessories', unit: 'Roll', specification: '', price: 222000 },

  // PIPA WELDED STAINLESS STEEL SCH 10
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '1/2" (Spindo/Tetsura)', price: 450300 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '3/4" (Spindo/Tetsura)', price: 575000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '1" (Spindo/Tetsura)', price: 922500 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '1 1/4" (Spindo/Tetsura)', price: 1189200 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '1 1/2" (Spindo/Tetsura)', price: 1372800 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '2" (Spindo/Tetsura)', price: 1735600 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '2 1/2" (Spindo/Tetsura)', price: 2325800 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '3" (Spindo/Tetsura)', price: 2850300 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '4" (Spindo/Tetsura)', price: 3693900 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '5" (Spindo/Tetsura)', price: 5156000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '6" (Spindo/Tetsura)', price: 6162500 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 10', category: 'Pipa Stainless', unit: 'Batang', specification: '8" (Spindo/Tetsura)', price: 8903800 },

  // PIPA WELDED STAINLESS STEEL SCH 20
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '1/2" (Spindo/Tetsura)', price: 524600 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '3/4" (Spindo/Tetsura)', price: 673300 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '1" (Spindo/Tetsura)', price: 1014300 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '1 1/4" (Spindo/Tetsura)', price: 1298500 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '1 1/2" (Spindo/Tetsura)', price: 1490800 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '2" (Spindo/Tetsura)', price: 2172800 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '2 1/2" (Spindo/Tetsura)', price: 2775900 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '3" (Spindo/Tetsura)', price: 3707000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '4" (Spindo/Tetsura)', price: 4808600 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '5" (Spindo/Tetsura)', price: 7416000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '6" (Spindo/Tetsura)', price: 8828600 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 20', category: 'Pipa Stainless', unit: 'Batang', specification: '8" (Spindo/Tetsura)', price: 15008600 },

  // PIPA WELDED STAINLESS STEEL SCH 40
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '1/2" (Spindo/Tetsura)', price: 559600 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '3/4" (Spindo/Tetsura)', price: 743200 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '1" (Spindo/Tetsura)', price: 1106000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '1 1/4" (Spindo/Tetsura)', price: 1499500 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '1 1/2" (Spindo/Tetsura)', price: 1788000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '2" (Spindo/Tetsura)', price: 2400000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '2 1/2" (Spindo/Tetsura)', price: 3812000 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '3" (Spindo/Tetsura)', price: 4987900 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '4" (Spindo/Tetsura)', price: 7099300 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '5" (Spindo/Tetsura)', price: 9707200 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '6" (Spindo/Tetsura)', price: 12597500 },
  { name: 'PIPA WELDED STAINLESS STEEL SCH 40', category: 'Pipa Stainless', unit: 'Batang', specification: '8" (Spindo/Tetsura)', price: 18968300 },

  // FITTING WELDED MEDIUM (HITAM)
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 88000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 126000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 233000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 370000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 513000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1067000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 2051000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 2801000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 53000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 75000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 141000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 222000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 308000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 587000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 1128000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 1542000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 171000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 206000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 308000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 474000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 670000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1504000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 2597000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 3572000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 178000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 215000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 321000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 492000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 697000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1550000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 2675000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 3680000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 117000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 128000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 207000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 272000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 390000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1033000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 1272000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 1828000 },

  // FITTING WELDED SCH 40 (HITAM)
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 119000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 191000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 339000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 654000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 878000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1677000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 3205000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 4569000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 72000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 115000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 204000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 392000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 527000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1007000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 2742000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 4159000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 198000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 272000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 402000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 631000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 903000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1845000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 3485000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 4259000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 206000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 282000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 419000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 656000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 939000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1902000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 3590000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 4386000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Hitam)', price: 131000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Hitam)', price: 148000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Hitam)', price: 240000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Hitam)', price: 351000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Hitam)', price: 470000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Hitam)', price: 1192000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Hitam)', price: 1431000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Hitam)', price: 2224000 },

  // FITTING WELDED MEDIUM (GALVANIZED)
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 115000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 163000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 301000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 475000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 679000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 1403000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 2642000 },
  { name: 'ELBOW 90D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 3735000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 67000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 94000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 175000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 275000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 391000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 746000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 1525000 },
  { name: 'ELBOW 45D WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 1965000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 205000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 251000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 381000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 578000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 834000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 1803000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 3106000 },
  { name: 'EQUAL TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 4320000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 212000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 260000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 394000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 596000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 860000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 1849000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 3184000 },
  { name: 'RED.TEE WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 4428000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 135000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 150000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 234000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 314000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 449000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 1133000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 1393000 },
  { name: 'RED.CONC WELDED MEDIUM', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 2039000 },

  // FITTING WELDED SCH 40 (GALVANIZED)
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 149000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 239000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 429000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 807000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 1084000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 2154000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 4049000 },
  { name: 'ELBOW 90D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 5920000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 89000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 140000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 239000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 469000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 645000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 1264000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 2321000 },
  { name: 'ELBOW 45D WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 3417000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 247000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 336000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 518000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 815000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 1171000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 2286000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 4284000 },
  { name: 'EQUAL TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 5708000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 255000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 346000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 534000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 839000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 1207000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 2342000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 4389000 },
  { name: 'RED.TEE WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 5834000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '2 1/2" (Galvanized)', price: 149000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '3" (Galvanized)', price: 170000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '4" (Galvanized)', price: 272000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '5" (Galvanized)', price: 412000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '6" (Galvanized)', price: 555000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '8" (Galvanized)', price: 1341000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '10" (Galvanized)', price: 1676000 },
  { name: 'RED.CONC WELDED SCH 40', category: 'Fitting Baja', unit: 'Pcs', specification: '12" (Galvanized)', price: 2640000 },

  // CHECK VALVE JIS 10K FLANGE
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '1 1/2"', price: 5189490 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '2"', price: 5548290 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '2 1/2"', price: 7052777 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '3"', price: 8490392 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '4"', price: 12420862 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '5"', price: 19381295 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '6"', price: 25219672 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '8"', price: 44510175 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '10"', price: 69705985 },
  { name: 'CHECK VALVE JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '12"', price: 125331772 },

  // Y-STRAINER JIS 10K FLANGE
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '1 1/2"', price: 2719060 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '2"', price: 3370880 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '2 1/2"', price: 5457382 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '3"', price: 6603300 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '4"', price: 9209200 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '5"', price: 13970085 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '6"', price: 19358985 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '8"', price: 28949180 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '10"', price: 49765100 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '12"', price: 83293580 },
  { name: 'Y - STRAINER JIS 10K FLANGE', category: 'Valve', unit: 'Pcs', specification: '14"', price: 189443467 },

  // PRESSURE REDUCING VALVE
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '2"', price: 33781250 },
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '2 1/2"', price: 35937500 },
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '3"', price: 44562500 },
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '4"', price: 51103125 },
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '6"', price: 77833437 },
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '8"', price: 115000000 },
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '10"', price: 133687500 },
  { name: 'PRESSURE REDUCING VALVE', category: 'Valve', unit: 'Pcs', specification: '12"', price: 255000000 },

  // FCU TWO WAY MOTORIZED VALVE ON OFF
  { name: 'TWO WAY MOTORIZED VALVE ON OFF', category: 'Motorized Valve', unit: 'Pcs', specification: '1/2" VC6013AF1000T', price: 1722515 },
  { name: 'TWO WAY MOTORIZED VALVE ON OFF', category: 'Motorized Valve', unit: 'Pcs', specification: '3/4" VC6013AJC1000T', price: 1722515 },
  { name: 'TWO WAY MOTORIZED VALVE ON OFF', category: 'Motorized Valve', unit: 'Pcs', specification: '1" VC6013APC1000T', price: 1756594 },
  { name: 'TWO WAY MOTORIZED VALVE ON OFF', category: 'Motorized Valve', unit: 'Pcs', specification: '1 1/4" VCZBD1100/U + VC6013ZZ00', price: 3098710 },
  { name: 'TWO WAY VALVE ON OFF', category: 'Motorized Valve', unit: 'Pcs', specification: '1 1/4" VCZBD1100/U', price: 1954768 },
  { name: 'VALVE ACTUATOR ON OFF', category: 'Control & Sensor', unit: 'Pcs', specification: 'VC6013ZZ00', price: 1143943 },

  // FCU TWO WAY MOTORIZED VALVE MODULATING
  { name: 'TWO WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1/2" VC7931AF1111T', price: 3486300 },
  { name: 'TWO WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '3/4" VC7931AJ1111T', price: 3486300 },
  { name: 'TWO WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1" VC7931AP1111T', price: 3595246 },
  { name: 'TWO WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1 1/4" VC7931BF1111T', price: 4031034 },
  { name: 'VALVE ACTUATOR MODULATING', category: 'Control & Sensor', unit: 'Pcs', specification: 'VC7931ZZ11T', price: 2178938 },

  // FCU THREE WAY MOTORIZED VALVE MODULATING
  { name: 'THREE WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1/2" VC6013ME6000T', price: 1880249 },
  { name: 'THREE WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '3/4" VC6013MJC6000T', price: 1824740 },
  { name: 'THREE WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1" VC6013MP6000T', price: 1938306 },
  { name: 'THREE WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1/2" VC7931ME6111T', price: 3704194 },
  { name: 'THREE WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '3/4" VC7931MH6111T', price: 3704194 },
  { name: 'THREE WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1" VC7931MP6111T', price: 3758668 },
  { name: 'TWO WAY MOTORIZED VALVE MODULATING', category: 'Motorized Valve', unit: 'Pcs', specification: '1 1/4" VC7931NF1111T', price: 4194455 },

  // THERMOSTAT & ACCESSORIES
  { name: 'THERMOSTAT', category: 'Control & Sensor', unit: 'Pcs', specification: 'T6360A5013 (Heating or Cooling only)', price: 505514 },
  { name: 'THERMOSTAT', category: 'Control & Sensor', unit: 'Pcs', specification: 'T6373A1108 (2 Pipe, 3 speed)', price: 771344 },
  { name: 'THERMOSTAT', category: 'Control & Sensor', unit: 'Pcs', specification: 'T6373A1108N (2 pipe, heating/cooling only)', price: 771344 },
  { name: 'THERMOSTAT HALLO LCD BACKLIGHT', category: 'Control & Sensor', unit: 'Pcs', specification: 'T6800V2WN White Vertical', price: 1687518 },
  { name: 'THERMOSTAT HALLO LCD BACKLIGHT', category: 'Control & Sensor', unit: 'Pcs', specification: 'T6800H2WN White Horizontal', price: 1687518 },
  { name: 'THERMOSTAT ON OFF', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF228WN/U', price: 1306610 },
  { name: 'THERMOSTAT ON OFF WHITE HOUSING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428WN/U', price: 1948456 },
  { name: 'THERMOSTAT ON OFF BLACK HOUSING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428DN/U', price: 2313791 },
  { name: 'THERMOSTAT ON OFF SILVER HOUSING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428SN/U', price: 2526904 },
  { name: 'THERMOSTAT ON OFF ROSE GOLD HOUSING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428GN/U', price: 2526904 },
  { name: 'THERMOSTAT ON OFF COPPER HOUSING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428CN/U', price: 2526904 },
  { name: 'THERMOSTAT ON OFF SILVER HAIRLINE HOUSING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428LN/U', price: 2526904 },
  { name: 'THERMOSTAT ON OFF GOLD HAIRLINE HOUSING', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428KN/U', price: 2526904 },
  { name: 'THERMOSTAT ON OFF GRAY', category: 'Control & Sensor', unit: 'Pcs', specification: 'TF428WN-A/U', price: 2550093 },
  { name: 'WATER FLOW SWITCH', category: 'Control & Sensor', unit: 'Pcs', specification: 'WFS-1001-H', price: 1590243 },
  { name: 'WATER FLOW SWITCH (20 BAR)', category: 'Control & Sensor', unit: 'Pcs', specification: 'WFS-1002-H', price: 2385363 },
  { name: 'AUTOMATIC AIR VENT', category: 'Valve', unit: 'Pcs', specification: '1/2" E121-1/2A', price: 500000 },
  { name: 'AUTOMATIC AIR VENT', category: 'Valve', unit: 'Pcs', specification: '3/8" E121-3/8A', price: 500000 },
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
