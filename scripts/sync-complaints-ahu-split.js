const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CSV_DATA = `No,Tanggal,Jam Complaint,Lantai,Tenant / Area,Jenis Unit,Tag No.,Brand,Model,Nama Teknisi,Nama Supervisor,Kategori,Root Cause Analysis,Corrective Action,Last PM,Status
1,02 Maret 2026,,P2,Pos Security Loading Dock,SPLIT,,Panasonic,,,,Ruangan Panas,"Kompresor tidak berfungsi, kabel terbakar dan short body",,
2,4 Maret 2026,,L2,Jade Home (P2-07),AHU,,York,,,,Ruangan Panas,V Belt kendur karena pully sudah renggang,Penggantian V Belt,
3,4 Maret 2026,,L5,Koridor Nika (P5-10),AHU,,York,,,,Ruangan Panas,V Belt terlepas dari pully,Penggantian V Belt,
4,4 Maret 2026,,P2,Ruang Provost,SPLIT,,Panasonic,,,,Ruangan Panas,"Terdapat es pada pipa outdoor, indikasi kekurangan freon",Penambahan freon dan cleaning,
5,4 Maret 2026,,P2,Office Secure Parking (R. Pak Bagja),SPLIT,,Panasonic,,,,Ruangan Panas,Tidak ditemukan outdoor,,
6,5 Maret 2026,,L3,Koridor Eskalator N (L3-03),AHU,,York,,,,Kebocoran,"Air meluap dari bak drain, terdapat kebocoran pada bak drain",Pemvakuman dan pengeringan area,
7,5 Maret 2026,,L3,Koridor Smiggle(P3-03),AHU,,York,,,,Ruangan Panas,V Belt terlepas dari pully,Penggantian V Belt,
8,6 Maret 2026,,L3,Miniapolis (P3-07),AHU,,York,,,,Ruangan Panas,V Belt sudah kendur,Penggantian V Belt,
9,6 Maret 2026,,P3,Gudang Logistik 002,Split,,Daikin,,,,Ruangan Panas,Ditemukan kebocoran pada evaporator,,
10,06 Maret 2026,,P2,Klinik Plaza Indonesia (Ruang Paramedik),SPLIT,,Daikin,FTC50YV14,Andri,,,,"Pemasangan unit baru",
11,08 Maret 2026,,P2,Ruang Call Center,AHU,,PANASONIC,CU-YN9WKJ,Andri,,Ruangan Panas,Tekanan refrigerant pada unit berkurang tinggal 95 psi.,Telah dilakukan penambahan refrigerant pada unit sehingga mencapai tekanan ideal.,8 Maret 2026
12,09 Maret 2026,,P2,Corridor Lift 7-8,SPLIT,,,,Sarifuddin,,Ruangan Panas,Ruangan panas karena refrigeran berkurang.,Telah dilakukan penambahan refrigerant pada unit sehingga mencapai tekanan ideal.,9 Maret 2026
13,09 Maret 2026,,P2,Ruang Mesin Lift 1-2,SPLIT,Unit 2,,,Sarifuddin,,Ruangan Panas,Ruangan panas karena refrigeran berkurang.,Telah dilakukan penambahan refrigerant pada unit sehingga mencapai tekanan ideal.,
14,09 Maret 2026,,P3,Locker Aeon,SPLIT,,,,Andri,,Ruangan Panas,"Ruangan panas karena tekanan refrigeran berkurang, diakibatkan ada kebocoran pada evaporator",,Pending
15,10 Maret 2026,,L4,AHU L4-08,AHU,,,,,,Kebocoran,Ruangan tergenang because saluran drain terhalang lendir.,Telah dilakukan penyedotan dan pembersihan serta pengeringan area terdampak.,
16,10 Maret 2026,,L4,AHU L4-09,AHU,,,,,,AC Noise,V Belt sudah kendur,"Penggantian V Belt (Type A 87), namun tidak maksimal karena pinggiran pully sudah patah.",19 Januari 2026
17,11 Maret 2026,,L1,Channel Perfumme,AHU,,,,,,Ruangan Panas,"Ruangan panas karena AHU tidak running, thermostat tidak ditemukan di ruang sebelahnya.","Sudah dikoordinasikan ke BM karena menyangkut pekerjaan konstruksi di ruangan sebelah tempat biasa thermostat dipasang.",
18,11 Maret 2026,,L1,Pantry Bawah,SPLIT,,,,,,Kebocoran,Kebocoran disebabkan karena line drain gudang LV tersumbat lendir dan air meluap,Sudah dilakukan pemakuman pada line drain and lokasi sekitar telah dikeringkan.,2 Maret 2026
19,11 Maret 2026,,L4,AHU P4-07,AHU,,,,,,Kebocoran,Area AHU tergenang air because terjadi sumbatan material padat pada saluran pembuangan air.,Telah dilakukan pembersihan terhadap saluran pembuangan air, dilakukan pemakuman ulang pada line drain and bak AHU.,
20,13 Maret 2026,,P1,Ruang Driver,SPLIt,,,,Andri, Anel,,Kebocoran,Terjadi kebocoran pada saluran drain karena tersumbat,Sudah dilakukan pemakuman pada line drain,
21,13 Maret 2026,,P3,Color Wash,SPLIT,,,,Sarifuddin,,AC Mati,Ditemukan ada kerusakan pada remote sehingga kesulitan mengoperasikan unit,Telah dilakukan penggantian remote dengan remote lain sisa unit rusak yang setipe. Unit kembali bisa running,
22,14 Maret 2026,,P2,R. Server Secure Parking,SPLIT,,,,,,Ruangan Panas,Ruangan panas karena salah setting pada remote ,Telah dilakukan penyettingan suhu and fan pada remote si ruangan,
23,14 Maret 2026,,P3,Ruang JNE,SPLIT,,,,Sarifuddin,,Ruangan Panas,"Ruangan panas karena unit tidak running, disebabkan karena kerusakan pada kapsitor di PCB indoor",Telah dilakukan penggantian kapasitor.,
24,15 Maret 2026,,P2,Control Room Secure Parking,SPLIT,,,,Kholik,Agus, Afrizal,,Kebocoran,Kebocoran disebabkan sumbatan lendir dan kotoran pada pipa drain,Telah dilakukan pemakuman pada line drain,
25,15 Maret 2026,,P2,Locker CSO Pria,SPLIT,,,,Kholik,Agus, Afrizal,,Kebocoran,Kebocoran disebabkan sumbatan lendir dan kotoran pada pipa drain,Telah dilakukan pemakuman pada line drain,
26,15 Maret 2026,,L4,AHU L4 II,AHU,,,,Sarifuddin, Nasim,,Kebocoran,Ruangan AHU banjir karea bak drain sudah bolong,Telah dilakukan pemakuman dan pengeringan area,
27,17 Maret 2026,,L5,AHU P5-11,AHU,,,,Agus, Kholik,,,V Belt hanya terpasang satu,Sudah dilakukan pemasangan V Belt yang baru sekaligus penggantian yang lam karena sudah mulai rusak.,
28,17 Maret 2026,,L1,Osteria Gia,Split,,,,Sarifuddin, Nasim,,Kebocoran,"Bocor kembali karena elevasi yang menanjak, ditemukan salah satu sapot telah lepas.",Telah dilakukan perbaikan pada sapot, genangan juga telah divakum dan dikeringkan.,
29,17 Maret 2026,,L5,AHU P5-02,AHU,,,,Agus, Kholik,,,V Belt telah kendur,Penggantian V Belt yang kendur and penyetelan ulang agar tegangan V Belt sesuai,
30,17 Maret 2026,,L1,Koridor Toilet MaxMarra,AHU,,,,Agus, Kholik,,,Grill di depan toilet turun akibat kaitan sudah rusak,Telah dilakukan perbaikan pada kaitan and telah dipasang ulang grill agar kembali ke posisinya,
31,19 Maret 2026,,L1,Osteria Gia,SPLIT,,,,Andri,,Kebocoran,Kebocoran terjadi karena sumbatan pada line drain.,Telah dilakukan pemvakuman pada line drain utama.,
32,20 Maret 2026,,P3,Ruang Driver F19,SPLIT,,,,Andri,,AC Mati,AC tidak running kemungkinan akibat kebocoran pada indoor,,
33,20 Maret 2026,,P3,Ruang Mesin Lift 7-8,SPLIT,Unit 1,,,Andri,,AC Mati,"Kabel power sudah dicabut, kemungkinan kerusakan pada kompresor.",,20 Maret 2026
34,23 Maret 2026,,,LV,,,,,,,,,,
35,23 Maret 2026,,L3,Joe and Dough,,,,,,,,,,
36,24 Maret 2026,,L2,Paul Bakery,AHU,,,,Sarifuddin,,AC Mati,Pergantian Motor fan,Telah dilakukan penggantian motor fan pada unit AHU and pemasangan kontaktor. Pekerjaan tinggal menghubungkan power, tertunda karena power belum konek.,
37,25 Maret 2026,,L4,P-AHU L4-01,AHU,,,,Sarifuddin,,AC Noise,AC noise karena V Belt kendur,,
38,25 Maret 2026,,L4,P-AHU L4-02,AHU,,,,Sarifuddin,,AC Noise,AC noise karena V Belt kendur,,
39,25 Maret 2026,,L4,Batik Keris,AHU,,,,Sarifuddin,,Ruangan Panas,Ruangan panas disebabkan karena unit AHU off (AHU Gantung L4-05),Telah dilakukan pengecekan pada AHU yang menyuplai ruangan tersebut, ditemukan AHU tidak running, diagnosa dari tim sebelumnya ada kerusakan pada motor fan.,
40,25 Maret 2026,,L6,Ganara,AHU,Unit 3,,,Sarifuddin,,AC Noise,AC noise karena V Belt kendur,,
41,25 Maret 2026,,L6,Ganara,AHU,Unit 9,,,Sarifuddin,,AC Noise,V Belt putus and terdapat kebocoran pada evaporator,,
42,25 Maret 2026,,P3,Locker GHP Pria,SPLIT,,,,Sarifuddin,,AC Mati,Unit msti/hidup kemungkinan ada sumbatan pada kapiler.,,13 Maret 2026
43,26 Maret 2026,,L3,Miniapolis (AHU L3-07),AHU,,,,Sarifuddin,,AC Noise,"Tindak lanjut temuan PM, diketahui V Belt telah kendur",Telah dilakukan penggantian V Belt pada unit dengan V Belt baru (1800 LW),25 Maret 2026
44,28 Maret 2026,,L4,Urban Quarter (AHU P4-05),AHU,,York,YDM 40 x 60,Sarifuddin,,Ruangan Panas,"Ruangan panas karena hembusan udara tidak maksimal, disebabkan V Belt kendur, diketahui pula dudukan mesin fan kendur sehingga posisi mesin berubah.",Telah dilakukan pengencangan pada dudukan mesin and penyetelan ulang V Belt,24 Maret 2026
45,28 Maret 2026,,P2,Secure Parking (R. Control/CCTV),SPLIT,,Daikin,,Andri,,AC Mati,"Pengukuran tekanan hanya 70 psi, tapi ampere 8,3. Saat diisi freon ampere naik di atas 9 walau tekanan ideal belum tercapai. Tidak ditemukan kebocoran.",Sudah dilakukan penambahan freon sampai 130 psi.,8 Maret 2026
46,29 Maret 2026,,P2,Locker CSO Pria,SPLIT,,Panasonic,,Sarifuddin,,Kebocoran,Jalur drain sudah penuh tersumbat kotoran and lendir,Pemakuman pada jalur drainase,7 Maret 2026
47,29 Maret 2026,,L3,Mother Care (AHU P3-09),AHU,,York,YDM 70 x 80,Sarifuddin,,AC Mati,Ducting supply kemungkinan sudah kotor, setelah diservis hembusan udara dari AHU menjadi lebih kuat mengakibatkan kotoran rontok and jatuh ke tenant.,,25 Maret 2026
48,29 Maret 2026,,L3,Miniapolis,AHU,,York,YDM 60 x 70,Ayub,,Kebocoran,Pada ducting supply glaswool sudah rusak and dilepas dari ducting, terjadi kondensasi pada ducting,Sudah dilakukan pemakuman pada ducting and titik kondensasi.,25 Maret 2026
49,30 Maret 2026,,L4,Ruang Trafo,AHU,,Tranee,CLCP 040,Sarifuddin,,Ruangan Panas,"V Belt dalam kondisi kendur, namun kondisi V Belt masih layak.",Penyetelan ulang V Belt (dikencangkan kembali),28 Maret 2026
50,30 Maret 2025,,P2,Office GHP,SPLIT,,Daikin,,Sarifuddin,,Ruangan Panas,Pengecekan tekanan and ampere menunjukkan hasil yang bagus. Flow udara lemah, dugaan evaporator bagian dalam kotor.,,10 Maret 2026
51,31 Maret 2026,,P2,Office GHP,SPLIT,,Daikin,RC50NV14,Sarifuddin,,Ruangan Panas,Pengecekan tekanan and ampere menunjukkan hasil yang bagus. Flow udara lemah, dugaan evaporator bagian dalam kotor.,Telah dilakukan pembongkaran and overhaul evaporator unit.,10 Maret 2026
1,1 Apr 2026,8:00,L4,AHU P4-02 Corridor Atrium / Lucy House,AHU,,YORK,YDM 30 X 50,Sarifuddin,Sarifuddin,Penggantian Part,V Belt unit sudah kendur,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian dengan V Belt yang baru. Tipe V Belt SPA 1137 LW,24 Apr 2026
2,1 Apr 2026,12:00,P2,P2 Locker CS Pria,SPLIT WALL,,PANASONIC,,Sarifuddin,Sarifuddin,Kebocoran,"Unit sering bocor and kurang dingin, diduga karena adanya blocking pada Evaporator.",Telah dilakukan pekerjaan over haul pada indoor. Kami hanya melakukan pengecekan status unit. Aman, tidak ada kebocoran lanjutan.,13 Apr 2026
3,1 Apr 2026,17:00,P1,P1 Ruang LV & MV (Ruang Genset Diesel Hyatt) Unit 2,SPLIT WALL,,PANASONIC,CS-PN18RKP,Sarifuddin,Sarifuddin,Ruangan Panas,Dari pengecekan ditemukan kebocoran pada evaporator (U Bent),-,2 Aug 2025
4,1 Apr 2026,17:00,P1,Ruang LV & MV (Ruang Genset Diesel Hyatt) Unit 3,SPLIT WALL,,PANASONIC,CS-PN18RKP,Sarifuddin,Sarifuddin,Ruangan Panas,"Dari pengecekan, kompresor unit telah mengalami Short body.",-,2 Aug 2025
5,2 Apr 2026,8:00,L5,AHU P5-09 Ramen Seirockya,AHU,,YORK,YDM 70 X 90,Sarifuddin,Sarifuddin,Penggantian Part,Kondisi V Belt sudah rusak and perlu diganti ,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian dengan V Belt yang baru. Tipe V Belt SPB 2150 LW,27 Mar 2026
6,2 Apr 2026,10:04,P2,P2 Locker CS Wanita ,SPLIT WALL,,,,Sarifuddin,Sarifuddin,Ruangan Panas,Unit belum running karena memang belum dinyalakan,Unit telah dinyalakan and disetel pada suhu optimal.,
7,2 Apr 2026,8:00,L3,AHU P3-09 Mother Care,AHU,,YORK,YDM 70 X 80,Sarifuddin,Sarifuddin,Penggantian Part,Kondisi V Belt sudah rusak and perlu diganti ,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-36,25 Mar 2026
8,2 Apr 2026,13:45,L3,AHU P3-09 Mother Care,AHU,,YORK,YDM 70 X 80,Sarifuddin,Sarifuddin,Non AC,Lampu penerangan ruangan sudah putus,Telah dilakukan penggantian lampu. Lampu diperoleh from BM.,25 Mar 2026
9,4 Apr 2026,8:00,L5,AHU P5-07 Corridor Lift NIKA,AHU,,YORK,YDM 40 X 60,Sarifuddin,Sarifuddin,Penggantian Part,V Belt sudah kendur,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-71,26 Mar 2026
10,5 Apr 2026,8:00,L3,AHU L3-03,AHU,,,,Sarifuddin,Sarifuddin,Penggantian Part,Kondisi V Belt sudah kurang elastis and mulai crack di beberapa tempat ,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt,9 Mar 2026
11,6 Apr 2026,8:30,P2,P2 Ruang Provost (R. Interogasi),SPLIT WALL,,,,Sarifuddin,Sarifuddin,Ruangan Panas,"Evaporator bagian dalam telah ngeblok dengan kotoran and lendir, tidak cukup hanya dicuci steam from depan.",Telah dilakukan pekerjaan over haul pada unit indoor,5 Mar 2026
12,7 Apr 2026,8:00,L2,AHU P2-01,AHU,,,,Sarifuddin,Sarifuddin,Penggantian Part,V Belt sudah kendur,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-36,-
13,7 Apr 2026,14:00,P2,Kantina Unit 1,SPLIT DUCT,,,,Sarifuddin,Sarifuddin,Ruangan Panas,Unit AC Nomor 1 ruang kantina ditemukan salah satu fan blower outdoor tidak berputar, disebabkan bearing telah berkarat and macet.,Telah dilakukan perbaikan pada fan blower with pengaplikasian anti karat WD. Saat ini fan blower sudah dapat berputar kembali.,14 Mar 2026
14,7 Apr 2026,14:00,P2,Kantina Unit 2,SPLIT DUCT,,,,Sarifuddin,Sarifuddin,AC Mati,Unit AC Nomor 2 ruang kantina dalam kondisi tidak running cukup lama.,Telah dilakukan pengecekan terhadap unit. Dugaan sementara ada sumbatan pada filter drier. Perlu penggantian filter drier.,14 Mar 2026
15,8 Apr 2026,8:00,L2,AHU P2-03,AHU,,,,Sarifuddin,Sarifuddin,Penggantian Part,V Belt sudah kendur,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-46,5 Apr 2026
16,9 Apr 2026,10:00,P2,Ruang Security Night Guard,SPLIT WALL,,,,Sarifuddin,Sarifuddin,Ruangan Panas,"AC kurang dingin disebabkan adanya sumbatan pada bagian dalam evaporator akibat lendir and kotoran yang menumpuk, ditandai evaporator dingin tapi flow udara lemah and tidak rata.",Telah dilakukan pekerjaan over haul pada unit indoor,7 Mar 2026
17,12 Apr 2026,10:00,L5,Tenant Go Work,AHU,,,,Sarifuddin,Sarifuddin,AC Noise,Suara bising diduga berasal from unit AC, berdasarkan pengecekan suara bising disebabkan benturan berulang antara sapot ducting with ducting, akibat sapot renggang and ducting bergetar.,Telah dilakukan pengencangan pada sapot sehingga getaran dapat teredam.,-
18,13 Apr 2026,11:00,L2,Multi Function Hall,SPLIT DUCT,,,,Sarifuddin,Sarifuddin,Pemantauan Unit,Instruksi BM terkait pelaksanaan kegiatan di hari setelahnya.,Telah dilakukan pemakuman pada ujung line drain unit-unit AC Split Duct ruang MFH.,7 Mar 2026
19,13 Apr 2026,19:30,L3,AHU L3-19,AHU,,,,Ayub,Sarifuddin,AC Bau,"Terdapat keluhan bau tak sedap pada supply from AHU, from pengecekan bak drain AHU dalam keadaan kotor, berlumut, and terdapat buih. Diduga sumber bau berasal from bak drain.",Telah dilakukan pekerjaan pencucian ulang pada unit AHU,30 Mar 2026
20,13 Apr 2026,10:30,L4,AHU P4-09,AHU,,,,Sarifuddin,Sarifuddin,AC Bau,"Terdapat keluhan bau tak sedap pada supply from AHU, from pengecekan bak drain AHU dalam keadaan kotor, berlumut, and terdapat buih. Diduga sumber bau berasal from bak drain.",Telah dilakukan pekerjaan pencucian ulang pada unit AHU,24 Mar 2026
21,14 Apr 2026,16:16,L3,AHU L3-16,AHU,,,,Sarifuddin,Sarifuddin,Penggantian Part,Unit tidak terdapat V Belt,Telah dilakukan pekerjaan pemasangan V Belt pada unit with tipe V Belt SPA 1682 LW,10 Mar 2026
22,15 Apr 2026,16:00,P3,Ruang Teknisi HVAC P3,,,,,,Sarifuddin,Sarifuddin,Non AC,-,Permintaan bantuan penghitungan unit bekas from bongkaran.,-
23,17 Apr 2026,17:00,P1,Locker CS Wanita,SPLIT WALL,,,,Sarifuddin,Sarifuddin,Instalasi Unit,Unit lama telah rusak,Pemasangan unit baru menggantikan unit rusak di Locker CS Wanita. Merk Daikin 1 PK,-
24,18 Apr 2026,13:00,P3,Color Wash,SPLIT WALL,,,,Sarifuddin,Sarifuddin,Kebocoran,"Unit bocor pada saluran drainase, from pengecekan bak drain meluap karena ada penyumbatan pada line drain.",Telah dilakukan pemvakuman pada line drain and riser.,17 Mar 2026
25,20 Apr 2026,9:00,L48 OFT,Altitude,,,,,,Sarifuddin,Sarifuddin,AC Mati,"From pengecekan didapati error pada PCB Modul outdoor, namun ternyata unit tidak memiliki indoor",Telah dilakukan perbaikan pada PCB Modul,-
26,20 Apr 2026,13:30,P2,Locker CS Wanita,SPLIT WALL,,,,Sarifuddin,Sarifuddin,Ruangan Panas,Ruangan panas disebabkan tekanan refrigeran kurang sehingga pendinginan tidak maksimal. From pengecekan terdapat kebocoran pada napple pipa low press di outdoor,Telah dilakukan pemotongan and flaring ulang pada napple pipa low press,7 Mar 2026
27,20 Apr 2026,10:30,P1,Lobby Lift VIP,SPLIT DUCT,,,,Sarifuddin,Sarifuddin,AC Mati,"Setelah dilakukan pengecekan, diduga terjadi kerusakan pada kompresor, indikasi resistansi pada kompresor yang berubah-ubah",Pengecekan pada kompresor unit,-
28,25 Apr 2026,23:00,L1,AHU L1-09,AHU,,,,Sarifuddin,Sarifuddin,Penggantian Part,Filter AHU sudah kotor,Penggantian filter AHU,2 Apr 2026
29,26 Apr 2026,23:00,L3,AHU P3-08,AHU,,,,Sarifuddin,Sarifuddin,Penggantian Part,Filter AHU sudah kotor,Penggantian filter AHU,-
30,26 Apr 2026,9:30,P2,Ruang Manager Secure Parking,SPLIT WALL,,,,Sarifuddin,Sarifuddin,Ruangan Panas,Ruangan panas disebabkan terdapat kebosoran pada evaporator (u bent),Telah dilakukan pembongkaran evaporator and pengelasan pada titik kebocoran, serta penambahan freon,-
31,28 Apr 2026,16:30,P1,Ruang Travo TX-27,AC STANDING,,,,Sarifuddin,Sarifuddin,AC Mati,Unit telah mati and tidak difungsikan sejak lama,AC Mati diduga ada kerusakan pada kompresor, perlu pengecekan lebih lanjut,-
32,28 Apr 2026,16:30,P1,Ruang Travo TX-27,SPLIT DUCT,,,,Sarifuddin,Sarifuddin,AC Mati,Unit telah mati and tidak difungsikan sejak lama,AC Mati diduga ada kerusakan pada kompresor, perlu pengecekan lebih lanjut,-
33,29 Apr 2026,11:30,L1,AHU P1-01,AHU,,,,Sarifuddin,Sarifuddin,Pemantauan Unit,Permintaan bantuan untuk membuka valve pada unit,Pembukaan valve pada unit,1 Apr 2026
34,29 Apr 2026,23:00,L1,AHU P1-04,AHU,,,,Adit,Sarifuddin,Penggantian Part,Filter AHU sudah kotor,Penggantian filter AHU,10 Apr 2026`;

