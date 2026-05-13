import { PrismaClient } from '../src/generated/client_v3';

const prisma = new PrismaClient();

const JUKLAK_CONTENT = `
MASTER BLUEPRINT V2: PETUNJUK PELAKSANAAN (JUKLAK)
Value Engineering Services (VES) - Skala Operasional Nasional (Integrasi Tier 1, 2, dan 3)

1. Alur Kerja (Workflow) Berdasarkan Level Layanan (Tiering)
Alur pemrosesan data dan pelaporan dibedakan berdasarkan jenis kontrak VES klien:

- Tier 1: DASAR (Descriptive)
  * Input: Teknisi mencatat parameter di logsheet (tekanan, suhu, ampere) dan temuan visual (karat, bengkok).
  * Pemrosesan: Data dikompilasi menjadi dokumen mati (Summary Report PDF).
  * Output: Laporan PDF berisi deskripsi kondisi saat ini dan rekomendasi perbaikan reaktif (ganti sparepart rusak).
  * Target: Teknisi Gedung / Supervisor Engineering.

- Tier 2: MENENGAH (Proactive)
  * Input: Sama dengan Tier 1, namun data wajib diinput langsung ke platform EPL CONNECT secara real-time.
  * Pemrosesan: Sistem mengolah data menjadi Health Index Scoring (cth: Skor 82% - Kuning).
  * Output: Live Executive Dashboard. Alarm otomatis jika skor kesehatan unit turun di bawah standar. Laporan audit engineering proaktif.
  * Target: Chief Engineer / Facility Manager.

- Tier 3: LENGKAP (Predictive & Financial)
  * Input: Termasuk Tier 2, ditambah pencatatan data kWh meter chiller/HVAC dan data beban pendinginan aktual.
  * Pemrosesan: Data digabungkan dengan tarif listrik dasar (Digital Twin Linkage) untuk menghitung efisiensi (kW/TR).
  * Output: Laporan Return on Investment (ROI) & Cost Saving bulanan. Prediksi umur sisa aset (Life Cycle Management).
  * Target: Board of Directors (BOD) / Pemilik Gedung / Finance Manager.

2. Fase Pra-Kontrak (Genba / Site Audit Awal)
Sebelum penawaran resmi diterbitkan, tim wajib melakukan asesmen lapangan untuk menentukan baseline performa.
- Observasi Energi (Wajib untuk Tier 3): Mengumpulkan data tagihan listrik klien dan estimasi konsumsi daya HVAC saat ini.
- Identifikasi Pemborosan: Mendokumentasikan kondisi insulasi, indikasi kerak air, atau usia unit yang menurunkan efisiensi.

3. Fase Onboarding & Asset Database Management
- Registrasi Aset & Pelabelan QR Code: Setiap unit didaftarkan di EPL CONNECT dan ditempel stiker QR Code unik. Pemindaian wajib dilakukan sebelum/sesudah perawatan.
- Input Baseline Data: Memasukkan data desain pabrikan (seperti Ampere maksimal, Flow Rate, Head) sebagai batas atas toleransi dalam sistem (krusial untuk algoritma Tier 2 & 3).

4. Matriks SLA (Service Level Agreement) Adaptif
- Tier 3 (Prioritas VIP 24/7): Respon 15 menit, tiba di lokasi maksimal 2-4 Jam (untuk operasional kritis seperti RS/Industri).
- Tier 2 (Proaktif): Respon 30 menit, tiba di lokasi maksimal 4-8 Jam. Sistem alarm otomatis.
- Tier 1 (Standar): Respon 1 jam, tiba di lokasi 1x24 jam atau jadwal reguler.
`;

