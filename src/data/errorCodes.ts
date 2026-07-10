// ╔════════════════════════════════════════════════════════════════════════╗
// ║  DAIKIN ERROR CODES DATABASE (INDONESIAN TRANSLATED)                   ║
// ║  Source: Simple Self-Diagnosis by Malfunction Code (SM-TS2)            ║
// ╚════════════════════════════════════════════════════════════════════════╝

export type ErrorSeverity = "critical" | "warning" | "info";
export type UnitCategory = "indoor" | "outdoor" | "system" | "others";
export type ModelType = "RA" | "SkyAir" | "VRV" | "Package" | "HRV" | "Chiller";

export interface ErrorCode {
  code: string;
  category: UnitCategory;
  contents: string;
  causes: string[];
  models: ModelType[];
  severity: ErrorSeverity;
  resolution: string[];
}

const ALL: ModelType[] = ["RA","SkyAir","VRV","Package","HRV","Chiller"];
const RA_SKY_VRV: ModelType[] = ["RA","SkyAir","VRV"];
const VRV_ONLY: ModelType[] = ["VRV"];
const CHILLER: ModelType[] = ["Chiller"];
const PKG: ModelType[] = ["Package"];
const HRV_ONLY: ModelType[] = ["HRV"];
const RA_SKY_VRV_PKG: ModelType[] = ["RA","SkyAir","VRV","Package"];
const VRV_PKG_CHILLER: ModelType[] = ["VRV","Package","Chiller"];

const CRITICAL_RES = [
  "Matikan unit segera dari sumber listrik (breaker).",
  "Periksa koneksi kabel dan komponen yang disebutkan pada penyebab.",
  "Jangan paksa nyalakan ulang sebelum akar masalah diperbaiki.",
  "Hubungi teknisi ahli Daikin untuk investigasi lebih lanjut."
];

const WARNING_RES = [
  "Catat kode error ini.",
  "Periksa sambungan kabel, sensor, atau thermistor yang terkait.",
  "Coba lakukan reset power (matikan breaker 3 menit, lalu nyalakan lagi).",
  "Jika error kembali muncul, jadwalkan perbaikan dengan teknisi."
];

const INFO_RES = [
  "Periksa pengaturan pada remote controller atau modul.",
  "Pastikan konfigurasi (addressing, master/slave) sudah benar.",
  "Lakukan setting ulang sesuai panduan instalasi."
];

