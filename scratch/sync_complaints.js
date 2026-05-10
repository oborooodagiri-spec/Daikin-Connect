/**
 * BULK COMPLAINT SYNC SCRIPT
 * Sinkronisasi data complaint dari spreadsheet ke database Daikin Connect
 * Project: Plaza Indonesia (ID: 1)
 */

const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();
const crypto = require('crypto');

// ===== RAW DATA EXTRACTED FROM SPREADSHEET =====
const complaints = [
  {no:1,tanggal:"2026-03-01",lantai:"LB",tenant:"Chagee",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"AC kurang dingin",ca:"",rekomendasi:"",status:""},
  {no:2,tanggal:"2026-03-01",lantai:"",tenant:"BMF Clinic",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"AC bocor",ca:"Telah dilakukan pemvacuman hingga kering",rekomendasi:"",status:""},
  {no:3,tanggal:"2026-03-01",lantai:"L4",tenant:"Gyukaku",jenis:"",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"Kebocoran berasal dari air balik",ca:"Pengecekan pada kebocoran",rekomendasi:"Pemasangan filter dan service",status:"Closed"},
  {no:4,tanggal:"2026-03-01",lantai:"L3",tenant:"Optik Zeis",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"Kebocoran berasal dari bak drain unit yang keropos",ca:"",rekomendasi:"Pemasangan bak temporary",status:""},
  {no:5,tanggal:"2026-03-02",lantai:"L1",tenant:"Osteria Gia",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"AC bocor",ca:"Pengecekan kebocoran dan pemvacuman",rekomendasi:"Pergantian dop shok",status:"Closed"},
  {no:6,tanggal:"2026-03-02",lantai:"L1",tenant:"Bacha Coffee",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"AC mati",ca:"Penggantian termostat yang terbakar",rekomendasi:"",status:"Closed"},
  {no:7,tanggal:"2026-03-02",lantai:"L3",tenant:"Soup Restaurant",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"AC kurang dingin dan tidak ada flow",ca:"Pengecekan ke unit",rekomendasi:"",status:"Closed"},
  {no:8,tanggal:"2026-03-02",lantai:"L5",tenant:"Momo Paradise",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Non AC",rca:"Kebocoran berasal dari kondensasi pipa chiller",ca:"Pengecekan kebocoran dan pemvacuman",rekomendasi:"",status:"Closed"},
  {no:9,tanggal:"2026-03-02",lantai:"P2",tenant:"Pos Security Loading Dock",jenis:"SPLIT",brand:"Panasonic",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"Kompresor tidak berfungsi, kabel terbakar",ca:"",rekomendasi:"Perlu pergantian kompresor",status:"Done"},
  {no:10,tanggal:"2026-03-03",lantai:"L2",tenant:"Armani",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"AC mati",ca:"Pengecekan AC mati bukan unit FCU tetapi unit AHU",rekomendasi:"",status:"Closed"},
  {no:11,tanggal:"2026-03-03",lantai:"L5",tenant:"Wee Nam Lee",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Non AC",rca:"Kebocoran berasal dari flexible supply yang kondensasi",ca:"pemvacuman di flexible",rekomendasi:"",status:"Closed"},
  {no:12,tanggal:"2026-03-03",lantai:"L1",tenant:"Gucci",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"",ca:"Telah dilakukan pengecekan AC kurang dingin",rekomendasi:"",status:"Closed"},
  {no:13,tanggal:"2026-03-03",lantai:"L1",tenant:"Pellegrini's",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"AC kurang dingin disebabkan 3unit FCU Valve nya tertutup",ca:"Pengecekan Valve yang tertutup",rekomendasi:"",status:"Closed"},
  {no:14,tanggal:"2026-03-04",lantai:"L2",tenant:"Paul Bakery",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Non AC",rca:"Kebocoran bukan dari AC tetapi dari dak atas",ca:"",rekomendasi:"",status:"Closed"},
  {no:15,tanggal:"2026-03-04",lantai:"L3",tenant:"Massiro & Co",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"Kebocoran berasal dari kondensasi unit",ca:"Telah dilakukan pemvacuman",rekomendasi:"",status:"Closed"},
  {no:16,tanggal:"2026-03-04",lantai:"L2",tenant:"Jade Home (P2-07)",jenis:"AHU",brand:"York",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"V Belt kendur karena pully sudah renggang",ca:"Penggantian V Belt",rekomendasi:"Perlu penggantian pully",status:"Done"},
  {no:17,tanggal:"2026-03-04",lantai:"L5",tenant:"Koridor Nika (P5-10)",jenis:"AHU",brand:"York",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"V Belt terlepas dari pully",ca:"Penggantian V Belt",rekomendasi:"",status:"Closed"},
  {no:18,tanggal:"2026-03-04",lantai:"P2",tenant:"Ruang Provost",jenis:"SPLIT",brand:"Panasonic",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"Terdapat es pada pipa outdoor, indikasi kekurangan freon",ca:"Penambahan freon dan cleaning",rekomendasi:"",status:"Closed"},
  {no:19,tanggal:"2026-03-04",lantai:"P2",tenant:"Office Secure Parking (R. Pak Bagja)",jenis:"SPLIT",brand:"Panasonic",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"Tidak ditemukan outdoor",ca:"",rekomendasi:"Penggantian outdoor",status:"Pending"},
  {no:20,tanggal:"2026-03-05",lantai:"L1",tenant:"Pellegrini's",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"",ca:"Telah dilakukan pengecekan temperatur",rekomendasi:"",status:"Closed"},
  {no:21,tanggal:"2026-03-05",lantai:"L3",tenant:"Soup Restaurant",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"",ca:"Telah dilakukan pengecekan temperatur",rekomendasi:"",status:"Closed"},
  {no:22,tanggal:"2026-03-05",lantai:"L1",tenant:"Tod's",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"",ca:"Pengecekan temperature dan penggantian filter udara",rekomendasi:"",status:"Closed"},
  {no:23,tanggal:"2026-03-05",lantai:"P2",tenant:"Escalator Timur",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"Kebocoran dari bak drain meluap",ca:"",rekomendasi:"Pergantian bak drain MCQUAY MCC060",status:"Closed"},
  {no:24,tanggal:"2026-03-05",lantai:"L4",tenant:"De Salon",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"Kebocoran dari pipa airventing meluap",ca:"Pemvacuman pada pipa airventing",rekomendasi:"",status:"Pending"},
  {no:25,tanggal:"2026-03-05",lantai:"L3",tenant:"Koridor Eskalator N (L3-03)",jenis:"AHU",brand:"York",model:"",teknisi:"",kategori:"Kebocoran",rca:"Air meluap dari bak drain",ca:"Pemvakuman dan pengeringan area",rekomendasi:"Perbaikan bak drain",status:""},
  {no:26,tanggal:"2026-03-05",lantai:"L3",tenant:"Koridor Smiggle(P3-03)",jenis:"AHU",brand:"York",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"V Belt terlepas dari pully",ca:"Penggantian V Belt",rekomendasi:"",status:"Closed"},
  {no:27,tanggal:"2026-03-06",lantai:"L1",tenant:"Faure Le Page",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"AC Noise",rca:"Suara Berring motor noise atau rusak",ca:"Masih dalam pengerjaan",rekomendasi:"",status:"Done"},
  {no:28,tanggal:"2026-03-06",lantai:"L1",tenant:"Pellegrini's",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"Minta dicek temperature",ca:"Pengecekan temperature",rekomendasi:"",status:"Closed"},
  {no:29,tanggal:"2026-03-06",lantai:"P2",tenant:"Masjid",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"Bak drain tersumbat lendir",ca:"Pemvacuman sampai kering",rekomendasi:"",status:"Closed"},
  {no:30,tanggal:"2026-03-06",lantai:"L4",tenant:"Josephine Anni",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Non AC",rca:"Ada noda di plafon seperti rembesan air AC",ca:"Pengecekan kebocoran",rekomendasi:"",status:"Done"},
  {no:31,tanggal:"2026-03-06",lantai:"L4",tenant:"Samwon Garden",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"Bak drain keropos dan cover body unit keropos",ca:"",rekomendasi:"Penggantian bak drain dan cover body",status:"Closed"},
  {no:32,tanggal:"2026-03-06",lantai:"P4",tenant:"Masjid",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"line drain tersumbat lendir",ca:"Sudah dikeringkan dan pemvacuman",rekomendasi:"",status:"Closed"},
  {no:33,tanggal:"2026-03-06",lantai:"L2",tenant:"Alo",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"bak drain meluap tersumbat lendir",ca:"Pemvacuman",rekomendasi:"Service",status:"Closed"},
  {no:34,tanggal:"2026-03-06",lantai:"L1",tenant:"Shabu Shabu House",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Non AC",rca:"tutup dop sudah rembes",ca:"Dibalut isolasi seal tape",rekomendasi:"Penggantian tutup dop",status:"Done"},
  {no:35,tanggal:"2026-03-06",lantai:"L3",tenant:"Miniapolis (P3-07)",jenis:"AHU",brand:"York",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"V Belt sudah kendur",ca:"Penggantian V Belt",rekomendasi:"",status:"Closed"},
  {no:36,tanggal:"2026-03-06",lantai:"P3",tenant:"Gudang Logistik 002",jenis:"Split",brand:"Daikin",model:"",teknisi:"",kategori:"Ruangan Panas",rca:"Ditemukan kebocoran pada evaporator",ca:"",rekomendasi:"Penggantian evaporator",status:"Pending"},
  // Continue with remaining rows...  We'll add as many as needed  
  {no:37,tanggal:"2026-03-07",lantai:"L3",tenant:"Designer Workshop",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"kebocoran dari kondensasi terbawa blower",ca:"Pemvacuman",rekomendasi:"Service",status:""},
  {no:38,tanggal:"2026-03-07",lantai:"LB",tenant:"Karada",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"bak drain meluap",ca:"",rekomendasi:"Monitoring",status:"Done"},
  {no:39,tanggal:"2026-03-07",lantai:"L3",tenant:"Miki House",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Non AC",rca:"Kebocoran dari kondensasi pipa chiller",ca:"Sudah dilakukan perbaikan",rekomendasi:"",status:"Closed"},
  {no:40,tanggal:"2026-03-08",lantai:"L4",tenant:"Batik Keris",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Non AC",rca:"Kebocoran dari dak atas bukan dari unit FCU",ca:"Pemvacuman",rekomendasi:"",status:""},
  {no:41,tanggal:"2026-03-08",lantai:"LB",tenant:"Snack Zone",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"air kondensasi terhisap blower",ca:"",rekomendasi:"Penambahan akses manhole",status:""},
  {no:42,tanggal:"2026-03-08",lantai:"L5",tenant:"Sate Khas Senayan",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"bak drain keropos",ca:"Pemvacuman",rekomendasi:"Perbaikan bak temporary",status:""},
  {no:43,tanggal:"2026-03-08",lantai:"LB",tenant:"Karada",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"bak drain meluap, pipa line drain kurang elevasi",ca:"Perbaikan pipa line drain",rekomendasi:"Monitoring",status:"Done"},
  {no:44,tanggal:"2026-03-08",lantai:"P2",tenant:"Ruang Call Center",jenis:"AHU",brand:"PANASONIC",model:"CU-YN9WKJ",teknisi:"Andri",kategori:"Ruangan Panas",rca:"Tekanan refrigerant berkurang tinggal 95 psi",ca:"Penambahan refrigerant",rekomendasi:"",status:"Closed"},
  {no:45,tanggal:"2026-03-09",lantai:"L3",tenant:"Designer Workshop",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"ducting supply air terbawa blower",ca:"Pemvacuman",rekomendasi:"Monitoring",status:"Done"},
  {no:46,tanggal:"2026-03-09",lantai:"L1",tenant:"Valentino",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"bak drain meluap",ca:"Pemvacuman",rekomendasi:"",status:"Done"},
  {no:47,tanggal:"2026-03-09",lantai:"L4",tenant:"Headline",jenis:"FCU",brand:"",model:"",teknisi:"",kategori:"Kebocoran",rca:"pipa airventing terlalu rendah",ca:"Perbaikan sementara",rekomendasi:"Perbaikan pipa airventing",status:"Done"},
  {no:48,tanggal:"2026-03-09",lantai:"P2",tenant:"Corridor Lift 7-8",jenis:"SPLIT",brand:"",model:"",teknisi:"Sarifuddin",kategori:"Ruangan Panas",rca:"refrigeran berkurang",ca:"Penambahan refrigerant",rekomendasi:"Pengecekan kebocoran",status:"Closed"},
  {no:49,tanggal:"2026-03-09",lantai:"P2",tenant:"Ruang Mesin Lift 1-2",jenis:"SPLIT",brand:"",model:"",teknisi:"Sarifuddin",kategori:"Ruangan Panas",rca:"refrigeran berkurang",ca:"Penambahan refrigerant",rekomendasi:"",status:"Closed"},
  {no:50,tanggal:"2026-03-09",lantai:"P3",tenant:"Locker Aeon",jenis:"SPLIT",brand:"",model:"",teknisi:"Andri",kategori:"Ruangan Panas",rca:"tekanan refrigeran berkurang, kebocoran evaporator",ca:"",rekomendasi:"Penggantian indoor",status:"Pending"},
];

// ===== MONTH NAME MAPPING =====
const monthMap = {
  'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
  'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
  'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
};

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  // Already in ISO format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(dateStr);
  // Indonesian format: "01 Maret 2026"
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = monthMap[parts[1].toLowerCase()] || '01';
    const year = parts[2];
    return new Date(`${year}-${month}-${day}`);
  }
  return new Date(dateStr);
}

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, '');

async function main() {
  const PROJECT_ID = BigInt(1); // Plaza Indonesia
  
  console.log("=== BULK COMPLAINT SYNC - Plaza Indonesia ===\n");
  
  let imported = 0;
  let created_units = 0;
  let skipped = 0;
  const errors = [];
  
  for (const c of complaints) {
    try {
      const tenant = c.tenant?.trim();
      if (!tenant) { skipped++; continue; }
      
      const serviceDate = parseDate(c.tanggal);
      const unitType = (c.jenis || 'FCU').toUpperCase().replace('SPLIT DUCT', 'SPLIT').replace('SPLIT', 'Split');
      const brand = c.brand || '';
      const model = c.model || '';
      const floor = c.lantai || '';
      
      // ===== STEP 1: FIND OR CREATE UNIT =====
      let unit = null;
      
      // Try to find by room_tenant + floor
      const searchTenant = tenant;
      const candidates = await prisma.units.findMany({
        where: {
          project_ref_id: PROJECT_ID,
          room_tenant: { contains: searchTenant.substring(0, Math.min(10, searchTenant.length)) }
        }
      });
      
      if (candidates.length > 0) {
        // Pick best match
        unit = candidates.find(u => 
          norm(u.room_tenant) === norm(searchTenant) ||
          norm(u.room_tenant).includes(norm(searchTenant)) ||
          norm(searchTenant).includes(norm(u.room_tenant))
        ) || candidates[0];
      }
      
      if (!unit) {
        // Try broader search
        unit = await prisma.units.findFirst({
          where: {
            project_ref_id: PROJECT_ID,
            room_tenant: searchTenant
          }
        });
      }
      
      if (!unit) {
        // CREATE NEW UNIT
        const p = await prisma.projects.findUnique({
          where: { id: PROJECT_ID },
          select: { customer_id: true }
        });
        
        const ccc = String(p?.customer_id || 1).padStart(3, '0');
        const existingCount = await prisma.units.count({
          where: { project_ref_id: PROJECT_ID }
        });
        const uuu = String(existingCount + created_units + 1).padStart(3, '0');
        const newTag = `DKN${ccc}${uuu}`;
        const qrToken = crypto.randomBytes(16).toString('hex');
        
        unit = await prisma.units.create({
          data: {
            project_ref_id: PROJECT_ID,
            qr_code_token: qrToken,
            tag_number: newTag,
            brand: brand || "Daikin",
            model: model || null,
            unit_type: unitType || "FCU",
            building_floor: floor || null,
            room_tenant: tenant,
            status: "Normal"
          }
        });
        created_units++;
        console.log(`  🆕 Unit baru: ${newTag} - ${tenant} (${floor})`);
      }
      
      // ===== STEP 2: CREATE CORRECTIVE REPORT =====
      const kategori = c.kategori || "Lainnya";
      const rca = c.rca || "";
      const ca = c.ca || "";
      const rekomendasi = c.rekomendasi || "";
      const teknisi = c.teknisi || "Tim Teknisi PI";
      
      // Map status
      let actStatus = "Final_Approved";
      const rawStatus = (c.status || "").toLowerCase();
      if (rawStatus === "pending") actStatus = "Pending";
      else if (rawStatus === "done" || rawStatus === "closed") actStatus = "Final_Approved";
      
      // Create as Corrective service_activity
      await prisma.service_activities.create({
        data: {
          unit_id: unit.id,
          type: "Corrective",
          service_date: serviceDate,
          status: actStatus,
          inspector_name: teknisi,
          engineer_note: `[${kategori}] ${rca}`,
          technical_advice: rekomendasi || ca || "-",
          unit_tag: unit.tag_number,
          location: `${floor} - ${tenant}`,
          technical_json: JSON.stringify({
            import_source: "Complaint Spreadsheet Sync",
            complaint_no: c.no,
            kategori: kategori,
            root_cause: rca,
            corrective_action: ca,
            rekomendasi: rekomendasi,
            original_status: c.status || "Unknown"
          })
        }
      });
      
      // Also create a corrective record
      await prisma.corrective.create({
        data: {
          unit_id: unit.id,
          service_date: serviceDate,
          technician_name: teknisi,
          case_complain: `[${kategori}] ${rca || 'Complaint dari tenant'}`,
          root_cause: rca || "-",
          temp_action: ca || "-",
          perm_action: rekomendasi || "-",
          recommendation: rekomendasi || ca || "-",
          status: actStatus === "Final_Approved" ? "Final Approved" : "Pending"
        }
      });
      
      imported++;
      if (imported % 10 === 0) process.stdout.write(`  ✅ ${imported} complaints synced...\n`);
      
    } catch (err) {
      skipped++;
      errors.push(`#${c.no} ${c.tenant}: ${err.message?.substring(0, 80)}`);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`✅ Imported: ${imported} complaints`);
  console.log(`🆕 New units created: ${created_units}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  if (errors.length > 0) {
    console.log(`\n❌ Errors (first 10):`);
    errors.slice(0, 10).forEach(e => console.log(`   - ${e}`));
  }
  console.log(`========================================\n`);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error("FATAL:", e);
  prisma.$disconnect();
});