const JUKNIS_CONTENT = `
MASTER BLUEPRINT V2: PETUNJUK TEKNIS (JUKNIS)
Standardisasi Lapangan - Value Engineering Services (VES)

1. Instruksi Kerja Pemungutan Data (Data Gathering)
- Logsheet Manual & Visual (Standar Tier 1): Teknisi WAJIB mengisi form parameter dasar (Tekanan Freon, Ampere, Voltase, Suhu Masuk/Keluar). Lakukan inspeksi visual mendalam pada anomali fisik (contoh: karat pada flow switch, sensor bengkok, kebocoran oli).
- Validasi Input Digital (Standar Tier 2): Teknisi lapangan WAJIB memindahkan data logsheet secara akurat ke dalam aplikasi seluler EPL CONNECT di lokasi. Tidak boleh ada delay input agar Live Dashboard klien ter-update secara real-time.
- Pengumpulan Data Finansial (Standar Tier 3): Chief Engineer atau Project Account wajib meminta data konsumsi kWh bulanan khusus panel HVAC dari tim Engineering klien pada akhir bulan untuk perhitungan Cost Saving.

2. Modul Sistem Centralized Water-Cooled (Chiller Plant)
A. Water Cooled Chiller:
   - (Tier 1/2) Cek Approach Temperature Evaporator & Kondensor (Batas normal < 2°C). Cek visual kebocoran freon dan oli. Cek tarikan Ampere kompresor.
   - (Tier 3) Chief Engineer menghitung aktual kW/TR. Jika melebihi spesifikasi pabrik (contoh > 0.6 kW/TR), segera susun proposal ROI untuk Chemical Cleaning atau Overhaul.
B. Pompa Sirkulasi & Cooling Tower:
   - (Tier 1/2) Ukur vibrasi bearing. Pastikan arus motor IE3 seimbang di tiap fasa. Cek Mechanical Seal. Bersihkan basin cooling tower.
   - (Tier 3) Analisis prediksi kegagalan pompa berdasarkan tren getaran (Vibration Trend Analysis) dari bulan ke bulan. Rencanakan jadwal penggantian bearing sebelum unit breakdown.

3. Modul Evaluasi & Rekomendasi (Value Engineering Action)
- Aksi Reaktif (Tier 1): Rekomendasi perbaikan diberikan setelah ditemukan kerusakan fisik pada saat kunjungan (contoh: "Sensor rusak, mohon diganti").
- Aksi Proaktif (Tier 2): Sistem memberikan peringatan dini. (Contoh: "Skor kesehatan Chiller B turun dari 90% ke 75% akibat tren suhu oli yang perlahan naik. Jadwalkan pengecekan filter oli minggu depan").
- Aksi Strategis (Tier 3): Pertemuan triwulanan dengan BOD klien. (Contoh: "Chiller lama Bapak memakan daya 1.2 kW/TR. Tagihan listrik Rp 200 juta/bulan. Jika Bapak menyetujui program Retrofit VFD kami bulan depan, estimasi tagihan akan turun menjadi Rp 160 juta/bulan. ROI tercapai dalam 18 bulan.")
`;

async function main() {
  console.log('Seeding Knowledge Resources...');

  await prisma.knowledge_resources.create({
    data: {
      title: "Master Blueprint V2: Juklak (Manajerial & Strategis)",
      category: "JUKLAK",
      type: "GUIDELINE",
      tags: "VES, Managerial, Strategic, Operational",
      content: JUKLAK_CONTENT,
      visibility: "Internal",
    }
  });

  await prisma.knowledge_resources.create({
    data: {
      title: "Master Blueprint V2: Juknis (Standardisasi Lapangan)",
      category: "JUKNIS",
      type: "GUIDELINE",
      tags: "VES, Technical, Field, Engineering",
      content: JUKNIS_CONTENT,
      visibility: "Internal",
    }
  });

  await prisma.knowledge_resources.create({
    data: {
      title: "Smart Service Contract & Asset Management",
      category: "MARKETING",
      type: "INTERACTIVE",
      tags: "Smart Service, Presentation, Asset Management",
      href: "/service-presentation",
      visibility: "Internal",
    }
  });

  await prisma.knowledge_resources.create({
    data: {
      title: "Strategic Operational Roadmap - VES Project Lifecycle",
      category: "STRATEGY",
      type: "INTERACTIVE",
      tags: "VES, Strategy, Roadmap, Operational",
      href: "/admin/ves-flow",
      visibility: "Internal",
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