const parseCSV = (csv) => {
  const lines = csv.split('\n');
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current);
    result.push(parts);
  }
  return result;
};

const parseIndonesianDate = (dateStr) => {
    if (!dateStr) return null;
    const months = {
        'januari': 0, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
        'jan': 0, 'mar': 2, 'apr': 3, 'mei': 4, 'jun': 5, 'jul': 6, 'agu': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length < 3) return new Date(dateStr); // Fallback for simple formats
    
    const day = parseInt(parts[0]);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
};

async function sync() {
  const rows = parseCSV(CSV_DATA);

  for (const row of rows) {
    let [no, tanggal, jam, lantai, tenant, jenis, tag, brand, model, teknisi, spv, kategori, root_cause, action, last_pm, status] = row;
    
    if (!tenant && !tag) continue;

    const serviceDate = parseIndonesianDate(tanggal);
    const lastPmDate = parseIndonesianDate(last_pm);

    // Map Unit Type
    let mappedType = (jenis || 'AHU').toUpperCase();
    if (mappedType === 'SPLIT' || mappedType === 'SPLIT WALL') mappedType = 'SPLIT DUCT'; // Grouping as requested earlier

    let unit = null;
    if (tag) {
        unit = await prisma.units.findFirst({ where: { tag_number: tag.trim() } });
    }
    if (!unit && tenant) {
        unit = await prisma.units.findFirst({
            where: {
                room_tenant: { contains: tenant.trim() }
            }
        });
    }

    if (!unit) {
        console.log(`Unit not found for ${tenant}. Creating new unit...`);
        unit = await prisma.units.create({
            data: {
                room_tenant: tenant || "Unknown Tenant",
                unit_type: mappedType,
                brand: brand || "Daikin",
                model: model || "-",
                tag_number: tag || null,
                site_id: 1, 
                project_ref_id: 1,
                status: 'Normal'
            }
        });
    }

    console.log(`Syncing complaint for ${unit.room_tenant} (${unit.tag_number || unit.id}) on ${tanggal}`);
    
    const technicalJson = JSON.stringify({
        personnel: {
            name: teknisi || "Daikin Service Team",
            service_date: serviceDate,
            service_time: jam || "-",
            wo_number: "-",
            visit: "1"
        },
        analysis: {
            complain: kategori || "-",
            root_cause: root_cause || "-",
            corrective_action: action || "-",
            recommendation: "-",
            status: status || "Done"
        },
        pic: {
            name: "-",
            department: "-",
            phone: "-",
            email: "-"
        },
        lastPreventiveDate: lastPmDate,
        activity_photos: []
    });

    await prisma.service_activities.create({
        data: {
            unit_id: unit.id,
            type: 'Corrective',
            service_date: serviceDate,
            inspector_name: teknisi || "Daikin Service Team",
            technical_json: technicalJson,
            technical_advice: `Root Cause: ${root_cause || "-"}\nAction: ${action || "-"}`,
            status: 'Final_Approved'
        }
    });
  }

  console.log('Sync completed successfully.');
  process.exit(0);
}

sync().catch(e => {
  console.error(e);
  process.exit(1);
});
