const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CSV_DATA = `NO,TANGGAL,LANTAI,TENANT/AREA,KODE UNIT,BRAND,MODEL,CORRECTIVE ACTION,FOTO 1,FOTO 2,FOTO 3,FOTO 1,FOTO 2,FOTO 3,STATUS
1,4 Mar 2026,,Jade Home,AHU P2-07,YORK,YDM 70 X 80,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU P2-07,,,,,,done
2,4 Mar 2026,,Koridor Nika,AHU P5-10,YORK,YDM 60 X 70,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU P5-10,,,,,,done
3,5 Mar 2026,,Koridor Eskalator N,AHU L3-03,YORK,YDM 40 X 70,Telah dilakukan pekerjaan pemvakuman pada bak drain dan ruangan AHU L3-03 dilanjutkan pembersihan dan pengeringan ruangan terdampak.,,,,,,done
4,5 Mar 2026,,Koridor Smiggle,AHU P3-03,YORK,YDM 60 X 80,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU P3-03,,,,,,done
5,6 Mar 2026,,Miniapolis,AHU P3-07,YORK,YDM 60 X 70,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU P3-07,,,,,,done
6,6 Mar 2026,,Ruang Klinik PI (Paramedik),,Panasonic,RC50YV14,Telah dilakukan pemasangan satu set unit baru di ruang klinik Plaza Indonesia untuk menggantikan unit lama yang rusak.,,,,,,done
7,8 Mar 2026,,Ruang Call Center,,PANASONIC,CU-YN9WKJ,"Telah dilakukan penambahan refrigeran pada unit untuk mengatasi laporan ruangan panas, diketahui tekanan refrigeran berkurang dari yang seharusnya",,,,,,done
8,9 Mar 2026,,Corridor Lift 7-8,,PANASONIC,CU-PN9WKJ,"Telah dilakukan penambahan refrigeran pada unit untuk mengatasi laporan ruangan panas, diketahui tekanan refrigeran berkurang dari yang seharusnya",,,,,,done
9,9 Mar 2026,,Ruang Mesin Lift 1-2,,PANASONIC,CU-PN12AKJ,"Telah dilakukan penambahan refrigeran pada unit untuk mengatasi laporan ruangan panas, diketahui tekanan refrigeran berkurang dari yang seharusnya",,,,,,done
10,10 Mar 2026,,Koridor Pilar New,AHU L4-08,YORK,YDM 40 X 100,Telah dilakukan pekerjaan pemvakuman pada bak drain dan ruangan AHU L4-08 dilanjutkan pembersihan dan pengeringan ruangan terdampak.,,,,,,done
11,10 Mar 2026,,Koridor Lavalen,AHU L4-09,TRANE,CLCP 45,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU L4-09,,,,,,done
12,11 Mar 2026,,Koridor Talenta,AHU P4-07,YORK,YDM 60 X 80,Telah dilakukan pekerjaan pemvakuman pada bak drain dan ruangan AHU P4-07 dilanjutkan pembersihan dan pengeringan ruangan terdampak.,,,,,,done
13,12 Mar 2026,,Osteria Gia,,,,"Telah dilakukan pemakuman pada line drain pada unit untuk mengatasi kebocoran.",,,,,,done
14,13 Mar 2026,,Ruang Driver,,,,"Telah dilakukan pemakuman pada line drain pada unit untuk mengatasi kebocoran.",,,,,,done
15,13 Mar 2026,,Color Wash,,DAIKIN,FTC50NV14,"Telah dilakukan penggantian remote pada remote bawaan unit yang megalami kerusakan, pengganti berasal dari unit lain yang telah rusak.",,,,,,done
16,14 Mar 2026,,Ruang JNE,,PANASONIC,CS-PC12NKP,"Telah dilakukan penggantian kapasitor pada unit akibat kapasitor telah lemah/rusak, ditandai unit yang mati/hidup berkali-kali",,,,,,done
17,15 Mar 2026,,Control Room Secure Parking,,PANASONIC,CU-PN9WKJ,"Telah dilakukan pemakuman pada line drain pada unit untuk mengatasi kebocoran.",,,,,,done
18,15 Mar 2026,,Locker CSO Pria,,DAIKIN,RV50CXV14,"Telah dilakukan pemakuman pada line drain pada unit untuk mengatasi kebocoran.",,,,,,done
19,15 Mar 2026,,Button Scarves,AHU L4 II,TRANE,CLCP AE 68,Telah dilakukan pekerjaan pemvakuman pada bak drain dan ruangan AHU L4-II dilanjutkan pembersihan dan pengeringan ruangan terdampak.,,,,,,done
20,17 Mar 2026,,Ware House,AHU P5-11,YORK,YDM 70 X 80,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU P5-11,,,,,,done
21,17 Mar 2026,,Osteria Gia,,,,"Telah dilakukan perbaikan pada sapot line drain yang telah mengalai kerusakan.",,,,,,done
22,17 Mar 2026,,Koridor Sate Senayan,AHU P5-02,YORK,YDM 30 X 50,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU P5-02,,,,,,done
23,17 Mar 2026,,Koridor Toilet MaxMarra,,,,"Telah dilakukan perbaikan pada grill return AHU yang telah turun",,,,,,done
24,19 Mar 2026,,Osteria Gia,AC SPLIT,,,"Telah dilakukan pemakuman pada line drain pada unit untuk mengatasi kebocoran.",,,,,,done
25,24 Mar 2026,,Paul Bakery,L2 AHU I,York,YDM SBH 350,"Pada tanggal 24 Maret telah dilakukan pekerjaan pemasangan motor fan dan kontaktor AHU Gantung Paul Bakery di L2 (AHU Gantung Corridor H7M), merk York YDM SBH 350",,,,,,done
26,25 Mar 2026,,Ganara,AHU 3,TiCA,,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU 3 Ganara,,,,,,done
27,25 Mar 2026,,Ganara,AHU 9,TiCA,,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU 9 Ganara,,,,,,done
28,26 Mar 2026,,Miniapolis,AHU L4-01,TRANE,CLCP 45,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU L4-01 sebagai tindak lanjut temuan saat PM,,,,,,done
29,26 Mar 2026,,Urban Quarter,AHU L4-02,TRANE,CLCP 45,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU L4-02.,,,,,,done
30,26 Mar 2026,,Miniapolis,AHU L3-07,York,YDM 60 x 70,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU L3-07 sebagai tindak lanjut temuan saat PM,,,,,,done
31,28 Mar 2026,,Urban Quarter,AHU P4-05,York,YDM 40 x 60,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU P4-05.,,,,,,done
32,28 Mar 2026,,Secure Parking (R. Control/CCTV),,Daikin,,"Telah dilakukan penambahan refrigeran pada unit untuk mengatasi laporan ruangan panas, diketahui tekanan refrigeran berkurang dari yang seharusnya",,,,,,done
33,29 Mar 2026,,Locker CSO Pria,,PANASONIC,CU-YN9WKJ,"Telah dilakukan pemakuman pada line drain pada unit untuk mengatasi kebocoran.",,,,,,done
34,29 Mar 2026,,Miniapolis,AHU P3-07,York,YDM 60 x 70,Telah dilakukan pemakuman dan pengeringan area yang terdampak,,,,,,done
35,30 Mar 2026,,Ruang Trafo,AHU L4-17,Tranee,CLCP 040,Telah dilakukan pekerjaan penggantian V Belt pada unit AHU L4-17.,,,,,,done
36,31 Mar 2026,,Office GHP,,Daikin,RC50NV14,Telah dilakukan overhaul pada evaporator unit akibat bagian dalam sudah tertutup lendir tebal,,,,,,done
1,1 Apr 2026,L4,Ruang AHU P4-02,AHU P4-02,,,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur dan telah dilakukan penggantian with V Belt yang baru. Tipe V Belt SPA 1137 LW,,,,,,Done
2,2 Apr 2026,L5,Ruang AHU P5-09,AHU P5-09,,,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur dan telah dilakukan penggantian with V Belt yang baru. Tipe V Belt SPB 2150 LW,,,,,,Done
3,2 Apr 2026,L3,Ruang AHU P3-09,AHU P3-09,,,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-36,,,,,,Done
4,2 Apr 2026,L3,Ruang AHU P3-09,AHU P3-09,,,Telah dilakukan penggantian lampu penerangan pada ruang AHU P3-09, sebelumnya lampu penerangan pada ruangan dalam kondisi putus and berpotensi mengganggu aktivitas pekerjaan di ruang tersebut.,,,,,,Done
5,4 Apr 2026,L5,Ruang AHU P5-07,AHU P5-07,,,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-71,,,,,,Done
6,6 Apr 2026,P2,Ruang Provost,,,,"Telah dilakukan pekerjaan over haul pada unit indoor diakibatkan unit sudah kurang dingin, flow udara tidak merata, and ditemukan tumpukan lumut and lendir pada evaporator bagian dalam.",,,,,,Done
7,7 Apr 2026,L2,Ruang AHU P2-01,AHU P2-01,,,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-36,,,,,,Done
8,7 Apr 2026,P2,Kantina,,,,"Telah dilakukan pekerjaan pengecekan pada AC Split Duct di ruang Kantina, keluhan ruangan panas. Hasil temuan kami salah satu kipas blower pada unit out door (bagian bawah) macet and sulit berputar karena korosi. Telah diberikan pelumas anti korosi untuk menangani permasalahan ini. Kipas blower sudah kembali berputar.",,,,,,Done
9,8 Apr 2026,L2,Ruang AHU P2-03,AHU P2-03,,,Telah dilakukan pekerjaan pengecekan V Belt unit AHU yang kendur and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt A-46,,,,,,Done
10,12 Apr 2026,L5,Go Work,,,,"Telah dilakukan pekerjaan penanganan noise pada unit AC yang disebabkan sapot ducting yang telah kendur. Telah dilakukan perbaikan and pengencangan pada sapot ducting.",,,,,,Done
11,13 Apr 2026,L4,Ruang AHU P4-09,AHU P4-09,,,Telah dilakukan pekerjaan cleaning ulang pada unit AHU akibat munculnya bau tidak sedap pada area suplai unit.,,,,,,Done
12,13 Apr 2026,L3,Ruang AHU L3-19,AHU L3-19,,,Telah dilakukan pekerjaan cleaning ulang pada unit AHU akibat munculnya bau tidak sedap pada area suplai unit.,,,,,,Done
13,13 Apr 2026,L2,Multi Function Hall,,,,"Telah dilakukan pemvakuman main line drain pada unit-unit AC Split Duct ruang MFH.",,,,,,Done
14,14 Apr 2026,L3,Ruang AHU L3-16,AHU L3-16,,,Telah dilakukan pekerjaan pengecekan V Belt unit AHU (ditemukan AHU tidak memiliki V Belt) and telah dilakukan penggantian with V Belt yang baru. Tipe V Belt SPA 1682 LW,,,,,,Done
15,15 Apr 2026,P3,Ruang Teknisi HVAC,,,,"Atas permintaan BM, telah dilakukan pekerjaan penghitungan sisa bongkaran unit. Terdapat 1 unit Merk Panasonic (2 PK) and 3 unit Merk Daikin (1 unit 2 PK and 2 unit 1 PK)",,,,,,Done
16,17 Apr 2026,P1,Locker CS Wanita,,,,"Telah dilakukan pekerjaan over haul pada unit indoor diakibatkan unit sudah kurang dingin, flow udara tidak merata, and ditemukan tumpukan lumut and lendir pada evaporator bagian dalam.",,,,,,Done
17,18 Apr 2026,P3,Color Wash,,,,"Telah dilakukan pekerjaan pengecekan unit yang mengalami kebocoran. Kebocoran disebabkan karena line drain tersumbat lendir and kotoran. Telah dilakukan pemakuman pada line drain.",,,,,,Done
18,20 Apr 2026,P1,Lobby Lift VIP,,,,"Telaj dilakukan pekerjaan pengecekan unit. Didapati unit mengalami masalah pada kompresor. Hasil pengukuran resistansi pada kompresor menunjukkan hasil yang berubah-ubah. Selanjutnya perlu dilakukan penggantian kompresor.",,,,,,Done
19,20 Apr 2026,P2,Locker CS Wanita,,,,"Telah dilakukan pengecekan pada unit and ditemukan adanya kebocoran pada napple low press di unit out door. Telah dilakukan pemotongan and flaring ulang pada pipa.",,,,,,Done
20,20 Apr 2026,L48,Altitude,,,,"Telah dilakukan pekerjaan pengecekan pada unit and ditemukan bekas korsleting (terbakar) pada PCB Module out door, telah dilakukan perbaikan and pemasangan ulang. Unit belum running karena ketiadaan unit indoor. (REQ BM)",,,,,,Pending
21,25 Apr 2026,P3,Gudang Logistik,Unit 2,,,Over haul and deep cleaning pada unit indoor,,,,,,
22,27 Apr 2026,P2,Office Secure Parking (Ruang Manager),,PANASONIC,CS-YN5WKJ,"Over haul and deep cleaning pada unit indoor, serta pengelasan pada titik kebocoran di U Bent",,,,,,Done
23,28 Apr 2026,L4,Ruang AHU L4-16,AHU L4-16,YORK,YDM 50 X 70,"Telah dilakukan pemvakuman pada bak drain, line drain and riser, serta pembersihan and pengeringan pada ruangan AHU",,,,,,Done
24,29 Apr 2026,L2,Ruang AHU P1-04,AHU P1-04,YORK,,Telah dilakukan penggantian filter AHU,,,,,,Done`;

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
    const parts = dateStr.trim().split(' ');
    if (parts.length < 3) return new Date(dateStr); 
    
    const day = parseInt(parts[0]);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
};

