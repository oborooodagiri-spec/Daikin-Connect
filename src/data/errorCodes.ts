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
const RA_SKY_VRV_PKG_HRV: ModelType[] = ["RA","SkyAir","VRV","Package","HRV"];
const VRV_PKG: ModelType[] = ["VRV","Package"];
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
  { code: "A0", category: "indoor", contents: "Perangkat proteksi eksternal aktif", causes: ["Perangkat proteksi di terminal T1-T2 indoor aktif"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A1", category: "indoor", contents: "Kerusakan pada PCB unit indoor", causes: ["Malfungsi karena noise", "Kerusakan fisik PCB indoor"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A3", category: "indoor", contents: "Sistem kontrol pembuangan air (drain) bermasalah", causes: ["Pipa pembuangan tersumbat", "Pompa drain rusak", "Pelampung rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A4", category: "indoor", contents: "Proteksi pembekuan (freezing) aktif", causes: ["Kekurangan volume air", "Thermistor suhu air rusak", "Switch 26WL rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A5", category: "indoor", contents: "Proteksi pembekuan saat pendinginan / tekanan tinggi saat pemanasan", causes: ["Filter udara kotor / short-circuit", "Thermistor heat exchanger rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "A6", category: "indoor", contents: "Motor kipas macet, overload, atau overcurrent", causes: ["Konektor kendor", "Motor kipas rusak", "PCB indoor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "A7", category: "indoor", contents: "Malfungsi motor sirip ayun (swing flap motor)", causes: ["Motor swing rusak", "PCB indoor rusak", "Mekanisme sirip macet"], models: RA_SKY_VRV, severity: "warning", resolution: WARNING_RES },
  { code: "A8", category: "indoor", contents: "Malfungsi suplai tegangan / arus input AC berlebih", causes: ["Tegangan drop", "Kelebihan arus input AC"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "A9", category: "indoor", contents: "Malfungsi penggerak katup ekspansi elektronik", causes: ["Koil katup ekspansi elektronik rusak", "PCB indoor rusak", "Konektor kendor"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "AA", category: "indoor", contents: "Heater terlalu panas (overheat)", causes: ["Proteksi heater 26WH aktif"], models: RA_SKY_VRV_PKG, severity: "critical", resolution: CRITICAL_RES },
  { code: "AF", category: "indoor", contents: "Malfungsi sistem pelembap (humidifier)", causes: ["Kebocoran air humidifier", "Pelampung rusak", "Pipa pembuangan miring salah"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "AH", category: "indoor", contents: "Malfungsi penangkap debu (air cleaner)", causes: ["Elemen debu rusak", "Power supply tegangan tinggi rusak"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },
  { code: "AJ", category: "indoor", contents: "Malfungsi pengaturan kapasitas (Indoor PCB)", causes: ["Adaptor kapasitas tidak dipasang saat ganti PCB", "PCB indoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "C1", category: "indoor", contents: "Gagal transmisi antara PCB indoor dan PCB kipas", causes: ["Malfungsi transmisi kontrol penggerak motor kipas"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "C4", category: "indoor", contents: "Thermistor pipa cair heat exchanger bermasalah", causes: ["Kontak konektor kendor", "Thermistor pipa cair rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "C5", category: "indoor", contents: "Thermistor pipa gas heat exchanger bermasalah", causes: ["Kontak konektor kendor", "Thermistor pipa gas rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "C6", category: "indoor", contents: "Malfungsi driver pengontrol motor kipas", causes: ["Sensor motor kipas rusak", "Driver kontrol motor kipas rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "C7", category: "indoor", contents: "Motor penggerak panel depan bermasalah", causes: ["Motor panel depan rusak", "Limit switch panel rusak"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },
  { code: "C9", category: "indoor", contents: "Thermistor udara masuk (suction) bermasalah", causes: ["Kontak konektor kendor", "Thermistor suction rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "CA", category: "indoor", contents: "Thermistor udara keluar (discharge) bermasalah", causes: ["Kontak konektor kendor", "Thermistor discharge rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "CC", category: "indoor", contents: "Malfungsi sensor kelembapan (humidity)", causes: ["Kontak konektor kendor", "Sensor kelembapan rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "CJ", category: "indoor", contents: "Malfungsi sensor termostat di remote", causes: ["Thermistor remote rusak", "Gangguan noise", "PCB remote rusak"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },

  // ═══════════════════════════ OUTDOOR UNIT ═══════════════════════════
  { code: "E0", category: "outdoor", contents: "Perangkat proteksi (unified) aktif", causes: ["Proteksi PCB outdoor aktif", "Konektor kendor", "PCB outdoor rusak", "Gangguan noise"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E1", category: "outdoor", contents: "Saklar tekanan tinggi (HPS) aktif", causes: ["Heat exchanger / filter outdoor kotor", "HPS rusak", "Pipa refrigeran mampat", "Konektor kendor"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E3", category: "outdoor", contents: "Saklar tekanan rendah (LPS) aktif", causes: ["Pipa refrigeran mampat", "Konektor kendor"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E4", category: "outdoor", contents: "Motor kompresor inverter overheat", causes: ["Kekurangan gas freon", "Katup 4-arah bocor", "Kompresor inverter macet"], models: RA_SKY_VRV, severity: "critical", resolution: CRITICAL_RES },
  { code: "E5", category: "outdoor", contents: "Motor kompresor standar overcurrent / macet", causes: ["Kompresor macet", "Kabel salah", "Stop valve tertutup"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E6", category: "outdoor", contents: "Malfungsi motor kipas outdoor", causes: ["Konektor motor kipas kendor", "Motor kipas rusak", "Driver motor kipas rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "E7", category: "outdoor", contents: "Overcurrent pada kompresor inverter", causes: ["Kompresor rusak", "PCB outdoor rusak", "Kapasitor utama rusak", "Power transistor jebol"], models: RA_SKY_VRV, severity: "critical", resolution: CRITICAL_RES },
  { code: "E8", category: "outdoor", contents: "Koil katup ekspansi elektronik bermasalah", causes: ["Katup rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "E9", category: "outdoor", contents: "Malfungsi katup 4-arah (Four Way Valve)", causes: ["Katup rusak", "PCB outdoor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "EA", category: "outdoor", contents: "Suhu air masuk (entering water) bermasalah", causes: ["Suhu air tidak normal", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_PKG_CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "EC", category: "outdoor", contents: "Malfungsi pada unit penyimpanan termal", causes: ["Katup ekspansi unit termal rusak", "PCB termal rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "EF", category: "outdoor", contents: "Suhu pipa pembuangan (discharge) bermasalah", causes: ["Kekurangan freon", "Konektor kendor", "Tekanan sangat tinggi"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "F3", category: "outdoor", contents: "Sistem sensor kompresor bermasalah", causes: ["Kabel sensor putus/longgar", "PCB rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "F6", category: "outdoor", contents: "Damper unit pelembap bermasalah", causes: ["Limit switch damper rusak", "Damper macet"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "H0", category: "outdoor", contents: "Malfungsi sensor tekanan tinggi (HPS)", causes: ["Sensor HPS rusak", "Konektor kendor"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "H1", category: "outdoor", contents: "Malfungsi sensor tekanan rendah (LPS)", causes: ["Sensor LPS rusak", "Konektor kendor"], models: RA_SKY_VRV, severity: "critical", resolution: CRITICAL_RES },
  { code: "H3", category: "outdoor", contents: "Thermistor overload kompresor bermasalah", causes: ["Konektor kendor", "Thermistor proteksi rusak"], models: RA_SKY_VRV, severity: "warning", resolution: WARNING_RES },
  { code: "H4", category: "outdoor", contents: "Malfungsi sensor deteksi posisi kompresor", causes: ["Kabel kompresor kendor", "Kompresor rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "H5", category: "outdoor", contents: "Sinyal motor kipas outdoor bermasalah", causes: ["Kabel kipas kendor", "Motor kipas rusak", "Driver kipas mati"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "H6", category: "outdoor", contents: "Sistem input arus (CT) bermasalah", causes: ["Power transistor rusak", "Reaktor rusak", "Salah kabel inverter", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "H7", category: "outdoor", contents: "Thermistor udara luar bermasalah", causes: ["Konektor kendor", "Thermistor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "H8", category: "outdoor", contents: "Thermistor udara discharge bermasalah", causes: ["Konektor kendor", "Thermistor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "H9", category: "outdoor", contents: "Thermistor suhu air bermasalah", causes: ["Konektor kendor", "PCB outdoor rusak", "Thermistor air rusak"], models: VRV_PKG_CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "HC", category: "outdoor", contents: "Alarm unit penyimpanan termal es", causes: ["Wiring rusak", "Kesalahan setting", "Keebihan tangki termal"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "HF", category: "outdoor", contents: "Level air tangki penyimpanan termal bermasalah", causes: ["Level air rendah", "Sensor level air rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "HJ", category: "outdoor", contents: "Alarm suhu ruangan tinggi (Chiller)", causes: ["Heat exchanger kotor", "Thermistor rusak", "Malfungsi katup 3-arah"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "J1", category: "outdoor", contents: "Sensor tekanan (pressure sensor) bermasalah", causes: ["Konektor sensor kendor", "Sensor rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J2", category: "outdoor", contents: "Sensor arus kompresor bermasalah", causes: ["Sensor arus mati", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "J3", category: "outdoor", contents: "Thermistor pipa pembuangan (discharge) bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J4", category: "outdoor", contents: "Sistem sensor suhu saturasi ekivalen bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: RA_SKY_VRV, severity: "warning", resolution: WARNING_RES },
  { code: "J5", category: "outdoor", contents: "Thermistor pipa hisap (suction) bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J6", category: "outdoor", contents: "Thermistor heat exchanger bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "J7", category: "outdoor", contents: "Thermistor pipa cair (liquid) sirkuit refrigeran bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "J8", category: "outdoor", contents: "Thermistor pipa cair (bypass/lainnya) bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "J9", category: "outdoor", contents: "Thermistor pipa gas sirkuit refrigeran bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "JA", category: "outdoor", contents: "Sensor tekanan tinggi bermasalah", causes: ["Konektor kendor", "Sensor tekanan rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "JC", category: "outdoor", contents: "Sensor tekanan rendah bermasalah", causes: ["Konektor kendor", "Sensor tekanan rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "JE", category: "outdoor", contents: "Thermistor sub-tank bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "JF", category: "outdoor", contents: "Thermistor pemanas untuk heat exchanger bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "JH", category: "outdoor", contents: "Thermistor suhu oli bermasalah", causes: ["Konektor kendor", "Thermistor rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "L0", category: "outdoor", contents: "Sistem inverter bermasalah", causes: ["Kapasitas power kurang", "PCB inverter rusak/konslet"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L1", category: "outdoor", contents: "Malfungsi pada PCB Inverter", causes: ["Kabel kompresor cacat", "Sekering (fuse) putus"], models: VRV_ONLY, severity: "critical", resolution: CRITICAL_RES },
  { code: "L3", category: "outdoor", contents: "Suhu box kelistrikan terlalu panas", causes: ["Short-circuit hawa panas", "Power transistor jebol"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L4", category: "outdoor", contents: "Suhu heatsink inverter terlalu panas", causes: ["Pendinginan heatsink terhalang", "Thermistor heatsink rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L5", category: "outdoor", contents: "Arus berlebih seketika output DC inverter", causes: ["Stop valve tertutup", "Kompresor rusak/macet"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L6", category: "outdoor", contents: "Arus berlebih seketika output AC inverter", causes: ["Freon diisi berlebihan (overcharge)", "Kompresor aus"], models: VRV_ONLY, severity: "critical", resolution: CRITICAL_RES },
  { code: "L8", category: "outdoor", contents: "Kelebihan arus (overcurrent) kompresor inverter", causes: ["Tekanan mampat di sirkuit pendingin", "Kompresor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "L9", category: "outdoor", contents: "Kompresor inverter gagal start (Stall prevention)", causes: ["Tekanan kompresor tidak setara", "Kabel kompresor putus"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "LA", category: "outdoor", contents: "Power transistor rusak", causes: ["Modul power transistor jebol", "PCB Inverter mati"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "LC", category: "outdoor", contents: "Gagal transmisi antara PCB kontrol dan PCB inverter", causes: ["Konektor kendor", "Gangguan noise", "PCB Inverter / Kontrol rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "P0", category: "outdoor", contents: "Kekurangan freon (unit penyimpanan termal)", causes: ["Kekurangan freon", "Pipa freon tersumbat"], models: VRV_ONLY, severity: "critical", resolution: CRITICAL_RES },
  { code: "P1", category: "outdoor", contents: "Tegangan tidak seimbang / Fasa putus (Open phase)", causes: ["Open phase", "Tegangan antar fasa (R-S-T) tidak rata", "Kapasitor utama rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "P2", category: "outdoor", contents: "Pengisian freon otomatis berhenti", causes: ["Stop valve tertutup", "Katup tabung freon tertutup"], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "P3", category: "outdoor", contents: "Thermistor dalam box kelistrikan bermasalah", causes: ["Suhu box panas", "Thermistor heatsink rusak", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "P4", category: "outdoor", contents: "Sensor suhu heatsink (radiating fin) bermasalah", causes: ["Thermistor heatsink rusak", "Kabel putus", "PCB outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "P8", category: "outdoor", contents: "Proteksi pembekuan saat pengisian freon otomatis", causes: ["Tutup silinder freon dan mulai lagi dari tahap 1."], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "P9", category: "outdoor", contents: "Pengisian freon otomatis selesai", causes: ["Pengisian selesai - tidak ada masalah."], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "PA", category: "outdoor", contents: "Tabung freon habis saat pengisian otomatis", causes: ["Silinder freon master kosong", "Silinder freon slave kosong"], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "PC", category: "outdoor", contents: "Pengisian freon otomatis hampir selesai", causes: ["Hampir selesai - pantau proses."], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "PE", category: "outdoor", contents: "Malfungsi setting kapasitas (Outdoor PCB)", causes: ["Adaptor setting kapasitas tidak terpasang", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "PH", category: "outdoor", contents: "Kombinasi salah antara inverter dan fan driver", causes: ["Salah tipe PCB Inverter", "Salah tipe PCB kontrol"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "PJ", category: "outdoor", contents: "Sistem mendeteksi kekurangan freon ekstrem", causes: ["Kekurangan freon bocor", "Stop valve belum dibuka penuh"], models: ALL, severity: "critical", resolution: CRITICAL_RES },

  // ═══════════════════════════ SYSTEM ═══════════════════════════
  { code: "U0", category: "system", contents: "Kekurangan freon / fasa terbalik / fasa hilang", causes: ["Fasa listrik PLN terbalik atau putus satu", "Salah kabel wiring", "PCB outdoor rusak"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "U1", category: "system", contents: "Drop tegangan daya seketika (Mati lampu)", causes: ["Tegangan drop drastis", "Koneksi kabel power longgar"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "U2", category: "system", contents: "Test Run belum dijalankan atau ada error transmisi", causes: ["Check operation (Test run) belum dijalankan sama sekali", "Malfungsi transmisi saat tes", "Wiring keliru", "PCB outdoor rusak"], models: ALL, severity: "info", resolution: INFO_RES },
  { code: "U3", category: "system", contents: "Gagal transmisi antara unit Indoor dan Outdoor", causes: ["Kabel transmisi F1-F2 putus/konslet", "Gangguan noise", "PCB Indoor/Outdoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "U4", category: "system", contents: "Gagal komunikasi antara unit Indoor dan Remote", causes: ["Kabel remote P1-P2 putus", "PCB indoor rusak", "Gangguan noise", "Setting remote kembar (dua remote di set Main) salah"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "U5", category: "system", contents: "Gagal komunikasi antar sesama unit Indoor", causes: ["Wiring kabel salah", "Gangguan noise", "PCB indoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "U6", category: "system", contents: "Gagal transmisi antara PCB Outdoor dan micro-computer", causes: ["Kabel harness antara PCB putus", "PCB outdoor rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "U7", category: "system", contents: "Gagal komunikasi antar sesama unit Outdoor", causes: ["Kabel antar outdoor putus", "Kesalahan setting switch pada modul outdoor (Master/Slave)", "Kabel outdoor-thermal rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "U8", category: "system", contents: "Gagal komunikasi antar sesama Remote Controller", causes: ["Setting Main/Sub dua remote salah", "Kabel antar remote putus", "PCB remote rusak"], models: RA_SKY_VRV, severity: "info", resolution: INFO_RES },
  { code: "U9", category: "system", contents: "Malfungsi transmisi sistem lain", causes: ["Gagal komunikasi antar indoor lain dan outdoor", "Katup ekspansi indoor lain rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "UA", category: "system", contents: "Kombinasi Indoor-Outdoor salah / Sistem gagal sinkron", causes: ["Kombinasi model Indoor-Outdoor tidak cocok", "Salah pasang tipe PCB", "Terlalu banyak unit indoor", "Defect suplai daya"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "UC", category: "system", contents: "Duplikasi Address Centralized Controller (Bentrok alamat)", causes: ["Dua perangkat punya alamat sentral yang sama persis", "Reset switch tertekan", "Alamat central remote berubah"], models: VRV_ONLY, severity: "info", resolution: INFO_RES },
  { code: "UE", category: "system", contents: "Gagal komunikasi antara unit Indoor dan Central Controller", causes: ["Kabel transmisi antara indoor dan central controller putus/salah"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "UF", category: "system", contents: "Mismatch antara jalur pipa dan kabel transmisi", causes: ["Kabel transmisi menyilang (cross-wired) antar sistem", "Gagal auto-addressing", "PCB indoor rusak"], models: ALL, severity: "warning", resolution: WARNING_RES },
  { code: "UH", category: "system", contents: "Malfungsi kelengkapan sistem (Gagal Addressing)", causes: ["Kabel transmisi F1-F2 disambung menyilang ke outdoor lain", "PCB indoor dan outdoor bermasalah", "Mismatch model unit indoor outdoor (RA)"], models: ALL, severity: "critical", resolution: CRITICAL_RES },
  { code: "UJ", category: "system", contents: "Kesalahan field setting dari remote controller", causes: ["Input setting dari remote tidak sesuai parameter", "Kabel opsi (optional device) terpasang salah", "Sistem masih terjebak di service mode"], models: ALL, severity: "info", resolution: INFO_RES },
  { code: "M1", category: "system", contents: "Malfungsi transmisi perangkat opsi (aksesoris)", causes: ["Perangkat aksesoris rusak", "Kabel opsi salah"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "M8", category: "system", contents: "Malfungsi PCB Centralized Remote Controller", causes: ["PCB sentral remote rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "MA", category: "system", contents: "Malfungsi transmisi antar remote controller sentral", causes: ["Koneksi daya remote sentral terputus", "Kabel transmisi remote rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "MC", category: "system", contents: "Kombinasi remote sentral salah (Bentrok master)", causes: ["Lebih dari satu master controller disambungkan", "Setting remote sentral bentrok", "Perangkat sentral rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },

  // ═══════════════════════════ OTHERS (HRV / Chiller) ═══════════════════════════
  { code: "60", category: "others", contents: "Proteksi eksternal aktif (HRV)", causes: ["Sensor proteksi aktif", "Kabel output rusak", "PCB kontrol rusak"], models: HRV_ONLY, severity: "critical", resolution: CRITICAL_RES },
  { code: "64", category: "others", contents: "Thermistor udara indoor HRV rusak", causes: ["Konektor kendor", "PCB kontrol rusak"], models: HRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "65", category: "others", contents: "Thermistor udara outdoor HRV rusak", causes: ["Konektor kendor", "PCB kontrol rusak"], models: HRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "6A", category: "others", contents: "Malfungsi damper (HRV)", causes: ["Konektor kendor", "Motor damper rusak"], models: HRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "70", category: "others", contents: "Kompresor 2 Overload", causes: ["Kurang freon", "Konektor rusak", "Bocor katup 4-arah"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "71", category: "others", contents: "Kompresor 2 Overcurrent", causes: ["Kurang freon", "Short-circuit", "Kompresor rusak"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "72", category: "others", contents: "Motor kipas 2 Overcurrent", causes: ["Konektor rusak", "Motor kipas rusak", "PCB rusak"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "73", category: "others", contents: "Sensor High Pressure (HPS) 2 Aktif", causes: ["Kondensor kotor", "Pipa buntu", "HPS rusak"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "74", category: "others", contents: "Sensor Low Pressure (LPS) 2 Aktif", causes: ["Pipa buntu", "Kurang freon"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "75", category: "others", contents: "Sensor Low Pressure 2 Rusak", causes: ["Konektor rusak", "Sensor rusak", "PCB rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "76", category: "others", contents: "Sensor High Pressure 2 Rusak", causes: ["Konektor rusak", "Sensor rusak", "PCB rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "77", category: "others", contents: "Malfungsi Fan Inter Lock 1", causes: ["Relay kontak rusak", "Kabel putus"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "78", category: "others", contents: "Malfungsi Fan Inter Lock 2", causes: ["Relay kontak rusak", "Kabel putus"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "7A", category: "others", contents: "Sensor arus kompresor 2 bermasalah", causes: ["Sensor rusak", "Kompresor rusak", "PCB outdoor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "7C", category: "others", contents: "Pump Inter Lock 2 aktif", causes: ["Cooling water pump interlock aktif"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "80", category: "others", contents: "Thermistor air masuk bermasalah", causes: ["Konektor kendor", "Thermistor air masuk rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "81", category: "others", contents: "Thermistor air keluar bermasalah", causes: ["Konektor kendor", "Thermistor air keluar rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "82", category: "others", contents: "Thermistor refrigeran sistem 1 rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "83", category: "others", contents: "Thermistor refrigeran sistem 2 rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "84", category: "others", contents: "Thermistor heat exchanger 1 rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "85", category: "others", contents: "Thermistor heat exchanger 2 rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "86", category: "others", contents: "Thermistor discharge kompresor 1 rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "88", category: "others", contents: "Suhu pipa discharge 2 tidak normal", causes: ["Kurang freon", "Thermistor rusak", "Konektor kendor"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "89", category: "others", contents: "Brazed-plate heat exchanger freezing (pembekuan)", causes: ["Kekurangan gas freon ekstrem"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "8A", category: "others", contents: "Thermistor air keluar 2 rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "8E", category: "others", contents: "Thermistor suction 1 pemanasan rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "8F", category: "others", contents: "Thermistor suction 2 pemanasan rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "8H", category: "others", contents: "Suhu air panas ekstrem", causes: ["Thermistor air rusak"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "90", category: "others", contents: "Kuantitas air dingin tidak normal (AXP)", causes: ["Kekurangan volume air", "AXP terputus"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "91", category: "others", contents: "Katup ekspansi elektronik sistem 2 rusak", causes: ["Konektor kendor", "Koil ekspansi rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "92", category: "others", contents: "Thermistor suction 2 rusak", causes: ["Konektor kendor", "Thermistor rusak"], models: CHILLER, severity: "warning", resolution: WARNING_RES },
  { code: "94", category: "others", contents: "Transmisi antara unit HRV dan kipas bermasalah", causes: ["PCB kipas rusak", "Kabel koneksi putus"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "95", category: "others", contents: "Sistem inverter 1 rusak", causes: ["Unit inverter kipas mati"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "96", category: "others", contents: "Sistem inverter 2 rusak", causes: ["Unit inverter kipas mati"], models: CHILLER, severity: "critical", resolution: CRITICAL_RES },
  { code: "97", category: "others", contents: "Malfungsi thermal storage unit", causes: ["Unit penyimpan panas rusak"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "98", category: "others", contents: "Thermal storage brine pump bermasalah", causes: ["Overcurrent / macet pada pompa brine"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
  { code: "99", category: "others", contents: "Tangki penyimpanan termal bermasalah", causes: ["Level air tangki termal rendah"], models: VRV_ONLY, severity: "warning", resolution: WARNING_RES },
];

export interface RemoteGuide {
  id: string;
  title: string;
  type: "wireless" | "wired";
  models: string[];
  steps: string[];
}

export const REMOTE_GUIDES: RemoteGuide[] = [
  {
    id: "wireless-1",
    title: "Remote Controller Wireless (AC Split/Residential)",
    type: "wireless",
    models: ["ARC455A", "ARC452A", "ARC433B", "ARC423A", "ARC417A"],
    steps: [
      "Arahkan remote ke unit indoor lalu tahan tombol TIMER CANCEL selama 5 detik.",
      "Tampilan suhu di layar remote akan berubah menjadi '00' dengan bunyi bip panjang.",
      "Tekan TIMER CANCEL berulang-ulang sampai terdengar bunyi bip PANJANG. Angka di layar saat bunyi bip panjang adalah KODE ERROR Anda.",
      "Untuk keluar dari mode diagnosis, tahan kembali tombol TIMER CANCEL selama 5 detik (atau diamkan 1 menit)."
    ]
  },
  {
    id: "wireless-2",
    title: "Remote Controller Wireless (ARC447A)",
    type: "wireless",
    models: ["ARC447A"],
    steps: [
      "Tahan tombol TIMER CANCEL selama 5 detik, angka '00' akan berkedip di bagian suhu layar.",
      "Tekan tombol TIMER CANCEL berkali-kali hingga Anda mendengar bunyi bip PANJANG dari indoor.",
      "Jika terdengar bunyi bip PENDEK atau DUA KALI BIP berturut-turut, itu BUKAN kode errornya. Terus tekan sampai bunyi panjang.",
      "Angka di layar saat bip panjang adalah kode error. Tahan TIMER CANCEL 5 detik untuk keluar."
    ]
  },
  {
    id: "wireless-3",
    title: "Remote Controller Wireless 3-Tombol",
    type: "wireless",
    models: ["ARC433B67", "ARC433B68", "ARC433B69", "ARC433B76"],
    steps: [
      "Tekan 3 tombol (TEMP ▲, TEMP ▼, MODE) secara bersamaan. Angka puluhan di layar akan berkedip.",
      "Tekan TEMP ▲ atau ▼ hingga terdengar bunyi 'pi pi' atau bunyi 'bip panjang'. 'pi' = angka salah, 'pi pi' = angka puluhan benar.",
      "Tekan MODE. Sekarang angka satuan akan berkedip.",
      "Tekan TEMP ▲ atau ▼ hingga terdengar bunyi 'bip panjang' utuh. Angka yang muncul adalah kode error-nya.",
      "Tekan tombol MODE untuk keluar, lalu tekan ON/OFF 2 kali untuk kembali ke mode normal."
    ]
  },
  {
    id: "wired-1",
    title: "Remote Controller Wired (SkyAir, VRV - Tipe Lama)",
    type: "wired",
    models: ["BRC1C62"],
    steps: [
      "Jika mesin mati karena error, lampu operasi (LED) pada remote akan berkedip dan kode error akan otomatis muncul di layar.",
      "Jika Anda tidak melihatnya, tekan tombol INSPECTION/TEST (bergambar mata/kaca pembesar).",
      "Layar akan memunculkan tulisan 'Unit' dan angka '0' yang berkedip.",
      "Tekan UP atau DOWN hingga terdengar bunyi bip panjang yang menandakan Anda mengakses memori error unit tersebut.",
      "Kode error akan muncul di layar. Untuk mereset history error, tahan tombol ON/OFF selama 4 detik saat masuk di mode inspeksi ini."
    ]
  },
  {
    id: "wired-2",
    title: "Remote Controller Wired Digital (Navi)",
    type: "wired",
    models: ["BRC1E61"],
    steps: [
      "Jika unit mati karena error, lampu hijau (LED) operasi akan berkedip.",
      "Di bagian bawah layar akan muncul tulisan: 'Error: Press Menu Button' (Error: Tekan Tombol Menu).",
      "Cukup tekan tombol 'Menu/Enter' yang letaknya di tengah. Kode error akan langsung terlihat besar di layar.",
      "Pilih 'Service Contact / Model Info' lalu tekan 'Menu/Enter' lagi untuk melihat rincian detail.",
      "Tekan tombol 'Cancel' untuk kembali ke layar biasa."
    ]
  },
];
