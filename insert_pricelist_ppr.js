const { PrismaClient } = require('./src/generated/client_v3');
const prisma = new PrismaClient();

const items = [
  // PIPA PPR PN10
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '1/2" (20mm)', price: 38290 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '3/4" (25mm)', price: 52162 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '1" (32mm)', price: 83874 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '1 1/4" (40mm)', price: 132883 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '1 1/2" (50mm)', price: 206036 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '2" (63mm)', price: 326126 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '2 1/2" (75mm)', price: 456306 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '3" (90mm)', price: 658649 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '4" (110mm)', price: 978108 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN10', category: 'Pipa PPR', unit: 'Batang', specification: '6" (160mm)', price: 3333423 },

  // PIPA PPR PN16
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '1/2" (20mm)', price: 49009 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '3/4" (25mm)', price: 76577 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '1" (32mm)', price: 123063 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '1 1/4" (40mm)', price: 191261 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '1 1/2" (50mm)', price: 298649 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '2" (63mm)', price: 469460 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '2 1/2" (75mm)', price: 668649 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '3" (90mm)', price: 958378 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '4" (110mm)', price: 1435766 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN16', category: 'Pipa PPR', unit: 'Batang', specification: '6" (160mm)', price: 4833423 },

  // PIPA PPR PN20
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '1/2" (20mm)', price: 55225 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '3/4" (25mm)', price: 84775 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '1" (32mm)', price: 139369 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '1 1/4" (40mm)', price: 214965 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '1 1/2" (50mm)', price: 335766 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '2" (63mm)', price: 531982 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '2 1/2" (75mm)', price: 753125 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '3" (90mm)', price: 1082432 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '4" (110mm)', price: 1617658 },
  { name: 'PIPA PPR RUCIKA KELEN GREEN PN20', category: 'Pipa PPR', unit: 'Batang', specification: '6" (160mm)', price: 5512883 },

  // COUPLER PPR
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1/2" (20mm)', price: 3423 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '3/4" (25mm)', price: 3694 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1" (32mm)', price: 4955 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1 1/4" (40mm)', price: 9640 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1 1/2" (50mm)', price: 18919 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '2" (63mm)', price: 30000 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '2 1/2" (75mm)', price: 71892 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '3" (90mm)', price: 87207 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '4" (110mm)', price: 128288 },
  { name: 'COUPLER PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '6" (160mm)', price: 641892 },

  // CAP PPR
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1/2" (20mm)', price: 2703 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '3/4" (25mm)', price: 3333 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1" (32mm)', price: 5586 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1 1/4" (40mm)', price: 25405 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '1 1/2" (50mm)', price: 27748 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '2" (63mm)', price: 39189 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '2 1/2" (75mm)', price: 107207 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '3" (90mm)', price: 372883 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '4" (110mm)', price: 411982 },
  { name: 'CAP PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '6" (160mm)', price: 1763694 },

  // REDUCER FEMALE PPR
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x20 mm', price: 3964 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x20 mm', price: 6216 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x25 mm', price: 7297 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x20 mm', price: 9640 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x25 mm', price: 9540 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x32 mm', price: 11441 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x20 mm', price: 13333 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x25 mm', price: 15315 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x32 mm', price: 17207 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x40 mm', price: 18468 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x25 mm', price: 20360 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x32 mm', price: 21441 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x40 mm', price: 31441 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x50 mm', price: 33333 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x32 mm', price: 39009 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x40 mm', price: 42793 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x50 mm', price: 44685 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x63 mm', price: 49820 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x32 mm', price: 52883 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x40 mm', price: 55405 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x50 mm', price: 57447 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x63 mm', price: 66468 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x75 mm', price: 75495 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x50 mm', price: 106667 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x63 mm', price: 108378 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x75 mm', price: 141351 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110x90 mm', price: 175856 },
  { name: 'REDUCER FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '160x110 mm', price: 279369 },

  // ELBOW 45° PPR
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20 mm', price: 4595 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25 mm', price: 6577 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32 mm', price: 8829 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40 mm', price: 16757 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50 mm', price: 29730 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63 mm', price: 62432 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75 mm', price: 92793 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90 mm', price: 158649 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110 mm', price: 251532 },
  { name: 'ELBOW 45° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '160 mm', price: 1016757 },

  // ELBOW 90° PPR
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20 mm', price: 5315 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25 mm', price: 6847 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32 mm', price: 7838 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40 mm', price: 16306 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50 mm', price: 25946 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63 mm', price: 44324 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75 mm', price: 77297 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90 mm', price: 128468 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110 mm', price: 197838 },
  { name: 'ELBOW 90° PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '160 mm', price: 1154865 },

  // FEMALE THREAD TEE PPR
  { name: 'FEMALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x1/2"', price: 34955 },
  { name: 'FEMALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x3/4"', price: 39640 },
  { name: 'FEMALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x1/2"', price: 44234 },
  { name: 'FEMALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x3/4"', price: 50811 },
  { name: 'FEMALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x1/2"', price: 58468 },
  { name: 'FEMALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x3/4"', price: 66126 },
  { name: 'FEMALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x1"', price: 106757 },

  // FLANGE ADAPTOR PPR
  { name: 'FLANGE ADAPTOR PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63 mm', price: 42252 },
  { name: 'FLANGE ADAPTOR PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75 mm', price: 94324 },
  { name: 'FLANGE ADAPTOR PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90 mm', price: 144505 },
  { name: 'FLANGE ADAPTOR PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110 mm', price: 180721 },

  // MALE THREAD TEE PPR
  { name: 'MALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x1/2"', price: 48559 },
  { name: 'MALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x3/4"', price: 66306 },
  { name: 'MALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x1/2"', price: 50811 },
  { name: 'MALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x3/4"', price: 62342 },
  { name: 'MALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x1/2"', price: 115946 },
  { name: 'MALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x3/4"', price: 119640 },
  { name: 'MALE THREAD TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x1"', price: 176937 },

  // REDUCER MALE / FEMALE PPR
  { name: 'REDUCER MALE / FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x20 mm', price: 4505 },
  { name: 'REDUCER MALE / FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x20 mm', price: 6306 },
  { name: 'REDUCER MALE / FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x25 mm', price: 8108 },
  { name: 'REDUCER MALE / FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x25 mm', price: 11982 },
  { name: 'REDUCER MALE / FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x32 mm', price: 14144 },
  { name: 'REDUCER MALE / FEMALE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x32 mm', price: 21351 },

  // EQUAL TEE PPR
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20 mm', price: 5315 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25 mm', price: 6486 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32 mm', price: 9369 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40 mm', price: 19910 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50 mm', price: 32423 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63 mm', price: 77658 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75 mm', price: 123694 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90 mm', price: 160721 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '110 mm', price: 283333 },
  { name: 'EQUAL TEE PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '160 mm', price: 1443423 },

  // MALE THREAD JOINT PPR
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x1/2"', price: 36577 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x3/4"', price: 55315 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x1/2"', price: 36757 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x3/4"', price: 51351 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x3/4"', price: 80450 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x1"', price: 94955 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x1-1/4"', price: 181802 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x1-1/2"', price: 286216 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x2"', price: 434775 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x2-1/2"', price: 802162 },
  { name: 'MALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x3"', price: 1257117 },

  // FEMALE THREAD JOINT PPR
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x1/2"', price: 28559 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '20x3/4"', price: 41712 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x1/2"', price: 30811 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '25x3/4"', price: 37748 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x3/4"', price: 72162 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '32x1"', price: 79369 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '40x1-1/4"', price: 212072 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '50x1-1/2"', price: 216216 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '63x2"', price: 395946 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '75x2-1/2"', price: 499730 },
  { name: 'FEMALE THREAD JOINT PPR', category: 'Fitting PPR', unit: 'Pcs', specification: '90x3"', price: 735315 },

  // STRAIGHT WAY VALVE PPR
  { name: 'STRAIGHT WAY VALVE PPR', category: 'Valve PPR', unit: 'Pcs', specification: '20 mm', price: 109730 },
  { name: 'STRAIGHT WAY VALVE PPR', category: 'Valve PPR', unit: 'Pcs', specification: '25 mm', price: 175766 },
  { name: 'STRAIGHT WAY VALVE PPR', category: 'Valve PPR', unit: 'Pcs', specification: '32 mm', price: 247207 },
  { name: 'STRAIGHT WAY VALVE PPR', category: 'Valve PPR', unit: 'Pcs', specification: '40 mm', price: 372883 },
  { name: 'STRAIGHT WAY VALVE PPR', category: 'Valve PPR', unit: 'Pcs', specification: '50 mm', price: 451802 },
  { name: 'STRAIGHT WAY VALVE PPR', category: 'Valve PPR', unit: 'Pcs', specification: '63 mm', price: 784144 }
];

async function main() {
  console.log(`Inserting ${items.length} items to Master Pricelist...`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const item of items) {
    // Check if exists to avoid duplicates
    const existing = await prisma.pricelist_items.findFirst({
      where: {
        name: item.name,
        specification: item.specification
      }
    });
    
    if (existing) {
      // Update price if exists
      await prisma.pricelist_items.update({
        where: { id: existing.id },
        data: { price: item.price }
      });
      skipped++;
    } else {
      // Create new
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