async function sync() {
  const rows = parseCSV(CSV_DATA);

  for (const row of rows) {
    let [no, tanggal, lantai, tenant, kode_unit, brand, model, action, f1, f2, f3, f4, f5, f6, status] = row;
    
    if (!tenant && !kode_unit) continue;

    const serviceDate = parseIndonesianDate(tanggal);

    // Map Unit Type
    let mappedType = "AHU";
    if (kode_unit && (kode_unit.includes("SPLIT") || kode_unit.includes("AC"))) mappedType = "SPLIT DUCT";
    else if (tenant && (tenant.includes("SPLIT") || tenant.includes("AC"))) mappedType = "SPLIT DUCT";
    
    // Find unit
    let unit = null;
    if (kode_unit) {
        unit = await prisma.units.findFirst({ 
            where: { 
                OR: [
                    { tag_number: kode_unit.trim() },
                    { code: kode_unit.trim() }
                ]
            } 
        });
    }
    
    if (!unit && tenant) {
        unit = await prisma.units.findFirst({
            where: {
                room_tenant: { contains: tenant.trim() }
            }
        });
    }

    if (!unit) {
        console.log(`Unit not found for ${tenant} / ${kode_unit}. Creating new unit...`);
        unit = await prisma.units.create({
            data: {
                room_tenant: tenant || "Unknown Tenant",
                unit_type: mappedType,
                brand: brand || "Daikin",
                model: model || "-",
                tag_number: kode_unit || null,
                code: kode_unit || null,
                site_id: 1, 
                project_ref_id: 1,
                status: 'Normal'
            }
        });
    }

    console.log(`Syncing corrective for ${unit.room_tenant} (${unit.tag_number || unit.id}) on ${tanggal}`);
    
    const technicalJson = JSON.stringify({
        personnel: {
            name: "Daikin Service Team",
            service_date: serviceDate,
            service_time: "-",
            wo_number: "-",
            visit: "1"
        },
        analysis: {
            complain: "-",
            root_cause: "-",
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
        activity_photos: [],
        is_bulk_sync: true
    });

    await prisma.service_activities.create({
        data: {
            unit_id: unit.id,
            type: 'Corrective',
            service_date: serviceDate,
            inspector_name: "Daikin Service Team",
            technical_json: technicalJson,
            technical_advice: `Action: ${action || "-"}`,
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