export const ERROR_CODES: ErrorCode[] = [
  // ═══════════════════════════ INDOOR UNIT ═══════════════════════════
  { code: "A0", category: "indoor", contents: "Perangkat proteksi eksternal aktif", causes: ["Perangkat proteksi yang terhubung ke terminal T1-T2 unit indoor sedang aktif"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A1", category: "indoor", contents: "Kerusakan pada PCB unit indoor", causes: ["Malfungsi akibat gangguan noise listrik", "Kerusakan fisik pada PCB indoor"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A3", category: "indoor", contents: "Sistem kontrol level pembuangan air (drain) bermasalah", causes: ["Pipa pembuangan tersumbat atau kemiringan pipa tidak tepat", "Pompa drain rusak", "Pelampung (float switch) rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A4", category: "indoor", contents: "Malfungsi proteksi pembekuan (freezing)", causes: ["Kekurangan volume air", "Thermistor suhu air rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A5", category: "indoor", contents: "Proteksi pembekuan saat pendinginan / kontrol tekanan tinggi saat pemanasan", causes: ["Filter udara unit indoor kotor / tersumbat (short-circuit udara)", "Thermistor heat exchanger indoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A6", category: "indoor", contents: "Motor kipas (fan motor) macet, overload, atau overcurrent", causes: ["Konektor kabel longgar atau putus", "Motor kipas rusak", "PCB indoor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "A7", category: "indoor", contents: "Malfungsi motor sirip ayun (swing flap motor)", causes: ["Motor swing rusak", "PCB indoor rusak", "Mekanisme sirip macet terhalang kotoran/benda"], models: RA_SKY_VRV, severity: "warning", resolution: WARNING_RES },
  { code: "A8", category: "indoor", contents: "Malfungsi suplai tegangan / arus input AC berlebih", causes: ["Tegangan suplai daya tidak stabil/drop", "Kelebihan arus input AC"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "A9", category: "indoor", contents: "Malfungsi penggerak katup ekspansi elektronik (EEV)", causes: ["Koil katup ekspansi elektronik rusak", "PCB indoor rusak", "Konektor kabel katup kendor/putus"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "AA", category: "indoor", contents: "Heater terlalu panas (overheat)", causes: ["Sistem proteksi pemanas (26WH) aktif"], models: RA_SKY_VRV_PKG, severity: "critical", resolution: CRITICAL_RES },
  { code: "AF", category: "indoor", contents: "Malfungsi pada sistem pelembap (humidifier)", causes: ["Kebocoran air pada humidifier", "Float switch rusak", "Kemiringan pipa drainase tidak tepat"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "AH", category: "indoor", contents: "Malfungsi penangkap debu pada air cleaner", causes: ["Elemen pengumpul debu rusak", "Unit power supply tegangan tinggi rusak"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },
  { code: "AJ", category: "indoor", contents: "Malfungsi pengaturan kapasitas pada PCB indoor", causes: ["Adaptor pengaturan kapasitas tidak dipasang saat ganti PCB", "PCB indoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "C1", category: "indoor", contents: "Gagal transmisi komunikasi antara PCB indoor dan PCB kipas", causes: ["Malfungsi transmisi kontrol penggerak motor kipas"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "C4", category: "indoor", contents: "Malfungsi thermistor pipa cair (liquid pipe) heat exchanger", causes: ["Kontak konektor thermistor bermasalah", "Thermistor pipa cair rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "C5", category: "indoor", contents: "Malfungsi thermistor pipa gas heat exchanger", causes: ["Kontak konektor thermistor bermasalah", "Thermistor pipa gas rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "C6", category: "indoor", contents: "Malfungsi modul driver pengontrol motor kipas", causes: ["Sistem sensor motor kipas bermasalah", "Driver kontrol motor kipas rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "C7", category: "indoor", contents: "Motor penggerak panel depan bermasalah", causes: ["Motor penggerak panel depan rusak", "Limit switch panel rusak"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },
  { code: "C9", category: "indoor", contents: "Malfungsi thermistor udara masuk (suction air thermistor)", causes: ["Kontak konektor bermasalah", "Thermistor udara hisap rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "CA", category: "indoor", contents: "Malfungsi thermistor udara keluar (discharge air thermistor)", causes: ["Kontak konektor bermasalah", "Thermistor udara tiup keluar rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "CC", category: "indoor", contents: "Malfungsi sistem sensor kelembapan (humidity)", causes: ["Kontak konektor bermasalah", "Sensor kelembapan rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "CJ", category: "indoor", contents: "Malfungsi sensor termostat pada remote controller", causes: ["Thermistor di dalam remote rusak", "Gangguan noise sinyal", "PCB remote rusak"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },

  // ═══════════════════════════ OUTDOOR UNIT ═══════════════════════════
  { code: "E0", category: "outdoor", contents: "Perangkat proteksi menyatu (unified) aktif", causes: ["Perangkat proteksi yang terhubung ke PCB outdoor bekerja", "Konektor perangkat proteksi kendor", "PCB outdoor rusak", "Gangguan kelistrikan eksternal"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E1", category: "outdoor", contents: "Saklar tekanan tinggi (High Pressure Switch / HPS) aktif", causes: ["Heat exchanger outdoor atau filter hisap kotor", "HPS rusak", "Pipa refrigeran tersumbat atau terjepit", "Konektor kendor"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E3", category: "outdoor", contents: "Saklar tekanan rendah (Low Pressure Switch / LPS) aktif", causes: ["Pipa refrigeran tersumbat", "Sistem kekurangan freon ekstrim", "Konektor bermasalah"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E4", category: "outdoor", contents: "Overheat pada motor kompresor inverter", causes: ["Kekurangan volume refrigeran (freon)", "Kebocoran pada katup 4-arah (four-way valve)", "Motor kompresor macet/lock"], models: RA_SKY_VRV, severity: "critical", resolution: CRITICAL_RES },
  { code: "E5", category: "outdoor", contents: "Overcurrent / macet pada motor kompresor standar", causes: ["Kompresor inverter macet", "Kesalahan kabel wiring", "Stop valve / kran masih tertutup", "Kompresor standar macet"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E6", category: "outdoor", contents: "Malfungsi motor kipas (fan motor) outdoor", causes: ["Kontak konektor motor kipas buruk", "Motor kipas terbakar/rusak", "Fan motor driver rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E7", category: "outdoor", contents: "Kelebihan arus (overcurrent) kompresor inverter", causes: ["Kompresor rusak atau macet", "PCB outdoor rusak", "Kapasitor sirkuit utama inverter rusak", "Power transistor jebol"], models: RA_SKY_VRV, severity: "critical", resolution: CRITICAL_RES },
  { code: "E8", category: "outdoor", contents: "Koil katup ekspansi elektronik bermasalah", causes: ["Katup ekspansi elektronik macet/rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "E9", category: "outdoor", contents: "Malfungsi katup 4-arah (Four Way Valve)", causes: ["Katup 4-arah macet / rusak mekanis", "PCB outdoor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "EA", category: "outdoor", contents: "Malfungsi suhu air masuk (entering water temperature)", causes: ["Suhu air pendingin tidak normal", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_PKG_CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "EC", category: "outdoor", contents: "Malfungsi pada unit penyimpanan termal", causes: ["Katup ekspansi elektronik pada unit penyimpanan termal bermasalah", "PCB penyimpanan termal rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "EF", category: "outdoor", contents: "Suhu pipa pembuangan kompresor (discharge) terlalu tinggi / tidak normal", causes: ["Kekurangan freon (gas)", "Konektor bermasalah", "Tekanan sangat tinggi saat mode pendinginan"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "F3", category: "outdoor", contents: "Sistem sensor kompresor bermasalah", causes: ["Kabel sensor putus atau sambungan buruk", "PCB rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "F6", category: "outdoor", contents: "Damper unit pelembap (humidifier) bermasalah", causes: ["Limit switch damper rusak", "Damper fisik rusak/macet"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "H0", category: "outdoor", contents: "Sensor saklar tekanan tinggi (HPS) rusak", causes: ["Sensor HPS putus/rusak", "Kontak konektor kendor"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "H1", category: "outdoor", contents: "Sensor saklar tekanan rendah (LPS) rusak", causes: ["Sensor LPS putus/rusak", "Kontak konektor kendor"], models: RA_SKY_VRV, severity: "critical", resolution: CRITICAL_RES },
  { code: "H3", category: "outdoor", contents: "Thermistor kelebihan beban kompresor rusak", causes: ["Konektor kendor", "Thermistor proteksi kompresor rusak"], models: RA_SKY_VRV, severity: "warning", resolution: WARNING_RES },
  { code: "H4", category: "outdoor", contents: "Malfungsi sensor deteksi posisi kompresor", causes: ["Kontak kabel kompresor buruk", "Kompresor rusak (magnet rotor hilang daya)", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "H5", category: "outdoor", contents: "Sinyal motor kipas outdoor bermasalah", causes: ["Kontak kabel kipas kendor", "Motor kipas rusak", "Driver motor kipas mati"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "H6", category: "outdoor", contents: "Sistem input arus kompresor (CT) bermasalah", causes: ["Power transistor rusak", "Reaktor rusak", "Kesalahan kabel sirkuit inverter", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "H7", category: "outdoor", contents: "Thermistor udara luar ruangan rusak", causes: ["Konektor thermistor kendor", "Thermistor suhu udara luar rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "H8", category: "outdoor", contents: "Thermistor udara discharge rusak", causes: ["Konektor kendor", "Thermistor discharge rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "H9", category: "outdoor", contents: "Thermistor suhu air panas/dingin rusak", causes: ["Konektor kendor", "PCB outdoor bermasalah", "Thermistor air rusak"], models: VRV_PKG_CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "J1", category: "outdoor", contents: "Sensor tekanan (pressure sensor) bermasalah", causes: ["Konektor sensor tekanan kendor", "Sensor tekanan rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J2", category: "outdoor", contents: "Sensor arus (current sensor) kompresor rusak", causes: ["Sensor arus mati", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "J3", category: "outdoor", contents: "Thermistor pipa pembuangan (discharge pipe) kompresor bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J4", category: "outdoor", contents: "Sistem sensor suhu saturasi ekivalen tekanan rendah rusak", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: RA_SKY_VRV, severity: "warning", resolution: WARNING_RES },
  { code: "J5", category: "outdoor", contents: "Thermistor pipa hisap (suction pipe) bermasalah", causes: ["Konektor kendor", "Thermistor suction rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J6", category: "outdoor", contents: "Thermistor heat exchanger outdoor rusak", causes: ["Konektor kendor", "Thermistor koil kondensor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J7", category: "outdoor", contents: "Thermistor pipa cair (liquid) sirkuit refrigeran rusak", causes: ["Konektor kendor", "Thermistor pipa cair rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "J8", category: "outdoor", contents: "Thermistor pipa cair (pengaturan bypass/lainnya) rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "J9", category: "outdoor", contents: "Thermistor pipa gas sirkuit refrigeran rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "JA", category: "outdoor", contents: "Sensor tekanan tinggi (High pressure sensor) bermasalah", causes: ["Konektor kendor", "Sensor tekanan jebol/rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "JC", category: "outdoor", contents: "Sensor tekanan rendah (Low pressure sensor) bermasalah", causes: ["Konektor kendor", "Sensor tekanan rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "L0", category: "outdoor", contents: "Sistem inverter bermasalah", causes: ["Kapasitas catu daya kurang", "PCB inverter rusak / konslet"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L1", category: "outdoor", contents: "Malfungsi pada PCB Inverter", causes: ["Kabel kompresor cacat/konslet", "Sekering (fuse) putus"], models: VRV_ONLY, severity: "critical", resolution: CRITICAL_RES },
  { code: "L3", category: "outdoor", contents: "Suhu box panel listrik terlalu panas", causes: ["Sirkulasi udara di box tertutup (short-circuit panas)", "Power transistor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L4", category: "outdoor", contents: "Suhu sirip pendingin (heatsink) inverter terlalu tinggi", causes: ["Pendinginan heatsink terhalang", "Thermistor heatsink rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L5", category: "outdoor", contents: "Arus berlebih seketika pada output DC inverter", causes: ["Stop valve masih tertutup penuh saat menyala", "Kompresor rusak/macet mekanis"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L6", category: "outdoor", contents: "Arus berlebih seketika pada output AC inverter", causes: ["Freon diisi berlebihan (overcharge)", "Kompresor rusak"], models: VRV_ONLY, severity: "critical", resolution: CRITICAL_RES },
  { code: "L8", category: "outdoor", contents: "Kelebihan arus (overcurrent) pada kompresor inverter", causes: ["Kenaikan tekanan abnormal karena sirkuit freon mampat", "Kompresor aus/rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L9", category: "outdoor", contents: "Kompresor inverter gagal start (stall prevention)", causes: ["Tekanan kompresor belum setara (pressure equalization gagal)", "Kabel kompresor putus/salah fasa"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "LA", category: "outdoor", contents: "Power transistor rusak", causes: ["Modul power transistor jebol", "PCB Inverter mati"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "LC", category: "outdoor", contents: "Gagal transmisi antara PCB kontrol utama dan PCB inverter", causes: ["Kabel konektor antar PCB kendor/putus", "Gangguan noise sinyal", "PCB Inverter rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "P1", category: "outdoor", contents: "Ketidakseimbangan tegangan antar fasa / fasa hilang (Open phase)", causes: ["Salah satu kabel fasa putus (open phase)", "Tegangan antar fasa (R-S-T) tidak seimbang", "Kapasitor utama rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "P2", category: "outdoor", contents: "Sistem pengisian refrigeran otomatis terhenti sementara", causes: ["Stop valve tertutup", "Katup tabung freon tertutup"], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "P4", category: "outdoor", contents: "Sensor suhu sirip pendingin (heatsink) bermasalah", causes: ["Thermistor heatsink rusak", "Kabel thermistor putus"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "PJ", category: "outdoor", contents: "Sistem kekurangan refrigeran ekstrim (terdeteksi elektronik)", causes: ["Kebocoran freon besar", "Stop valve belum dibuka sepenuhnya"], models: ALL, severity: "critical", resolution: CRITICAL_RES },

  // ═══════════════════════════ SYSTEM ═══════════════════════════
  { code: "U0", category: "system", contents: "Terdeteksi kurangnya freon / fasa terbalik / fasa hilang", causes: ["Fasa listrik PLN terbalik atau putus satu (pada sistem 3 fasa)", "Salah pemasangan kabel wiring R-S-T", "Kekurangan freon parah", "PCB outdoor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "U1", category: "system", contents: "Drop tegangan / tegangan listrik gagal (mati lampu seketika)", causes: ["Suplai tegangan tidak stabil atau drop drastis", "Kabel power supply kendor/bermasalah"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "U2", category: "system", contents: "Check Operation (Test Run) belum dijalankan atau gagal", causes: ["Test Run (mode inisialisasi awal) belum dilakukan", "Transmisi komunikasi terganggu selama Test Run", "Wiring salah"], models: ALL, severity: "info", resolution: INFO_RES },
  { code: "U3", category: "system", contents: "Gagal transmisi komunikasi antara unit Indoor dan Outdoor", causes: ["Kabel transmisi F1-F2 putus atau konslet", "Gangguan interferensi listrik (noise)", "PCB Indoor / Outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "U4", category: "system", contents: "Gagal komunikasi antara unit Indoor dan Remote Controller", causes: ["Kabel remote P1-P2 putus atau terjepit", "PCB indoor rusak", "Gangguan sinyal dari kabel lain (noise)", "Setting Main/Sub pada remote kembar (dua remote di set Main)"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "U5", category: "system", contents: "Gagal komunikasi antar sesama unit Indoor", causes: ["Kesalahan kabel jaringan indoor", "Gangguan noise", "PCB indoor salah satu unit rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "U7", category: "system", contents: "Gagal transmisi komunikasi antar sesama unit Outdoor", causes: ["Kabel F1-F2 Q1-Q2 antar outdoor putus", "Kesalahan setting switch pada modul outdoor (master/slave salah)"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "U8", category: "system", contents: "Gagal komunikasi antar sesama Remote Controller", causes: ["Setting Main/Sub salah (misal: dua remote disambung paralel dan dua-duanya diset Main)", "Kabel antar remote putus"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },
  { code: "UA", category: "system", contents: "Kombinasi Indoor-Outdoor salah / Sistem gagal sinkronisasi", causes: ["Kombinasi model Indoor dan Outdoor tidak kompatibel", "PCB yang diganti salah tipe", "Terlalu banyak unit indoor yang disambungkan melebihi kapasitas", "Tegangan power indoor/outdoor tidak sinkron"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "UC", category: "system", contents: "Duplikasi Address Centralized Controller (Bentrok alamat)", causes: ["Ada dua unit atau lebih yang memiliki nomor address central yang sama persis", "Reset switch tertekan secara tak sengaja"], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "UE", category: "system", contents: "Gagal komunikasi antara unit Indoor dan Centralized Controller (iTouch, dsb)", causes: ["Kabel transmisi antara indoor dan central controller putus/bermasalah", "Address belum di-set pada unit indoor"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "UF", category: "system", contents: "Mismatch antara jalur pipa freon dan kabel transmisi", causes: ["Kabel transmisi F1-F2 disambung silang / tertukar antar sistem refrigeran", "Gagal auto-addressing saat Test Run", "PCB indoor rusak sehingga tak mengenali instruksi outdoor"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "UH", category: "system", contents: "Malfungsi sinkronisasi sistem", causes: ["Kabel transmisi menyilang (cross-wired) antara sistem indoor-outdoor", "Sistem gagal melakukan addressing", "Mismatch unit yang dikombinasikan"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "UJ", category: "system", contents: "Kesalahan pada field setting dari remote", causes: ["Input field setting salah/di luar batas via remote", "Konektor opsi (optional device) terpasang salah"], models: ALL, severity: "info", resolution: INFO_RES },
];
